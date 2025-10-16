import { createCommand, LexicalCommand, NodeKey } from "lexical";

export const INSERT_LAYOUT_COMMAND: LexicalCommand<string> =
  createCommand<string>();

export const UPDATE_LAYOUT_COMMAND: LexicalCommand<{
  template: string;
  nodeKey: NodeKey;
}> = createCommand<{template: string; nodeKey: NodeKey}>();

export function getItemsCountFromTemplate(template: string): number {
  return template.trim().split(/\s+/).length;
}
