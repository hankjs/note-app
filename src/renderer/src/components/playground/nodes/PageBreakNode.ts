import './PageBreakNode.css';

import { mergeRegister } from '@lexical/utils';
import {
  CLICK_COMMAND,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  LexicalNode,
  SerializedLexicalNode,
} from 'lexical';
import { useLexicalComposer, useLexicalNodeSelection } from 'lexical-vue';
import { Component, defineComponent, h } from 'vue';
import { useEffect } from '../composables/useEffect';

export type SerializedPageBreakNode = SerializedLexicalNode;

const PageBreakComponent = defineComponent({
  props: ['nodeKey'],
  setup(props) {
    const editor = useLexicalComposer();
    const { isSelected, setSelected, clearSelection } = useLexicalNodeSelection(props.nodeKey);
    useEffect(() => {
      return mergeRegister(
        editor.registerCommand(
          CLICK_COMMAND,
          (event: MouseEvent) => {
            const pbElem = editor.getElementByKey(props.nodeKey);

            if (event.target === pbElem) {
              if (!event.shiftKey) {
                clearSelection();
              }
              setSelected(!isSelected);
              return true;
            }

            return false;
          },
          COMMAND_PRIORITY_LOW,
        ),
      )
    }, [() => props.nodeKey, () => editor, () => isSelected.value])
    useEffect(() => {
      const pbElem = editor.getElementByKey(props.nodeKey);
      if (pbElem !== null) {
        pbElem.className = isSelected ? 'selected' : '';
      }
    }, [() => props.nodeKey, () => editor, () => isSelected.value])

    return null
  },
})

export class PageBreakNode extends DecoratorNode<Component> {
  static getType(): string {
    return 'page-break';
  }

  static clone(node: PageBreakNode): PageBreakNode {
    return new PageBreakNode(node.__key);
  }

  static importJSON(serializedNode: SerializedPageBreakNode): PageBreakNode {
    return $createPageBreakNode().updateFromJSON(serializedNode);
  }

  static importDOM(): DOMConversionMap | null {
    return {
      figure: (domNode: HTMLElement) => {
        const tp = domNode.getAttribute('type');
        if (tp !== this.getType()) {
          return null;
        }

        return {
          conversion: $convertPageBreakElement,
          priority: COMMAND_PRIORITY_HIGH,
        };
      },
    };
  }

  createDOM(): HTMLElement {
    const el = document.createElement('figure');
    el.style.pageBreakAfter = 'always';
    el.setAttribute('type', this.getType());
    return el;
  }

  getTextContent(): string {
    return '\n';
  }

  isInline(): false {
    return false;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): Component {
    return h(PageBreakComponent, { nodeKey: this.getKey() })
  }
}

function $convertPageBreakElement(): DOMConversionOutput {
  return { node: $createPageBreakNode() };
}

export function $createPageBreakNode(): PageBreakNode {
  return new PageBreakNode();
}

export function $isPageBreakNode(
  node: LexicalNode | null | undefined,
): node is PageBreakNode {
  return node instanceof PageBreakNode;
}
