/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {LexicalEditor} from 'lexical';

import {COMMAND_PRIORITY_CRITICAL, LexicalCommand} from 'lexical';
import { useEffect } from '../composables';
import { shallowRef, ShallowRef } from 'vue';

export type LexicalCommandLog = ReadonlyArray<
  {index: number} & LexicalCommand<unknown> & {payload: unknown}
>;

export function registerLexicalCommandLogger(
  editor: LexicalEditor,
  setLoggedCommands: (
    v: (oldValue: LexicalCommandLog) => LexicalCommandLog,
  ) => void,
): () => void {
  const unregisterCommandListeners = new Set<() => void>();
  let i = 0;
  for (const [command] of editor._commands) {
    unregisterCommandListeners.add(
      editor.registerCommand(
        command,
        (payload) => {
          setLoggedCommands((state) => {
            i += 1;
            const newState = [...state];
            newState.push({
              index: i,
              payload,
              type: command.type ? command.type : 'UNKNOWN',
            });

            if (newState.length > 10) {
              newState.shift();
            }

            return newState;
          });

          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }

  return () => unregisterCommandListeners.forEach((unregister) => unregister());
}

export function useLexicalCommandsLog(
  editor: LexicalEditor,
): ShallowRef<LexicalCommandLog> {
  const loggedCommands = shallowRef<LexicalCommandLog>([]);

  useEffect(() => {
    return registerLexicalCommandLogger(editor, (getValue) =>  {
      const oldValue = loggedCommands.value;
      loggedCommands.value = getValue(oldValue);
    });
  });

  return loggedCommands;
}
