import { $isRangeSelection } from "lexical";

/**
 * Check if there is a selection that spans across
 * content, i.e. is not empty
 */

export function $isRangeSelected(
  selection
) {
  return $isRangeSelection(selection) && !selection.anchor.is(selection.focus);
}
