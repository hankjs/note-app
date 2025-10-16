<script setup lang="ts">
import { getTransformSetFromKlass, LexicalNestedComposerProps } from "./LexicalNestedComposer.shard"
import { computed, provide, ref } from "vue"
import {
  createLexicalComposerContext,
  LexicalComposerContextType,
  LexicalComposerContextWithEditor,
  useLexicalComposerContext
} from "../composables"
import {
  createSharedNodeState,
  EditorThemeClasses,
  getRegisteredNode,
  LexicalEditor,
  LexicalNodeReplacement
} from "lexical"
import { invariant, warnOnlyOnce } from "shared"
import collaborationContext from "../composables/useCollaborationContext"
import { LexicalEditorContextProviderKey, LexicalEditorProviderKey } from "../composables/inject"
const initialNodesWarning = warnOnlyOnce(
  `LexicalNestedComposer initialNodes is deprecated and will be removed in v0.32.0, it has never worked correctly.\nYou can configure your editor's nodes with createEditor({nodes: [], parentEditor: $getEditor()})`
)
const explicitNamespaceWarning = warnOnlyOnce(
  `LexicalNestedComposer initialEditor should explicitly initialize its namespace when the node configuration differs from the parentEditor. For backwards compatibility, the namespace will be initialized from parentEditor until v0.32.0, but this has always had incorrect copy/paste behavior when the configuration differed.\nYou can configure your editor's namespace with createEditor({namespace: 'nested-editor-namespace', nodes: [], parentEditor: $getEditor()}).`
)

const props = defineProps<LexicalNestedComposerProps>()
const wasCollabPreviouslyReadyRef = ref(false)
const parentContext = useLexicalComposerContext()
if (parentContext == null) {
  invariant(false, "Unexpected parent context null on a nested composer")
}
const { editor: parentEditor, getTheme: getParentTheme } = parentContext
const { initialEditor, initialNodes } = props
const composerContext = computed<LexicalComposerContextWithEditor>(() => {
  const composerTheme: EditorThemeClasses | undefined =
    props.initialTheme || getParentTheme() || undefined

  const { getTheme }: LexicalComposerContextType = createLexicalComposerContext(
    parentContext,
    composerTheme
  )

  if (composerTheme !== undefined) {
    initialEditor._config.theme = composerTheme
  }

  initialEditor._parentEditor = initialEditor._parentEditor || parentEditor
  const createEditorArgs = initialEditor._createEditorArgs
  const explicitNamespace = createEditorArgs && createEditorArgs.namespace

  if (!initialNodes) {
    if (!(createEditorArgs && createEditorArgs.nodes)) {
      const parentNodes = (initialEditor._nodes = new Map(parentEditor._nodes))
      if (!explicitNamespace) {
        // This is the only safe situation to inherit the parent's namespace
        initialEditor._config.namespace = parentEditor._config.namespace
      }
      for (const [type, entry] of parentNodes) {
        initialEditor._nodes.set(type, {
          exportDOM: entry.exportDOM,
          klass: entry.klass,
          replace: entry.replace,
          replaceWithKlass: entry.replaceWithKlass,
          sharedNodeState: createSharedNodeState(entry.klass),
          transforms: getTransformSetFromKlass(entry.klass)
        })
      }
    } else if (!explicitNamespace) {
      explicitNamespaceWarning()
      initialEditor._config.namespace = parentEditor._config.namespace
    }
  } else {
    initialNodesWarning()
    if (!explicitNamespace) {
      explicitNamespaceWarning()
      initialEditor._config.namespace = parentEditor._config.namespace
    }
    for (let klass of initialNodes) {
      let replace: LexicalNodeReplacement["with"] | null = null
      let replaceWithKlass: LexicalNodeReplacement["withKlass"] | null = null

      if (typeof klass !== "function") {
        const options = klass
        klass = options.replace
        replace = options.with
        replaceWithKlass = options.withKlass || null
      }
      const registeredKlass = getRegisteredNode(initialEditor, klass.getType())

      initialEditor._nodes.set(klass.getType(), {
        exportDOM: registeredKlass ? registeredKlass.exportDOM : undefined,
        klass,
        replace,
        replaceWithKlass,
        sharedNodeState: createSharedNodeState(klass),
        transforms: getTransformSetFromKlass(klass)
      })
    }
  }

  return {
    editor: initialEditor,
    getTheme: getTheme
  }
})

const isCollabReady = computed(
  () =>
    props.skipCollabChecks ||
    wasCollabPreviouslyReadyRef.value ||
    (collaborationContext.value?.yjsDocMap &&
      collaborationContext.value.yjsDocMap.has(initialEditor.getKey()))
)
const isCollabActive = computed(() => collaborationContext.value.isCollabActive)

provide<LexicalEditor>(LexicalEditorProviderKey, composerContext.value.editor)
provide<LexicalComposerContextWithEditor>(LexicalEditorContextProviderKey, composerContext.value)
</script>

<template>
  <slot v-if="!isCollabActive || isCollabReady" />
</template>
