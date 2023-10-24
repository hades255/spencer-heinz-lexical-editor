/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useHistory } from 'lexical-editor/utils/useHistory';

export { createEmptyHistoryState } from '@lexical/history';

export function HistoryPlugin({ externalHistoryState }) {
  const [editor] = useLexicalComposerContext();

  useHistory(editor, externalHistoryState);

  return null;
}
