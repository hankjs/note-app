
import {
  getCodeLanguageOptions as getCodeLanguageOptionsPrism,
} from '@lexical/code';

import {
  getCodeLanguageOptions as getCodeLanguageOptionsShiki,
  getCodeThemeOptions as getCodeThemeOptionsShiki,
} from '@lexical/code-shiki';
import { $findMatchingParent, $isRootOrShadowRoot, ElementFormatType, LexicalNode } from 'lexical';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const rootTypeToRootName = {
  root: 'Root',
  table: 'Table',
};

export const CODE_LANGUAGE_OPTIONS_PRISM: [string, string][] =
  getCodeLanguageOptionsPrism().filter((option) =>
    [
      'c',
      'clike',
      'cpp',
      'css',
      'html',
      'java',
      'js',
      'javascript',
      'markdown',
      'objc',
      'objective-c',
      'plain',
      'powershell',
      'py',
      'python',
      'rust',
      'sql',
      'swift',
      'typescript',
      'xml',
    ].includes(option[0]),
  );

export const CODE_LANGUAGE_OPTIONS_SHIKI: [string, string][] =
  getCodeLanguageOptionsShiki().filter((option) =>
    [
      'c',
      'clike',
      'cpp',
      'css',
      'html',
      'java',
      'js',
      'javascript',
      'markdown',
      'objc',
      'objective-c',
      'plain',
      'powershell',
      'py',
      'python',
      'rust',
      'sql',
      'typescript',
      'xml',
    ].includes(option[0]),
  );

export const CODE_THEME_OPTIONS_SHIKI: [string, string][] =
  getCodeThemeOptionsShiki().filter((option) =>
    [
      'catppuccin-latte',
      'everforest-light',
      'github-light',
      'gruvbox-light-medium',
      'kanagawa-lotus',
      'dark-plus',
      'light-plus',
      'material-theme-lighter',
      'min-light',
      'one-light',
      'rose-pine-dawn',
      'slack-ochin',
      'snazzy-light',
      'solarized-light',
      'vitesse-light',
    ].includes(option[0]),
  );

export const FONT_FAMILY_OPTIONS: [string, string][] = [
  ['Arial', 'Arial'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
];

export const FONT_SIZE_OPTIONS: [string, string][] = [
  ['10px', '10px'],
  ['11px', '11px'],
  ['12px', '12px'],
  ['13px', '13px'],
  ['14px', '14px'],
  ['15px', '15px'],
  ['16px', '16px'],
  ['17px', '17px'],
  ['18px', '18px'],
  ['19px', '19px'],
  ['20px', '20px'],
];

export const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, ''>]: {
    icon: string;
    iconRTL: string;
    name: string;
  };
} = {
  center: {
    icon: 'center-align',
    iconRTL: 'center-align',
    name: 'Center Align',
  },
  end: {
    icon: 'right-align',
    iconRTL: 'left-align',
    name: 'End Align',
  },
  justify: {
    icon: 'justify-align',
    iconRTL: 'justify-align',
    name: 'Justify Align',
  },
  left: {
    icon: 'left-align',
    iconRTL: 'left-align',
    name: 'Left Align',
  },
  right: {
    icon: 'right-align',
    iconRTL: 'right-align',
    name: 'Right Align',
  },
  start: {
    icon: 'left-align',
    iconRTL: 'right-align',
    name: 'Start Align',
  },
};

export function dropDownActiveClass(active: boolean) {
  if (active) {
    return 'active dropdown-item-active';
  } else {
    return '';
  }
}

export function $findTopLevelElement(node: LexicalNode) {
  let topLevelElement =
    node.getKey() === 'root'
      ? node
      : $findMatchingParent(node, (e) => {
        const parent = e.getParent();
        return parent !== null && $isRootOrShadowRoot(parent);
      });

  if (topLevelElement === null) {
    topLevelElement = node.getTopLevelElementOrThrow();
  }
  return topLevelElement;
}