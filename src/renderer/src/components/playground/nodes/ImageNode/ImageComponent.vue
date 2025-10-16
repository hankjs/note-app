<script setup lang="ts">
import {
  useLexicalComposer,
  useLexicalNodeSelection,
  useCollaborationContext,
  useLexicalEditable,
  useSharedHistoryContext,
  LexicalHashtagPlugin,
  LexicalHistoryPlugin,
  LexicalRichTextPlugin,
  LexicalErrorBoundary,
  LexicalCollaborationPlugin,
  LexicalNestedComposer
} from "lexical-vue"
import { useEffect } from "../../composables/useEffect"
import { isSVG, noop, RIGHT_CLICK_IMAGE_COMMAND, useSuspenseImage } from "./ImageNode.shard"
import { Component, computed, Ref, ref } from "vue"
import BrokenImage from "./BrokenImage.vue"
import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DRAGSTART_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SELECTION_CHANGE_COMMAND
} from "lexical"
import { mergeRegister } from "@lexical/utils"
import { ImageNodeInterface } from "./ImageNodeInterface"
import { useSettings } from "../../composables/useSettings"
import { createWebsocketProvider } from "../../collaboration"
import DisableCaptionOnBlur from "./DisableCaptionOnBlur.vue"
import MentionsPlugin from "../../plugins/MentionsPlugin.vue"
import AutoLinkPlugin from "../../plugins/AutoLinkPlugin.vue"
import EmojisPlugin from "../../plugins/EmojisPlugin.vue"
import ContentEditable from "../../ui/ContentEditable.vue"
import KeywordsPlugin from "../../plugins/KeywordsPlugin.vue"
import TreeViewPlugin from "../../plugins/TreeViewPlugin.vue"
import LazyImage from "./LazyImage.vue"
import ImageResizer from "../../ui/ImageResize.vue"

const props = defineProps<{
  altText: string
  caption: LexicalEditor
  height: "inherit" | number
  maxWidth: number
  nodeKey: NodeKey
  resizable: boolean
  showCaption: boolean
  src: string
  width: "inherit" | number
  captionsEnabled: boolean
  isImageNode: (node: LexicalNode | null) => node is ImageNodeInterface<Component>
}>()

const imageRef = ref<null | HTMLImageElement>(null)
const buttonRef = ref<HTMLButtonElement | null>(null)
const { isSelected, setSelected, clearSelection } = useLexicalNodeSelection(props.nodeKey)
const isResizing = ref<boolean>(false)
const collaborationContext = useCollaborationContext()
const editor = useLexicalComposer()
const activeEditorRef = ref<LexicalEditor | null>(null)
const isLoadError = ref<boolean>(false)
const isEditable = useLexicalEditable()
const isInNodeSelection = computed(
  () =>
    isSelected.value &&
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      return $isNodeSelection(selection) && selection.has(props.nodeKey)
    })
)

const $onEnter = (event: KeyboardEvent) => {
  const latestSelection = $getSelection()
  const buttonElem = buttonRef.value
  if (
    $isNodeSelection(latestSelection) &&
    latestSelection.has(props.nodeKey) &&
    latestSelection.getNodes().length === 1
  ) {
    if (props.showCaption) {
      // Move focus into nested editor
      $setSelection(null)
      event.preventDefault()
      props.caption.focus()
      return true
    } else if (buttonElem !== null && buttonElem !== document.activeElement) {
      event.preventDefault()
      buttonElem.focus()
      return true
    }
  }
  return false
}

const $onEscape = (event: KeyboardEvent) => {
  if (activeEditorRef.value === props.caption || buttonRef.value === event.target) {
    $setSelection(null)
    editor.update(() => {
      setSelected(true)
      const parentRootElement = editor.getRootElement()
      if (parentRootElement !== null) {
        parentRootElement.focus()
      }
    })
    return true
  }
  return false
}

const onClick = (payload: MouseEvent) => {
  const event = payload

  if (isResizing) {
    return true
  }
  if (event.target === imageRef.value) {
    if (event.shiftKey) {
      setSelected(!isSelected)
    } else {
      clearSelection()
      setSelected(true)
    }
    return true
  }

  return false
}

const onRightClick = (event: MouseEvent): void => {
  editor.getEditorState().read(() => {
    const latestSelection = $getSelection()
    const domElement = event.target as HTMLElement
    if (
      domElement.tagName === "IMG" &&
      $isRangeSelection(latestSelection) &&
      latestSelection.getNodes().length === 1
    ) {
      editor.dispatchCommand(RIGHT_CLICK_IMAGE_COMMAND, event)
    }
  })
}

useEffect(() => {
  return mergeRegister(
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_, activeEditor) => {
        activeEditorRef.value = activeEditor
        return false
      },
      COMMAND_PRIORITY_LOW
    ),
    editor.registerCommand(
      DRAGSTART_COMMAND,
      (event) => {
        if (event.target === imageRef.value) {
          // TODO This is just a temporary workaround for FF to behave like other browsers.
          // Ideally, this handles drag & drop too (and all browsers).
          event.preventDefault()
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW
    )
  )
}, [() => editor])

