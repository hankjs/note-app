import { computed, inject, InjectionKey, reactive, watch } from 'vue'
import { invariant } from 'shared'
import { ElementFormatType } from 'lexical';


export const MIN_ALLOWED_FONT_SIZE = 8;
export const MAX_ALLOWED_FONT_SIZE = 72;
export const DEFAULT_FONT_SIZE = 15;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rootTypeToRootName = {
  root: 'Root',
  table: 'Table',
};

export const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  check: 'Check List',
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
};

export type BlockType = keyof typeof blockTypeToBlockName;
//disable eslint sorting rule for quick reference to toolbar state
/* eslint-disable sort-keys-fix/sort-keys-fix */
const INITIAL_TOOLBAR_STATE = {
  bgColor: '#fff',
  blockType: 'paragraph' as BlockType,
  canRedo: false,
  canUndo: false,
  codeLanguage: '',
  codeTheme: '',
  elementFormat: 'left' as ElementFormatType,
  fontColor: '#000',
  fontFamily: 'Arial',
  // Current font size in px
  fontSize: `${DEFAULT_FONT_SIZE}px`,
  // Font size input value - for controlled input
  fontSizeInputValue: `${DEFAULT_FONT_SIZE}`,
  isBold: false,
  isCode: false,
  isHighlight: false,
  isImageCaption: false,
  isItalic: false,
  isLink: false,
  isRTL: false,
  isStrikethrough: false,
  isSubscript: false,
  isSuperscript: false,
  isUnderline: false,
  isLowercase: false,
  isUppercase: false,
  isCapitalize: false,
  rootType: 'root' as keyof typeof rootTypeToRootName,
  listStartNumber: null as number | null,
};

type ToolbarState = typeof INITIAL_TOOLBAR_STATE;

// Utility type to get keys and infer value types
export type ToolbarStateKey = keyof ToolbarState;
export type ToolbarStateValue<Key extends ToolbarStateKey> = ToolbarState[Key];

type ToolbarStateProvider = {
  toolbarState: ToolbarState;
  updateToolbarState<Key extends ToolbarStateKey>(
    key: Key,
    value: ToolbarStateValue<Key>,
  ): void;
};

export const ToolbarStateProviderKey: InjectionKey<ToolbarStateProvider> = Symbol('ToolbarStateProviderKey')

export const useToolbarStateProvider = () => {
  const context = reactive<ToolbarState>(INITIAL_TOOLBAR_STATE)
  const selectionFontSize = computed(() => context.fontSize)
  function updateToolbarState<K extends ToolbarStateKey>(key: K, value: ToolbarStateValue<K>) {
    context[key] = value
  }

  watch(() => selectionFontSize, () => {
    updateToolbarState('fontSizeInputValue', selectionFontSize.value.slice(0, -2))
  })
  return {
    toolbarState: context,
    updateToolbarState,
  }
};

export const useToolbarState = () => {
  const context = inject(ToolbarStateProviderKey)

  if (!context) {
    invariant(
      false,
      'useToolbarState must be used within a ToolbarProvider',
    )
  }

  return context
};
