import emojis from './emoji.json';

export type EmojiMatch = Readonly<{
  position: number;
  shortcode: string;
  unifiedID: string;
}>;

/**
 * 映射表，键为可能的替换内容，值为统一的 emoji ID
 * 这些 ID 本质上是十六进制编码的 UTF-8 字符
 */
const emojiReplacementMap = emojis.reduce<Map<string, string>>((acc, row) => {
  if (!row.has_img_facebook) {
    return acc;
  }
  acc.set(`:${row.short_name}:`, row.unified);
  acc.set(`：${row.short_name}：`, row.unified);

  if (row.text != null) {
    acc.set(row.text, row.unified);
    acc.set(row.text.replace(/:/g, '：'), row.unified);
  }
  if (row.texts != null) {
    row.texts.forEach((text) => acc.set(text, row.unified));
    row.texts.forEach((text) => acc.set(text.replace(/:/g, '：'), row.unified));
  }

  return acc;
}, new Map());

/**
 * 在文本中查找 emoji shortcode，如果找到则返回其在文本中的位置、匹配到的 shortcode 以及统一 ID
 */
export default function findEmoji(text: string): EmojiMatch | null {
  const skippedText: string[] = [];

  for (const word of text.split(' ')) {
    if (!emojiReplacementMap.has(word)) {
      skippedText.push(word);
      continue;
    }
    if (skippedText.length > 0) {
      // 补偿 skippedText 和 word 之间的空格
      skippedText.push('');
    }

    return {
      position: skippedText.join(' ').length,
      shortcode: word,
      unifiedID: emojiReplacementMap.get(word)!,
    };
  }

  return null;
}
