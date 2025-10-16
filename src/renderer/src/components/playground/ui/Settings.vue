<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { INITIAL_SETTINGS, useSettings } from "../composables/useSettings"
import { useEffect } from "lexical-vue"
import { CAN_USE_BEFORE_INPUT } from "@lexical/utils"
import { useBrowserLocation } from "@vueuse/core"
import Switch from "./Switch.vue"

const browserLocation = useBrowserLocation()
const { setOption, settings } = useSettings()
useEffect(() => {
  if (INITIAL_SETTINGS.disableBeforeInput && CAN_USE_BEFORE_INPUT) {
    console.error(`Legacy events are enabled (disableBeforeInput) but CAN_USE_BEFORE_INPUT is true`)
  }
}, [])
const showSettings = ref(false)

const isSplitScreen = computed(() => {
  const parentWindow = window.parent
  browserLocation.value.pathname
  return parentWindow && parentWindow.location.pathname === "/split/"
})

const search = computed(() => {
  return browserLocation.value.search
})

const windowLocation = window.location

const onSplitScreenClick = () => {
  if (isSplitScreen.value) {
    window.parent.location.href = `/${search.value}`
  } else {
    window.location.href = `/split/${search.value}`
  }
}
</script>

<template>
  <button
    id="options-button"
    :class="`editor-dev-button ${showSettings ? 'active' : ''}`"
    @click="() => (showSettings = !showSettings)"
  />

  <div
    v-if="showSettings"
    className="switches"
  >
    <Switch
      v-if="settings.isRichText"
      @click="
        () => {
          setOption('isCollab', !settings.isCollab)
          windowLocation.reload()
        }
      "
      :checked="settings.isCollab"
      text="Collaboration"
    />
    <Switch
      @click="onSplitScreenClick"
      :checked="isSplitScreen"
      text="Split Screen"
    />
    <Switch
      @click="() => setOption('measureTypingPerf', !settings.measureTypingPerf)"
      :checked="settings.measureTypingPerf"
      text="Measure Perf"
    />
    <Switch
      @click="() => setOption('showTreeView', !settings.showTreeView)"
      :checked="settings.showTreeView"
      text="Debug View"
    />
    <Switch
      @click="() => setOption('showNestedEditorTreeView', !settings.showNestedEditorTreeView)"
      :checked="settings.showNestedEditorTreeView"
      text="Nested Editors Debug View"
    />
    <Switch
      @click="
        () => {
          setOption('isRichText', !settings.isRichText)
          setOption('isCollab', false)
        }
      "
      :checked="settings.isRichText"
      text="Rich Text"
    />
    <Switch
      @click="() => setOption('isCharLimit', !settings.isCharLimit)"
      :checked="settings.isCharLimit"
      text="Char Limit"
    />
    <Switch
      @click="() => setOption('isCharLimitUtf8', !settings.isCharLimitUtf8)"
      :checked="settings.isCharLimitUtf8"
      text="Char Limit (UTF-8)"
    />
    <Switch
      @click="() => setOption('hasLinkAttributes', !settings.hasLinkAttributes)"
      :checked="settings.hasLinkAttributes"
      text="Link Attributes"
    />
    <Switch
      @click="() => setOption('isMaxLength', !settings.isMaxLength)"
      :checked="settings.isMaxLength"
      text="Max Length"
    />
    <Switch
      @click="() => setOption('isAutocomplete', !settings.isAutocomplete)"
      :checked="settings.isAutocomplete"
      text="Autocomplete"
    />
    <Switch
      @click="
        () => {
          setOption('showTableOfContents', !settings.showTableOfContents)
        }
      "
      :checked="settings.showTableOfContents"
      text="Table Of Contents"
    />
    <Switch
      @click="
        () => {
          setOption('shouldUseLexicalContextMenu', !settings.shouldUseLexicalContextMenu)
        }
      "
      :checked="settings.shouldUseLexicalContextMenu"
      text="Use Lexical Context Menu"
    />
    <Switch
      @click="
        () => {
          setOption('shouldPreserveNewLinesInMarkdown', !settings.shouldPreserveNewLinesInMarkdown)
        }
      "
      :checked="settings.shouldPreserveNewLinesInMarkdown"
      text="Preserve newlines in Markdown"
    />
    <!-- <Switch
      @click="
        () => {
          setOption('tableHorizontalScroll', !settings.tableHorizontalScroll)
        }
      "
      :checked="settings.tableHorizontalScroll"
      text="Tables have horizontal scroll"
    /> -->
    <Switch
      @click="
        () => {
          setOption(
            'shouldAllowHighlightingWithBrackets',
            !settings.shouldAllowHighlightingWithBrackets
          )
        }
      "
      :checked="settings.shouldAllowHighlightingWithBrackets"
      text="Use Brackets for Highlighting"
    />

    <Switch
      @click="
        () => {
          setOption('selectionAlwaysOnDisplay', !settings.selectionAlwaysOnDisplay)
        }
      "
      :checked="settings.selectionAlwaysOnDisplay"
      text="Retain selection"
    />

    <Switch
      @click="
        () => {
          setOption('isCodeHighlighted', !settings.isCodeHighlighted)
        }
      "
      :checked="settings.isCodeHighlighted"
      text="Enable Code Highlighting"
    />

    <Switch
      @click="
        () => {
          setOption('isCodeShiki', !settings.isCodeShiki)
        }
      "
      :checked="settings.isCodeShiki"
      text="Use Shiki for Code Highlighting"
    />
  </div>
</template>
