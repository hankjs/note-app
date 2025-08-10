import type { LexicalThemeConfig } from '@/types/lexical'

// 完整的 Lexical 主题配置
export const createLexicalTheme = (isDark: boolean = false) => {
  return {
    // 基础布局
    ltr: 'lexical-ltr',
    rtl: 'lexical-rtl',
    
    // 段落
    paragraph: 'lexical-paragraph',
    
    // 引用
    quote: 'lexical-quote',
    
    // 标题
    heading: {
      h1: 'lexical-heading-h1',
      h2: 'lexical-heading-h2',
      h3: 'lexical-heading-h3',
      h4: 'lexical-heading-h4',
      h5: 'lexical-heading-h5',
      h6: 'lexical-heading-h6',
    },
    
    // 列表
    list: {
      nested: {
        listitem: 'lexical-nested-listitem',
      },
      ol: 'lexical-list-ol',
      ul: 'lexical-list-ul',
      listitem: 'lexical-listitem',
      listitemChecked: 'lexical-listitem-checked',
      listitemUnchecked: 'lexical-listitem-unchecked',
    },
    
    // 标签
    hashtag: 'lexical-hashtag',
    
    // 图片
    image: 'lexical-image',
    
    // 链接
    link: 'lexical-link',
    
    // 文本样式
    text: {
      bold: 'lexical-text-bold',
      code: 'lexical-text-code',
      italic: 'lexical-text-italic',
      strikethrough: 'lexical-text-strikethrough',
      subscript: 'lexical-text-subscript',
      superscript: 'lexical-text-superscript',
      underline: 'lexical-text-underline',
      underlineStrikethrough: 'lexical-text-underline-strikethrough',
    },
    
    // 代码块
    code: 'lexical-code',
    
    // 代码高亮
    codeHighlight: {
      atrule: 'lexical-token-attr',
      attr: 'lexical-token-attr',
      boolean: 'lexical-token-property',
      builtin: 'lexical-token-selector',
      cdata: 'lexical-token-comment',
      char: 'lexical-token-selector',
      class: 'lexical-token-function',
      'class-name': 'lexical-token-function',
      comment: 'lexical-token-comment',
      constant: 'lexical-token-property',
      deleted: 'lexical-token-property',
      doctype: 'lexical-token-comment',
      entity: 'lexical-token-operator',
      function: 'lexical-token-function',
      important: 'lexical-token-variable',
      inserted: 'lexical-token-selector',
      keyword: 'lexical-token-attr',
      namespace: 'lexical-token-variable',
      number: 'lexical-token-property',
      operator: 'lexical-token-operator',
      prolog: 'lexical-token-comment',
      property: 'lexical-token-property',
      punctuation: 'lexical-token-punctuation',
      regex: 'lexical-token-variable',
      selector: 'lexical-token-selector',
      string: 'lexical-token-selector',
      symbol: 'lexical-token-property',
      tag: 'lexical-token-property',
      url: 'lexical-token-operator',
      variable: 'lexical-token-variable',
    },
    
    // 表格
    table: 'lexical-table',
    tableCell: 'lexical-table-cell',
    tableCellHeader: 'lexical-table-cell-header',
    tableRow: 'lexical-table-row',
    
    // 占位符
    placeholder: 'lexical-placeholder',
    
    // 选择
    selection: 'lexical-selection',
    
    // 光标
    cursor: 'lexical-cursor',
    
    // 拖拽
    drag: 'lexical-drag',
    
    // 焦点
    focus: 'lexical-focus',
    
    // 错误
    error: 'lexical-error',
    
    // 警告
    warning: 'lexical-warning',
    
    // 成功
    success: 'lexical-success',
    
    // 信息
    info: 'lexical-info',
  }
}

// 获取当前主题配置
export function getEditorTheme(isDark: boolean = false): any {
  return createLexicalTheme(isDark)
}

// 主题切换函数
export function applyThemeToEditor(editor: any, isDark: boolean = false) {
  if (editor && editor._config) {
    const newTheme = createLexicalTheme(isDark)
    editor._config.theme = newTheme
    // 触发编辑器重新渲染
    editor.update(() => {
      // 强制更新
    })
  }
}

// 获取主题状态
export function getThemeState(): boolean {
  const app = document.querySelector('.app')
  return app?.classList.contains('theme-dark') || false
}

// 监听主题变化
export function watchThemeChange(callback: (isDark: boolean) => void) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target as Element
        if (target.classList.contains('app')) {
          const isDark = target.classList.contains('theme-dark')
          callback(isDark)
        }
      }
    })
  })
  
  const app = document.querySelector('.app')
  if (app) {
    observer.observe(app, {
      attributes: true,
      attributeFilter: ['class']
    })
  }
  
  return observer
}
