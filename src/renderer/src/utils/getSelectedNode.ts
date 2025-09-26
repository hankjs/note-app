import { $getSelection, $isRangeSelection } from 'lexical'

/**
 * Gets the selected node from the current selection
 */
export function getSelectedNode(selection: any) {
  if (!$isRangeSelection(selection)) {
    return null
  }
  
  const anchor = selection.anchor
  const focus = selection.focus
  
  if (anchor.getNode() === focus.getNode()) {
    return anchor.getNode()
  }
  
  // Return the anchor node as default
  return anchor.getNode()
}
