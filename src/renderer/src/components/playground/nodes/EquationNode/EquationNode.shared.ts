import { DecoratorNode, SerializedLexicalNode, Spread } from "lexical";
import { Component } from "vue";

export type SerializedEquationNode = Spread<
  {
    equation: string;
    inline: boolean;
  },
  SerializedLexicalNode
>;

export interface EquationNodeInterface extends DecoratorNode<Component> {
  __equation: string;
  __inline: boolean;

  getTextContent(): string 

  getEquation(): string 

  setEquation(equation: string): void 
}