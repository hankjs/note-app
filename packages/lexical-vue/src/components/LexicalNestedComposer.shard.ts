
import { EditorThemeClasses, getStaticNodeConfig, Klass, LexicalEditor, LexicalNodeReplacement, type KlassConstructor, type LexicalNode, type Transform } from 'lexical';

export function getTransformSetFromKlass(
  klass: KlassConstructor<typeof LexicalNode>,
): Set<Transform<LexicalNode>> {
  const transforms = new Set<Transform<LexicalNode>>();
  const { ownNodeConfig } = getStaticNodeConfig(klass);
  const transform = klass.transform();
  if (ownNodeConfig) {
    const $transform = ownNodeConfig.$transform;
    if ($transform) {
      transforms.add($transform);
    }
  }
  if (transform) {
    transforms.add(transform);
  }
  return transforms;
}

export interface LexicalNestedComposerProps {
  /**
   * The nested editor, created outside of this component (typically in the
   * implementation of a LexicalNode) with {@link createEditor}
   */
  initialEditor: LexicalEditor;
  /**
   * Optionally overwrite the theme of the initialEditor
   */
  initialTheme?: EditorThemeClasses;
  /**
   * @deprecated This feature is not safe or correctly implemented and will be
   * removed in v0.32.0. The only correct time to configure the nodes is when
   * creating the initialEditor.
   *
   * @example
   * ```ts
   * // This is normally in the implementation of a LexicalNode that
   * // owns the nested editor
   * editor = createEditor({nodes: [], parentEditor: $getEditor()});
   * ```
   */
  initialNodes?: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement>;
  /**
   * If this is not explicitly set to true, and the collab plugin is active,
   * rendering the children of this component will not happen until collab is ready.
   */
  skipCollabChecks?: undefined | true;
  /**
   * If this is not explicitly set to true, the editable state of the nested
   * editor will automatically follow the parent editor's editable state.
   * When set to true, the nested editor is responsible for managing its own
   * editable state.
   *
   * Available since v0.29.0
   */
  skipEditableListener?: undefined | true;
}