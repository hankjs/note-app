import { DecoratorNode, LexicalEditor } from "lexical";

export interface ImageNodeInterface<T> extends DecoratorNode<T> {
  __src: string;
  __altText: string;
  __width: 'inherit' | number;
  __height: 'inherit' | number;
  __maxWidth: number;
  __showCaption: boolean;
  __caption: LexicalEditor;
  // Captions cannot yet be used within editor cells
  __captionsEnabled: boolean;

  setWidthAndHeight: (width: 'inherit' | number, height: 'inherit' | number,) => void
  setShowCaption: (show: boolean) => void
  getSrc(): string 

  getAltText(): string
}