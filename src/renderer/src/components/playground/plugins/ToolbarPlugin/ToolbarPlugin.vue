<script setup lang="ts">
import type {
  CommandListenerPriority,
  CommandPayloadType,
  LexicalCommand,
  NodeKey,
  TextFormatType
} from "lexical"
import { $isCodeNode, normalizeCodeLanguage as normalizeCodeLanguagePrism } from "@lexical/code"
import { normalizeCodeLanguage as normalizeCodeLanguageShiki } from "@lexical/code-shiki"
import {
  $addUpdateTag,
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  HISTORIC_TAG,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  SKIP_DOM_SELECTION_TAG,
  SKIP_SELECTION_FOCUS_TAG,
  UNDO_COMMAND,
  $getRoot
} from "lexical"
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText
} from "@lexical/selection"
import { $findMatchingParent, IS_APPLE, $getNearestNodeOfType, mergeRegister } from "@lexical/utils"
import { INSERT_EMBED_COMMAND, useLexicalComposer } from "lexical-vue"
import { computed, h, ref } from "vue"
import { $isListNode, ListNode } from "@lexical/list"
import { $isHeadingNode } from "@lexical/rich-text"
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link"
import FloatingLinkEditor from "../FloatingLinkEditor.vue"
import { EmbedConfigs } from "../AutoEmbedPlugin/shared"
import Divider from "./Divider.vue"
import BlockFormatDropDown from "./BlockFormatDropDown.vue"
import FontDropDown from "./FontDropDown.vue"
import FontSize from "./FontSize.vue"
import { sanitizeUrl } from "../../utils/url"
import DropDown from "../../ui/DropDown.vue"
import DropDownItem from "../../ui/DropDownItem.vue"
import { getSelectedNode } from "../../utils/getSelectedNode"
import DropdownColorPicker from "../../ui/DropdownColorPicker.vue"
import type { LexicalEditor } from "lexical"
import { COMMAND_PRIORITY_CRITICAL } from "lexical"
import { BlockType, blockTypeToBlockName, useToolbarState } from "../../composables/useToolbarState"
import { $isEditorIsNestedEditor } from "@lexical/utils"
import { LexicalNode } from "lexical"
import { $isTableNode, $isTableSelection } from "@lexical/table"
import { $isNodeSelection } from "lexical"
import { useSettings } from "../../composables/useSettings"
import useModal from "../../composables/useModal"
import { useEffect } from "../../composables/useEffect"
import { clearFormatting } from "./utils"
import { INSERT_HORIZONTAL_RULE_COMMAND } from "lexical-vue"
import {
  dropDownActiveClass,
  CODE_LANGUAGE_OPTIONS_PRISM,
  CODE_LANGUAGE_OPTIONS_SHIKI,
  CODE_THEME_OPTIONS_SHIKI,
  $findTopLevelElement
} from "./ToolbarPlugin.shared"
import { isKeyboardInput } from "../../utils/focusUtils"
import { parseFontSizeForToolbar } from "./FontSize.shared"
import { SHORTCUTS } from "../ShortcutsPlugin/shortcuts"
import { INSERT_PAGE_BREAK } from "../PageBreakPlugin.shared"
import InsertImageDialog from "../ImagesPlugin/InsertImageDialog.vue"
import { INSERT_IMAGE_COMMAND, InsertImagePayload } from "../ImagesPlugin/ImagesPlugin.shared"

import catTypingGif from "../../assets/images/cat-typing.gif"
import { INSERT_EXCALIDRAW_COMMAND } from "../ExcalidrawPlugin/ExcalidrawPlugin.shared"
import InsertTableDialog from "../TablePlugin/InsertTableDialog.vue"
import InsertPollDialog from "../PollPlugin/InsertPollDialog.vue"
import InsertLayoutDialog from "../LayoutPlugin/InsertLayoutDialog.vue"
import InsertEquationDialog from "../EquationsPlugin/InsertEquationDialog.vue"
import { $createStickyNode } from "../../nodes/StickyNode/StickyNode"
import { INSERT_COLLAPSIBLE_COMMAND } from "../CollapsiblePlugin/CollapsiblePlugin.shared"

const emit = defineEmits<{
  (event: "isLinkEditMode", value: boolean): void
}>()

