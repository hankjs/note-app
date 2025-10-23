import { DecoratorNode, LexicalEditor } from "lexical";
import { Component } from "vue";

export type StickyNoteColor = 'pink' | 'yellow';

export interface StickyNoteInterface extends DecoratorNode<Component> {
  __x: number;
  __y: number;
  __color: StickyNoteColor;
  __caption: LexicalEditor;

  setPosition(x: number, y: number): void 

  toggleColor(): void 

  isIsolated(): true 
}

export type Positioning = {
  isDragging: boolean;
  offsetX: number;
  offsetY: number;
  rootElementRect: null | ClientRect;
  x: number;
  y: number;
};

export function positionSticky(
  stickyElem: HTMLElement,
  positioning: Positioning,
): void {
  const style = stickyElem.style;
  const rootElementRect = positioning.rootElementRect;
  const rectLeft = rootElementRect !== null ? rootElementRect.left : 0;
  const rectTop = rootElementRect !== null ? rootElementRect.top : 0;
  style.top = rectTop + positioning.y + 'px';
  style.left = rectLeft + positioning.x + 'px';
  console.log("style.top", style.top)
  console.log("style.left", style.left)
}