useEffect(() => {
  let rootCleanup = noop
  return mergeRegister(
    editor.registerCommand<MouseEvent>(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW),
    editor.registerCommand<MouseEvent>(RIGHT_CLICK_IMAGE_COMMAND, onClick, COMMAND_PRIORITY_LOW),
    editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
    editor.registerCommand(KEY_ESCAPE_COMMAND, $onEscape, COMMAND_PRIORITY_LOW),
    editor.registerRootListener((rootElement) => {
      rootCleanup()
      rootCleanup = noop
      if (rootElement) {
        rootElement.addEventListener("contextmenu", onRightClick)
        rootCleanup = () => rootElement.removeEventListener("contextmenu", onRightClick)
      }
    }),
    () => rootCleanup()
  )
}, [() => editor])

const setShowCaption = (show: boolean) => {
  editor.update(() => {
    const node = $getNodeByKey(props.nodeKey)
    if (props.isImageNode(node)) {
      node.setShowCaption(show)
      if (show) {
        node.__caption.update(() => {
          if (!$getSelection()) {
            $getRoot().selectEnd()
          }
        })
      }
    }
  })
}

const onResizeEnd = (nextWidth: "inherit" | number, nextHeight: "inherit" | number) => {
  // Delay hiding the resize bars for click case
  setTimeout(() => {
    isResizing.value = false
  }, 200)

  editor.update(() => {
    const node = $getNodeByKey(props.nodeKey)
    if (props.isImageNode(node)) {
      node.setWidthAndHeight(nextWidth, nextHeight)
    }
  })
}

const onResizeStart = () => {
  isResizing.value = true
}

const { historyState } = useSharedHistoryContext()
const {
  settings: { showNestedEditorTreeView }
} = useSettings()

const draggable = computed(() => isInNodeSelection.value && !isResizing.value)
const isFocused = computed(() => (isSelected.value || isResizing.value) && isEditable.value)
</script>

<template>
  <Suspense>
    <template>
      <div :draggable="draggable">
        <BrokenImage v-if="isLoadError" />
        <LazyImage
          :className="isFocused ? `focused ${isInNodeSelection ? 'draggable' : ''}` : null"
          :src="src"
          :alt-text="altText"
          :width="width"
          :height="height"
          :max-width="maxWidth"
          @error="() => (isLoadError = true)"
          @init="(e) => (imageRef = e)"
        />
      </div>

      <div
        v-if="showCaption"
        class="image-caption-container"
      >
        <LexicalNestedComposer :initial-editor="caption">
          <DisableCaptionOnBlur :set-show-caption="setShowCaption" />
          <MentionsPlugin />
          <AutoLinkPlugin />
          <EmojisPlugin />
          <LexicalHashtagPlugin />
          <KeywordsPlugin />
          <LexicalCollaborationPlugin
            v-if="collaborationContext.isCollabActive"
            :id="caption.getKey()"
            :provider-factory="createWebsocketProvider"
            :should-bootstrap="true"
          />
          <LexicalHistoryPlugin
            v-else
            :external-history-state="historyState"
          />
          <LexicalRichTextPlugin>
            <template #contentEditable>
              <ContentEditable
                placeholder="Enter a caption..."
                placeholderclass="ImageNode__placeholder"
                class="ImageNode__contentEditable"
              />
            </template>
          </LexicalRichTextPlugin>
          <TreeViewPlugin v-if="showNestedEditorTreeView" />
        </LexicalNestedComposer>
      </div>
      <ImageResizer
        v-if="resizable && isInNodeSelection && isFocused"
        :show-caption="showCaption"
        :set-show-caption="setShowCaption"
        :editor="editor"
        :max-width="maxWidth"
        @resizeStart="onResizeStart"
        @resizeEnd="({ width, height }) => onResizeEnd(width, height)"
        @init="
          ({ image, button }) => {
            imageRef = image
            buttonRef = button
          }
        "
        :captions-enabled="!isLoadError && captionsEnabled"
      />
    </template>
  </Suspense>
</template>

<style>
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

.ImageNode__contentEditable {
  min-height: 20px;
  border: 0px;
  resize: none;
  cursor: text;
  caret-color: rgb(5, 5, 5);
  display: block;
  position: relative;
  outline: 0px;
  padding: 10px;
  user-select: text;
  font-size: 12px;
  width: calc(100% - 20px);
  white-space: pre-wrap;
  word-break: break-word;
}

.ImageNode__placeholder {
  font-size: 12px;
  color: #888;
  overflow: hidden;
  position: absolute;
  text-overflow: ellipsis;
  top: 10px;
  left: 10px;
  user-select: none;
  white-space: nowrap;
  display: inline-block;
  pointer-events: none;
}

.image-control-wrapper--resizing {
  touch-action: none;
}
</style>
