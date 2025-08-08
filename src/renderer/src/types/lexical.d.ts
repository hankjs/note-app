import type { Ref } from 'vue'
import type { 
  LexicalEditor, 
  EditorState, 
  LexicalNode,
  Klass
} from 'lexical'

// Lexical 编辑器配置接口
export interface LexicalEditorConfig {
  namespace?: string
  nodes?: Array<Klass<LexicalNode>>
  onError?: (error: Error) => void
  editable?: boolean
  placeholder?: string
  autoFocus?: boolean
}

// Vue-Lexical 集成返回接口
export interface UseLexicalEditorReturn {
  // 编辑器实例
  editor: Ref<any | null>
  
  // 编辑器状态
  isEditable: Ref<boolean>
  content: Ref<string>
  editorState: Ref<EditorState | null>
  
  // 编辑器方法
  updateContent: (newContent: string) => void
  setEditorState: (state: EditorState) => void
  setRootElement: (element: HTMLElement) => void
  focus: () => void
  blur: () => void
  destroy: () => void
  
  // 编辑器事件
  onUpdate: (callback: (editorState: EditorState) => void) => void
  onError: (callback: (error: Error) => void) => void
}

// 编辑器主题配置
export interface LexicalThemeConfig {
  text: {
    bold: string
    italic: string
    underline: string
    strikethrough: string
    underlineStrikethrough: string
    code: string
  }
  paragraph: string
  heading: {
    h1: string
    h2: string
    h3: string
    h4: string
    h5: string
    h6: string
  }
  list: {
    ul: string
    ol: string
    listitem: string
    nested: {
      listitem: string
    }
  }
  quote: string
  code: string
  table: string
  tableCell: string
  tableCellHeader: string
  tableRow: string
  link: string
  image: string
}

// 工具栏配置
export interface ToolbarConfig {
  showFormatting: boolean
  showHeadings: boolean
  showLists: boolean
  showLinks: boolean
  showImages: boolean
  showTables: boolean
  showCode: boolean
}

// 编辑器事件
export interface LexicalEditorEvents {
  update: (editorState: EditorState) => void
  error: (error: Error) => void
  focus: () => void
  blur: () => void
  change: (content: string) => void
}

// 插件配置
export interface LexicalPluginConfig {
  richText: boolean
  list: boolean
  link: boolean
  table: boolean
  code: boolean
  history: boolean
  clipboard: boolean
  file: boolean
  html: boolean
  markdown: boolean
}
