import { createState, DecoratorNode } from "lexical";
import { Component } from "vue";

export const getDateTimeText = (dateTime: Date) => {
  if (dateTime === undefined) {
    return '';
  }
  const hours = dateTime?.getHours();
  const minutes = dateTime?.getMinutes();
  return (
    dateTime.toDateString() +
    (hours === 0 && minutes === 0
      ? ''
      : ` ${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}`)
  );
};

export const dateTimeState = createState('dateTime', {
  parse: (v) => new Date(v as string),
  unparse: (v) => v.toISOString(),
});

export interface DateTimeNodeInterface extends DecoratorNode<Component> {
  __dateTime: Date;

  getDateTime(): Date;

  setDateTime(dateTime: Date): void;
}
