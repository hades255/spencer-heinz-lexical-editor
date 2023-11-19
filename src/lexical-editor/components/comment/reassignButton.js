/* eslint-disable prettier/prettier */
import { useCallback, useEffect, useRef, useState } from 'react';

import { $getSelection, SELECTION_CHANGE_COMMAND } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { isFunction } from 'lodash';

import useAuth from 'hooks/useAuth';
import FloatDialog from '../floatMenu/floatDialog';
import { BlackoutNode, isBlackedOutNode } from 'lexical-editor/nodes/blackoutNode';
import { mergeRegister } from '@lexical/utils';
import { ACTION_REQUEST_USER, COMMENT_TYPES } from 'lexical-editor/utils/constants';
import { Box } from '@mui/material';
import { getSelectedNode } from 'lexical-editor/plugins/toolbarPlugin';
import { SET_COMMENT_COMMAND } from 'lexical-editor/plugins/commentPlugin';
import { $isRangeSelected } from 'lexical-editor/utils/$isRangeSelected';
import DropDownMenu from '../floatMenu/dropdown';
import PropTypes from 'prop-types';

const LowPriority = 1;

export const ReassignButton = ({ users, me }) => {
  const { user } = useAuth();
  const [isDropDownActive, setIsDropDownActive] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [assignee, setAssignee] = useState();
  const [task, setTask] = useState();
  const [permittedUsers, setPermittedUsers] = useState(users);
  const [step, setStep] = useState(0);

  const [editor] = useLexicalComposerContext();

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
  }, [editor]);

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
    setDialogOpen(false);
    console.log('B');
    editor.dispatchCommand(SET_COMMENT_COMMAND, { assignee, task, user, commentContent: comment, type: COMMENT_TYPES.REASSIGNED });
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

  const handleMouseMove = () => {
    setIsDropDownActive(true);
    return false;
  };

  const handleMouseLeave = () => {
    setIsDropDownActive(false);
    return false;
  };

  return (
    <>
      <Box
        sx={{
          top: '250px',
          left: '50px'
        }}
        zIndex={`10001`}
        // display={!pos?.x || !pos?.y ? `none` : `flex`}
        position={`absolute`}
        alignItems={`center`}
        justifyContent={`space-between`}
        bgcolor={`white`}
        border={`1px solid black`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <DropDownMenu
          setIsDropDownActive={setIsDropDownActive}
          setStep={setStep}
          step={step}
          index={0}
          isDropDownActive={isDropDownActive}
          setAssignee={setAssignee}
          assignee={assignee}
          setTask={setTask}
          task={task}
          users={permittedUsers}
          setDialogOpen={setDialogOpen}
          pos={{ x: 1, y: 1 }}
          currentUser={me}
        />
      </Box>
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
    </>
  );
};

ReassignButton.propTypes = {
  users: PropTypes.array,
  me: PropTypes.any
};
