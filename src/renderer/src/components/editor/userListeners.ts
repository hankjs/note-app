import { type LexicalEditor, ParagraphNode } from 'lexical';
import { onUnmounted, ShallowReactive, shallowReactive } from 'vue';

type UnmountListeners = () => void;

type ListenerManager = ShallowReactive<Map<string, UnmountListeners>>

export function useListeners() {
  const unmountListeners = shallowReactive<Map<string, UnmountListeners>>(new Map())

  onUnmounted(() => {
    unmountListeners.forEach((listener) => listener());
  });

  const registerListeners = (editor: LexicalEditor) => {
    registerUpdateListener(editor, unmountListeners);
    registerTextContentListener(editor, unmountListeners);
    registerMutationListener(editor, unmountListeners);
    registerEditableListener(editor, unmountListeners);
    registerDecoratorListener(editor, unmountListeners);
    registerRootListener(editor, unmountListeners);
  }

  return {
    registerListeners
  }
}

function registerUpdateListener(editor: LexicalEditor, listenerManager: ListenerManager) {
  const removeUpdateListener = editor.registerUpdateListener(({editorState}) => {
    // The latest EditorState can be found as `editorState`.
    // To read the contents of the EditorState, use the following API:
  
    editorState.read(() => {
      // Just like editor.update(), .read() expects a closure where you can use
      // the $ prefixed helper functions.
    });
  });

  listenerManager.set('update', () => removeUpdateListener());
}

function registerTextContentListener(editor: LexicalEditor, listenerManager: ListenerManager) {
  const removeTextContentListener = editor.registerTextContentListener(
    (textContent) => {
      // The latest text content of the editor!
      console.log('registerTextContentListener: ', textContent);
    },
  );
  
  listenerManager.set('textContent', () => removeTextContentListener());
}

function registerMutationListener(editor: LexicalEditor, listenerManager: ListenerManager) {
  const removeMutationListener = editor.registerMutationListener(
    ParagraphNode,
    (mutatedNodes, { updateTags, dirtyLeaves, prevEditorState }) => {
      console.log('registerMutationListener: mutatedNodes', mutatedNodes)
      console.log('registerMutationListener: updateTags', updateTags)
      console.log('registerMutationListener: dirtyLeaves', dirtyLeaves)
      console.log('registerMutationListener: prevEditorState', prevEditorState)
      // mutatedNodes is a Map where each key is the NodeKey, and the value is the state of mutation.
      for (let [nodeKey, mutation] of mutatedNodes) {
        console.log(nodeKey, mutation)
      }
    },
    {skipInitialization: false}
  );

  listenerManager.set('mutation', () => removeMutationListener());
}

function registerEditableListener(editor: LexicalEditor, listenerManager: ListenerManager) {
  const removeEditableListener = editor.registerEditableListener(
    (editable) => {
      // The editor's mode is passed in!
      console.log('registerEditableListener: editable', editable);
    },
  );

  listenerManager.set('editable', () => removeEditableListener());
}

function registerDecoratorListener(editor: LexicalEditor, listenerManager: ListenerManager) {
  const removeDecoratorListener = editor.registerDecoratorListener(
    (decorators) => {
      // The editor's decorators object is passed in!
      console.log('registerDecoratorListener: decorators', decorators);
    },
  );

  listenerManager.set('decorator', () => removeDecoratorListener());
}

function registerRootListener(editor: LexicalEditor, listenerManager: ListenerManager) {
  const removeRootListener = editor.registerRootListener(
    (rootElement, prevRootElement) => {
    //add listeners to the new root element
    //remove listeners from the old root element
    console.log('registerRootListener: rootElement', rootElement)
    console.log('registerRootListener: prevRootElement', prevRootElement)
    },
  );

  listenerManager.set('root', () => removeRootListener());
}

