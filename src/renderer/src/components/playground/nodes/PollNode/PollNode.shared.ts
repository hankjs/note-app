import { createState, DecoratorNode, SerializedLexicalNode, Spread, StateConfigValue, StateValueOrUpdater } from "lexical";
import { Component } from "vue";

export type Options = ReadonlyArray<Option>;

export type Option = Readonly<{
  text: string;
  uid: string;
  votes: Array<string>;
}>;

export type SerializedPollNode = Spread<
 {
   question: string;
   options: Options;
 },
 SerializedLexicalNode
>;

export function createUID(): string {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substring(0, 5);
}

export function createPollOption(text = ''): Option {
  return {
    text,
    uid: createUID(),
    votes: [],
  };
}

export function cloneOption(
  option: Option,
  text: string,
  votes?: Array<string>,
): Option {
  return {
    text,
    uid: option.uid,
    votes: votes || Array.from(option.votes),
  };
}

export function parseOptions(json: unknown): Options {
  const options: Option[] = [];
  if (Array.isArray(json)) {
    for (const row of json) {
      if (
        row &&
        typeof row.text === 'string' &&
        typeof row.uid === 'string' &&
        Array.isArray(row.votes) &&
        row.votes.every((v: unknown) => typeof v === 'string')
      ) {
        options.push(row);
      }
    }
  }
  return options;
}

export const questionState = createState('question', {
  parse: (v) => (typeof v === 'string' ? v : ''),
});

export const optionsState = createState('options', {
  isEqual: (a, b) =>
    a.length === b.length && JSON.stringify(a) === JSON.stringify(b),
  parse: parseOptions,
});

export interface PollNodeInterface extends DecoratorNode<Component> {
  getQuestion(): StateConfigValue<typeof questionState> 
  setQuestion(valueOrUpdater: StateValueOrUpdater<typeof questionState>): this 
  getOptions(): StateConfigValue<typeof optionsState> 
  setOptions(valueOrUpdater: StateValueOrUpdater<typeof optionsState>): this 

  addOption(option: Option): this 
  deleteOption(option: Option): this 

  setOptionText(option: Option, text: string): this 

  toggleVote(option: Option, username: string): this 
}

export function getTotalVotes(options: Options): number {
  return options.reduce((totalVotes, next) => {
    return totalVotes + next.votes.length;
  }, 0);
}
