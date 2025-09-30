import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  ElementTransformer,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
  TextMatchTransformer,
  Transformer,
} from '@lexical/markdown'
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from '@lexical/react/LexicalHorizontalRuleNode'
import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  TableCellHeaderStates,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '@lexical/table'
import {
  $createTextNode,
  $isParagraphNode,
  $isTextNode,
  LexicalNode,
} from 'lexical'

// Basic transformers for the playground
export const HR: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node: LexicalNode) => {
    return $isHorizontalRuleNode(node) ? '***' : null
  },
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _1, _2, isImport) => {
    const line = $createHorizontalRuleNode()

    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line)
    } else {
      parentNode.insertBefore(line)
    }

    line.selectNext()
  },
  type: 'element',
}

// Basic image transformer
export const IMAGE: TextMatchTransformer = {
  dependencies: [],
  export: (node: LexicalNode) => {
    return null // Basic implementation
  },
  importRegExp: /^!\[([^[]*)]\(([^(]+)\)$/,
  regExp: /^!\[([^[]*)]\(([^(]+)\)$/,
  replace: (textNode, match) => {
    const [, altText, src] = match
    const imageNode = $createTextNode(`![${altText}](${src})`)
    textNode.replace(imageNode)
  },
  trigger: ')',
  type: 'text-match',
}

// Basic emoji transformer
export const EMOJI: TextMatchTransformer = {
  dependencies: [],
  export: (node: LexicalNode) => {
    return null // Basic implementation
  },
  importRegExp: /:([a-z_]+):/,
  regExp: /:([a-z_]+):/,
  replace: (textNode, match) => {
    const [, emojiName] = match
    const emojiNode = $createTextNode(`:${emojiName}:`)
    textNode.replace(emojiNode)
  },
  trigger: ':',
  type: 'text-match',
}

// Basic equation transformer
export const EQUATION: TextMatchTransformer = {
  dependencies: [],
  export: (node: LexicalNode) => {
    return null // Basic implementation
  },
  importRegExp: /\$([^$]+)\$/,
  regExp: /\$([^$]+)\$/,
  replace: (textNode, match) => {
    const [, equation] = match
    const equationNode = $createTextNode(`$${equation}$`)
    textNode.replace(equationNode)
  },
  trigger: '$',
  type: 'text-match',
}

// Basic tweet transformer
export const TWEET: TextMatchTransformer = {
  dependencies: [],
  export: (node: LexicalNode) => {
    return null // Basic implementation
  },
  importRegExp: /^https:\/\/twitter\.com\/\w+\/status\/(\d+)$/,
  regExp: /^https:\/\/twitter\.com\/\w+\/status\/(\d+)$/,
  replace: (textNode, match) => {
    const [, tweetId] = match
    const tweetNode = $createTextNode(`https://twitter.com/user/status/${tweetId}`)
    textNode.replace(tweetNode)
  },
  trigger: ')',
  type: 'text-match',
}

// Basic table transformer
export const TABLE: ElementTransformer = {
  dependencies: [TableNode, TableRowNode, TableCellNode],
  export: (node: LexicalNode) => {
    return null // Basic implementation
  },
  regExp: /^\|(.+)\|$/,
  replace: (parentNode, _1, _2, isImport) => {
    // Basic table implementation
    const tableNode = $createTextNode('| Table |')
    parentNode.replace(tableNode)
  },
  type: 'element',
}

export const PLAYGROUND_TRANSFORMERS: Array<Transformer> = [
  TABLE,
  HR,
  IMAGE,
  EMOJI,
  EQUATION,
  TWEET,
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
]
