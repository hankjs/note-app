<script setup lang="ts">
import { dropDownActiveClass, rootTypeToRootName } from "./index.shared"
import DropDown from "../../ui/DropDown.vue"
import DropDownItem from "../../ui/DropDownItem.vue"
import { blockTypeToBlockName } from "../../composables/useToolbarState"
import {
  formatBulletList,
  formatCheckList,
  formatCode,
  formatHeading,
  formatNumberedList,
  formatParagraph,
  formatQuote
} from "./utils"
import { LexicalEditor } from "lexical"
import { SHORTCUTS } from "../ShortcutsPlugin/shortcuts"

withDefaults(
  defineProps<{
    blockType: keyof typeof blockTypeToBlockName
    rootType: keyof typeof rootTypeToRootName
    editor: LexicalEditor
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)
</script>

<template>
  <DropDown
    :disabled="disabled"
    button-class-name="toolbar-item block-controls"
    :button-icon-class-name="`icon block-type ${blockType}`"
    :button-label="blockTypeToBlockName[blockType]"
    button-aria-label="Formatting options for text style"
  >
    <DropDownItem
      :class="`item wide ${dropDownActiveClass(blockType === 'paragraph')}`"
      @click="() => formatParagraph(editor)"
    >
      <div className="icon-text-container">
        <i class="icon paragraph" />
        <span class="text">Normal</span>
      </div>
      <span className="shortcut">{{ SHORTCUTS.NORMAL }}</span>
    </DropDownItem>
    <DropDownItem
      :class="`item wide ${dropDownActiveClass(blockType === 'h1')}`"
      @click="formatHeading(editor, blockType, 'h1')"
    >
      <div className="icon-text-container">
        <i className="icon h1" />
        <span className="text">Heading 1</span>
      </div>
      <span className="shortcut">{{ SHORTCUTS.HEADING1 }}</span>
    </DropDownItem>
    <DropDownItem
      :class="`item wide ${dropDownActiveClass(blockType === 'h2')}`"
      @click="formatHeading(editor, blockType, 'h2')"
    >
      <div className="icon-text-container">
        <i className="icon h2" />
        <span className="text">Heading 2</span>
      </div>
      <span className="shortcut">{{ SHORTCUTS.HEADING2 }}</span>
    </DropDownItem>
    <DropDownItem
      :class="`item wide ${dropDownActiveClass(blockType === 'h3')}`"
      @click="formatHeading(editor, blockType, 'h3')"
    >
      <div className="icon-text-container">
        <i className="icon h3" />
        <span className="text">Heading 3</span>
      </div>
      <span className="shortcut">{{ SHORTCUTS.HEADING3 }}</span>
    </DropDownItem>
    <DropDownItem
      :class="`item wide ${dropDownActiveClass(blockType === 'number')}`"
      @click="formatNumberedList"
    >
      <div className="icon-text-container">
        <i className="icon numbered-list" />
        <span className="text">Numbered List</span>
      </div>
      <span className="shortcut">{{ SHORTCUTS.NUMBERED_LIST }}</span>
    </DropDownItem>
    <DropDownItem
      :class="`item wide ${dropDownActiveClass(blockType === 'bullet')}`"
      @click="formatBulletList"
    >
      <div className="icon-text-container">
        <i className="icon bullet-list" />
        <span className="text">Bullet List</span>
      </div>
      <span className="shortcut">{{ SHORTCUTS.BULLET_LIST }}</span>
    </DropDownItem>
    <DropDownItem
      :class="`item wide ${dropDownActiveClass(blockType === 'check')}`"
      @click="formatCheckList"
    >
      <div className="icon-text-container">
        <i className="icon check-list" />
        <span className="text">Check List</span>
      </div>
      <span className="shortcut">{{ SHORTCUTS.CHECK_LIST }}</span>
    </DropDownItem>
    <DropDownItem
      :class="`item wide ${dropDownActiveClass(blockType === 'quote')}`"
      @click="formatQuote"
    >
      <div className="icon-text-container">
        <i className="icon quote" />
        <span className="text">Quote</span>
      </div>
      <span className="shortcut">{{ SHORTCUTS.QUOTE }}</span>
    </DropDownItem>
    <DropDownItem
      :class="`item wide ${dropDownActiveClass(blockType === 'code')}`"
      @click="formatCode"
    >
      <div className="icon-text-container">
        <i className="icon code" />
        <span className="text">Code Block</span>
      </div>
      <span className="shortcut">{{ SHORTCUTS.CODE_BLOCK }}</span>
    </DropDownItem>
  </DropDown>
</template>
