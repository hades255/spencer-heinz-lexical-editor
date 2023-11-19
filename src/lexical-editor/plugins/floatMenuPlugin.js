import FloatMenu from '../components/floatMenu/floatMenu';
/* eslint-disable prettier/prettier */
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { $getSelection, SELECTION_CHANGE_COMMAND } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isRangeSelected } from '../utils/$isRangeSelected';
import { useUserInteractions } from '../hooks/useUserInteractions';

import { isFunction } from 'lodash';

import { SET_COMMENT_COMMAND } from './commentPlugin';
import FloatDialog from '../components/floatMenu/floatDialog';
import { getSelectedNode } from './toolbarPlugin';
import { BlackoutNode, isBlackedOutNode } from 'lexical-editor/nodes/blackoutNode';
import { mergeRegister } from '@lexical/utils';
import { ACTION_REQUEST_USER } from 'lexical-editor/utils/constants';

const ANCHOR_ELEMENT = document.body;

let setPosTimeout = 0;

const LowPriority = 1;

export const FloatMenuPlugin = ({ user, users }) => {
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
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, updateUsers]);

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
    console.log('cancelled');
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
        setDialogOpen={setDialogOpen}
        currentUser={user}
        users={permittedUsers}
      />
      <FloatDialog
        isDialogOpen={isDialogOpen}
        setDialogOpen={setDialogOpen}
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
