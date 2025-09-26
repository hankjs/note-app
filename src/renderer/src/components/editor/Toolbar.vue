<template>
  <div class="toolbar">
    <button
      :disabled="!canUndo || !isEditable"
      @click="dispatch(UNDO_COMMAND)"
      class="toolbar-item spaced"
      title="撤銷 (⌘Z)"
      aria-label="Undo"
    >
      <i class="format undo"></i>
    </button>
    <button
      :disabled="!canRedo || !isEditable"
      @click="dispatch(REDO_COMMAND)"
      class="toolbar-item"
      title="重做 (⇧⌘Z)"
      aria-label="Redo"
    >
      <i class="format redo"></i>
    </button>

    <div class="divider"></div>

    <template v-if="blockType && activeEditorRef === editorRef">
      <select
        class="toolbar-item block-controls"
        :disabled="!isEditable"
        v-model="blockType"
        @change="onChangeBlockType"
        aria-label="Formatting options for text style"
      >
        <option value="paragraph">Normal</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="number">Numbered List</option>
        <option value="bullet">Bullet List</option>
        <option value="check">Check List</option>
        <option value="quote">Quote</option>
        <option value="code">Code Block</option>
      </select>
      <div class="divider"></div>
    </template>

    <template v-if="blockType === 'code' && isCodeHighlighted">
      <select
        class="toolbar-item code-language"
        :disabled="!isEditable"
        v-model="codeLanguage"
        @change="onCodeLanguageSelect"
        aria-label="Select language"
      >
        <option v-for="opt in codeLanguageOptions" :key="opt[0]" :value="opt[0]">{{ opt[1] }}</option>
      </select>
      <template v-if="isCodeShiki">
        <select
          class="toolbar-item code-language"
          :disabled="!isEditable"
          v-model="codeTheme"
          @change="onCodeThemeSelect"
          aria-label="Select theme"
        >
          <option v-for="opt in codeThemeOptionsShiki" :key="opt[0]" :value="opt[0]">{{ opt[1] }}</option>
        </select>
      </template>
    </template>
    <template v-else>
      <select
        class="toolbar-item font-family"
        :disabled="!isEditable"
        v-model="fontFamily"
        @change="onFontFamilyChange"
        aria-label="Formatting options for font family"
      >
        <option v-for="opt in FONT_FAMILY_OPTIONS" :key="opt[0]" :value="opt[0]">{{ opt[1] }}</option>
      </select>
      <div class="divider"></div>
      <input
        class="toolbar-item font-size-input"
        :disabled="!isEditable"
        type="number"
        min="10"
        max="72"
        v-model="fontSizeNum"
        @change="onFontSizeChange"
      />
      <div class="divider"></div>

      <button
        :disabled="!isEditable"
        @click="formatText('bold')"
        :class="['toolbar-item spaced', { active: isBold }]"
        :title="`Bold (⌘B)`"
        aria-label="Format text as bold"
        type="button"
      >
        <i class="format bold" />
      </button>
      <button
        :disabled="!isEditable"
        @click="formatText('italic')"
        :class="['toolbar-item spaced', { active: isItalic }]"
        :title="`Italic (⌘I)`"
        aria-label="Format text as italics"
        type="button"
      >
        <i class="format italic" />
      </button>
      <button
        :disabled="!isEditable"
        @click="formatText('underline')"
        :class="['toolbar-item spaced', { active: isUnderline }]"
        :title="`Underline (⌘U)`"
        aria-label="Format text to underlined"
        type="button"
      >
        <i class="format underline" />
      </button>

      <button
        v-if="!isImageCaption"
        :disabled="!isEditable"
        @click="formatText('code')"
        :class="['toolbar-item spaced', { active: isCode }]"
        title="Insert code"
        type="button"
        aria-label="Insert code"
      >
        <i class="format code" />
      </button>

      <button
        :disabled="!isEditable"
        @click="insertLink"
        :class="['toolbar-item spaced', { active: isLink }]"
        aria-label="Insert link"
        title="Insert link (⌘K)"
        type="button"
      >
        <i class="format link" />
      </button>

      <input
        class="toolbar-item color-picker"
        :disabled="!isEditable"
        type="color"
        v-model="fontColor"
        @input="onFontColorSelect"
        title="text color"
      />
      <input
        class="toolbar-item color-picker"
        :disabled="!isEditable"
        type="color"
        v-model="bgColor"
        @input="onBgColorSelect"
        title="bg color"
      />
    </template>

    <div class="divider"></div>

    <select
      class="toolbar-item spaced alignment"
      :disabled="!isEditable"
      v-model="elementFormat"
      @change="onElementFormatChange"
      aria-label="Formatting options for text alignment"
    >
      <option value="left">Left Align</option>
      <option value="center">Center Align</option>
      <option value="right">Right Align</option>
      <option value="justify">Justify Align</option>
      <option value="start">Start Align</option>
      <option value="end">End Align</option>
    </select>
  </div>
  
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, shallowRef } from 'vue'
import type { LexicalEditor, ElementFormatType } from 'lexical'
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getNodeByKey,
  $getRoot,
  $isElementNode,
} from 'lexical'
import { $isHeadingNode } from '@lexical/rich-text'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { $isListNode, ListNode } from '@lexical/list'
import { $isParentElementRTL, $patchStyleText, $getSelectionStyleValueForProperty } from '@lexical/selection'
import { $findMatchingParent, $getNearestNodeOfType, IS_APPLE, mergeRegister } from '@lexical/utils'
import { $isTableNode, $isTableSelection } from '@lexical/table'
import { $isCodeNode, getCodeLanguageOptions as getCodeLanguageOptionsPrism } from '@lexical/code'
import { getCodeLanguageOptions as getCodeLanguageOptionsShiki, getCodeThemeOptions as getCodeThemeOptionsShiki } from '@lexical/code-shiki'

