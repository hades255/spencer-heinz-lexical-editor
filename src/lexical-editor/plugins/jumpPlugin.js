import { $getSelection, $isRangeSelection, $isTextNode, createCommand } from 'lexical';
import { $createCustomTextNode } from 'lexical-editor/nodes/customTextNode';
import { $isJumpNode, JumpNode } from 'lexical-editor/nodes/jumpNode';
import { $isRangeSelected } from 'lexical-editor/utils/$isRangeSelected';
import { useCallback, useEffect } from 'react';
import { $createJumpNode } from 'lexical-editor/nodes/jumpNode';
import { openSnackbar } from 'store/reducers/snackbar';
import { mergeRegister } from '@lexical/utils';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { getSelectedNode } from './toolbarPlugin';

const EditorPriority = 1;
export const JUMP_COMMAND = createCommand('JUMP_COMMAND');
export const UNJUMP_COMMAND = createCommand('UNJUMP_COMMAND');
export const JumpPlugin = () => {
  const [editor] = useLexicalComposerContext();

  /**
   * @param payload {uniqueId, level}
   */
  const jumpContent = useCallback(
    (payload) => {
      const { uniqueId, level } = payload;
      const selection = $getSelection();
      const nodes = selection.extract();

      // check if block of text is selected or not
      if ($isRangeSelected(selection)) {
        let isCreated = false;
        nodes.forEach((_node) => {
          if (!isCreated && $isTextNode(_node) && !$isJumpNode(_node)) {
            const writable = _node.getWritable();
            writable.replace($createJumpNode(writable.getTextContent(), uniqueId, level));
            isCreated = true;
          }
          return false;
        });

        if (!isCreated) {
          openSnackbar({
            open: true,
            message: 'This block of content is empty or already jumped.',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: false
          });
        }
        return false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor]
  );

  const unJumpContent = useCallback(
    () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && !$isRangeSelected(selection)) {
        const node = getSelectedNode(selection);
        if ($isJumpNode(node)) {
          const writable = node.getWritable();
          writable.replace($createCustomTextNode(writable.getTextContent()));
        }
      }
      return false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor]
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        JUMP_COMMAND,
        (payload) => {
          jumpContent(payload);
          return true;
        },
        EditorPriority
      ),
      editor.registerCommand(
        UNJUMP_COMMAND,
        () => {
          unJumpContent();
          return true;
        },
        EditorPriority
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  useEffect(() => {
    if (!editor.hasNodes([JumpNode])) {
      throw new Error('JumpPlugin: JumpNode not registered on editor');
    }
  }, [editor]);
  return null;
};
