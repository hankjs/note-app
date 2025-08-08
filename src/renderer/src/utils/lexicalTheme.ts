import type { LexicalThemeConfig } from '@/types/lexical'

// 默认主题配置
export const defaultThemeConfig: LexicalThemeConfig = {
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    underlineStrikethrough: 'underline line-through',
    code: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono'
  },
  paragraph: 'mb-4 leading-relaxed',
  heading: {
    h1: 'text-3xl font-bold mb-4 mt-6',
    h2: 'text-2xl font-bold mb-3 mt-5',
    h3: 'text-xl font-bold mb-2 mt-4',
    h4: 'text-lg font-bold mb-2 mt-3',
    h5: 'text-base font-bold mb-1 mt-2',
    h6: 'text-sm font-bold mb-1 mt-2'
  },
  list: {
    ul: 'list-disc list-inside mb-4 space-y-1',
    ol: 'list-decimal list-inside mb-4 space-y-1',
    listitem: 'mb-1',
    nested: {
      listitem: 'ml-4'
    }
  },
  quote: 'border-l-4 border-gray-300 pl-4 py-2 mb-4 italic text-gray-600',
  code: 'bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 font-mono text-sm overflow-x-auto',
  table: 'border-collapse border border-gray-300 mb-4 w-full',
  tableCell: 'border border-gray-300 px-3 py-2',
  tableCellHeader: 'border border-gray-300 px-3 py-2 bg-gray-100 font-bold',
  tableRow: 'hover:bg-gray-50',
  link: 'text-blue-600 hover:text-blue-800 underline',
  image: 'max-w-full h-auto rounded-lg mb-4'
}

// 暗色主题配置
export const darkThemeConfig: LexicalThemeConfig = {
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    underlineStrikethrough: 'underline line-through',
    code: 'bg-gray-700 px-1 py-0.5 rounded text-sm font-mono text-gray-200'
  },
  paragraph: 'mb-4 leading-relaxed text-gray-200',
  heading: {
    h1: 'text-3xl font-bold mb-4 mt-6 text-white',
    h2: 'text-2xl font-bold mb-3 mt-5 text-white',
    h3: 'text-xl font-bold mb-2 mt-4 text-white',
    h4: 'text-lg font-bold mb-2 mt-3 text-white',
    h5: 'text-base font-bold mb-1 mt-2 text-white',
    h6: 'text-sm font-bold mb-1 mt-2 text-white'
  },
  list: {
    ul: 'list-disc list-inside mb-4 space-y-1 text-gray-200',
    ol: 'list-decimal list-inside mb-4 space-y-1 text-gray-200',
    listitem: 'mb-1',
    nested: {
      listitem: 'ml-4'
    }
  },
  quote: 'border-l-4 border-gray-600 pl-4 py-2 mb-4 italic text-gray-300',
  code: 'bg-gray-800 text-gray-100 p-4 rounded-lg mb-4 font-mono text-sm overflow-x-auto',
  table: 'border-collapse border border-gray-600 mb-4 w-full',
  tableCell: 'border border-gray-600 px-3 py-2 text-gray-200',
  tableCellHeader: 'border border-gray-600 px-3 py-2 bg-gray-700 font-bold text-white',
  tableRow: 'hover:bg-gray-700',
  link: 'text-blue-400 hover:text-blue-300 underline',
  image: 'max-w-full h-auto rounded-lg mb-4'
}

// 将主题配置转换为 Lexical 编辑器主题
export function createLexicalTheme(config: LexicalThemeConfig): any {
  return {
    text: {
      bold: config.text.bold,
      italic: config.text.italic,
      underline: config.text.underline,
      strikethrough: config.text.strikethrough,
      underlineStrikethrough: config.text.underlineStrikethrough,
      code: config.text.code
    },
    paragraph: config.paragraph,
    heading: {
      h1: config.heading.h1,
      h2: config.heading.h2,
      h3: config.heading.h3,
      h4: config.heading.h4,
      h5: config.heading.h5,
      h6: config.heading.h6
    },
    list: {
      ul: config.list.ul,
      ol: config.list.ol,
      listitem: config.list.listitem,
      nested: {
        listitem: config.list.nested.listitem
      }
    },
    quote: config.quote,
    code: config.code,
    table: config.table,
    tableCell: config.tableCell,
    tableCellHeader: config.tableCellHeader,
    tableRow: config.tableRow,
    link: config.link,
    image: config.image
  }
}

// 获取当前主题配置
export function getThemeConfig(isDark: boolean = false): LexicalThemeConfig {
  return isDark ? darkThemeConfig : defaultThemeConfig
}

// 创建编辑器主题
export function getEditorTheme(isDark: boolean = false): any {
  const config = getThemeConfig(isDark)
  return createLexicalTheme(config)
}