const LowPriority: CommandListenerPriority = 1

// 外部注入
const editor = useLexicalComposer()
const activeEditorRef = defineModel<LexicalEditor>("activeEditor", { required: true })

const selectedElementKey = ref<NodeKey | null>(null)
const toolbarRef = ref<HTMLDivElement | null>(null)

const isEditable = ref(editor.isEditable())
const { toolbarState, updateToolbarState } = useToolbarState()

const dispatchToolbarCommand = <T extends LexicalCommand<unknown>>(
  command: T,
  payload: CommandPayloadType<T> | undefined = undefined,
  skipRefocus: boolean = false
) => {
  const activeEditor = activeEditorRef.value
  activeEditor.update(() => {
    if (skipRefocus) {
      $addUpdateTag(SKIP_DOM_SELECTION_TAG)
    }

    // Re-assert on Type so that payload can have a default param
    activeEditor.dispatchCommand(command, payload as CommandPayloadType<T>)
  })
}
const dispatchFormatTextCommand = (payload: TextFormatType, skipRefocus: boolean = false) =>
  dispatchToolbarCommand(FORMAT_TEXT_COMMAND, payload, skipRefocus)

const $handleHeadingNode = (selectedElement: LexicalNode) => {
  const type = $isHeadingNode(selectedElement)
    ? selectedElement.getTag()
    : selectedElement.getType()

  if (type in blockTypeToBlockName) {
    updateToolbarState("blockType", type as BlockType)
  }
}

const {
  settings: { isCodeHighlighted, isCodeShiki }
} = useSettings()

const $handleCodeNode = (element: LexicalNode) => {
  if ($isCodeNode(element)) {
    const language = element.getLanguage()
    updateToolbarState(
      "codeLanguage",
      language
        ? (isCodeHighlighted &&
            (isCodeShiki
              ? normalizeCodeLanguageShiki(language)
              : normalizeCodeLanguagePrism(language))) ||
            language
        : ""
    )
    const theme = element.getTheme()
    updateToolbarState("codeTheme", theme || "")
    return
  }
}

function $updateToolbar() {
  const activeEditor = activeEditorRef.value
  if (!activeEditor) return
  const selection = $getSelection()
  if ($isRangeSelection(selection)) {
    if (activeEditor !== editor && $isEditorIsNestedEditor(activeEditor)) {
      const rootElement = activeEditor.getRootElement()
      updateToolbarState(
        "isImageCaption",
        !!rootElement?.parentElement?.classList.contains("image-caption-container")
      )
    } else {
      updateToolbarState("isImageCaption", false)
    }

    const anchorNode = selection.anchor.getNode()
    const element = $findTopLevelElement(anchorNode)
    const elementKey = element.getKey()
    const elementDOM = activeEditor.getElementByKey(elementKey)

    updateToolbarState("isRTL", $isParentElementRTL(selection))

    // Update links
    const node = getSelectedNode(selection)
    const parent = node.getParent()
    const isLink = $isLinkNode(parent) || $isLinkNode(node)
    updateToolbarState("isLink", isLink)

    const tableNode = $findMatchingParent(node, $isTableNode)
    if ($isTableNode(tableNode)) {
      updateToolbarState("rootType", "table")
    } else {
      updateToolbarState("rootType", "root")
    }

    if (elementDOM !== null) {
      selectedElementKey.value = elementKey
      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode)
        const type = parentList ? parentList.getListType() : element.getListType()

        updateToolbarState("blockType", type)
      } else {
        $handleHeadingNode(element)
        $handleCodeNode(element)
      }
    }

    // Handle buttons
    updateToolbarState("fontColor", $getSelectionStyleValueForProperty(selection, "color", "#000"))
    updateToolbarState(
      "bgColor",
      $getSelectionStyleValueForProperty(selection, "background-color", "#fff")
    )
    updateToolbarState(
      "fontFamily",
      $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
    )
    let matchingParent
    if ($isLinkNode(parent)) {
      // If node is a link, we need to fetch the parent paragraph node to set format
      matchingParent = $findMatchingParent(
        node,
        (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
      )
    }

    // If matchingParent is a valid node, pass it's format type
    updateToolbarState(
      "elementFormat",
      $isElementNode(matchingParent)
        ? matchingParent.getFormatType()
        : $isElementNode(node)
          ? node.getFormatType()
          : parent?.getFormatType() || "left"
    )
  }
  if ($isRangeSelection(selection) || $isTableSelection(selection)) {
    // Update text format
    updateToolbarState("isBold", selection.hasFormat("bold"))
    updateToolbarState("isItalic", selection.hasFormat("italic"))
    updateToolbarState("isUnderline", selection.hasFormat("underline"))
    updateToolbarState("isStrikethrough", selection.hasFormat("strikethrough"))
    updateToolbarState("isSubscript", selection.hasFormat("subscript"))
    updateToolbarState("isSuperscript", selection.hasFormat("superscript"))
    updateToolbarState("isHighlight", selection.hasFormat("highlight"))
    updateToolbarState("isCode", selection.hasFormat("code"))
    updateToolbarState(
      "fontSize",
      $getSelectionStyleValueForProperty(selection, "font-size", "15px")
    )
    updateToolbarState("isLowercase", selection.hasFormat("lowercase"))
    updateToolbarState("isUppercase", selection.hasFormat("uppercase"))
    updateToolbarState("isCapitalize", selection.hasFormat("capitalize"))
  }
  if ($isNodeSelection(selection)) {
    const nodes = selection.getNodes()
    for (const selectedNode of nodes) {
      const parentList = $getNearestNodeOfType<ListNode>(selectedNode, ListNode)
      if (parentList) {
        const type = parentList.getListType()
        updateToolbarState("blockType", type)
      } else {
        const selectedElement = $findTopLevelElement(selectedNode)
        $handleHeadingNode(selectedElement)
        $handleCodeNode(selectedElement)
        // Update elementFormat for node selection (e.g., images)
        if ($isElementNode(selectedElement)) {
          updateToolbarState("elementFormat", selectedElement.getFormatType())
        }
      }
    }
  }
}