// Utils reused from project
import { sanitizeUrl } from '../../utils/url'
import { getSelectedNode } from '../../utils/getSelectedNode'

interface Props {
  editor: LexicalEditor
  activeEditor: LexicalEditor
}

const props = defineProps<Props>()

// Expose for template
const editorRef = shallowRef<LexicalEditor>(props.editor)
const activeEditorRef = shallowRef<LexicalEditor>(props.activeEditor)

// State
const isEditable = ref(props.editor.isEditable())
const canUndo = ref(false)
const canRedo = ref(false)
const isRTL = ref(false)
const isLink = ref(false)
const isImageCaption = ref(false)
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)
const isStrikethrough = ref(false)
const isSubscript = ref(false)
const isSuperscript = ref(false)
const isHighlight = ref(false)
const isCode = ref(false)
const elementFormat = ref<ElementFormatType>('left')
const fontFamily = ref('Arial')
const fontSize = ref('15px')
const fontSizeNum = ref(15)
const fontColor = ref('#000000')
const bgColor = ref('#ffffff')
const blockType = ref<'paragraph' | 'h1' | 'h2' | 'h3' | 'number' | 'bullet' | 'check' | 'quote' | 'code'>('paragraph')
const selectedElementKey = ref<string | null>(null)
const codeLanguage = ref('')
const codeTheme = ref('')

// Settings fallback
const isCodeHighlighted = true
const isCodeShiki = true

