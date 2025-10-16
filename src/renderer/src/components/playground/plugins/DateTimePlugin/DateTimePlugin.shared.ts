import { createCommand, LexicalCommand } from "lexical";

export type DateTimePluginCommandPayload = {
  dateTime: Date;
};

export const INSERT_DATETIME_COMMAND: LexicalCommand<DateTimePluginCommandPayload> =
  createCommand('INSERT_DATETIME_COMMAND');