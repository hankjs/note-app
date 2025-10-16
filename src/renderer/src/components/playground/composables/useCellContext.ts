import { Component, inject, InjectionKey, Ref, ref } from 'vue'
import {EditorThemeClasses, Klass, LexicalEditor, LexicalNode} from 'lexical';
import { invariant } from 'shared';

export type CellEditorConfigShape = null | CellEditorConfig;
export type CellEditorPluginsShape = null | Component | Array<Component>;

export type CellContextShape = {
  cellEditorConfig: Ref<CellEditorConfigShape>;
  cellEditorPlugins: Ref<CellEditorPluginsShape>;
  set: (
    cellEditorConfig: CellEditorConfigShape,
    cellEditorPlugins: CellEditorPluginsShape,
  ) => void;
};

export type CellEditorConfig = Readonly<{
  namespace: string;
  nodes?: ReadonlyArray<Klass<LexicalNode>>;
  onError: (error: Error, editor: LexicalEditor) => void;
  readOnly?: boolean;
  theme?: EditorThemeClasses;
}>;


export const CellContextProviderKey: InjectionKey<CellContextShape> = Symbol('CellContextProviderKey')

export function useCellContextProvider(): CellContextShape {
  const cellEditorConfig = ref<CellEditorConfigShape>(null)
  const cellEditorPlugins = ref<CellEditorPluginsShape>(null)

  const set = (config: CellEditorConfigShape, plugins: CellEditorPluginsShape) => {
    cellEditorConfig.value = config
    cellEditorPlugins.value = plugins
  }

  return {
    cellEditorConfig,
    cellEditorPlugins,
    set,
  }
}

export function useCellContext(): CellContextShape {
  const context = inject(CellContextProviderKey)
  if (!context) {
    invariant(false, 'useCellContext must be used within a CellContextProvider')
  }
  return context
}