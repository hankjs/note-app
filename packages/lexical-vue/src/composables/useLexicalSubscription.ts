import { useLexicalComposer } from "./useLexicalComposer";
import { useEffect } from "./useEffect";
import { ShallowRef, shallowRef } from "vue";
import { LexicalEditor } from "lexical";

export type LexicalSubscription<T> = {
  initialValueFn: () => T;
  subscribe: (callback: (value: T) => void) => () => void;
};

/**
 * Shortcut to Lexical subscriptions when values are used for render.
 * @param subscription - The function to create the {@link LexicalSubscription}. This function's identity must be stable (e.g. defined at module scope or with useCallback).
 */
export function useLexicalSubscription<T>(
  subscription: (editor: LexicalEditor) => LexicalSubscription<T>,
): ShallowRef<T> {
  const editor = useLexicalComposer();
  const initializedSubscription = subscription(editor)
  const value = shallowRef<T>(initializedSubscription.initialValueFn());
  useEffect(() => {
    const {initialValueFn, subscribe} = initializedSubscription;
    const currentValue = initialValueFn();
    if (value.value !== currentValue) {
      value.value = currentValue;
    }

    return subscribe((newValue: T) => {
      value.value = newValue;
    });
  })

  return value;
}
