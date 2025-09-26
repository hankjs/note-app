import {LexicalEditor, TextNode} from 'lexical';

import {$createEmojiNode} from './EmojiNode';
import findEmoji from './findEmoji';

function $textNodeTransform(node: TextNode): void {
  if (!node.isSimpleText() || node.hasFormat('code')) {
    return;
  }

  const text = node.getTextContent();

  // 只查找第一个出现的位置，因为对于其余部分，转换函数会再次运行
  // 因为新插入的节点会被视为“脏节点”而重新触发转换
  const emojiMatch = findEmoji(text);
  if (emojiMatch === null) {
    return;
  }

  let targetNode;
  if (emojiMatch.position === 0) {
    // 字符串的第一个文本片段，分割成两部分
    [targetNode] = node.splitText(
      emojiMatch.position + emojiMatch.shortcode.length,
    );
  } else {
    // 字符串中间
    [, targetNode] = node.splitText(
      emojiMatch.position,
      emojiMatch.position + emojiMatch.shortcode.length,
    );
  }

  const emojiNode = $createEmojiNode(emojiMatch.unifiedID);
  targetNode.replace(emojiNode);
}

export function registerEmoji(editor: LexicalEditor): () => void {
  // 這裡不使用 editor.registerUpdateListener，因為依賴 update listener 的替代方案非常不建議，
  // 它會觸發額外的渲染（這是最耗資源的生命週期操作）。
  return editor.registerNodeTransform(TextNode, $textNodeTransform);
}
