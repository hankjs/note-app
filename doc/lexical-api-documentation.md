# Lexical 编辑器 API 文档

## 概述

本文档描述了 Lexical 编辑器提供的程序化 API，支持文本选择、格式化应用和复合操作。

## 获取编辑器实例

```javascript
const editor = window.lexicalTest; // 全局编辑器实例
```

## 文本选择 API

### getSelectedText()
获取当前选中的文本内容。

```javascript
const selectedText = editor.getSelectedText();
console.log('选中的文本:', selectedText);
```

**返回值**: `string` - 当前选中的文本

### selectTextByContent(searchText, startIndex?)
根据文本内容选择文字。

```javascript
// 选择第一个"重要"文字
const success = editor.selectTextByContent('重要');

// 从第10个字符开始搜索"文本"
const success2 = editor.selectTextByContent('文本', 10);
```

**参数**:
- `searchText` (string): 要搜索的文本
- `startIndex` (number, 可选): 开始搜索的位置，默认为 0

**返回值**: `boolean` - 是否成功选择

### selectTextByRange(startOffset, endOffset)
根据字符范围选择文字。

```javascript
// 选择第0到第10个字符
const success = editor.selectTextByRange(0, 10);
```

**参数**:
- `startOffset` (number): 开始位置
- `endOffset` (number): 结束位置

**返回值**: `boolean` - 是否成功选择

### selectAllText()
选择所有文本。

```javascript
editor.selectAllText();
```

### clearSelection()
清除当前选择。

```javascript
editor.clearSelection();
```

## 格式化应用 API

### applyFormatToSelection(format)
对当前选中的文本应用格式。

```javascript
// 对选中文本应用粗体
const success = editor.applyFormatToSelection('bold');
```

**参数**:
- `format` (string): 格式类型，支持：
  - `'bold'` - 粗体
  - `'italic'` - 斜体
  - `'underline'` - 下划线
  - `'strikethrough'` - 删除线
  - `'code'` - 行内代码

**返回值**: `boolean` - 是否成功应用格式

### applyFormatToText(searchText, format)
对指定文本应用格式。

```javascript
// 将所有"重要"文字设为粗体
const success = editor.applyFormatToText('重要', 'bold');
```

**参数**:
- `searchText` (string): 要格式化的文本
- `format` (string): 格式类型

**返回值**: `boolean` - 是否成功应用格式

### applyFormatToRange(startOffset, endOffset, format)
对指定字符范围应用格式。

```javascript
// 对第10到第20个字符应用斜体
const success = editor.applyFormatToRange(10, 20, 'italic');
```

**参数**:
- `startOffset` (number): 开始位置
- `endOffset` (number): 结束位置
- `format` (string): 格式类型

**返回值**: `boolean` - 是否成功应用格式

### insertFormattedText(text, formats)
插入预格式化的文本。

```javascript
// 插入粗体斜体文本
editor.insertFormattedText('重要提示', ['bold', 'italic']);
```

**参数**:
- `text` (string): 要插入的文本
- `formats` (string[]): 格式数组

## 复合操作 API

### findAndFormatText(searchText, format)
查找并格式化所有匹配的文本。

```javascript
// 将所有"API"文字设为粗体
const count = editor.findAndFormatText('API', 'bold');
console.log(`格式化了 ${count} 个匹配项`);
```

**参数**:
- `searchText` (string): 要搜索的文本
- `format` (string): 要应用的格式

**返回值**: `number` - 格式化的匹配项数量

### batchFormatTexts(textFormats)
批量格式化多个文本。

```javascript
const configs = [
  { text: 'API', formats: ['bold'] },
  { text: '重要', formats: ['bold', 'italic'] },
  { text: '注意', formats: ['underline'] }
];

const successCount = editor.batchFormatTexts(configs);
console.log(`成功格式化 ${successCount} 项`);
```

**参数**:
- `textFormats` (Array): 配置数组，每个配置包含：
  - `text` (string): 要格式化的文本
  - `formats` (string[]): 要应用的格式数组

**返回值**: `number` - 成功格式化的项目数

## 状态查询 API

### getSelectionInfo()
获取当前选择的详细信息。

```javascript
const info = editor.getSelectionInfo();
console.log('选择信息:', info);
```

**返回值**: `object` - 包含以下属性：
- `hasSelection` (boolean): 是否有选中文本
- `selectedText` (string): 选中的文本内容
- `formats` (Set): 当前应用的格式集合
- `blockType` (string): 当前块类型
- `selectionLength` (number): 选中文本的长度

### canApplyFormat(format)
检查是否可以应用指定格式。

```javascript
const canFormat = editor.canApplyFormat('bold');
if (canFormat) {
  console.log('可以应用粗体格式');
} else {
  console.log('无法应用粗体格式（可能没有选中文本）');
}
```

**参数**:
- `format` (string): 要检查的格式类型

**返回值**: `boolean` - 是否可以应用格式

## 使用示例

### 示例 1: 自动格式化关键词

```javascript
// 自动将文档中的所有关键词设为粗体
const keywords = ['API', '重要', '注意', '提示'];
keywords.forEach(keyword => {
  const count = editor.findAndFormatText(keyword, 'bold');
  console.log(`关键词 "${keyword}" 格式化了 ${count} 次`);
});
```

### 示例 2: 交互式文本格式化

```javascript
// 选择特定文本并应用多种格式
function formatImportantText() {
  const success = editor.selectTextByContent('重要提示');
  if (success) {
    editor.applyFormatToSelection('bold');
    editor.applyFormatToSelection('underline');
    console.log('重要提示已格式化');
  }
}
```

### 示例 3: 条件格式化

```javascript
// 根据当前状态决定格式化操作
function smartFormat() {
  const info = editor.getSelectionInfo();
  
  if (info.hasSelection) {
    if (!info.formats.has('bold')) {
      editor.applyFormatToSelection('bold');
      console.log('应用粗体格式');
    } else {
      console.log('文本已经是粗体');
    }
  } else {
    console.log('请先选择文本');
  }
}
```

### 示例 4: 批量文本处理

```javascript
// 批量处理不同类型的文本
function batchProcess() {
  const configs = [
    { text: '标题', formats: ['bold'] },
    { text: '重点', formats: ['bold', 'italic'] },
    { text: '代码', formats: ['code'] },
    { text: '链接', formats: ['underline'] }
  ];
  
  const processed = editor.batchFormatTexts(configs);
  console.log(`批量处理完成，共处理 ${processed} 个项目`);
}
```

## 错误处理

所有 API 方法都包含错误处理，建议在使用时进行适当的错误检查：

```javascript
try {
  const success = editor.selectTextByContent('目标文本');
  if (success) {
    editor.applyFormatToSelection('bold');
    console.log('格式化成功');
  } else {
    console.log('未找到目标文本');
  }
} catch (error) {
  console.error('操作失败:', error);
}
```

## 最佳实践

1. **检查选择状态**: 在应用格式前，使用 `getSelectionInfo()` 检查当前状态
2. **错误处理**: 始终处理可能的错误情况
3. **性能考虑**: 大量操作时考虑使用批量方法
4. **用户体验**: 提供操作反馈，告知用户操作结果

## 注意事项

1. 某些格式化操作需要先选中文本才能生效
2. 文本搜索区分大小写
3. 批量操作可能需要较长时间，建议提供进度提示
4. API 调用前确保编辑器已正确初始化
