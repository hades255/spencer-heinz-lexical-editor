import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey, $getSelection, $isParagraphNode, $isRangeSelection, createCommand } from 'lexical';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { mergeRegister } from '@lexical/utils';
import { $isRangeSelected } from 'lexical-editor/utils/$isRangeSelected';
import { getSelectedNode } from './toolbarPlugin';
import { $createJsontagNode, $isJsontagNode, JsontagNode } from 'lexical-editor/nodes/jsontagNode';
import { isUndefined, max, min } from 'lodash';
import { createPortal } from 'react-dom';
import { Box, Paper } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

const EditorPriority = 1;
export const JSON_TAG_COMMAND = createCommand('JSON_TAG_COMMAND');
export const UNJSON_TAG_COMMAND = createCommand('UNJSON_TAG_COMMAND');
export const TOUCH_JSONTAG_NODE = createCommand('TOUCH_JSONTAG_NODE');
let floatTimeOut = 0;

export const JsontagPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [tag, setTag] = useState('');
  const [isOnFab, setIsOnFab] = useState(false);
  const [activeRect, setActiveRect] = useState({ top: undefined, left: undefined });

  const jsontagContent = useCallback(
    (payload) => {
      const { tag } = payload;
      const selection = $getSelection();
      const nodes = selection.extract();
      let jsontagNode = $createJsontagNode('editor-jsontag', tag, uuidv4());
      if ($isRangeSelected(selection)) {
        nodes.forEach((_node) => {
          const node = _node.getLatest();
          if ($isParagraphNode(node)) {
            jsontagNode = $createJsontagNode('editor-jsontag', tag, uuidv4());
            return;
          }
          const writable = node.getWritable();
          if (!jsontagNode.isAttached()) {
            writable.insertBefore(jsontagNode);
          }
          jsontagNode.append(writable);
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor]
  );

  const unJsontagContent = useCallback(
    () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && !$isRangeSelected(selection)) {
        const node = getSelectedNode(selection);
        if ($isJsontagNode(node)) {
          const writable = node.getWritable();
          writable.replace($createCustomTextNode(writable.getTextContent()));
        }
      }
      return false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor]
  );

  const handleTouchNode = useCallback(({ e, nodeKey }) => {
    const node = $getNodeByKey(nodeKey);
    setTag(node.__tag);
    clearTimeout(floatTimeOut);
    setIsOnFab(true);
    let doc = document.documentElement;
    let left = (window.scrollX || doc.scrollLeft) - (doc.clientLeft || 0);
    let top = (window.scrollY || doc.scrollTop) - (doc.clientTop || 0);
    setActiveRect({
      top: min([max([top, e.clientY + top]), window.innerHeight + top - 200]),
      left: max([min([e.clientX + left, window.innerWidth + left - 200]), left])
    });
  }, []);

  useEffect(() => {
    if (!editor.hasNodes([JsontagNode])) {
      throw new Error('JsontagPlugin: JsontagNode not registered on editor');
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        JSON_TAG_COMMAND,
        (payload) => {
          jsontagContent(payload);
          return true;
        },
        EditorPriority
      ),
      editor.registerCommand(
        UNJSON_TAG_COMMAND,
        () => {
          unJsontagContent();
          return true;
        },
        EditorPriority
      ),
      editor.registerCommand(
        TOUCH_JSONTAG_NODE,
        (payload) => {
          handleTouchNode(payload);
          return true;
        },
        EditorPriority
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, jsontagContent, unJsontagContent, handleTouchNode]);

  return (
    <>
      {createPortal(
        <>
          <Box
            sx={{ top: activeRect?.top + 10, left: activeRect?.left - 1 }}
            zIndex={`99`}
            display={isUndefined(activeRect?.left) || isUndefined(activeRect?.top) || !isOnFab ? `none` : `flex`}
            flexDirection={`column`}
            position={`absolute`}
            alignItems={`center`}
            justifyContent={`space-between`}
            bgcolor={`white`}
            onClick={() => {
              setIsOnFab(true);
            }}
          >
            <Paper
              sx={{
                p: 1,
                minWidth: '100px',
                maxWidth: '200px',
                cursor: 'pointer',
                wordWrap: 'break-word',
                border: '1px solid lightblue'
              }}
              onMouseLeave={() => {
                floatTimeOut = setTimeout(() => {
                  setIsOnFab(false);
                }, 600);
              }}
              onMouseMove={() => {
                clearTimeout(floatTimeOut);
                setIsOnFab(true);
              }}
            >
              <small>
                <code>TAG:</code>
              </small>{' '}
              {tag}
            </Paper>
          </Box>
        </>,
        document.body
      )}
    </>
  );
};

JsontagPlugin.propTypes = {
  user: PropTypes.string,
  users: PropTypes.array
};
