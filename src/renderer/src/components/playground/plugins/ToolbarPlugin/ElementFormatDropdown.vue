<script setup lang="ts">
import { ElementFormatType, type LexicalEditor, FORMAT_ELEMENT_COMMAND, OUTDENT_CONTENT_COMMAND, INDENT_CONTENT_COMMAND } from 'lexical'
import { ELEMENT_FORMAT_OPTIONS } from './index.shared'
import DropDown from '../../ui/DropDown.vue'
import DropDownItem from '../../ui/DropDownItem.vue'
import { SHORTCUTS } from '../ShortcutsPlugin/shortcuts'

const props = withDefaults(defineProps<{
  editor: LexicalEditor
  value: ElementFormatType
  isRTL: string
  disabled?: boolean
}>(), {
  disabled: false,
})

const formatOption = ELEMENT_FORMAT_OPTIONS[props.value || 'left'];
</script>

<template>
  <DropDown :disabled="disabled"
    button-class-name="toolbar-item spaced alignment" :button-label="value"
    :button-icon-class-name="`icon ${isRTL ? formatOption.iconRTL : formatOption.icon
      }`" button-aria-label="Formatting options for text alignment">
    <DropDownItem @click="() => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
    }" class="item wide">
      <div class="icon-text-container">
        <i class="icon left-align" />
        <span class="text">Left Align</span>
      </div>
      <span class="shortcut">{{ SHORTCUTS.LEFT_ALIGN }}</span>
    </DropDownItem>
    <DropDownItem @click="() => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
    }" class="item wide">
      <div class="icon-text-container">
        <i class="icon center-align" />
        <span class="text">Center Align</span>
      </div>
      <span class="shortcut">{{ SHORTCUTS.CENTER_ALIGN }}</span>
    </DropDownItem>
    <DropDownItem @click="() => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
    }" class="item wide">
      <div class="icon-text-container">
        <i class="icon right-align" />
        <span class="text">Right Align</span>
      </div>
      <span class="shortcut">{{ SHORTCUTS.RIGHT_ALIGN }}</span>
    </DropDownItem>
    <DropDownItem @click="() => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
    }" class="item wide">
      <div class="icon-text-container">
        <i class="icon justify-align" />
        <span class="text">Justify Align</span>
      </div>
      <span class="shortcut">{{ SHORTCUTS.JUSTIFY_ALIGN }}</span>
    </DropDownItem>
    <DropDownItem @click="() => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'start');
    }" class="item wide">
      <i class="`icon ${
            isRTL
              ? ELEMENT_FORMAT_OPTIONS.start.iconRTL
              : ELEMENT_FORMAT_OPTIONS.start.icon
          }`" />
      <span class="text">Start Align</span>
    </DropDownItem>
    <DropDownItem @click="() => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'end');
    }" class="item wide">
      <i class="`icon ${
            isRTL
              ? ELEMENT_FORMAT_OPTIONS.end.iconRTL
              : ELEMENT_FORMAT_OPTIONS.end.icon
          }`" />
      <span class="text">End Align</span>
    </DropDownItem>
    <Divider />
    <DropDownItem @click="() => {
      editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
    }" class="item wide">
      <div class="icon-text-container">
        <i :class="`icon ${(isRTL ? 'indent' : 'outdent')}`" />
        <span class="text">Outdent</span>
      </div>
      <span class="shortcut">{{ SHORTCUTS.OUTDENT }}</span>
    </DropDownItem>
    <DropDownItem @click="() => {
      editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
    }" class="item wide">
      <div class="icon-text-container">
        <i :class="`icon ${(isRTL ? 'outdent' : 'indent')}`" />
        <span class="text">Indent</span>
      </div>
      <span class="shortcut">{{ SHORTCUTS.INDENT }}</span>
    </DropDownItem>
  </DropDown>
</template>
