import FloatMenu from '../components/floatMenu/floatMenu';
/* eslint-disable prettier/prettier */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { $getSelection, SELECTION_CHANGE_COMMAND } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isRangeSelected } from '../utils/$isRangeSelected';
import { useUserInteractions } from '../hooks/useUserInteractions';

import { isFunction } from 'lodash';

import { OPEN_COMMENT_DIALOG_COMMAND, SET_COMMENT_COMMAND } from './commentPlugin';
import FloatDialog from '../components/floatMenu/floatDialog';
import { getSelectedNode } from './toolbarPlugin';
import { $isBlackoutNode, BlackoutNode, isBlackedOutNode } from 'lexical-editor/nodes/blackoutNode';
import { mergeRegister } from '@lexical/utils';
import { ACTION_REQUEST_USER } from 'lexical-editor/utils/constants';
import { useSelector } from 'store';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

const ANCHOR_ELEMENT = document.body;

let setPosTimeout = 0;

const LowPriority = 1;

export const FloatMenuPlugin = () => {
  const allUsers = useSelector((state) => state.document.users);
  const leaders = useSelector((state) => state.document.leaders);
  const user = useSelector((state) => state.document.me);
  const users = useMemo(() => [...allUsers, ...leaders.filter((item) => item.team !== user.team)], [allUsers, leaders, user]);

  const [show, setShow] = useState(false);
  const [isDropDownActive, setIsDropDownActive] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [assignee, setAssignee] = useState();
  const [task, setTask] = useState();
  const [permittedUsers, setPermittedUsers] = useState(users);

  const [editor] = useLexicalComposerContext();
  const { isPointerDown, isKeyDown } = useUserInteractions();

  const commentRef = useRef();

  useEffect(() => {
    setCommentError('');
    if (isDialogOpen) {
      setTimeout(() => {
        if (isFunction(commentRef.current.focus)) {
          commentRef.current.focus();
        }
      }, 100);
    }
  }, [isDialogOpen]);

  const updateUsers = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelected(selection)) {
      const node = getSelectedNode(selection);
      // !check if locked or blacked out and get permitted users of block of text
      let _permittedUsers = users.map((_user) => _user._id);
      // ! @topbot 2023/9/12 #not showing unblacked users for blacked one
      // node
      //   .getParents()
      //   // ! @topbot 2023/9/9 disable for locked content
      //   // .filter(parent => $isLockNode(parent) || $isBlackoutNode(parent))
      //   .filter(parent => $isBlackoutNode(parent))
      //   .reverse()
      //   .map((_node) => {
      //     _permittedUsers = intersection(_permittedUsers, _node.getUsers());
      //   });
      setPermittedUsers(users.filter((_user) => _permittedUsers.includes(_user._id)));
      // ! @topbot 2023/9/12 #set only action request for blacked out user
      if (isBlackedOutNode(node, BlackoutNode.__currentUser)) {
        setPermittedUsers([ACTION_REQUEST_USER]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, users]);

  const checkCanComment = useCallback(() => {
    let flag = true;
    let flag_ = true;
    const selection = $getSelection();
    if (assignee === ACTION_REQUEST_USER._id) return true;
    if ($isRangeSelected(selection)) {
      const nodes = selection.extract();
      nodes.forEach((node) => {
        if (!flag) return flag;
        if (!flag_) return flag_;
        if ($isBlackoutNode(node)) {
          const writable = node.getWritable();
          if (!writable.__users.includes(user._id)) {
            flag = false;
          }
          if (!writable.__users.includes(assignee)) {
            flag_ = false;
          }
        } else if ($isBlackoutNode(node.getParent())) {
          const writable = node.getParent().getWritable();
          if (!writable.__users.includes(user._id)) {
            flag = false;
          }
          if (!writable.__users.includes(assignee)) {
            flag_ = false;
          }
        }
      });
    }
    if (!flag) {
      dispatch(
        openSnackbar({
          open: true,
          message: `You are not authorized to assign a comment to this block of text`,
          variant: 'alert',
          alert: {
            color: 'info'
          },
          close: true
        })
      );
    }
    if (!flag_) {
      dispatch(
        openSnackbar({
          open: true,
          message: `Blacked out users can't receive comments`,
          variant: 'alert',
          alert: {
            color: 'info'
          },
          close: true
        })
      );
    }
    return flag && flag_;
  }, [user, assignee]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateUsers();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        // eslint-disable-next-line no-unused-vars
        (_payload, newEditor) => {
          updateUsers();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        OPEN_COMMENT_DIALOG_COMMAND,
        // eslint-disable-next-line no-unused-vars
        ({ value }) => {
          if (value) {
            if (checkCanComment()) setDialogOpen(value);
          } else setDialogOpen(value);
          return false;
        },
        LowPriority
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, updateUsers, checkCanComment]);

  const handleSetDialogOpen = useCallback((value) => editor.dispatchCommand(OPEN_COMMENT_DIALOG_COMMAND, { value }), [editor]);

  const handleSubmitComment = () => {
    let comment = commentRef.current.value;
    // if (!trim(comment)) {
    //   setCommentError('Invalid comment!');
    //   return false;
    // }
    // console.log('submit comment');
    setDialogOpen(false);
    editor.dispatchCommand(SET_COMMENT_COMMAND, { assignee, task, user, commentContent: comment });
  };

  const handleCancelComment = () => {
    setDialogOpen(false);
    setAssignee('');
    setTask('');
  };

  const handleCommentKeyDown = (e) => {
    setCommentError('');
    if (e.key === 'Enter') {
      e.preventDefault();
      setCommentError('Invalid comment!');
      handleSubmitComment();
    }
  };

  const updateFloatingMenu = useCallback(() => {
    editor.getEditorState().read(() => {
      if (editor.isComposing() || isPointerDown || isKeyDown) return;

      if (editor.getRootElement() !== document.activeElement && !isDropDownActive && (!assignee || !task)) {
        clearTimeout(setPosTimeout);
        setShow(false);
        return;
      }

      const selection = $getSelection();

      if ($isRangeSelected(selection)) {
        setShow(true);
      } else {
        setShow(false);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, isPointerDown, isKeyDown, isDropDownActive]);

  // Rerender the floating menu automatically on every state update.
  // Needed to show correct state for active formatting state.
  useEffect(() => {
    return editor.registerUpdateListener(() => {
      updateFloatingMenu();
    });
  }, [editor, updateFloatingMenu]);

  // Rerender the floating menu on relevant user interactions.
  // Needed to show/hide floating menu on pointer up / key up.
  useEffect(() => {
    updateFloatingMenu();
  }, [isPointerDown, isKeyDown, updateFloatingMenu]);

  return createPortal(
    <>
      <FloatMenu
        editor={editor}
        show={show}
        setIsDropDownActive={setIsDropDownActive}
        isDropDownActive={isDropDownActive}
        setAssignee={setAssignee}
        assignee={assignee}
        task={task}
        setTask={setTask}
        setDialogOpen={handleSetDialogOpen}
        currentUser={user}
        users={permittedUsers}
      />
      <FloatDialog //xx new comment dialog
        isDialogOpen={isDialogOpen}
        setDialogOpen={handleSetDialogOpen}
        assignee={assignee}
        task={task}
        commentError={commentError}
        handleSubmitComment={handleSubmitComment}
        handleCancelComment={handleCancelComment}
        commentRef={commentRef}
        handleCommentKeyDown={handleCommentKeyDown}
        users={users}
      />
    </>,
    ANCHOR_ELEMENT
  );
};