useEffect(() => {
  return editor.registerCommand(
    SELECTION_CHANGE_COMMAND,
    (_payload, newEditor) => {
      activeEditorRef.value = newEditor
      $updateToolbar()
      return false
    },
    COMMAND_PRIORITY_CRITICAL
  )
}, [() => editor])

useEffect(() => {
  activeEditorRef.value?.getEditorState().read(
    () => {
      $updateToolbar()
    },
    { editor: activeEditorRef.value }
  )
}, [() => activeEditorRef.value])

useEffect(() => {
  const activeEditor = activeEditorRef.value
  return mergeRegister(
    editor.registerEditableListener((editable) => {
      isEditable.value = editable
    }),
    activeEditor.registerUpdateListener(({ editorState }) => {
      editorState.read(
        () => {
          $updateToolbar()
        },
        { editor: activeEditor }
      )
    }),
    activeEditor.registerCommand<boolean>(
      CAN_UNDO_COMMAND,
      (payload) => {
        updateToolbarState("canUndo", payload)
        return false
      },
      COMMAND_PRIORITY_CRITICAL
    ),
    activeEditor.registerCommand<boolean>(
      CAN_REDO_COMMAND,
      (payload) => {
        updateToolbarState("canRedo", payload)
        return false
      },
      COMMAND_PRIORITY_CRITICAL
    )
  )
}, [() => activeEditorRef.value])

function applyStyleText(
  styles: Record<string, string>,
  skipHistoryStack?: boolean,
  skipRefocus: boolean = false
) {
  activeEditorRef.value.update(
    () => {
      if (skipRefocus) {
        $addUpdateTag(SKIP_DOM_SELECTION_TAG)
      }
      const selection = $getSelection()
      if (selection !== null) {
        $patchStyleText(selection, styles)
      }
    },
    skipHistoryStack ? { tag: HISTORIC_TAG } : {}
  )
}

function onFontColorSelect(value: string, skipHistoryStack: boolean, skipRefocus: boolean) {
  applyStyleText({ color: value }, skipHistoryStack, skipRefocus)
}

function onBgColorSelect(value: string, skipHistoryStack: boolean, skipRefocus: boolean) {
  applyStyleText({ "background-color": value }, skipHistoryStack, skipRefocus)
}

const insertLink = () => {
  if (!toolbarState.isLink) {
    emit("isLinkEditMode", true)
    activeEditorRef.value.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"))
  } else {
    emit("isLinkEditMode", false)
    activeEditorRef.value.dispatchCommand(TOGGLE_LINK_COMMAND, null)
  }
}

