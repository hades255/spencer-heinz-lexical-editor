import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  SELECTION_CHANGE_COMMAND,
  $getNodeByKey,
  $getPreviousSelection,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $nodesOfType,
  $setSelection,
  createCommand
} from 'lexical';
import { $isAtNodeEnd } from '@lexical/selection';
import { mergeRegister, $wrapNodeInElement } from '@lexical/utils';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { isEmpty, isFunction, isUndefined, max, min, trim } from 'lodash';
import { $isCommentNode } from '../nodes/commentNode';
import { $createCommentNode, CommentNode } from 'lexical-editor/nodes/commentNode';
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { IconButton } from '@mui/material';
import { MailFilled } from '@ant-design/icons';
import { createPortal } from 'react-dom';
import { $isRangeSelected } from 'lexical-editor/utils/$isRangeSelected';
import { useUserInteractions } from 'lexical-editor/hooks/useUserInteractions';
import { v4 as uuidv4 } from 'uuid';
import useLocalStorage from 'lexical-editor/hooks/useLocalStorage';
import { HideSourceRounded } from '@mui/icons-material';
import { not } from 'utils/array';
import { $isLockNode } from 'lexical-editor/nodes/lockNode';
import { $isBlackoutNode, isBlackedOutNode } from 'lexical-editor/nodes/blackoutNode';
import { ACTION_REQUEST_USER, COMMENT_TYPES } from 'lexical-editor/utils/constants';
import { ReassignButton } from 'lexical-editor/components/comment/reassignButton';
import { useSelector } from 'store';
import axiosServices from 'utils/axios';
import DoneIcon from '@mui/icons-material/Done';
import ReplyIcon from '@mui/icons-material/Reply';
import ClearIcon from '@mui/icons-material/Clear';

const EditorPriority = 1;
export const SET_COMMENT_COMMAND = createCommand('SET_COMMENT_COMMAND');
export const UPDATE_COMMENT_COMMAND = createCommand('UPDATE_COMMENT_COMMAND');
export const REMOVE_COMMENT = createCommand('REMOVE_COMMENT');

export const ADD_REPLY_COMMAND = createCommand('ADD_REPLY_COMMAND');

export const TOUCH_COMMENT_COMMAND = createCommand('TOUCH_COMMENT_COMMAND');
export const FILTER_COMMENT = createCommand('FILTER_COMMENT');

let floatTimeOut = 0;

