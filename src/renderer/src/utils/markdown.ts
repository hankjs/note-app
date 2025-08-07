import MarkdownIt from 'markdown-it'
import highlightjs from 'markdown-it-highlightjs'
import taskLists from 'markdown-it-task-lists'
import footnote from 'markdown-it-footnote'
import hljs from 'highlight.js'

// 创建 markdown-it 实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})

// 添加代码高亮插件
md.use(highlightjs, {
  inline: true,
  hljs: {
    highlight: (str: string, lang: string) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value
        } catch (__) {}
      }
      return '' // 使用默认的转义
    }
  }
})

// 添加任务列表插件
md.use(taskLists)

// 添加脚注插件
md.use(footnote)

// 添加数学公式插件 (可选)
// md.use(require('markdown-it-katex'))

// 添加图表插件 (可选)
// md.use(require('markdown-it-mermaid'))

/**
 * 将 Markdown 文本转换为 HTML
 */
export function markdownToHtml(markdown: string): string {
  try {
    return md.render(markdown)
  } catch (error) {
    console.error('Markdown 解析错误:', error)
    return `<pre>${markdown}</pre>`
  }
}

/**
 * 提取 Markdown 文本的标题
 */
export function extractHeadings(markdown: string): Array<{ level: number; text: string; id: string }> {
  const headings: Array<{ level: number; text: string; id: string }> = []
  const lines = markdown.split('\n')
  
  lines.forEach(line => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      headings.push({ level, text, id })
    }
  })
  
  return headings
}

/**
 * 提取 Markdown 文本的摘要 (前几行)
 */
export function extractSummary(markdown: string, maxLines: number = 3): string {
  const lines = markdown.split('\n').filter(line => line.trim())
  const summaryLines = lines.slice(0, maxLines)
  return summaryLines.join('\n')
}

/**
 * 统计 Markdown 文本的基本信息
 */
export function getMarkdownStats(markdown: string) {
  const lines = markdown.split('\n')
  const words = markdown.split(/\s+/).filter(word => word.length > 0)
  const characters = markdown.length
  const charactersNoSpaces = markdown.replace(/\s/g, '').length
  
  return {
    lines: lines.length,
    words: words.length,
    characters,
    charactersNoSpaces
  }
}

/**
 * 清理 Markdown 文本
 */
export function cleanMarkdown(markdown: string): string {
  return markdown
    .replace(/\r\n/g, '\n') // 统一换行符
    .replace(/\t/g, '  ')   // 替换制表符为空格
    .trim()
}

/**
 * 生成目录 HTML
 */
export function generateToc(headings: Array<{ level: number; text: string; id: string }>): string {
  if (headings.length === 0) return ''
  
  let toc = '<nav class="toc">\n<ul>\n'
  
  headings.forEach(heading => {
    const indent = '  '.repeat(heading.level - 1)
    toc += `${indent}<li><a href="#${heading.id}">${heading.text}</a></li>\n`
  })
  
  toc += '</ul>\n</nav>'
  return toc
}