function onCodeLanguageSelect(value: string) {
  activeEditorRef.value.update(() => {
    $addUpdateTag(SKIP_SELECTION_FOCUS_TAG)
    if (selectedElementKey.value !== null) {
      const node = $getNodeByKey(selectedElementKey.value)
      if ($isCodeNode(node)) {
        node.setLanguage(value)
      }
    }
  })
}

const onCodeThemeSelect = (value: string) => {
  activeEditorRef.value.update(() => {
    if (selectedElementKey.value !== null) {
      const node = $getNodeByKey(selectedElementKey.value)
      if ($isCodeNode(node)) {
        node.setTheme(value)
      }
    }
  })
}

const insertGifOnClick = (payload: InsertImagePayload) => {
  activeEditorRef.value.dispatchCommand(INSERT_IMAGE_COMMAND, payload)
}

const canViewerSeeInsertDropdown = computed(() => !toolbarState.isImageCaption)
const canViewerSeeInsertCodeButton = computed(() => !toolbarState.isImageCaption)

const { modal, showModal } = useModal()
</script>

<template>
  <component :is="modal" />
  <div
    ref="toolbarRef"
    class="toolbar"
  >
    <button
      :disabled="!toolbarState.canUndo || !isEditable"
      @click="dispatchToolbarCommand(UNDO_COMMAND, undefined, isKeyboardInput($event))"
      :title="IS_APPLE ? 'Undo (⌘Z)' : 'Undo (Ctrl+Z)'"
      type="button"
      class="toolbar-item spaced"
      aria-label="Undo"
    >
      <i class="format undo" />
    </button>
    <button
      :disabled="!toolbarState.canRedo || !isEditable"
      @click="dispatchToolbarCommand(REDO_COMMAND, undefined, isKeyboardInput($event))"
      :title="IS_APPLE ? 'Redo (⇧⌘Z)' : 'Redo (Ctrl+Y)'"
      type="button"
      class="toolbar-item spaced"
      aria-label="Redo"
    >
      <i class="format redo" />
    </button>
    <Divider />
    <template v-if="toolbarState.blockType in blockTypeToBlockName && activeEditorRef === editor">
      <BlockFormatDropDown
        :disabled="!isEditable"
        :blockType="toolbarState.blockType"
        :rootType="toolbarState.rootType"
        :editor="activeEditorRef"
      />
      <Divider />
    </template>

    <!-- Start: Code -->
    <template v-if="toolbarState.blockType === 'code' && isCodeHighlighted">
      <DropDown
        v-if="!isCodeShiki"
        :disabled="!isEditable"
        button-class-name="toolbar-item code-language"
        :button-label="
          (CODE_LANGUAGE_OPTIONS_PRISM.find(
            (opt) => opt[0] === normalizeCodeLanguagePrism(toolbarState.codeLanguage)
          ) || ['', ''])[1]
        "
        button-aria-label="Select language"
      >
        <DropDownItem
          v-for="[value, name] in CODE_LANGUAGE_OPTIONS_PRISM"
          :key="value"
          :class="`item ${dropDownActiveClass(value === toolbarState.codeLanguage)}`"
          @click="onCodeLanguageSelect(value)"
        >
          <span class="text">{{ name }}</span>
        </DropDownItem>
      </DropDown>

      <!-- Start: Code Shiki -->
      <template v-if="isCodeShiki">
        <DropDown
          :disabled="!isEditable"
          button-class-name="toolbar-item code-language"
          :button-label="
            (CODE_LANGUAGE_OPTIONS_SHIKI.find(
              (opt) => opt[0] === normalizeCodeLanguagePrism(toolbarState.codeLanguage)
            ) || ['', ''])[1]
          "
          button-aria-label="Select language"
        >
          <DropDownItem
            v-for="[value, name] in CODE_LANGUAGE_OPTIONS_SHIKI"
            :key="value"
            :class="`item ${dropDownActiveClass(value === toolbarState.codeLanguage)}`"
            @click="onCodeLanguageSelect(value)"
          >
            <span class="text">{{ name }}</span>
          </DropDownItem>
        </DropDown>

        <DropDown
          :disabled="!isEditable"
          button-class-name="toolbar-item code-language"
          :button-label="
            (CODE_THEME_OPTIONS_SHIKI.find((opt) => opt[0] === toolbarState.codeTheme) || [
              '',
              ''
            ])[1]
          "
          button-aria-label="Select theme"
        >
          <DropDownItem
            v-for="[value, name] in CODE_THEME_OPTIONS_SHIKI"
            :key="value"
            :class="`item ${dropDownActiveClass(value === toolbarState.codeTheme)}`"
            @click="onCodeThemeSelect(value)"
          >
            <span class="text">{{ name }}</span>
          </DropDownItem>
        </DropDown>
      </template>
      <!-- End: Code Shiki -->
    </template>
    <!-- End: Code -->

    <!-- Start: Font -->
    <template v-else>
      <FontDropDown
        :disabled="!isEditable"
        custom-style="font-family"
        :value="toolbarState.fontFamily"
        :editor="activeEditorRef"
      />
      <Divider />
      <FontSize
        :disabled="false"
        :editor="activeEditorRef"
        :selection-font-size="parseFontSizeForToolbar(toolbarState.fontSize).slice(0, -2)"
      />
      <Divider />
      <button
        :disabled="!isEditable"
        @click="dispatchFormatTextCommand('bold', isKeyboardInput($event))"
        :class="`toolbar-item spaced ${toolbarState.isBold ? 'active' : ''}`"
        :title="`Bold (${SHORTCUTS.BOLD})`"
        type="button"
        :aria-label="`Format text as bold. Shortcut: ${SHORTCUTS.BOLD}`"
      >
        <i class="format bold" />
      </button>
      <button
        :disabled="!isEditable"
        @click="dispatchFormatTextCommand('italic', isKeyboardInput($event))"
        :class="`toolbar-item spaced ${toolbarState.isItalic ? 'active' : ''}`"
        :title="`Italic (${SHORTCUTS.ITALIC})`"
        type="button"
        :aria-label="`Format text as italics. Shortcut: ${SHORTCUTS.ITALIC}`"
      >
        <i class="format italic" />
      </button>
      <button
        :disabled="!isEditable"
        @click="dispatchFormatTextCommand('underline', isKeyboardInput($event))"
        :class="`toolbar-item spaced ${toolbarState.isUnderline ? 'active' : ''}`"
        :title="`Underline (${SHORTCUTS.UNDERLINE})`"
        type="button"
        :aria-label="`Format text as underlined. Shortcut: ${SHORTCUTS.UNDERLINE}`"
      >
        <i class="format underline" />
      </button>
      <template v-if="canViewerSeeInsertCodeButton">
        <button
          :disabled="!isEditable"
          @click="dispatchFormatTextCommand('code', isKeyboardInput($event))"
          :class="`toolbar-item spaced ${toolbarState.isCode ? 'active' : ''}`"
          :title="`Insert code block (${SHORTCUTS.INSERT_CODE_BLOCK})`"
          type="button"
          aria-label="Insert code block"
        >
          <i class="format code" />
        </button>
      </template>
      <button
        :disabled="!isEditable"
        @click="insertLink"
        :class="`toolbar-item spaced ${toolbarState.isLink ? 'active' : ''}`"
        :title="`Insert link (${SHORTCUTS.INSERT_LINK})`"
        type="button"
        aria-label="Insert link"
      >
        <i class="format link" />
      </button>

      <DropdownColorPicker
        :disabled="!isEditable"
        button-class-name="toolbar-item color-picker"
        button-aria-label="Formatting text color"
        button-icon-class-name="icon font-color"
        :color="toolbarState.fontColor"
        @change="onFontColorSelect"
        title="text color"
      />
      <DropdownColorPicker
        :disabled="!isEditable"
        button-class-name="toolbar-item color-picker"
        button-aria-label="Formatting background color"
        button-icon-class-name="icon bg-color"
        :color="toolbarState.bgColor"
        @change="onBgColorSelect"
        title="bg color"
      />

      <DropDown
        :disabled="!isEditable"
        button-class-name="toolbar-item spaced"
        button-label=""
        button-arial-label="Formatting options for additional text styles"
        button-icon-class-name="icon dropdown-more"
      >
        <DropDownItem
          @click="dispatchFormatTextCommand('lowercase', isKeyboardInput($event))"
          :class="`item wide ${dropDownActiveClass(toolbarState.isLowercase)}`"
          title="Lowercase"
          aria-label="Format text to lowercase"
        >
          <div class="icon-text-container">
            <i class="icon lowercase" />
            <span class="text">Lowercase</span>
          </div>
          <span class="shortcut">{{ SHORTCUTS.LOWERCASE }}</span>
        </DropDownItem>
        <DropDownItem
          @click="dispatchFormatTextCommand('uppercase', isKeyboardInput($event))"
          :class="`item wide ${dropDownActiveClass(toolbarState.isUppercase)}`"
          title="Uppercase"
          aria-label="Format text to uppercase"
        >
          <div class="icon-text-container">
            <i class="icon uppercase" />
            <span class="text">Uppercase</span>
          </div>
          <span class="shortcut">{{ SHORTCUTS.UPPERCASE }}</span>
        </DropDownItem>
        <DropDownItem
          @click="dispatchFormatTextCommand('capitalize', isKeyboardInput($event))"
          :class="`item wide ${dropDownActiveClass(toolbarState.isCapitalize)}`"
          title="Capitalize"
          aria-label="Format text to capitalize"
        >
          <div class="icon-text-container">
            <i class="icon capitalize" />
            <span class="text">Capitalize</span>
          </div>
          <span class="shortcut">{{ SHORTCUTS.CAPITALIZE }}</span>
        </DropDownItem>
        <DropDownItem
          @click="dispatchFormatTextCommand('strikethrough', isKeyboardInput($event))"
          :class="`item wide ${dropDownActiveClass(toolbarState.isStrikethrough)}`"
          title="Strikethrough"
          aria-label="Format text with a strikethrough"
        >
          <div class="icon-text-container">
            <i class="icon strikethrough" />
            <span class="text">Strikethrough</span>
          </div>
          <span class="shortcut">{{ SHORTCUTS.STRIKETHROUGH }}</span>
        </DropDownItem>
        <DropDownItem
          @click="dispatchFormatTextCommand('subscript', isKeyboardInput($event))"
          :class="`item wide ${dropDownActiveClass(toolbarState.isSubscript)}`"
          title="Subscript"
          aria-label="Format text with a subscript"
        >
          <div class="icon-text-container">
            <i class="icon subscript" />
            <span class="text">Subscript</span>
          </div>
          <span class="shortcut">{{ SHORTCUTS.SUBSCRIPT }}</span>
        </DropDownItem>
        <DropDownItem
          @click="dispatchFormatTextCommand('superscript', isKeyboardInput($event))"
          :class="`item wide ${dropDownActiveClass(toolbarState.isSuperscript)}`"
          title="Superscript"
          aria-label="Format text with a superscript"
        >
          <div class="icon-text-container">
            <i class="icon superscript" />
            <span class="text">Superscript</span>
          </div>
          <span class="shortcut">{{ SHORTCUTS.SUPERSCRIPT }}</span>
        </DropDownItem>
        <DropDownItem
          @click="dispatchFormatTextCommand('highlight', isKeyboardInput($event))"
          :class="`item wide ${dropDownActiveClass(toolbarState.isHighlight)}`"
          title="Highlight"
          aria-label="Format text with a highlight"
        >
          <div class="icon-text-container">
            <i class="icon highlight" />
            <span class="text">Highlight</span>
          </div>
        </DropDownItem>
        <DropDownItem
          @click="clearFormatting(activeEditorRef, isKeyboardInput($event))"
          class="item wide"
          title="Clear text formatting"
          aria-label="Clear all text formatting"
        >
          <div class="icon-text-container">
            <i class="icon clear" />
            <span class="text">Clear Formatting</span>
          </div>
          <span class="shortcut">{{ SHORTCUTS.CLEAR_FORMATTING }}</span>
        </DropDownItem>
      </DropDown>
      <template v-if="canViewerSeeInsertDropdown">
        <Divider />
        <DropDown
          :disabled="!isEditable"
          button-class-name="toolbar-item spaced"
          button-label="Insert"
          button-aria-label="Insert specialized editor node"
          button-icon-class-name="icon plus"
        >
          <DropDownItem
            @click="dispatchToolbarCommand(INSERT_HORIZONTAL_RULE_COMMAND)"
            class="item"
          >
            <i class="icon horizontal-rule" />
            <span class="text">Horizontal Rule</span>
          </DropDownItem>
          <DropDownItem
            @click="dispatchToolbarCommand(INSERT_PAGE_BREAK)"
            class="item"
          >
            <i class="icon page-break" />
            <span class="text">Page Break</span>
          </DropDownItem>
          <DropDownItem
            @click="
              () => {
                showModal('Insert Image', (onClose: () => void) => {
                  return h(InsertImageDialog, {
                    activeEditor,
                    onClose
                  })
                })
              }
            "
            class="item"
          >
            <i class="icon image" />
            <span class="text">Image</span>
          </DropDownItem>
          <DropDownItem
            @click="
              () =>
                insertGifOnClick({
                  altText: 'Cat typing on a laptop',
                  src: catTypingGif
                })
            "
            class="item"
          >
            <i class="icon gif" />
            <span class="text">GIF</span>
          </DropDownItem>
          <DropDownItem
            @click="dispatchToolbarCommand(INSERT_EXCALIDRAW_COMMAND)"
            class="item"
          >
            <i class="icon diagram-2" />
            <span class="text">Excalidraw</span>
          </DropDownItem>
          <DropDownItem
            @click="
              showModal('Insert Table', (onClose) =>
                h(InsertTableDialog, {
                  activeEditor,
                  onClose
                })
              )
            "
            class="item"
          >
            <i class="icon table" />
            <span class="text">Table</span>
          </DropDownItem>

          <DropDownItem
            @click="
              () => {
                showModal('Insert Poll', (onClose) =>
                  h(InsertPollDialog, {
                    activeEditor,
                    onClose
                  })
                )
              }
            "
            class="item"
          >
            <i class="icon poll" />
            <span class="text">Poll</span>
          </DropDownItem>
          <DropDownItem
            @click="
              () => {
                showModal('Insert Columns Layout', (onClose) =>
                  h(InsertLayoutDialog, {
                    activeEditor,
                    onClose
                  })
                )
              }
            "
            class="item"
          >
            <i class="icon columns" />
            <span class="text">Columns Layout</span>
          </DropDownItem>

          <DropDownItem
            @click="
              () => {
                showModal('Insert Equation', (onClose) =>
                  h(InsertEquationDialog, {
                    activeEditor,
                    onClose
                  })
                )
              }
            "
            class="item"
          >
            <i class="icon equation" />
            <span class="text">Equation</span>
          </DropDownItem>
          <DropDownItem
            @click="
              () => {
                editor.update(() => {
                  $addUpdateTag(SKIP_SELECTION_FOCUS_TAG)
                  const root = $getRoot()
                  const stickyNode = $createStickyNode(0, 0)
                  root.append(stickyNode)
                })
              }
            "
            class="item"
          >
            <i class="icon sticky" />
            <span class="text">Sticky Note</span>
          </DropDownItem>
          <DropDownItem
            @click="() => dispatchToolbarCommand(INSERT_COLLAPSIBLE_COMMAND)"
            class="item"
          >
            <i class="icon caret-right" />
            <span class="text">Collapsible container</span>
          </DropDownItem>
          <!-- TODO: add datetime plugin -->
          <!-- <DropDownItem
            @click="
              () => {
                const dateTime = new Date()
                dateTime.setHours(0, 0, 0, 0)
                dispatchToolbarCommand(INSERT_DATETIME_COMMAND, { dateTime })
              }
            "
            class="item"
          >
            <i class="icon calendar" />
            <span class="text">Date</span>
          </DropDownItem> -->
          <DropDownItem
            v-for="embedConfig in EmbedConfigs"
            :key="embedConfig.type"
            @click="() => dispatchToolbarCommand(INSERT_EMBED_COMMAND, embedConfig.type)"
            class="item"
          >
            {{ embedConfig.icon }}
            <span class="text">{{ embedConfig.contentName }}</span>
          </DropDownItem>
        </DropDown>
      </template>

      <Teleport to="body">
        <FloatingLinkEditor
          v-if="toolbarState.isLink"
          :priority="LowPriority"
        />
      </Teleport>
    </template>
    <!-- End: Font -->
  </div>
</template>
