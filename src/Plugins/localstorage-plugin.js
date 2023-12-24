import { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { debounce } from 'lodash';

export function LocalStoragePlugin({ namespace }) {
  const [editor] = useLexicalComposerContext();

  const saveContent = useCallback(
    (content) => {
      localStorage.setItem(namespace, content);
    },
    [namespace]
  );

  const debouncedSaveContent = debounce(saveContent, 500);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
      // Don't update if nothing changed
      if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;

      // check if content edit is permitted or not
      const serializedState = JSON.stringify(editorState.toJSON());
      debouncedSaveContent(serializedState);
    });
  }, [debouncedSaveContent, editor]);

  return null;
}

LocalStoragePlugin.propTypes = {
  namespace: PropTypes.any
};
