<script setup lang="ts">
import { ErrorBoundary, useLexicalComposer } from "lexical-vue"
import { ref } from "vue"
import Button from "./Button.vue"
import KatexRenderer from "./KatexRenderer.vue"
const props = withDefaults(
  defineProps<{
    initialEquation?: string
  }>(),
  {
    initialEquation: ""
  }
)

const emit = defineEmits<{
  (event: "confirm", equation: string, inline: boolean): void
}>()

const editor = useLexicalComposer()
const equation = ref<string>(props.initialEquation)
const inline = ref<boolean>(true)

const onClick = () => {
  emit("confirm", equation.value, inline.value)
}

const onCheckboxChange = () => {
  inline.value = !inline.value
}
</script>

<template>
  <div class="KatexEquationAlterer_defaultRow">
    Inline
    <input
      type="checkbox"
      :checked="inline"
      @change="onCheckboxChange"
    />
  </div>
  <div class="KatexEquationAlterer_defaultRow">Equation</div>
  <div class="KatexEquationAlterer_centerRow">
    <input
      v-if="inline"
      v-model="equation"
      class="KatexEquationAlterer_textArea"
    />
    <textarea
      v-else
      v-model="equation"
      class="KatexEquationAlterer_textArea"
    />
  </div>
  <div class="KatexEquationAlterer_defaultRow">Visualization</div>
  <div class="KatexEquationAlterer_centerRow">
    <ErrorBoundary
      @error="(e) => editor._onError(e)"
      :fallback="null"
    >
      <KatexRenderer
        :equation="equation"
        :inline="false"
        @double-click="() => null"
      />
    </ErrorBoundary>
  </div>
  <div class="KatexEquationAlterer_dialogActions">
    <Button @click="onClick">Confirm</Button>
  </div>
</template>
