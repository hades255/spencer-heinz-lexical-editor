import { useEffect, useMemo, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { $getNodeByKey, $getRoot, $isParagraphNode, CLEAR_HISTORY_COMMAND, UNDO_COMMAND } from 'lexical';
import { useEditorHistoryState } from 'contexts/LexicalEditor';
import { $isLockNode, LockNode, isLockedNode } from 'lexical-editor/nodes/lockNode';
import { mergeRegister } from '@lexical/utils';
import PropTypes from 'prop-types';
import { debounce, isEmpty } from 'lodash';
import { openSnackbar } from 'store/reducers/snackbar';
import { $isBlackoutNode, BlackoutNode, isBlackedOutNode } from 'lexical-editor/nodes/blackoutNode';
import { $isCommentNode, CommentNode, canRemoveCommentNode } from 'lexical-editor/nodes/commentNode';
import { $isJumpNode, JumpNode } from 'lexical-editor/nodes/jumpNode';
import { getNavList } from 'store/reducers/document';
import { useDispatch } from 'store';
import axiosServices from 'utils/axios';

export function ActionsPlugin({ user }) {
  const [editor] = useLexicalComposerContext();
  const { historyState } = useEditorHistoryState();

  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

  const { undoStack, redoStack } = historyState ?? {};
  const [hasUndo, setHasUndo] = useState(undoStack?.length !== 0);
  const [hasRedo, setHasRedo] = useState(redoStack?.length !== 0);

  const dispatch = useDispatch();

  const MandatoryPlugins = useMemo(() => {
    return <ClearEditorPlugin />;
  }, []);

  // useEffect(() => {
  //   window.addEventListener('focus', function () {
  //     editor.focus();
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
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

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves, tags, ...rest }) => {
        // Don't update if nothing changed
        // console.log(dirtyElements, dirtyLeaves);
        if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
        editorState.read(() => {
          // const selection = $getSelection();
          dirtyLeaves.forEach((_key) => {
            const node = $getNodeByKey(_key);
            if (!node) {
              return false;
            }
            // !check if other modified this block of text
            if (tags.has('collaboration')) {
              if (
                isLockedNode(node, user) ||
                ($isLockNode(node) && !node.isEditable()) ||
                isBlackedOutNode(node, user) ||
                ($isBlackoutNode(node) && !node.isEditable())
              ) {
                editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
              }
              return false;
            }

            if (
              isLockedNode(node, user) ||
              ($isLockNode(node) && !node.isEditable()) ||
              isBlackedOutNode(node, user) ||
              ($isBlackoutNode(node) && !node.isEditable())
            ) {
              console.log('Not allowed to edit this node.');
              if (!isEmpty(undoStack)) {
                dispatch(
                  openSnackbar({
                    open: true,
                    message: 'You are not authorized to edit this block of text.',
                    variant: 'alert',
                    alert: {
                      color: 'error'
                    },
                    close: true
                  })
                );
              }
              editor.setEditable(false);
              debouncedUnDo(editor);
            }
          });
        });
      }),
      editor.registerMutationListener(LockNode, (nodeMutations, { updateTags, prevEditorState }) => {
        // !check if other mutated nodes
        if (updateTags.has('collaboration')) {
          for (const [nodeKey, mutation] of nodeMutations) {
            const workEditorState = mutation === 'destroyed' ? prevEditorState : editor.getEditorState();
            workEditorState.read(() => {
              const node = $getNodeByKey(nodeKey);
              if (!node) {
                return false;
              }
              if (isLockedNode(node, user) || ($isLockNode(node) && !node.isEditable())) {
                editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
              }
            });
            return false;
          }
          return false;
        }
        let validationFlag = false;
        for (const [nodeKey, mutation] of nodeMutations) {
          if (mutation === 'created' || mutation === 'updated') continue;
          prevEditorState.read(() => {
            const node = $getNodeByKey(nodeKey);
            if (!node) {
              return false;
            }
            if (isLockedNode(node, user) || ($isLockNode(node) && !node.isEditable())) {
              validationFlag = true;
            }
          });
        }
        if (validationFlag) {
          console.log('Not allowed to destroy this node.');
          dispatch(
            openSnackbar({
              open: true,
              message: 'You are not authorized to edit this block of text.',
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
          editor.setEditable(false);
          debouncedUnDo(editor);
        }
        return false;
      }),
      editor.registerMutationListener(BlackoutNode, (nodeMutations, { updateTags, prevEditorState }) => {
        // !check if other mutated nodes
        if (updateTags.has('collaboration')) {
          for (const [nodeKey, mutation] of nodeMutations) {
            const workEditorState = mutation === 'destroyed' ? prevEditorState : editor.getEditorState();
            workEditorState.read(() => {
              const node = $getNodeByKey(nodeKey);
              if (!node) {
                return false;
              }
              if (isBlackedOutNode(node, user) || !node.isEditable()) {
                editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
              }
            });
            return false;
          }
          return false;
        }
        let validationFlag = false;
        for (const [nodeKey, mutation] of nodeMutations) {
          if (mutation === 'created' || mutation === 'updated') continue;
          prevEditorState.read(() => {
            const node = $getNodeByKey(nodeKey);
            if (!node) {
              return false;
            }
            if (isBlackedOutNode(node, user) || !node.isEditable()) {
              validationFlag = true;
            }
          });
        }
        if (validationFlag) {
          console.log('Not allowed to destroy this node.');
          dispatch(
            openSnackbar({
              open: true,
              message: 'You are not authorized to edit this block of text.',
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
          editor.setEditable(false);
          debouncedUnDo(editor);
        }
        return false;
      }),
      editor.registerMutationListener(CommentNode, (nodeMutations, { updateTags, prevEditorState }) => {
        if (updateTags.has('collaboration')) return false;
        let nodeKey, mutation, same;
        for (const [nodeKey_, mutation_] of nodeMutations) {
          nodeKey = nodeKey_;
          mutation = mutation || mutation_;
          same = mutation ? mutation === mutation_ : false;
        }
        // if (updateTags.has('history-merge')) {
        //   console.log('history-merge');
        // }

        let validationFlag = false;

        if (same) {
          if (mutation === 'destroyed') {
            prevEditorState.read(() => {
              const node = $getNodeByKey(nodeKey);
              if (!node) {
                return false;
              }
              validationFlag = canRemoveCommentNode(node, user);
              if (!validationFlag) {
                editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
                if ($isCommentNode(node)) {
                  const comments = node.getComments();
                  let ids = [];
                  comments.forEach((item) => {
                    ids.push(item.uniqueId);
                  });
                  (async () => {
                    try {
                      await axiosServices.delete('/task/uniqueIds/' + ids);
                    } catch (error) {
                      console.log(error);
                    }
                  })();
                }
              }
            });
          }
          // if (mutation === 'created') {
          //   editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
          // }
          console.log(mutation);
        }

        if (validationFlag) {
          dispatch(
            openSnackbar({
              open: true,
              message: 'You are not authorized to edit this block of text.',
              variant: 'alert',
              alert: {
                color: 'info'
              },
              close: true
            })
          );
          editor.setEditable(false);
          debouncedUnDo(editor);
        }
        return false;
      }),
      editor.registerMutationListener(JumpNode, () => {
        const navList = [];
        editor.getEditorState().read(() => {
          const root = $getRoot();
          const children = root.getAllTextNodes();
          children
            .filter((child) => $isJumpNode(child))
            .forEach((_node) => {
              const navItem = {
                text: _node.getTextContent(),
                uniqueId: _node.getUniqueId(),
                level: _node.getLevel()
              };
              navList.push(navItem);
            });
        });
        getNavList(navList);
        return false;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  useEffect(
    function checkEditorHistoryActions() {
      return editor.registerUpdateListener(() => {
        setHasRedo(redoStack?.length !== 0);
        setHasUndo(undoStack?.length !== 0);
      });
    },
    [editor, undoStack, redoStack]
  );

  return <>{MandatoryPlugins}</>;
}

// const ActionIcons = {
//   Clear: (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//       strokeWidth={1.5}
//       stroke="currentColor"
//       className="w-5 h-5"
//       width={`25px`}
//     >
//       <title>Clear</title>
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z"
//       />
//     </svg>
//   ),
//   Undo: (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//       strokeWidth={1.5}
//       stroke="currentColor"
//       className="w-5 h-5"
//       width={`25px`}
//     >
//       <title>Undo</title>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
//     </svg>
//   ),
//   Redo: (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//       strokeWidth={1.5}
//       stroke="currentColor"
//       className="w-5 h-5"
//       width={`25px`}
//     >
//       <title>Redo</title>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
//     </svg>
//   )
// };

ActionsPlugin.propTypes = {
  user: PropTypes.string
};

const debouncedUnDo = debounce((editor) => {
  editor.dispatchCommand(UNDO_COMMAND, undefined);
  editor.setEditable(true);
}, 10);

/*
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
            id={`undo_btn`}
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
      */
