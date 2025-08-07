import { FileItem } from '@/stores/files'

/**
 * 生成唯一的文件 ID
 */
export function generateFileId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * 检查是否为 Markdown 文件
 */
export function isMarkdownFile(filename: string): boolean {
  const ext = getFileExtension(filename).toLowerCase()
  return ext === 'md' || ext === 'markdown'
}

/**
 * 获取文件名（不含扩展名）
 */
export function getFileNameWithoutExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化文件修改时间
 */
export function formatFileTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  
  // 小于1小时
  if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前'
  }
  
  // 小于24小时
  if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前'
  }
  
  // 小于7天
  if (diff < 604800000) {
    return Math.floor(diff / 86400000) + '天前'
  }
  
  // 超过7天显示具体日期
  return date.toLocaleDateString('zh-CN')
}

/**
 * 验证文件名
 */
export function validateFileName(filename: string): { valid: boolean; error?: string } {
  if (!filename || filename.trim().length === 0) {
    return { valid: false, error: '文件名不能为空' }
  }
  
  if (filename.length > 255) {
    return { valid: false, error: '文件名过长' }
  }
  
  // 检查非法字符
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(filename)) {
    return { valid: false, error: '文件名包含非法字符' }
  }
  
  // 检查保留名称
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
  const nameWithoutExt = getFileNameWithoutExtension(filename).toUpperCase()
  if (reservedNames.includes(nameWithoutExt)) {
    return { valid: false, error: '文件名是系统保留名称' }
  }
  
  return { valid: true }
}

/**
 * 生成安全的文件名
 */
export function sanitizeFileName(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/^\.+/, '')
    .replace(/\.+$/, '')
}

/**
 * 构建文件路径
 */
export function buildFilePath(...parts: string[]): string {
  return parts
    .map(part => part.replace(/^\/+|\/+$/g, ''))
    .filter(part => part.length > 0)
    .join('/')
}

/**
 * 获取相对路径
 */
export function getRelativePath(basePath: string, fullPath: string): string {
  if (fullPath.startsWith(basePath)) {
    return fullPath.substring(basePath.length).replace(/^\/+/, '')
  }
  return fullPath
}

/**
 * 创建文件树结构
 */
export function createFileTree(files: FileItem[]): FileItem[] {
  const fileMap = new Map<string, FileItem>()
  const rootFiles: FileItem[] = []
  
  // 创建文件映射
  files.forEach(file => {
    fileMap.set(file.path, { ...file, children: [] })
  })
  
  // 构建树结构
  files.forEach(file => {
    const pathParts = file.path.split('/')
    pathParts.pop()! // 移除文件名，只保留路径
    const parentPath = pathParts.join('/')
    
    if (parentPath === '') {
      // 根目录文件
      rootFiles.push(fileMap.get(file.path)!)
    } else {
      // 子目录文件
      const parent = fileMap.get(parentPath)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(fileMap.get(file.path)!)
      }
    }
  })
  
  return rootFiles
}

/**
 * 扁平化文件树
 */
export function flattenFileTree(files: FileItem[]): FileItem[] {
  const result: FileItem[] = []
  
  function traverse(items: FileItem[]) {
    items.forEach(item => {
      result.push({ ...item, children: undefined })
      if (item.children && item.children.length > 0) {
        traverse(item.children)
      }
    })
  }
  
  traverse(files)
  return result
}
