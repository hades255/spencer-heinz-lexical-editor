import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isParagraphNode, $isRangeSelection, COPY_COMMAND, createCommand } from 'lexical';
import PropTypes from 'prop-types';
import { useCallback, useEffect } from 'react';
import { mergeRegister } from '@lexical/utils';
import { not } from 'lexical-editor/components/lock/lockSelection';
import { $isRangeSelected } from 'lexical-editor/utils/$isRangeSelected';
import { getSelectedNode, getUserIds } from './toolbarPlugin';
import { isEqual } from 'lodash';
import { $createBlackoutNode, $isBlackoutNode, BlackoutNode, isBlackedOutNode } from 'lexical-editor/nodes/blackoutNode';
import { $isCommentNode } from 'lexical-editor/nodes/commentNode';
import { $isLockNode, isLockedNode } from 'lexical-editor/nodes/lockNode';
import { openSnackbar } from 'store/reducers/snackbar';
import { dispatch } from 'store';

const EditorPriority = 1;
export const BLACK_OUT_COMMAND = createCommand('BLACK_OUT_COMMAND');
export const UNBLACK_OUT_COMMAND = createCommand('UNBLACK_OUT_COMMAND');
export const BlackoutPlugin = ({ user, users }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    // set current user when initialized
    BlackoutNode.setCurrentUser(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const blackoutContent = useCallback(
    (payload) => {
      const { users: unlockedUsers } = payload;
      const selection = $getSelection();
      const nodes = selection.extract();
      // nodes.forEach((_node) => {
      //   const node = _node.getLatest();
      //   if ($isBlackoutNode(node)) {
      //     // check if user has permission to edit
      //     const oldUsers = node.getUsers();
      //     if (!oldUsers || oldUsers.indexOf(user) === -1) {
      //       return false;
      //     }
      //     const writable = node.getWritable();
      //     const newLockedNode = $createBlackoutNode('editor-black-out', [...not(unlockedUsers, [user]), user]);
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
      //   if (node.getParent() && $isBlackoutNode(node.getParent())) {
      //     if (nodes.length === 1) {
      //       const writable = node.getParent().getWritable();
      //       const oldUsers = node.getParent().getUsers();
      //       if (oldUsers.indexOf(user) === -1) {
      //         return false;
      //       }
      //       const newLockedNode = $createBlackoutNode('editor-black-out', [...not(unlockedUsers, [user]), user]);
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
      //   if ($isCommentNode(node.getParent()) || $isLockNode(node.getParent())) {
      //     if (nodes.length > 2) {
      //       return false;
      //     }
      //   }

      //   const writable = node.getWritable();
      //   // if (index === 0) {
      //   // wrapElement =
      //   $wrapNodeInElement(writable, () => {
      //     return $createBlackoutNode('editor-black-out', [...not(unlockedUsers, [user]), user]);
      //   });
      //   // } else {
      //   //   wrapElement.append(writable);
      //   // }
      // });

      // const anchor = selection.anchor;
      // const focus = selection.focus;
      const anchorNode = selection.anchor.getNode();
      const focusNode = selection.focus.getNode();

      let wrapBlackoutNode = $createBlackoutNode('editor-black-out', [...not(unlockedUsers, [user]), user]);

      let isValid = true;
      // check if orginally have lock node in selection
      nodes.forEach((node) => {
        if ($isBlackoutNode(node) || $isBlackoutNode(node.getParent())) {
          // check if user has permission to edit
          const oldUsers = $isBlackoutNode(node) ? node.getUsers() : node.getParent().getUsers();
          if (!oldUsers || oldUsers.indexOf(user) === -1) {
            isValid = false;
            return false;
          }
        }
        if (isBlackedOutNode(node, user) || isLockedNode(node, user)) {
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
            close: false
          })
        );
        return false;
      }

      // check if part of one blacked out node is selected
      if (anchorNode?.getParent() === focusNode?.getParent() && $isBlackoutNode(anchorNode?.getParent()) && $isRangeSelected(selection)) {
        const writable = anchorNode.getParent();
        const children = writable.getChildren();
        const selectedFirstIndex = nodes[0].getIndexWithinParent();
        const selectedLastIndex = nodes[nodes.length - 1].getIndexWithinParent();
        const prevBlackedoutNode = $createBlackoutNode('editor-black-out', writable.getUsers());
        const nextBlackedoutNode = $createBlackoutNode('editor-black-out', writable.getUsers());
        for (let i = 0; i < children.length; i += 1) {
          if (i < selectedFirstIndex) {
            prevBlackedoutNode.append(children[i]);
          } else if (i > selectedLastIndex) {
            nextBlackedoutNode.append(children[i]);
          } else {
            wrapBlackoutNode.append(children[i]);
          }
        }
        writable.replace(prevBlackedoutNode);
        prevBlackedoutNode.insertAfter(wrapBlackoutNode);
        wrapBlackoutNode.insertAfter(nextBlackedoutNode);
        return false;
      }

      nodes.forEach((_node) => {
        const writable = _node.getWritable();

        // check if node is paragraph node or not @topbot 4/9/2023
        if ($isParagraphNode(_node)) {
          wrapBlackoutNode = $createBlackoutNode('editor-black-out', [...not(unlockedUsers, [user]), user]);
          return false;
        }
        if ($isLockNode(writable.getParent()) || $isCommentNode(writable.getParent()) || $isBlackoutNode(writable.getParent())) {
          // selected more than 2 element nodes and node length is greater than 2
          if (anchorNode?.getParent() !== focusNode?.getParent() || _node.getParent() !== focusNode?.getParent()) {
            return false;
          }
        }

        if ($isBlackoutNode(_node) || $isBlackoutNode(_node.getParent())) {
          const writable = $isBlackoutNode(_node) ? _node.getWritable() : _node.getParent().getWritable();
          const children = writable.getChildren();
          for (let i = 0; i < children.length; i += 1) wrapBlackoutNode.append(children[i]);

          // check if locked node is selected
          if (nodes.length === 1 && !$isRangeSelected(selection)) {
            writable.replace(wrapBlackoutNode);
          } else {
            writable.remove();
          }
          return false;
        }

        if (!wrapBlackoutNode.isAttached()) {
          writable.insertBefore(wrapBlackoutNode);
        }
        wrapBlackoutNode.append(writable);
      });
      // check if all users are selected
      if (isEqual(getUserIds(users).sort(), [...not(unlockedUsers, [user]), user].sort())) {
        const children = wrapBlackoutNode.getChildren();
        for (let i = 0; i < children.length; i += 1) wrapBlackoutNode.insertBefore(children[i]);
        wrapBlackoutNode.remove();
        return false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor]
  );

  const unblackoutContent = useCallback(
    () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const node = getSelectedNode(selection);
        const parent = node.getParent();
        if (($isBlackoutNode(parent) || $isBlackoutNode(node)) && !$isRangeSelected(selection)) {
          const _blackoutNode = $isBlackoutNode(parent) ? parent : node;
          const writable = _blackoutNode.getWritable();
          const children = writable.getChildren();
          for (let i = 0; i < children.length; i += 1) {
            if (!$isCommentNode(children[i]) || children[i].getTextContent() !== '🖐') {
              writable.insertBefore(children[i]);
            }
          }
          writable.remove();
        }
      }
      return false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor]
  );

  useEffect(() => {
    if (!editor.hasNodes([BlackoutNode])) {
      throw new Error('LockPlugin: LockNode not registered on editor');
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        BLACK_OUT_COMMAND,
        (payload) => {
          blackoutContent(payload);
          return true;
        },
        EditorPriority
      ),
      editor.registerCommand(
        UNBLACK_OUT_COMMAND,
        () => {
          unblackoutContent();
          return true;
        },
        EditorPriority
      ),
      editor.registerCommand(
        COPY_COMMAND,
        () => {
          navigator.clipboard.readText().then(() => {
            // console.log(copiedText);
          });
          return true;
        },
        EditorPriority
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return null;
};

BlackoutPlugin.propTypes = {
  user: PropTypes.string,
  users: PropTypes.array
};
