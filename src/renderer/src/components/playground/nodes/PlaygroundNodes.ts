import type { Klass, LexicalNode } from 'lexical'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { HashtagNode } from '@lexical/hashtag'
import { EmojiNode } from './EmojiNode'
import { MentionNode } from './MentionNode'
import { YouTubeNode } from './YouTubeNode'
import { TweetNode } from './TweetNode'
import { PageBreakNode } from './PageBreakNode'
import { ImageNode } from './ImageNode'
import { ExcalidrawNode } from './ExcalidrawNode'
import { PollNode } from './PollNode/PollNode'
import { LayoutContainerNode } from './Layout/LayoutContainerNode'
import { LayoutItemNode } from './Layout/LayoutItemNode'
import { EquationNode } from './EquationNode/EquationNode'
import { CollapsibleContentNode } from '../plugins/CollapsiblePlugin/CollapsibleContentNode'
import { CollapsibleContainerNode } from '../plugins/CollapsiblePlugin/CollapsibleContainerNode'
import { CollapsibleTitleNode } from '../plugins/CollapsiblePlugin/CollapsibleTitleNode'
import { StickyNode } from './StickyNode/StickyNode'

const PlaygroundNodes: Array<Klass<LexicalNode>> = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  CodeHighlightNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  AutoLinkNode,
  LinkNode,
  PageBreakNode,
  HashtagNode,
  EmojiNode,
  MentionNode,
  YouTubeNode,
  TweetNode,
  PageBreakNode,
  ImageNode,
  ExcalidrawNode,
  PollNode,
  LayoutContainerNode,
  LayoutItemNode,
  EquationNode,
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
  StickyNode,
]

export default PlaygroundNodes