// Options
const FONT_FAMILY_OPTIONS: [string, string][] = [
  ['Arial', 'Arial'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
]

const codeLanguageOptions = ref<[string, string][]>([])
const codeThemeOptionsShiki = ref<[string, string][]>([])

function initCodeOptions() {
  const allow = [
    'c','clike','cpp','css','html','java','js','javascript','markdown','objc','objective-c','plain','powershell','py','python','rust','sql','typescript','xml',
  ]
  codeLanguageOptions.value = (isCodeShiki ? getCodeLanguageOptionsShiki() : getCodeLanguageOptionsPrism()).filter((o) => allow.includes(o[0]))
  const themeAllow = [
    'catppuccin-latte','everforest-light','github-light','gruvbox-light-medium','kanagawa-lotus','dark-plus','light-plus','material-theme-lighter','min-light','one-light','rose-pine-dawn','slack-ochin','snazzy-light','solarized-light','vitesse-light',
  ]
  codeThemeOptionsShiki.value = getCodeThemeOptionsShiki().filter((o) => themeAllow.includes(o[0]))
}

function dispatch(command: any, payload?: any) {
  activeEditorRef.value.dispatchCommand(command, payload as any)
}

function formatText(format: any) {
  dispatch(FORMAT_TEXT_COMMAND, format)
}

function applyStyleText(styles: Record<string, string>) {
  activeEditorRef.value.update(() => {
    const selection = $getSelection()
    if (selection) {
      $patchStyleText(selection, styles)
    }
  })
}

function onFontColorSelect() {
  applyStyleText({ color: fontColor.value })
}

function onBgColorSelect() {
  applyStyleText({ 'background-color': bgColor.value })
}

function insertLink() {
  if (!isLink.value) {
    dispatch(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'))
  } else {
    dispatch(TOGGLE_LINK_COMMAND, null)
  }
}

function onCodeLanguageSelect() {
  activeEditorRef.value.update(() => {
    if (selectedElementKey.value) {
      const node = $getNodeByKey(selectedElementKey.value)
      if (node && $isCodeNode(node)) {
        node.setLanguage(codeLanguage.value)
      }
    }
  })
}

function onCodeThemeSelect() {
  activeEditorRef.value.update(() => {
    if (selectedElementKey.value) {
      const node = $getNodeByKey(selectedElementKey.value)
      if (node && $isCodeNode(node)) {
        node.setTheme(codeTheme.value)
      }
    }
  })
}

function onFontFamilyChange() {
  applyStyleText({ 'font-family': fontFamily.value })
}

function onFontSizeChange() {
  const px = `${Number(fontSizeNum.value) || 15}px`
  fontSize.value = px
  applyStyleText({ 'font-size': px })
}

function onElementFormatChange() {
  dispatch(FORMAT_ELEMENT_COMMAND, elementFormat.value)
}

function onChangeBlockType() {
  // Minimal support: paragraphs and headings, lists via commands
  activeEditorRef.value.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return
    const anchorNode = selection.anchor.getNode()
    const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow()
    switch (blockType.value) {
      case 'h1':
      case 'h2':
      case 'h3':
        if ($isElementNode(element)) {
          const tag = blockType.value
          const heading = ($isHeadingNode as any)(element) ? element : (window as any).$createHeadingNode?.(tag) || element
          if (heading !== element) {
            const children = element.getChildren()
            children.forEach((c: any) => heading.append(c))
            element.replace(heading)
          }
        }
        break
      case 'quote':
      case 'code':
      case 'paragraph':
      default:
        // For brevity, rely on format buttons or other UI in app
        break
    }
  })
}