export default function CommentPlugin({ user, uniqueId: doc }) {
  const allUsers = useSelector((state) => state.document.users);
  const leaders = useSelector((state) => state.document.leaders);
  const me = useSelector((state) => state.document.me);
  const users = useMemo(() => [...allUsers, ...leaders.filter((item) => item.team !== me.team)], [allUsers, leaders, me]);

  const [editor] = useLexicalComposerContext();
  const [comments, setComments] = useState([]);
  const [isOnFab, setIsOnFab] = useState(false);
  const [activeNode, setActiveNode] = useState({});
  const [activeCommentIndex, setActiveCommentIndex] = useState(0);
  const [activeReplyIndex, setActiveReplyIndex] = useState(0);
  const [activeRect, setActiveRect] = useState({ top: undefined, left: undefined });
  const [replyShow, setReplyShow] = useState({});
  const [isBlackedOut, setIsBlackedOut] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const replyRef = useRef('');

  const nativeSel = window.getSelection();

  const { isPointerDown, isKeyDown } = useUserInteractions();

  const [suppressedComments, setSuppressedComments] = useLocalStorage('suppressedComments', []);

  useEffect(() => {
    window.addEventListener('scroll', () => {
      let doc = document.documentElement;
      let top = (window.scrollY || doc.scrollTop) - (doc.clientTop || 0);
      setActiveRect({
        top: min([max([top + 35 * comments.length, activeRect.top - 200 + top]), window.innerHeight + top - 300]),
        left: activeRect.left
      });
    });
    // set current user of commentNode
    CommentNode.setCurrentUser(user);
    CommentNode.setCurrentTeam(me?.team);
    CommentNode.setUsers(users);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, user, users]);

  useEffect(() => {
    if (isDialogOpen) {
      setReplyShow({});
      setTimeout(() => {
        if (isFunction(replyRef.current.focus)) {
          replyRef.current.focus();
        }
      }, 100);
    }
  }, [isDialogOpen]);

  useEffect(() => {
    setReplyShow({});
  }, [activeCommentIndex]);

  useEffect(() => {
    setReplyShow({});
    setActiveCommentIndex(0);
    setActiveReplyIndex(0);
    if (!isOnFab) {
      setActiveRect({ top: undefined, left: undefined });
      setComments([]);
    }
  }, [isOnFab]);

  const submitComment = useCallback(
    ({ assignee, task, comment, commentor: { _id }, uniqueId, type }) => {
      (async () => {
        try {
          await axiosServices.post('/task', { assignee, task, comment, commentor: _id, uniqueId, type, doc });
        } catch (error) {
          console.log(error);
        }
      })();
    },
    [doc]
  );

  const submitCommentComplete = useCallback((uniqueId, status = 'complete') => {
    (async () => {
      try {
        await axiosServices.put('/task/uniqueId/' + uniqueId, { status });
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const submitCommentRemove = useCallback((uniqueId) => {
    (async () => {
      try {
        await axiosServices.delete('/task/uniqueId/' + uniqueId);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const updateState = useCallback(() => {
    const selection = $getSelection();
    if (editor.isComposing() || isPointerDown || isKeyDown) {
      setActiveRect({ top: undefined, left: undefined });
      return false;
    }
    if ($isRangeSelection(selection)) {
      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if (($isCommentNode(parent) || $isCommentNode(node)) && !$isRangeSelected(selection)) {
        const _commentNode = $isCommentNode(parent) ? parent : node;
        // !! check this part
        // check if comment node is wraped with black out node let this user out of it.
        // ! @topbot 2023/09/11 #check if comment is created by current user or not
        const filteredComments = _commentNode.getComments()?.filter((comment) => comment.commentor._id === CommentNode.__currentUser);
        if (isBlackedOutNode(_commentNode, user) && isEmpty(filteredComments)) {
          setActiveRect({ top: undefined, left: undefined });
          return false;
        }
        // ! @topbot 2023/09/11 #filter comments created by current user if blacked out
        const _comments = isBlackedOutNode(_commentNode, user) ? filteredComments : _commentNode.getComments();
        //  show comment
        setComments(
          _comments
            .filter(
              (item) =>
                users.find((u) => u._id === item.assignee) &&
                (me.team === item.commentor.team || me._id === item.commentor._id || me._id === item.assignee)
            )
            .map((item) => ({
              ...item,
              commentor:
                me.team === item.commentor.team || item.commentor.leader
                  ? item.commentor
                  : leaders.find((_item) => _item.team === item.commentor.team && _item.leader) || item.commentor
            }))
        );
        // check suppressedComments in localstorage and do update
        const storedValue = window.localStorage.getItem('suppressedComments');
        let suppressedUniqueIds = storedValue === null ? [] : JSON.parse(storedValue);
        setSuppressedComments(suppressedUniqueIds);

        setActiveNode(_commentNode.getLatest());
        setIsBlackedOut(isBlackedOutNode(_commentNode, user));
        setActiveCommentIndex(0);
        setActiveReplyIndex(0);
        clearTimeout(floatTimeOut);
        setIsOnFab(true);
        let doc = document.documentElement;
        let left = (window.scrollX || doc.scrollLeft) - (doc.clientLeft || 0);
        let top = (window.scrollY || doc.scrollTop) - (doc.clientTop || 0);

        const domRange = nativeSel.getRangeAt(0);
        const SelectedRects = domRange.getClientRects();
        if (SelectedRects.length === 1) {
          let rect = SelectedRects[0];
          setActiveRect({
            top: min([max([top + 35 * comments.length, rect.top - 200 + top]), window.innerHeight + top - 300]),
            left: max([min([rect.left + rect.width + left, window.innerWidth + left - 300]), left])
          });
        } else {
          setIsOnFab(false);
        }
      } else {
        setActiveNode(null);
        setIsOnFab(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, isKeyDown]);

  const handleSubmitReply = useCallback(
    (node, index, reply) => {
      if (!trim(reply)) {
        return false;
      }
      if (!isEmpty(node)) {
        node.addReply(index, trim(reply), user);
        const writable = node.getWritable();
        const newCommentNode = $createCommentNode('editor-comment', [...writable.getComments()], [user]);
        const children = writable.getChildren();
        for (let i = 0; i < children.length; i += 1) newCommentNode.append(children[i]);
        writable.replace(newCommentNode);
      }
      replyRef.current.value = '';
      setDialogOpen(false);
      return false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor]
  );

  const updateComment = useCallback(
    (node, index, comment, status) => {
      if (!isEmpty(node)) {
        console.log(node);
        node.setStatus(index, status);
        const writable = node.getWritable();
        const newCommentNode = $createCommentNode('editor-comment', [...writable.getComments()], [user]);
        const children = writable.getChildren();
        for (let i = 0; i < children.length; i += 1) newCommentNode.append(children[i]);
        writable.replace(newCommentNode);

        setTimeout(() => {
          submitCommentComplete(comment.uniqueId, status);
        }, 100);
        return true;
      }
      return false;
    },
    [user, submitCommentComplete]
  );

  const removeComment = useCallback(
    (comment) => {
      const commentNodes = $nodesOfType(CommentNode);
      commentNodes.forEach((node) => {
        const comments = node.getLatest().getComments();
        const writable = node.getWritable();
        if (comments.find((item) => item.uniqueId === comment.uniqueId)) {
          const _comments = comments.filter((item) => item.uniqueId != comment.uniqueId);
          const children = writable.getChildren();
          if (_comments.length === 0) {
            for (let i = 0; i < children.length; i += 1) writable.insertBefore(children[i]);
            writable.remove();
          } else {
            const newCommentNode = $createCommentNode('editor-comment', _comments, [user._id]);
            for (let i = 0; i < children.length; i += 1) newCommentNode.append(children[i]);
            writable.replace(newCommentNode);
          }
          setTimeout(() => {
            submitCommentRemove(comment.uniqueId);
          }, 100);
        }
      });
    },
    [user, submitCommentRemove]
  );

  const getLeaderFromTeam = useCallback(
    (team) => {
      return users.find((item) => item.team === team && item.leader);
    },
    [users]
  );

  const handleTouchComment = useCallback(
    (nodeKey) => {
      /**.map((item) => ({
          ...item,
          commentor:
            item.commentor.team !== me.team && getLeaderFromTeam(item.commentor.team)
              ? getLeaderFromTeam(item.commentor.team)
              : item.commentor
        })) */
      const writable = $getNodeByKey(nodeKey).getWritable();
      const newCommentNode = $createCommentNode('editor-comment', writable.getComments(), [...writable.getNewOrUpdated(), user]);
      const children = writable.getChildren();
      for (let index = 0; index < children.length; index++) {
        newCommentNode.append(children[index]);
      }
      writable.replace(newCommentNode);
      return false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, me, getLeaderFromTeam]
  );

  const setComment = useCallback(
    (payload) => {
      const { assignee, task, user, commentContent, type } = payload;
      const selection = $getPreviousSelection().clone();
      $setSelection(selection);
      const anchorNode = selection.anchor.getNode();
      const focusNode = selection.focus.getNode();
      // let firstNode = anchorNode;
      // let lastNode = focusNode;

      const nodes = selection.extract();
      // const isBackward = selection.isBackward();

      // if (isBackward) {
      //   firstNode = focusNode;
      //   lastNode = anchorNode;
      // }
      // let wrapElement = null;
      // console.log('set new comment');

      const newComment = {
        assignee: assignee,
        task: task,
        comment: commentContent,
        commentor: user,
        replies: [],
        date: new Date().toISOString(),
        uniqueId: uuidv4(),
        type: type ?? COMMENT_TYPES.ASSIGNED
      };
      nodes.forEach((_node) => {
        const node = _node.getLatest();

        const writable = node.getWritable();

        // check if parent node is paragraph node @topbot 9/4/2023
        if ($isParagraphNode(node)) {
          return false;
        }

        // check if parent node is blacked out of
        if (isBlackedOutNode(writable, user._id) || ($isBlackoutNode(node) && !node.isEditable())) {
          const writable = node.getParent().getWritable();
          if (isBlackedOutNode(writable, user._id)) {
            return false;
          }
          // const newCommentNode = $createCommentNode('editor-comment', [newComment], [user._id]);
          // newCommentNode.append($createTextNode('🖐'));
          // writable.append(newCommentNode);
          // return false;
        }

        // check if reassigned for this node
        if (type === COMMENT_TYPES.REASSIGNED) {
          // check if parent is lock or black-out
          if ($isLockNode(node.getParent()) || $isBlackoutNode(node.getParent())) {
            if (anchorNode?.getParent() !== focusNode?.getParent() || _node.getParent() !== focusNode?.getParent()) {
              return false;
            }
          }
          const writable = node
            .getParents()
            .reverse()
            .find((_parent) => $isCommentNode(_parent))
            .getWritable();
          const newCommentNode = $createCommentNode('editor-comment', [newComment, ...writable.getComments()], [user._id]);
          const children = writable.getChildren();
          for (let i = 0; i < children.length; i += 1) newCommentNode.append(children[i]);
          writable.replace(newCommentNode);
          setTimeout(() => {
            submitComment(newComment);
          });
          return false;
        }

        if ($isCommentNode(node)) {
          const writable = node.getWritable();
          const newCommentNode = $createCommentNode('editor-comment', [newComment, ...writable.getComments()], [user._id]);
          const children = writable.getChildren();
          for (let i = 0; i < children.length; i += 1) newCommentNode.append(children[i]);
          writable.replace(newCommentNode);
          return false;
        }
        if (node.getParent() && $isCommentNode(node.getParent())) {
          if (nodes.length === 1) {
            const writable = node.getParent().getWritable();
            const prevCommentNode = $createCommentNode('editor-comment', [...writable.getComments()], [...writable.getNewOrUpdated()]);
            const newCommentNode = $createCommentNode('editor-comment', [newComment, ...writable.getComments()], [user._id]);
            const nextCommentNode = $createCommentNode('editor-comment', [...writable.getComments()], [...writable.getNewOrUpdated()]);
            const children = writable.getChildren();
            const selectedIndex = node.getIndexWithinParent();
            for (let i = 0; i < children.length; i += 1) {
              if (i < selectedIndex) {
                prevCommentNode.append(children[i]);
              } else if (i > selectedIndex) {
                nextCommentNode.append(children[i]);
              } else {
                newCommentNode.append(children[i]);
              }
            }
            writable.insertBefore(prevCommentNode);
            prevCommentNode.insertAfter(newCommentNode);
            newCommentNode.insertAfter(nextCommentNode);
            writable.remove();
          }
          // wrapElement = writable;
          return false;
        }

        // check if parent is lock or black-out
        if ($isLockNode(node.getParent()) || $isBlackoutNode(node.getParent())) {
          if (anchorNode?.getParent() !== focusNode?.getParent() || _node.getParent() !== focusNode?.getParent()) {
            return false;
          }
        }

        $wrapNodeInElement(writable, () => {
          setTimeout(() => {
            submitComment(newComment);
          });
          return $createCommentNode('editor-comment', [newComment], [user._id]);
        });
        // } else {
        //   wrapElement.append(writable);
        // }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, submitComment]
  );

  const filterComment = useCallback(
    (payload) => {
      const { filter } = payload;
      const commentNodes = $nodesOfType(CommentNode);
      commentNodes.forEach((node) => {
        const comments = node.getLatest().getComments();
        const writable = node.getWritable();
        if (comments.find((comment) => comment.assignee.includes(filter))) {
          writable.setSuppressed(false);
          return false;
        }
        writable.setSuppressed(true);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor]
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateState();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        // eslint-disable-next-line no-unused-vars
        (_payload, _newEditor) => {
          updateState();
          return false;
        },
        EditorPriority
      ),
      editor.registerCommand(
        ADD_REPLY_COMMAND,
        // eslint-disable-next-line no-unused-vars
        (_payload, _newEditor) => {
          const { activeNode, index, reply } = _payload;
          handleSubmitReply(activeNode, index, reply);
          return false;
        },
        EditorPriority
      ),
      editor.registerCommand(
        FILTER_COMMENT,
        // eslint-disable-next-line no-unused-vars
        (_payload, _newEditor) => {
          filterComment(_payload);
          return false;
        },
        EditorPriority
      ),
      editor.registerCommand(
        TOUCH_COMMENT_COMMAND,
        // eslint-disable-next-line no-unused-vars
        (_payload, _newEditor) => {
          handleTouchComment(_payload);
          return false;
        },
        EditorPriority
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, updateState]);

  useEffect(() => {
    if (!editor.hasNodes([CommentNode])) {
      throw new Error('CommentPlugin: CommentNode not registered on editor');
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SET_COMMENT_COMMAND,
        (payload) => {
          setComment(payload);
          return true;
        },
        EditorPriority
      ),
      editor.registerCommand(
        UPDATE_COMMENT_COMMAND,
        (payload) => {
          const { activeNode, index, comment, status } = payload;
          updateComment(activeNode, index, comment, status);
          return true;
        },
        EditorPriority
      ),
      editor.registerCommand(
        REMOVE_COMMENT,
        (payload) => {
          const { comment } = payload;
          removeComment(comment);
          return true;
        },
        EditorPriority
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const handleCancelReply = useCallback(() => {
    setDialogOpen(false);
    floatTimeOut = setTimeout(() => {
      setIsOnFab(false);
    }, 1000);
  }, []);

  const handleReplyKeyDown = useCallback(
    (e) => {
      let _reply = replyRef.current.value;
      if (e.key === 'Enter' && trim(_reply)) {
        e.preventDefault();
        editor.dispatchCommand(ADD_REPLY_COMMAND, { activeNode, index: activeCommentIndex, reply: replyRef.current.value });
      }
      return false;
    },
    [activeCommentIndex, activeNode, editor]
  );

  const handleSetStatusComment = useCallback(
    (comment, status) => editor.dispatchCommand(UPDATE_COMMENT_COMMAND, { activeNode, index: activeCommentIndex, comment, status }),
    [activeCommentIndex, activeNode, editor]
  );

  const handleRemoveComment = useCallback(
    (comment) => {
      editor.dispatchCommand(REMOVE_COMMENT, { comment });
    },
    [editor]
  );

  return (
    <>
      {createPortal(
        <>
          <Box
            sx={{ top: activeRect?.top + 10, left: activeRect?.left - 1 }}
            zIndex={`10001`}
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
            {/* LookHERE */}
            {comments
              .filter((comment) => !suppressedComments?.includes(comment.uniqueId))
              .map((_comment, _index) => (
                <Paper
                  key={`comment-list-${_index}`}
                  sx={{
                    position: 'absolute',
                    left: `${25 * _index}px`,
                    top: `-${35 * _index}px`,
                    zIndex: activeCommentIndex === _index ? '10001' : comments.length - _index,
                    filter: activeCommentIndex !== _index ? 'brightness(0.75)' : '',
                    padding: '0px 10px 15px 10px',
                    width: '200px',
                    height: `300px`,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setActiveCommentIndex(_index);
                  }}
                  onMouseLeave={() => {
                    // setReplyShow({});
                    floatTimeOut = setTimeout(() => {
                      if (!isDialogOpen) {
                        setIsOnFab(false);
                      }
                    }, 600);
                  }}
                  onMouseMove={() => {
                    clearTimeout(floatTimeOut);
                    setIsOnFab(true);
                  }}
                >
                  <Grid container flexDirection={`column`} wrap={'wrap'}>
                    <Grid justifyContent="left" item xs zeroMinWidth>
                      <Grid
                        display={`flex`}
                        flexDirection={`row`}
                        justifyContent="space-between"
                        item
                        xs
                        zeroMinWidth
                        position={`sticky`}
                        paddingTop={`10px`}
                        top={`0`}
                        sx={{ backdropFilter: 'blur(5px)' }}
                      >
                        <h3
                          style={{
                            display: 'inline-block',
                            margin: 0,
                            textAlign: 'left',
                            color: '#ff4d4f',
                            height: '75px',
                            borderBottom: '1px solid #fafafb'
                          }}
                        >
                          To: {[...users, ACTION_REQUEST_USER].find((user) => user._id === _comment.assignee)?.name}, Action:{' '}
                          {_comment.task}
                        </h3>
                        <IconButton
                          onClick={() => {
                            setReplyShow((prev) => ({ ...prev, [_index]: !prev[_index] }));
                          }}
                          disabled={activeCommentIndex !== _index || !_comment['replies']?.length}
                        >
                          <Badge badgeContent={_comment['replies']?.length ?? 0} color="error">
                            <MailFilled width={`30px`} color={'action'} />
                          </Badge>
                        </IconButton>
                      </Grid>
                      <Box sx={{ maxHeight: `170px`, overflowY: `auto` }}>
                        <p
                          style={{
                            textAlign: 'left',
                            margin: `0px 0px`,
                            fontSize: '1.1rem',
                            wordWrap: 'break-word'
                          }}
                        >
                          {_comment.comment}
                        </p>
                        <p style={{ textAlign: 'left', color: 'gray', fontSize: '0.7rem' }}>
                          <strong>
                            {_comment.type === COMMENT_TYPES.ASSIGNED ? `From` : `Reassigned by`} {_comment.commentor.name}
                          </strong>{' '}
                          {new Date(_comment.date).toLocaleString()}
                        </p>
                      </Box>
                    </Grid>
                    <Grid justifyContent="start" item>
                      {/* <IconButton
                        variant={'outlined'}
                        sx={{ paddingX: '0' }}
                        size={'small'}
                        disabled={activeCommentIndex !== _index}
                        onClick={() => {
                          setSuppressedComments([...not(suppressedComments, [...comments.map((value) => value.uniqueId)])]);
                        }}
                      >
                        <RemoveRedEye />
                      </IconButton> */}
                    </Grid>
                    <Grid justifyContent="start" item>
                      <Tooltip title="Don't show this comment when click text">
                        <IconButton
                          variant={'outlined'}
                          sx={{
                            paddingX: '0',
                            position: 'absolute',
                            bottom: '20px',
                            left: '20px',
                            transform: 'translate(-50%, 10px)'
                          }}
                          size={'medium'}
                          onClick={() => {
                            const suppressedUniqueIds = comments.slice(_index).map((value) => value.uniqueId);
                            setSuppressedComments([...not(suppressedComments, suppressedUniqueIds), ...suppressedUniqueIds]);
                          }}
                        >
                          <HideSourceRounded />
                        </IconButton>
                      </Tooltip>
                      <ReassignButton users={users} me={me} />
                      <Tooltip title="Reply">
                        <IconButton
                          variant={'outlined'}
                          sx={{
                            paddingX: '0',
                            position: 'absolute',
                            bottom: '20px',
                            right: '60px',
                            transform: 'translate(-50%, 10px)'
                          }}
                          size={'medium'}
                          onClick={() => {
                            setDialogOpen(true);
                          }}
                        >
                          <ReplyIcon color="success" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={
                          user === _comment.commentor._id
                            ? _comment.status === 'completed'
                              ? 'Completed'
                              : _comment.status === 'review'
                              ? 'Require Review'
                              : 'Set complete'
                            : user === _comment.assignee
                            ? _comment.status === 'completed'
                              ? 'Completed'
                              : _comment.status === 'review'
                              ? 'Cancel Review'
                              : 'Set review'
                            : "Can't touch this"
                        }
                      >
                        <IconButton
                          variant={'outlined'}
                          sx={{
                            paddingX: '0',
                            position: 'absolute',
                            bottom: '20px',
                            right: '25px',
                            transform: 'translate(-50%, 10px)'
                          }}
                          size={'medium'}
                          onClick={() => {
                            return user === _comment.commentor._id
                              ? _comment.status === 'completed'
                                ? 'Completed'
                                : handleSetStatusComment(_comment, 'complete')
                              : user === _comment.assignee
                              ? _comment.status === 'completed'
                                ? 'Completed'
                                : _comment.status === 'review'
                                ? handleSetStatusComment(_comment, 'assign')
                                : handleSetStatusComment(_comment, 'review')
                              : "Can't touch this";
                          }}
                        >
                          <DoneIcon
                            color={
                              user === _comment.commentor._id
                                ? _comment.status === 'completed'
                                  ? 'success'
                                  : _comment.status === 'review'
                                  ? 'info'
                                  : 'warning'
                                : user === _comment.assignee
                                ? _comment.status === 'completed'
                                  ? 'success'
                                  : _comment.status === 'review'
                                  ? 'info'
                                  : 'warning'
                                : 'secondary'
                            }
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user === _comment.commentor._id ? 'Remove this comment' : "Can't touch this"}>
                        <IconButton
                          variant={'outlined'}
                          sx={{
                            paddingX: '0',
                            position: 'absolute',
                            bottom: '20px',
                            right: '-10px',
                            transform: 'translate(-50%, 10px)'
                          }}
                          size={'medium'}
                          onClick={() => {
                            if (user === _comment.commentor._id) handleRemoveComment(_comment);
                          }}
                        >
                          <ClearIcon color={user === _comment.commentor._id ? 'error' : 'secondary'} />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                  {replyShow[_index] && (
                    <ClickAwayListener
                      onClickAway={() => {
                        setReplyShow((prev) => ({ ...prev, [_index]: false }));
                      }}
                    >
                      <div>
                        {_comment['replies'].map((_reply, _replyIndex) => (
                          <Card
                            className={'reply-card'}
                            key={`reply-${_replyIndex}`}
                            sx={{
                              position: 'absolute',
                              width: 150,
                              height: 200,
                              top: '45px',
                              left: `${100 - (150 + (_comment['replies'].length - 1) * 75) / 2 + 75 * _replyIndex}px`,
                              zIndex: activeReplyIndex === _replyIndex ? '10002' : _comment['replies'].length - _replyIndex,
                              filter: activeReplyIndex !== _replyIndex ? 'brightness(0.75)' : '',
                              wordWrap: 'break-word',
                              overflowY: 'auto'
                            }}
                            onClick={() => {
                              setActiveReplyIndex(_replyIndex);
                            }}
                          >
                            <CardContent>
                              <Box>
                                <Typography variant="h5" component="div">
                                  {_reply['content']}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1.5 }} color="text.secondary">
                                  <strong>From {isBlackedOut ? 'XXX' : users.find((user) => user._id === _reply['replier'])?.name}</strong>{' '}
                                  {new Date(_reply['date']).toLocaleString()}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ClickAwayListener>
                  )}
                </Paper>
              ))}
          </Box>
        </>,
        document.body
      )}
      <Dialog
        open={isDialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        sx={{ zIndex: 10002 }}
      >
        <DialogTitle>Reply</DialogTitle>
        <DialogContent>
          <TextField
            id="outlined-multiline-static"
            label="Write here..."
            multiline
            rows={4}
            defaultValue=""
            inputRef={replyRef}
            margin={`dense`}
            onKeyDown={(e) => handleReplyKeyDown(e)}
            focused={isDialogOpen}
          />
        </DialogContent>
        <DialogActions>
          <Button size="small" color="error" onClick={handleCancelReply}>
            Cancel
          </Button>
          <Button
            size="small"
            onClick={() => {
              editor.dispatchCommand(ADD_REPLY_COMMAND, { activeNode, index: activeCommentIndex, reply: replyRef.current.value });
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

CommentPlugin.propTypes = {
  user: PropTypes.string,
  uniqueId: PropTypes.any
};

function getSelectedNode(selection) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
  }
}
