import { DecoratorNode } from "lexical";
import { Dimension } from "./ExcalidrawNode.shared";

export interface ExcalidrawNodeInterface<T> extends DecoratorNode<T> {
  __data: string;
  __width: Dimension;
  __height: Dimension;

  setData(data: string): void 

  getWidth(): Dimension 

  setWidth(width: Dimension): void 

  getHeight(): Dimension 

  setHeight(height: Dimension): void 
}