function updateToolbar() {
  const editor = activeEditorRef.value
  const selection = $getSelection()
  if ($isRangeSelection(selection)) {
    // Image caption detection omitted in this Vue version; keep false
    isImageCaption.value = false

    const anchorNode = selection.anchor.getNode()
    const node = getSelectedNode(selection as any)
    const parent = node.getParent()
    const element = (anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow()) as any
    const elementKey = element.getKey()
    selectedElementKey.value = elementKey

    isRTL.value = $isParentElementRTL(selection)
    isLink.value = $isLinkNode(parent) || $isLinkNode(node as any)

    const tableNode = $findMatchingParent(node as any, $isTableNode as any)
    // rootType not surfaced in this stripped toolbar

    if ($isListNode(element)) {
      const parentList = $getNearestNodeOfType<ListNode>(anchorNode as any, ListNode)
      const type = parentList ? parentList.getListType() : element.getListType()
      blockType.value = type as any
    } else {
      if ($isHeadingNode(element)) {
        blockType.value = element.getTag()
      } else {
        const t = element.getType()
        blockType.value = (t === 'code' || t === 'quote') ? (t as any) : 'paragraph'
      }
      if ($isCodeNode(element)) {
        const language = element.getLanguage()
        codeLanguage.value = language || ''
        const theme = element.getTheme?.() || ''
        codeTheme.value = theme || ''
      }
    }

    fontColor.value = $getSelectionStyleValueForProperty(selection, 'color', '#000')
    bgColor.value = $getSelectionStyleValueForProperty(selection, 'background-color', '#fff')
    fontFamily.value = $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial')
    fontSize.value = $getSelectionStyleValueForProperty(selection, 'font-size', '15px')
    const parsed = Number(String(fontSize.value).replace(/px$/, ''))
    fontSizeNum.value = isNaN(parsed) ? 15 : parsed

    let matchingParent: any
    if ($isLinkNode(parent)) {
      matchingParent = $findMatchingParent(node as any, (parentNode: any) => $isElementNode(parentNode) && !parentNode.isInline())
    }
    elementFormat.value = ($isElementNode(matchingParent)
      ? matchingParent.getFormatType()
      : ($isElementNode(node as any) ? (node as any).getFormatType() : (parent as any)?.getFormatType() || 'left')) as ElementFormatType
  }

  if ($isRangeSelection(selection) || $isTableSelection(selection as any)) {
    isBold.value = selection.hasFormat('bold')
    isItalic.value = selection.hasFormat('italic')
    isUnderline.value = selection.hasFormat('underline')
    isStrikethrough.value = selection.hasFormat('strikethrough')
    isSubscript.value = selection.hasFormat('subscript')
    isSuperscript.value = selection.hasFormat('superscript')
    isHighlight.value = selection.hasFormat('highlight')
    isCode.value = selection.hasFormat('code')
  }
}

let unregisterAll: null | (() => void) = null

onMounted(() => {
  initCodeOptions()
  const base = props.editor
  const active = props.activeEditor
  editorRef.value = base
  activeEditorRef.value = active

  unregisterAll = mergeRegister(
    base.registerEditableListener((editable) => {
      isEditable.value = editable
    }),
    active.registerCommand(SELECTION_CHANGE_COMMAND, (_payload, newEditor) => {
      activeEditorRef.value = newEditor as any
      newEditor.getEditorState().read(() => updateToolbar())
      return false
    }, COMMAND_PRIORITY_CRITICAL),
    active.registerUpdateListener(({ editorState }) => {
      editorState.read(() => updateToolbar())
    }),
    active.registerCommand<boolean>(CAN_UNDO_COMMAND, (payload) => {
      canUndo.value = payload
      return false
    }, COMMAND_PRIORITY_CRITICAL),
    active.registerCommand<boolean>(CAN_REDO_COMMAND, (payload) => {
      canRedo.value = payload
      return false
    }, COMMAND_PRIORITY_CRITICAL),
  )

  active.getEditorState().read(() => updateToolbar())
})

onUnmounted(() => {
  if (unregisterAll) unregisterAll()
})

// expose commands used in template
defineExpose({ UNDO_COMMAND, REDO_COMMAND })
</script>

<style scoped>
.toolbar { display: flex; align-items: center; gap: 4px; }
.toolbar-item { height: 28px; }
.spaced { margin-right: 4px; }
.divider { width: 1px; height: 20px; background: var(--divider, #e5e7eb); margin: 0 6px; }
.active { background: rgba(0,0,0,0.06); }
.font-size-input { width: 56px; padding: 0 6px; }
.color-picker { width: 32px; padding: 0; border: none; background: transparent; }
</style>



