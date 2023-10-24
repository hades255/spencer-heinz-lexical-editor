import { useEffect, useMemo, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { $getRoot, $isParagraphNode, CLEAR_EDITOR_COMMAND, REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import { useEditorHistoryState } from 'contexts/LexicalEditor';
import { Box, Button } from '@mui/material';

export function ActionsPlugin() {
  const [editor] = useLexicalComposerContext();
  const { historyState } = useEditorHistoryState();

  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

  const { undoStack, redoStack } = historyState ?? {};
  const [hasUndo, setHasUndo] = useState(undoStack?.length !== 0);
  const [hasRedo, setHasRedo] = useState(redoStack?.length !== 0);

  const MandatoryPlugins = useMemo(() => {
    return <ClearEditorPlugin />;
  }, []);

  useEffect(
    function checkEditorEmptyState() {
      return editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const root = $getRoot();
          const children = root.getChildren();

          if (children.length > 1) {
            setIsEditorEmpty(false);
            return;
          }

          if ($isParagraphNode(children[0])) {
            setIsEditorEmpty(children[0].getChildren().length === 0);
          } else {
            setIsEditorEmpty(false);
          }
        });
      });
    },
    [editor]
  );

  useEffect(
    function checkEditorHistoryActions() {
      return editor.registerUpdateListener(() => {
        setHasRedo(redoStack?.length !== 0);
        setHasUndo(undoStack?.length !== 0);
      });
    },
    [editor, undoStack, redoStack]
  );

  return (
    <>
      {MandatoryPlugins}
      <Box display={`flex`} gap={1}>
        <Button
          size="small"
          disabled={isEditorEmpty}
          onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
          }}
        >
          {ActionIcons.Clear}
        </Button>
        <Box display={`flex`} gap={1}>
          <Button
            size="small"
            disabled={!hasUndo}
            onClick={() => {
              editor.dispatchCommand(UNDO_COMMAND, undefined);
            }}
          >
            {ActionIcons.Undo}
          </Button>
          <Button
            size="small"
            disabled={!hasRedo}
            onClick={() => {
              editor.dispatchCommand(REDO_COMMAND, undefined);
            }}
          >
            {ActionIcons.Redo}
          </Button>
        </Box>
      </Box>
    </>
  );
}

const ActionIcons = {
  Clear: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
      width={`25px`}
    >
      <title>Clear</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z"
      />
    </svg>
  ),
  Undo: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
      width={`25px`}
    >
      <title>Undo</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
  ),
  Redo: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
      width={`25px`}
    >
      <title>Redo</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
    </svg>
  )
};
