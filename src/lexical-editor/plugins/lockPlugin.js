import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isParagraphNode, $isRangeSelection, createCommand } from 'lexical';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo } from 'react';
import { mergeRegister } from '@lexical/utils';
import { $createLockNode, $isLockNode, LockNode, isLockedNode } from 'lexical-editor/nodes/lockNode';
import { not } from 'utils/array';
import { $isRangeSelected } from 'lexical-editor/utils/$isRangeSelected';
import { getSelectedNode, getUserIds } from './toolbarPlugin';
import { isEqual } from 'lodash';
import { $isCommentNode } from 'lexical-editor/nodes/commentNode';
import { $isBlackoutNode, isBlackedOutNode } from 'lexical-editor/nodes/blackoutNode';
import { openSnackbar } from 'store/reducers/snackbar';
import { dispatch } from 'store';
import { useSelector } from 'store';

const EditorPriority = 1;
export const LOCK_COMMAND = createCommand('LOCK_COMMAND');
export const UNLOCK_COMMAND = createCommand('UNLOCK_COMMAND');

export const LockPlugin = ({ user }) => {
  const allUsers = useSelector((state) => state.document.users.map((item) => item._id));
  const leaders = useSelector((state) => state.document.leaders);
  const me = useSelector((state) => state.document.me);
  const users = useMemo(
    () => [...allUsers, ...leaders.filter((item) => item.team !== me.team).map((item) => item._id)],
    [allUsers, leaders, me]
  );

  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    LockNode.setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    LockNode.setAllUsers(users);
  }, [users]);

  const lockContent = useCallback(
    (payload) => {
      const { users: unlockedUsers } = payload;
      const selection = $getSelection();
      const nodes = selection.extract();
      // nodes.forEach((_node) => {
      //   const node = _node.getLatest();
      //   if ($isLockNode(node)) {
      //     // check if user has permission to edit
      //     const oldUsers = node.getUsers();
      //     if (!oldUsers || oldUsers.indexOf(user) === -1) {
      //       return false;
      //     }
      //     const writable = node.getWritable();
      //     const newLockedNode = $createLockNode('editor-lock', [...not(unlockedUsers, [user]), user]);
      //     const children = writable.getChildren();
      //     // check if all users are selected
      //     if (isEqual(getUserIds(users).sort(), [...not(unlockedUsers, [user]), user].sort())) {
      //       for (let i = 0; i < children.length; i += 1) writable.insertBefore(children[i]);
      //       writable.remove();
      //       return false;
      //     }
      //     for (let i = 0; i < children.length; i += 1) newLockedNode.append(children[i]);
      //     writable.replace(newLockedNode);
      //     return false;
      //   }
      //   if (node.getParent() && $isLockNode(node.getParent())) {
      //     if (nodes.length === 1) {
      //       const writable = node.getParent().getWritable();
      //       const oldUsers = node.getParent().getUsers();
      //       if (oldUsers.indexOf(user) === -1) {
      //         return false;
      //       }
      //       const newLockedNode = $createLockNode('editor-lock', [...not(unlockedUsers, [user]), user]);
      //       const children = writable.getChildren();
      //       // check if all users are selected
      //       if (isEqual(getUserIds(users).sort(), [...not(unlockedUsers, [user]), user].sort())) {
      //         for (let i = 0; i < children.length; i += 1) writable.insertBefore(children[i]);
      //         writable.remove();
      //         return false;
      //       }
      //       for (let i = 0; i < children.length; i += 1) newLockedNode.append(children[i]);
      //       writable.replace(newLockedNode);
      //     }
      //     // wrapElement = writable;
      //     return false;
      //   }

      //   // check if parent is comment or black-out
      //   if ($isCommentNode(node.getParent()) || $isBlackoutNode(node.getParent())) {
      //     if (nodes.length > 2) {
      //       return false;
      //     }
      //   }

      //   const writable = node.getWritable();
      //   // if (index === 0) {
      //   // wrapElement =
      //   $wrapNodeInElement(writable, () => {
      //     return $createLockNode('editor-lock', [...not(unlockedUsers, [user]), user]);
      //   });
      //   // } else {
      //   //   wrapElement.append(writable);
      //   // }
      // });

      const anchorNode = selection.anchor.getNode();
      const focusNode = selection.focus.getNode();

      let wrapLockNode = $createLockNode('editor-lock', [...not(unlockedUsers, [user]), user], user);

      // check if node range is in the locked node
      const parentLockedNode = anchorNode
        .getParents()
        .reverse()
        .find((_node) => $isLockNode(_node));
      // if all the node selected are in the lock node
      const isSelectionInLockNode = !!focusNode.getParents().find((_node) => _node.is(parentLockedNode));
      if (isSelectionInLockNode && $isRangeSelected(selection)) {
        const writable = parentLockedNode.getWritable();
        const children = writable.getChildren();
        const startParentIndex = anchorNode.getParents().indexOf(parentLockedNode) + 1;
        const selectedFirstIndex = anchorNode.getParents()[startParentIndex].getIndexWithinParent();
        const lastParentIndex = focusNode.getParents().indexOf(parentLockedNode) + 1;
        const selectedLastIndex = focusNode.getParents()[lastParentIndex].getIndexWithinParent();
        const prevLockedNode = $createLockNode('editor-lock', writable.getUsers(), writable.getLocker(), writable.getTimestamp());
        const nextLockedNode = $createLockNode('editor-lock', writable.getUsers(), writable.getLocker(), writable.getTimestamp());
        for (let i = 0; i < children.length; i += 1) {
          if (i < selectedFirstIndex) {
            prevLockedNode.append(children[i]);
          } else if (i > selectedLastIndex) {
            nextLockedNode.append(children[i]);
          } else {
            wrapLockNode.append(children[i]);
          }
        }
        writable.replace(prevLockedNode);
        prevLockedNode.insertAfter(wrapLockNode);
        wrapLockNode.insertAfter(nextLockedNode);
        return false;
      }

      let isValid = true;
      // check if orginally have lock node in selection
      nodes.forEach((node) => {
        if ($isLockNode(node) || $isLockNode(node.getParent())) {
          // check if user has permission to edit
          const oldUsers = $isLockNode(node) ? node.getUsers() : node.getParent().getUsers();
          if (!oldUsers || oldUsers.indexOf(user) === -1) {
            isValid = false;
            return false;
          }
        }
        if (isBlackedOutNode(node, user)) {
          isValid = false;
          return false;
        }
      });

      if (!isValid) {
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

      // case for cursor pointed on the block
      if (anchorNode === focusNode && !$isRangeSelected(selection)) {
        // case if anchorNode is locked out
        if (isLockedNode(anchorNode)) {
          // if parent of anchorNode is locked out
          if (!$isLockNode(anchorNode.getParent()) && isLockedNode(anchorNode.getParent())) {
            anchorNode
              .getParents()
              .reverse()
              .map((_node, index) => {
                if ($isLockNode(_node)) {
                  const writable = _node;
                  const parentNode = anchorNode.getParents().reverse()[index + 1];
                  if (!parentNode) {
                    return false;
                  }
                  const children = writable.getChildren();
                  const selectedIndex = parentNode.getIndexWithinParent();
                  const prevLockedNode = $createLockNode('editor-lock', writable.getUsers(), writable.getLocker(), writable.getTimestamp());
                  const nextLockedNode = $createLockNode('editor-lock', writable.getUsers(), writable.getLocker(), writable.getTimestamp());
                  for (let i = 0; i < children.length; i += 1) {
                    if (i < selectedIndex) {
                      prevLockedNode.append(children[i]);
                    } else if (i > selectedIndex) {
                      nextLockedNode.append(children[i]);
                    } else {
                      wrapLockNode.append(children[i]);
                    }
                  }
                  writable.replace(prevLockedNode);
                  prevLockedNode.insertAfter(wrapLockNode);
                  wrapLockNode.insertAfter(nextLockedNode);
                }
                return false;
              });
            return false;
            // const parentNode = anchorNode.getParent();
            // const writable = parentNode.getParent();
          }
        }
      }

      // check if part of one blacked out node is selected
      if (anchorNode?.getParent() === focusNode?.getParent() && $isLockNode(anchorNode?.getParent()) && $isRangeSelected(selection)) {
        // check if blacked out
        if (isBlackedOutNode(anchorNode, user)) {
          return false;
        }
        const writable = anchorNode.getParent();
        const children = writable.getChildren();
        const selectedFirstIndex = nodes[0].getIndexWithinParent();
        const selectedLastIndex = nodes[nodes.length - 1].getIndexWithinParent();
        const prevLockedNode = $createLockNode('editor-lock', writable.getUsers(), writable.getLocker(), writable.getTimestamp());
        const nextLockedNode = $createLockNode('editor-lock', writable.getUsers(), writable.getLocker(), writable.getTimestamp());
        for (let i = 0; i < children.length; i += 1) {
          if (i < selectedFirstIndex) {
            prevLockedNode.append(children[i]);
          } else if (i > selectedLastIndex) {
            nextLockedNode.append(children[i]);
          } else {
            wrapLockNode.append(children[i]);
          }
        }
        writable.replace(prevLockedNode);
        prevLockedNode.insertAfter(wrapLockNode);
        wrapLockNode.insertAfter(nextLockedNode);
        return false;
      }

      nodes.forEach((_node) => {
        const writable = _node.getWritable();

        // check if node is paragraph node or not @topbot 4/9/2023
        if ($isParagraphNode(_node)) {
          wrapLockNode = $createLockNode('editor-lock', [...not(unlockedUsers, [user]), user], user);
          return false;
        }

        if ($isLockNode(writable.getParent()) || $isCommentNode(writable.getParent()) || $isBlackoutNode(writable.getParent())) {
          if (anchorNode?.getParent() !== focusNode?.getParent() || _node.getParent() !== focusNode?.getParent()) {
            return false;
          }
        }
        if ($isLockNode(_node) || $isLockNode(_node.getParent())) {
          const writable = $isLockNode(_node) ? _node.getWritable() : _node.getParent().getWritable();
          const children = writable.getChildren();
          for (let i = 0; i < children.length; i += 1) wrapLockNode.append(children[i]);
          // check if locked node is selected
          if (nodes.length === 1 && !$isRangeSelected(selection)) {
            writable.replace(wrapLockNode);
          } else {
            writable.remove();
          }
          return false;
        }

        if (!wrapLockNode.isAttached()) {
          writable.insertBefore(wrapLockNode);
        }
        wrapLockNode.append(writable);
      });
      // check if all users are selected
      // if (isEqual(getUserIds(users).sort(), [...not(unlockedUsers, [user]), user].sort())) {
      //   const children = wrapLockNode.getChildren();
      //   for (let i = 0; i < children.length; i += 1) wrapLockNode.insertBefore(children[i]);
      //   wrapLockNode.remove();
      //   return false;
      // }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor]
  );

  const unlockContent = useCallback(
    () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const node = getSelectedNode(selection);
        const parents = node.getParents();
        let unlocked = false;
        parents.forEach((parent) => {
          if (unlocked) return;
          if (($isLockNode(parent) || $isLockNode(node)) && !$isRangeSelected(selection)) {
            const _lockNode = $isLockNode(parent) ? parent : node;
            const writable = _lockNode.getWritable();
            const children = writable.getChildren();
            for (let i = 0; i < children.length; i += 1) writable.insertBefore(children[i]);
            writable.remove();
            unlocked = true;
          }
        });
      }
      return false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor]
  );

  useEffect(() => {
    if (!editor.hasNodes([LockNode])) {
      throw new Error('LockPlugin: LockNode not registered on editor');
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        LOCK_COMMAND,
        (payload) => {
          lockContent(payload);
          return true;
        },
        EditorPriority
      ),
      editor.registerCommand(
        UNLOCK_COMMAND,
        () => {
          unlockContent();
          return true;
        },
        EditorPriority
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return null;
};

LockPlugin.propTypes = {
  user: PropTypes.string
};
