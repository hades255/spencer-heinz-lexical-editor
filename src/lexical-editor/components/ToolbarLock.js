import { EyeFilled, EyeInvisibleFilled, LockFilled } from '@ant-design/icons';
import { LockOpenOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { $getSelection, $isRangeSelection, SELECTION_CHANGE_COMMAND } from 'lexical';
import { LOCK_COMMAND, UNLOCK_COMMAND } from 'lexical-editor/plugins/lockPlugin';
import { getSelectedNode, getUserIds } from 'lexical-editor/plugins/toolbarPlugin';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import LockUserDialog from './lock/lockDialog';
import { useCallback, useEffect, useRef, useState } from 'react';
import { mergeRegister } from '@lexical/utils';
import { $isLockNode, isLockedNode } from 'lexical-editor/nodes/lockNode';
import { $isRangeSelected } from 'lexical-editor/utils/$isRangeSelected';
import { not } from 'utils/array';
import PropTypes from 'prop-types';

const LowPriority = 1;

const ToolbarLock = ({ user, users, editor, active }) => {
  const [isLockedShow, setIsLockedShow] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedUsers, setLockedUsers] = useState([]);
  const [unlockedUsers, setUnlockedUsers] = useState([]);
  const [isLockingUser, setIsLockingUser] = useState(false);

  const locker = useRef('');
  const timestamp = useRef('');

  useEffect(() => {
    setLockedUsers(getUserIds(users));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  const updateLockbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if (($isLockNode(parent) || $isLockNode(node)) && !$isRangeSelected(selection)) {
        setIsLocked(true);
      }
      // update locked nodes if selected
      if (isLockedNode(node) && !$isRangeSelected(selection)) {
        // ! @topbot 2023/9/10 get locked node logic change
        // const _lockNode = $isLockNode(parent) ? parent : node;
        const _lockNode = node
          .getParents()
          .reverse()
          .find((parent) => $isLockNode(parent) && !parent.getUsers()?.includes(user._id));
        const initUser = _lockNode.getLocker();
        const _unlockedUsers = _lockNode.getUsers();
        const _lockedUsers = getUserIds(users).filter((value) => value !== initUser && _unlockedUsers?.indexOf(value) === -1);
        setLockedUsers(_lockedUsers);
        setUnlockedUsers(not(getUserIds(users), initUser === user ? _lockedUsers : [..._lockedUsers, initUser]));
        locker.current = users.find((_user) => _user._id === initUser)?.name;
        timestamp.current = _lockNode.getTimestamp();
        setIsLocked(true);
      } else {
        setIsLocked(false);
        setLockedUsers(getUserIds(users));
        setUnlockedUsers([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, locker, timestamp, users]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLockbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        // eslint-disable-next-line no-unused-vars
        (_payload, newEditor) => {
          updateLockbar();
          return false;
        },
        LowPriority
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, updateLockbar]);

  const unlockNode = useCallback(() => {
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

    editor.dispatchCommand(UNLOCK_COMMAND);
  }, [editor, unlockedUsers, user]);

  /**
   *
   * @description lock selected nodes
   * @Todo check and reinforce properties should be preserved
   */
  const lockNode = useCallback(() => {
    editor.dispatchCommand(LOCK_COMMAND, { users: unlockedUsers });
    return false;
  }, [editor, unlockedUsers]);

  const showLockedNodes = useCallback(() => {
    setIsLockedShow((prev) => !prev);
    return false;
  }, []);

  return (
    <>
      <IconButton
        size="large"
        icon="link"
        aria-label="Lock Node"
        disabled={!active}
        onClick={() => {
          if (!isLocked || unlockedUsers.includes(user)) {
            setIsLockingUser(true);
          } else {
            dispatch(
              openSnackbar({
                open: true,
                message: `You do not have the authority to change lock permissions for this block of text. Locked by ${locker.current.valueOf()} at ${timestamp.current.valueOf()}`,
                variant: 'alert',
                alert: {
                  color: 'error'
                },
                close: true
              })
            );
          }
        }}
        id={`lock-btn`}
        color={isLocked ? 'error' : 'secondary'}
      >
        {isLocked ? <LockFilled /> : <LockOpenOutlined />}
      </IconButton>
      {isLocked && (
        <IconButton
          size="large"
          icon="link"
          aria-label="Lock Node"
          disabled={!active}
          onClick={() => {
            unlockNode();
          }}
          color={'primary'}
        >
          <LockOpenOutlined />
        </IconButton>
      )}
      <IconButton
        size="large"
        icon="link"
        aria-label="Lock Node"
        disabled={!active}
        onClick={showLockedNodes}
        color={isLockedShow ? 'primary' : 'secondary'}
      >
        {isLockedShow ? <EyeFilled /> : <EyeInvisibleFilled />}
      </IconButton>
      <LockUserDialog
        lockedUsers={lockedUsers}
        setLockedUsers={setLockedUsers}
        unlockedUsers={unlockedUsers}
        setUnlockedUsers={setUnlockedUsers}
        setIsLockingUser={setIsLockingUser}
        isLockingUser={isLockingUser}
        currentUser={user}
        users={users}
        isLocked={isLocked}
        lockNode={lockNode}
        editor={editor}
      />
    </>
  );
};

ToolbarLock.propTypes = {
  user: PropTypes.string,
  users: PropTypes.array,
  active: PropTypes.bool,
  editor: PropTypes.object
};

export default ToolbarLock;
