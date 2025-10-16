<script setup lang="ts">
import {
  LexicalAutoFocusPlugin,
  LexicalCheckListPlugin,
  LexicalClickableLinkPlugin,
  LexicalHashtagPlugin,
  LexicalHistoryPlugin,
  LexicalLinkPlugin,
  LexicalListPlugin,
  LexicalRichTextPlugin,
  LexicalTablePlugin,
  useLexicalComposer
} from "lexical-vue"

import EmojisPlugin from "./plugins/EmojisPlugin.vue"
import EmojiPickerPlugin from "./plugins/EmojiPickerPlugin.vue"
import TreeViewPlugin from "./plugins/TreeViewPlugin.vue"
import ToolbarPlugin from "./plugins/ToolbarPlugin/ToolbarPlugin.vue"
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin.vue"
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin.vue"
import AutoLinkPlugin from "./plugins/AutoLinkPlugin.vue"
import MarkdownShortcutPlugin from "./plugins/MarkdownShortcutPlugin.vue"
import ContentEditable from "./ui/ContentEditable.vue"
import MentionsPlugin from "./plugins/MentionsPlugin.vue"
import AutoEmbedPlugin from "./plugins/AutoEmbedPlugin/index.vue"
import YouTubePlugin from "./plugins/YouTubePlugin/index.vue"
import TwitterPlugin from "./plugins/TwitterPlugin/index.vue"
import FloatingLinkEditor from "./plugins/FloatingLinkEditor.vue"
import PageBreakPlugin from "./plugins/PageBreakPlugin.vue"
import { shallowRef } from "vue"
import type { LexicalEditor } from "lexical"
import ImagesPlugin from "./plugins/ImagesPlugin/ImagesPlugin.vue"
import ExcalidrawPlugin from "./plugins/ExcalidrawPlugin/ExcalidrawPlugin.vue"
import TablePluginComposer from "./plugins/TablePlugin/TablePluginComposer.vue"
import { useSettings } from "./composables/useSettings"
import PollPlugin from "./plugins/PollPlugin/PollPlugin.vue"
import LayoutPlugin from "./plugins/LayoutPlugin/LayoutPlugin.vue"
import EquationsPlugin from "./plugins/EquationsPlugin/EquationsPlugin.vue"
import CollapsiblePlugin from "./plugins/CollapsiblePlugin/CollapsiblePlugin.vue"
// import DateTimePlugin from "./plugins/DateTimePlugin/DateTimePlugin.vue"

const editor = useLexicalComposer()
const activeEditor = shallowRef<LexicalEditor>(editor)

const {
  settings: {
    isCodeHighlighted,
    isCodeShiki,
    isCollab,
    useCollabV2,
    isAutocomplete,
    isMaxLength,
    isCharLimit,
    hasLinkAttributes,
    isCharLimitUtf8,
    isRichText,
    showTreeView,
    showTableOfContents,
    shouldUseLexicalContextMenu,
    shouldPreserveNewLinesInMarkdown,
    tableCellMerge,
    tableCellBackgroundColor,
    tableHorizontalScroll,
    shouldAllowHighlightingWithBrackets,
    selectionAlwaysOnDisplay,
    listStrictIndent
  }
} = useSettings()
</script>

<template>
  <LexicalHistoryPlugin>
    <TablePluginComposer>
      <ToolbarPlugin
        v-model:activeEditor="activeEditor"
      />
      <div class="editor-container">
        <div className="editor-inner">
          <LexicalRichTextPlugin>
            <template #contentEditable>
              <div class="editor-scroller">
                <div class="editor">
                  <ContentEditable />
                </div>
              </div>
            </template>
            <template #placeholder>
              <div class="editor-placeholder">Enter some text...</div>
            </template>
          </LexicalRichTextPlugin>
          <LexicalTablePlugin
            :hasCellMerge="tableCellMerge"
            :hasCellBackgroundColor="tableCellBackgroundColor"
            :hasHorizontalScroll="tableHorizontalScroll"
          />
          <AutoEmbedPlugin />
          <TreeViewPlugin />
          <LexicalAutoFocusPlugin />
          <CodeHighlightPlugin />
          <LexicalListPlugin />
          <LexicalCheckListPlugin />
          <LexicalLinkPlugin />
          <AutoLinkPlugin />
          <ListMaxIndentLevelPlugin :max-depth="7" />
          <LexicalHashtagPlugin />
          <MarkdownShortcutPlugin />
          <EmojiPickerPlugin />
          <EmojisPlugin />
          <MentionsPlugin />
          <LexicalClickableLinkPlugin />
          <YouTubePlugin />
          <TwitterPlugin />
          <FloatingLinkEditor :priority="1" />
          <PageBreakPlugin />
          <ImagesPlugin />
          <ExcalidrawPlugin />
          <PollPlugin />
          <LayoutPlugin />
          <EquationsPlugin />
          <CollapsiblePlugin />
          <!-- <DateTimePlugin /> -->
        </div>
      </div>
    </TablePluginComposer>
  </LexicalHistoryPlugin>
</template>
