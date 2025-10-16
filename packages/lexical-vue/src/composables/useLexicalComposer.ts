import { inject } from 'vue'
import invariant from 'tiny-invariant'
import type { EditorThemeClasses, LexicalEditor } from 'lexical'
import { LexicalEditorProviderKey, LexicalEditorContextProviderKey } from './inject'

export type LexicalComposerContextType = {
  getTheme: () => EditorThemeClasses | null | undefined;
};

export type LexicalComposerContextWithEditor = LexicalComposerContextType&  {
  editor: LexicalEditor,
} 

export function useLexicalComposer() {
  const editor = inject<LexicalEditor>(LexicalEditorProviderKey)

  if (!editor) {
    invariant(
      false,
      'useLexicalComposer: cannot find a LexicalComposer',
    )
  }

  return editor
}

export function createLexicalComposerContext(
  parent: LexicalComposerContextWithEditor | null | undefined,
  theme: EditorThemeClasses | null | undefined,
): LexicalComposerContextType {
  let parentContext: LexicalComposerContextType | null = null;

  if (parent != null) {
    parentContext = parent;
  }

  function getTheme() {
    if (theme != null) {
      return theme;
    }

    return parentContext != null ? parentContext.getTheme() : null;
  }

  return {
    getTheme,
  };
}

export function useLexicalComposerContext(): LexicalComposerContextWithEditor {
  const composerContext = inject<LexicalComposerContextWithEditor>(LexicalEditorContextProviderKey)

  if (composerContext == null) {
    invariant(
      false,
      'LexicalComposerContext.useLexicalComposerContext: cannot find a LexicalComposerContext',
    );
  }

  return composerContext;
}
