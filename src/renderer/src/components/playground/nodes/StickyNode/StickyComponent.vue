<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import { $getNodeByKey, LexicalEditor, LexicalNode, NodeKey } from "lexical"
import { Positioning, positionSticky } from "./StickyNode.shared"
import {
  ErrorBoundary,
  LexicalCollaborationPlugin,
  LexicalHistoryPlugin,
  LexicalNestedComposer,
  LexicalPlainTextPlugin,
  useLexicalComposer,
  useSharedHistoryContext
} from "lexical-vue"
import { useCollaborationContext, useEffect as useLayoutEffect } from "lexical-vue"
import { useEffect } from "../../composables/useEffect"
import { calculateZoomLevel } from "@lexical/utils"
import { StickyNoteInterface } from "./StickyNode.shared"
import { createWebsocketProvider } from "../../collaboration"
import StickyEditorTheme from "../../themes/StickyEditorTheme"
import ContentEditable from "../../ui/ContentEditable.vue"

const props = defineProps<{
  caption: LexicalEditor
  color: "pink" | "yellow"
  nodeKey: NodeKey
  x: number
  y: number
  isStickyNode: (node: LexicalNode | null) => node is StickyNoteInterface
}>()

const emit = defineEmits<{
  (event: "error"): void
  (event: "init", image: HTMLImageElement | null): void
}>()

const editor = useLexicalComposer()
const stickyContainerRef = ref<null | HTMLDivElement>(null)
const positioningRef = reactive<Positioning>({
  isDragging: false,
  offsetX: 0,
  offsetY: 0,
  rootElementRect: null,
  x: 0,
  y: 0
})
const collaborationContext = useCollaborationContext()

useEffect(() => {
  const position = positioningRef
  position.x = props.x
  position.y = props.y

  const stickyContainer = stickyContainerRef.value
  if (stickyContainer !== null) {
    positionSticky(stickyContainer, position)
  }
}, [() => positioningRef.x, () => positioningRef.y])

useLayoutEffect(() => {
  const position = positioningRef
  const resizeObserver = new ResizeObserver((entries) => {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      const { target } = entry
      position.rootElementRect = target.getBoundingClientRect()
      const stickyContainer = stickyContainerRef.value
      if (stickyContainer !== null) {
        positionSticky(stickyContainer, position)
      }
    }
  })

  const removeRootListener = editor.registerRootListener((nextRootElem, prevRootElem) => {
    if (prevRootElem !== null) {
      resizeObserver.unobserve(prevRootElem)
    }
    if (nextRootElem !== null) {
      resizeObserver.observe(nextRootElem)
    }
  })

  const handleWindowResize = () => {
    const rootElement = editor.getRootElement()
    const stickyContainer = stickyContainerRef.value
    if (rootElement !== null && stickyContainer !== null) {
      position.rootElementRect = rootElement.getBoundingClientRect()
      positionSticky(stickyContainer, position)
    }
  }

  window.addEventListener("resize", handleWindowResize)

  return () => {
    window.removeEventListener("resize", handleWindowResize)
    removeRootListener()
  }
})

watch(
  () => stickyContainerRef.value,
  () => {
    const stickyContainer = stickyContainerRef.value
    if (stickyContainer !== null) {
      // Delay adding transition so we don't trigger the
      // transition on load of the sticky.
      setTimeout(() => {
        stickyContainer.style.setProperty("transition", "top 0.3s ease 0s, left 0.3s ease 0s")
      }, 500)
    }
  }
)

const handlePointerMove = (event: PointerEvent) => {
  const stickyContainer = stickyContainerRef.value
  const positioning = positioningRef
  const rootElementRect = positioning.rootElementRect
  const zoom = calculateZoomLevel(stickyContainer)
  if (stickyContainer !== null && positioning.isDragging && rootElementRect !== null) {
    positioning.x = event.pageX / zoom - positioning.offsetX - rootElementRect.left
    positioning.y = event.pageY / zoom - positioning.offsetY - rootElementRect.top
    positionSticky(stickyContainer, positioning)
  }
}

const handlePointerUp = (event: PointerEvent) => {
  const stickyContainer = stickyContainerRef.value
  const positioning = positioningRef
  if (stickyContainer !== null) {
    positioning.isDragging = false
    stickyContainer.classList.remove("dragging")
    editor.update(() => {
      const node = $getNodeByKey(props.nodeKey)
      if (props.isStickyNode(node)) {
        node.setPosition(positioning.x, positioning.y)
      }
    })
  }
  document.removeEventListener("pointermove", handlePointerMove)
  document.removeEventListener("pointerup", handlePointerUp)
}
const handlePointerDown = (event: PointerEvent) => {
  const stickyContainer = stickyContainerRef.value
  if (
    stickyContainer == null ||
    event.button === 2 ||
    event.target !== stickyContainer.firstChild
  ) {
    // Right click or click on editor should not work
    return
  }
  const stickContainer = stickyContainer
  const positioning = positioningRef
  if (stickContainer !== null) {
    const { top, left } = stickContainer.getBoundingClientRect()
    const zoom = calculateZoomLevel(stickContainer)
    positioning.offsetX = event.clientX / zoom - left
    positioning.offsetY = event.clientY / zoom - top
    positioning.isDragging = true
    stickContainer.classList.add("dragging")
    document.addEventListener("pointermove", handlePointerMove)
    document.addEventListener("pointerup", handlePointerUp)
    event.preventDefault()
  }
}

const handleDelete = () => {
  editor.update(() => {
    const node = $getNodeByKey(props.nodeKey)
    if (props.isStickyNode(node)) {
      node.remove()
    }
  })
}

const handleColorChange = () => {
  editor.update(() => {
    const node = $getNodeByKey(props.nodeKey)
    if (props.isStickyNode(node)) {
      node.toggleColor()
    }
  })
}

const { historyState } = useSharedHistoryContext()
</script>

<template>
  <div
    ref="stickyContainerRef"
    class="sticky-note-container"
  >
    <div
      :class="`sticky-note ${color}`"
      @pointerdown="handlePointerDown"
    >
      <button
        @click="handleDelete"
        class="delete"
        aria-label="Delete sticky note"
        title="Delete"
      >
        X
      </button>
      <button
        @click="handleColorChange"
        class="color"
        aria-label="Change sticky note color"
        title="Color"
      >
        <i class="bucket" />
      </button>
      <LexicalNestedComposer
        :initial-editor="caption"
        :initial-theme="StickyEditorTheme"
      >
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
        <LexicalPlainTextPlugin>
          <template #contentEditable>
            <ContentEditable
              placeholder="What's up?"
              placeholder-class-name="StickyNode__placeholder"
              class="StickyNode__contentEditable"
            />
          </template>
        </LexicalPlainTextPlugin>
      </LexicalNestedComposer>
    </div>
  </div>
</template>
