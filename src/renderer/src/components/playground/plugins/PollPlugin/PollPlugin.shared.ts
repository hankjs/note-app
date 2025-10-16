import { createCommand, LexicalCommand } from "lexical";

export const INSERT_POLL_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_POLL_COMMAND',
);