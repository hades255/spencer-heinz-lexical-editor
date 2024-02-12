import { VerifiedOutlined } from '@ant-design/icons';
import { LockOpenOutlined, PendingRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { $getSelection, $isRangeSelection, SELECTION_CHANGE_COMMAND } from 'lexical';
import { getSelectedNode, getUserIds } from 'lexical-editor/plugins/toolbarPlugin';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import LockUserDialog from './blackout/lockDialog';
import { useCallback, useEffect, useState } from 'react';
import { mergeRegister } from '@lexical/utils';
import { $isRangeSelected } from 'lexical-editor/utils/$isRangeSelected';
import { not } from 'utils/array';
import PropTypes from 'prop-types';
import { $isBlackoutNode, isBlackedOutNode } from 'lexical-editor/nodes/blackoutNode';
import { UNBLACK_OUT_COMMAND } from 'lexical-editor/plugins/blackoutPlugin';
import { BLACK_OUT_COMMAND } from 'lexical-editor/plugins/blackoutPlugin';
import { $isLockNode, isLockedNode } from 'lexical-editor/nodes/lockNode';

const LowPriority = 1;

const ToolbarBlackout = ({ user, users, editor, active }) => {
  const [isBlackedOut, setIsBlackedOut] = useState(false);
  const [lockedUsers, setLockedUsers] = useState([]);
  const [unlockedUsers, setUnlockedUsers] = useState([]);
  const [isLockingUser, setIsLockingUser] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);

  useEffect(() => {
    setLockedUsers(getUserIds(users));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  const updateBlackoutbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if (($isBlackoutNode(parent) || $isBlackoutNode(node)) && !$isRangeSelected(selection)) {
        setIsBlackedOut(true);
      }
      // update locked nodes if selected
      if (isBlackedOutNode(node) && !$isRangeSelected(selection)) {
        // ! @topbot 2023/9/10 get locked node logic change
        // const _blackoutNode = $isBlackoutNode(parent) ? parent : node;
        const _blackoutNode = node
          .getParents()
          .reverse()
          .find((parent) => $isBlackoutNode(parent) && !parent.getUsers()?.includes(user._id));
        const initUser = _blackoutNode.getUser();
        const _unlockedUsers = _blackoutNode.getUsers();
        const _lockedUsers = getUserIds(users).filter((value) => value !== initUser && _unlockedUsers?.indexOf(value) === -1);
        setLockedUsers(_lockedUsers);
        setUnlockedUsers(not(getUserIds(users), initUser === user ? _lockedUsers : [..._lockedUsers, initUser]));
        setIsBlackedOut(true);
      } else {
        setIsBlackedOut(false);
        setLockedUsers(getUserIds(users));
        setUnlockedUsers([]);
      }

      // ! @topbot 2023/09/15 #add checking if node is locked out of current user
      setIsLockedOut(false);
      if ($isRangeSelected(selection)) {
        if (($isLockNode(node) && !node.isEditable()) || isLockedNode(node, user)) {
          setIsLockedOut(true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, users, user]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateBlackoutbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        // eslint-disable-next-line no-unused-vars
        (_payload, newEditor) => {
          updateBlackoutbar();
          return false;
        },
        LowPriority
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, updateBlackoutbar]);

  const unblackoutNode = () => {
    if (unlockedUsers.indexOf(user) === -1) {
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
      return false;
    }

    editor.dispatchCommand(UNBLACK_OUT_COMMAND);
  };

  /**
   *
   * @description lock selected nodes
   * @Todo check and reinforce properties should be preserved
   */
  const blackoutNode = () => {
    editor.dispatchCommand(BLACK_OUT_COMMAND, { users: unlockedUsers });
    return false;
  };

  return (
    <>
      <IconButton
        size="large"
        icon="link"
        aria-label="Lock Node"
        id={'blackout-btn'}
        disabled={!active}
        onClick={() => {
          // ! @topbot 2023/09/15 #add checking if node is locked out of current user
          if (!isLockedOut && (!isBlackedOut || unlockedUsers.includes(user))) {
            setIsLockingUser(true);
          } else {
            dispatch(
              openSnackbar({
                open: true,
                message: 'You do not have the authority to change lock permissions for this block of text.',
                variant: 'alert',
                alert: {
                  color: 'error'
                },
                close: true
              })
            );
          }
        }}
        color={isBlackedOut ? 'error' : 'secondary'}
      >
        {isBlackedOut ? <VerifiedOutlined /> : <PendingRounded />}
      </IconButton>
      {isBlackedOut && (
        <IconButton
          size="large"
          icon="link"
          aria-label="Lock Node"
          disabled={!active}
          onClick={() => {
            unblackoutNode();
          }}
          color={'primary'}
        >
          <LockOpenOutlined />
        </IconButton>
      )}
      <LockUserDialog
        lockedUsers={lockedUsers}
        setLockedUsers={setLockedUsers}
        unlockedUsers={unlockedUsers}
        setUnlockedUsers={setUnlockedUsers}
        setIsLockingUser={setIsLockingUser}
        isLockingUser={isLockingUser}
        currentUser={user}
        users={users}
        isLocked={isBlackedOut}
        lockNode={blackoutNode}
        editor={editor}
      />
    </>
  );
};

ToolbarBlackout.propTypes = {
  user: PropTypes.string,
  users: PropTypes.array,
  active: PropTypes.bool,
  editor: PropTypes.object
};

export default ToolbarBlackout;
