import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SELECTION_CHANGE_COMMAND, FORMAT_TEXT_COMMAND, $getSelection, $isRangeSelection, createCommand } from 'lexical';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $wrapNodeInElement } from '@lexical/utils';
import { $isAtNodeEnd } from '@lexical/selection';
import { mergeRegister } from '@lexical/utils';
import { createPortal } from 'react-dom';
import {
  // $createCodeNode,
  $isCodeNode,
  getDefaultCodeLanguage
} from '@lexical/code';
import {
  BoldOutlined,
  CarOutlined,
  EyeFilled,
  EyeInvisibleFilled,
  FileTextOutlined,
  ItalicOutlined,
  LockFilled,
  StrikethroughOutlined,
  UnderlineOutlined
} from '@ant-design/icons';
import { Button, ClickAwayListener, Grow, IconButton, MenuItem, MenuList, Paper, Popper } from '@mui/material';
import { CodeOutlined, HideSourceOutlined, LinkOutlined, LockOpenOutlined } from '@mui/icons-material';
import { CAR_OPTIONS, USER_OPTIONS } from './constants';
import { isEmpty } from 'lodash';
import { intersection, not } from './components/lock-user-selection';
import LockUserDialog from './components/lock-user-dialog';
import { $isUserTextNode } from './components/user-text-node';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { $createBlackoutNode, $isBlackoutNode } from './components/black-out-node';
import BlackUserDialog from './components/black-user-dialog';

const LowPriority = 1;
export const BLACKOUT_COMMAND = createCommand('BLACKOUT_COMMAND');
export const UNBLACKOUT_COMMAND = createCommand('UNBLACKOUT_COMMAND');

function positionEditorElement(editor, rect) {
  if (rect === null) {
    editor.style.opacity = '0';
    editor.style.top = '-1000px';
    editor.style.left = '-1000px';
  } else {
    editor.style.opacity = '1';
    editor.style.top = `${rect.top + rect.height + window.pageYOffset + 10}px`;
    editor.style.left = `${rect.left + window.pageXOffset - editor.offsetWidth / 2 + rect.width / 2}px`;
  }
}

function FloatingLinkEditor({ editor }) {
  const editorRef = useRef(null);
  const inputRef = useRef(null);
  const mouseDownRef = useRef(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isEditMode, setEditMode] = useState(false);
  const [lastSelection, setLastSelection] = useState(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl('');
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (selection !== null && !nativeSelection.isCollapsed && rootElement !== null && rootElement.contains(nativeSelection.anchorNode)) {
      const domRange = nativeSelection.getRangeAt(0);
      let rect;
      if (nativeSelection.anchorNode === rootElement) {
        let inner = rootElement;
        while (inner.firstElementChild != null) {
          inner = inner.firstElementChild;
        }
        rect = inner.getBoundingClientRect();
      } else {
        rect = domRange.getBoundingClientRect();
      }

      if (!mouseDownRef.current) {
        positionEditorElement(editorElem, rect);
      }
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== 'link-input') {
      positionEditorElement(editorElem, null);
      setLastSelection(null);
      setEditMode(false);
      setLinkUrl('');
    }

    return true;
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        LowPriority
      )
    );
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  return (
    <div ref={editorRef} className="link-editor">
      {isEditMode ? (
        <input
          ref={inputRef}
          className="link-input"
          value={linkUrl}
          onChange={(event) => {
            setLinkUrl(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              if (lastSelection !== null) {
                if (linkUrl !== '') {
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
                }
                setEditMode(false);
              }
            } else if (event.key === 'Escape') {
              event.preventDefault();
              setEditMode(false);
            }
          }}
        />
      ) : (
        <>
          <div className="link-input">
            <a href={linkUrl} target="_blank" rel="noopener noreferrer">
              {linkUrl}
            </a>
            <div
              className="link-edit"
              role="button"
              tabIndex={0}
              onMouseDown={(event) => event.preventDefault()}
              onKeyDown={() => { }}
              onClick={() => {
                setEditMode(true);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

function Select({ onChange, className, options, value }) {
  return (
    <select className={className} onChange={onChange} value={value}>
      <option hidden={true} value="" />
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

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

export default function ToolbarPlugin({ carModel, setCarModel, currentUser, isLockedShow, setIsLockedShow }) {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [selectedElementKey, setSelectedElementKey] = useState(null);
  const [showCarOptionsDropDown, setShowCarOptionsDropDown] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('');
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const [isLocked, setIsLocked] = useState(false);
  const [lockedUsers, setLockedUsers] = useState([]);
  const [unlockedUsers, setUnlockedUsers] = useState([]);
  const [isLockingUser, setIsLockingUser] = useState(false);
  const [parentUnlockedUsers, setParentUnlockedUsers] = useState([]);

  const [isBlacked, setIsBlacked] = useState(false);
  const [blackedUsers, setBlackedUsers] = useState([]);
  const [unblackedUsers, setUnblackedUsers] = useState([]);
  const [isBlacking, setIsBlacking] = useState(false);
  const [parentUnblackedUsers, setparentUnblackedUsers] = useState([]);

  useEffect(() => {
    setLockedUsers(USER_OPTIONS);
    setBlackedUsers(USER_OPTIONS);
  }, []);

  const anchorRef = useRef(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isCodeNode(element)) {
          setCodeLanguage(element.getLanguage() || getDefaultCodeLanguage());
        }
      }
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
      // update locked nodes if selected
      if ($isUserTextNode(node)) {
        node.isLocked() ? setIsLocked(true) : setIsLocked(false);
        const _unlockedUsers = node.getUsers();
        const _lockedUsers = USER_OPTIONS.filter((value) => _unlockedUsers.indexOf(value) === -1);
        setLockedUsers(_lockedUsers);
        setUnlockedUsers(not(USER_OPTIONS, _lockedUsers));

        //  check if both prev and next nodes are locked
        if ($isUserTextNode(node.getPreviousSibling()) && $isUserTextNode(node.getNextSibling())) {
          if (node.getPreviousSibling().isLocked() && node.getNextSibling().isLocked()) {
            // get intersection part of users and prevent from locking.
            setParentUnlockedUsers(intersection(node.getPreviousSibling().getUsers(), node.getNextSibling().getUsers()));
          } else {
            setParentUnlockedUsers([]);
          }
        }

        if (node.getParent() && $isBlackoutNode(node.getParent())) {
          setIsBlacked(true);
          const _unblackedUsers = node.getParent().getUsers();
          const _blackedUsers = USER_OPTIONS.filter((value) => _unblackedUsers.indexOf(value) === -1);
          setBlackedUsers(_blackedUsers);
          setUnblackedUsers(not(USER_OPTIONS, _blackedUsers));
        } else {
          setIsBlacked(false);
          setBlackedUsers(USER_OPTIONS);
          setUnblackedUsers([]);
        }
      }
    }
  }, [editor]);

  const blackout = useCallback(
    (payload) => {
      const { unblackedUsers, currentUser } = payload;
      const selection = $getSelection();
      const anchorNode = selection.anchor.getNode();
      const focusNode = selection.focus.getNode();
      let firstNode = anchorNode;
      let lastNode = focusNode;

      const nodes = selection.extract();
      const isBackward = selection.isBackward();
      if (isBackward) {
        firstNode = focusNode;
        lastNode = anchorNode;
      }

      let wrapElement = null;

      nodes.forEach((_node) => {
        const node = _node.getLatest();

        if (anchorNode.is(focusNode) && nodes.length === 1) {
          console.log('single node');
          // check if one whole node is selected
          if (anchorNode.isDirty() && node.getNextSibling()) {
            // check if anchorNode has default comments
            const writable = node.getNextSibling()?.getLatest().getWritable();

            if (!isEmpty(anchorNode.getComments())) {
              if (node.getNextSibling() && $isUserTextNode(node.getNextSibling())) {
                writable.setComments(anchorNode.getComments());
              } else {
                // next sibling is not UserTextNode
              }
            }
            writable.setFilterType(anchorNode.getFilterType());
            writable.setLocked(anchorNode.isLocked());
            writable.setLockedTime(anchorNode.getLockedTime());
            writable.setUsers(anchorNode.getUsers());
            const newUniqueId = uuidv4();
            writable.setUniqueId(newUniqueId);
          }
          if ($isUserTextNode(anchorNode)) {
            const writable = node.getWritable();
            writable.setComments(anchorNode.getComments());
            writable.setLocked(anchorNode.isLocked());
            writable.setLockedTime(anchorNode.getLockedTime());
            writable.setUsers(anchorNode.getUsers());
            const newUniqueId = uuidv4();
            writable.setUniqueId(newUniqueId);

            // check if anchorNode is locked
            if (anchorNode.isLocked()) {
              return false;
            }
            // check if already blackedout by someone
            if (anchorNode.getParent() && $isBlackoutNode(anchorNode.getParent())) {
              // check if current user is blocked, then users = original users
              const writable = anchorNode.getParent().getLatest().getWritable();
              if (anchorNode.getParent().getUsers().indexOf(currentUser) > -1) {
                writable.setUsers([...not(unblackedUsers, [currentUser]), currentUser]);
              } else {
                writable.setUsers(anchorNode.getParent().getUsers());
              }
              return false;
            }
            $wrapNodeInElement(writable, () => {
              return $createBlackoutNode('black-out', [...not(unblackedUsers, [currentUser]), currentUser]);
            });
          } else {
            // if this node is not UserTextNode
          }

          return false;
        }
        if (node.is(firstNode)) {
          console.log('first node');
          if ($isUserTextNode(node)) {
            if ($isUserTextNode(firstNode)) {
              const writable = node.getWritable();
              writable.setComments(firstNode.getComments());
              writable.setLocked(firstNode.isLocked());
              writable.setLockedTime(firstNode.getLockedTime());
              writable.setUsers(firstNode.getUsers());
              writable.setUniqueId(firstNode.getUniqueId());

              // check if already blackedout by someone
              if (firstNode.getParent() && $isBlackoutNode(firstNode.getParent())) {
                // check if current user is blocked, then users = original users
                const writable = firstNode.getParent().getLatest().getWritable();
                if (firstNode.getParent().getUsers().indexOf(currentUser) > -1) {
                  writable.setUsers([...not(unblackedUsers, [currentUser]), currentUser]);
                } else {
                  writable.setUsers(firstNode.getParent().getUsers());
                }
                wrapElement = writable;
                return false;
              }
              wrapElement = $wrapNodeInElement(writable, () => {
                return $createBlackoutNode('black-out', [...not(unblackedUsers, [currentUser]), currentUser]);
              });
            } else {
              // if first node is not UserTextNode
            }
          } else {
            // if this node is not UserTextNode
          }
        } else if (node.getPreviousSibling()?.is(firstNode)) {
          console.log('first');
          if ($isUserTextNode(firstNode)) {
            if ($isUserTextNode(node)) {
              const writable = node.getWritable();
              writable.setComments(firstNode.getComments());
              writable.setLocked(firstNode.isLocked());
              writable.setLockedTime(firstNode.getLockedTime());
              writable.setUsers(firstNode.getUsers());
              const newUniqueId = uuidv4();
              writable.setUniqueId(newUniqueId);

              // check if already blackedout by someone
              if (firstNode.getParent() && $isBlackoutNode(firstNode.getParent())) {
                // check if current user is blocked, then users = original users
                const writable = firstNode.getParent().getLatest().getWritable();
                if (firstNode.getParent().getUsers().indexOf(currentUser) > -1) {
                  writable.setUsers([...not(unblackedUsers, [currentUser]), currentUser]);
                } else {
                  writable.setUsers(firstNode.getParent().getUsers());
                }
                wrapElement = writable;
                return false;
              }
              wrapElement = $wrapNodeInElement(writable, () => {
                return $createBlackoutNode('black-out', [...not(unblackedUsers, [currentUser]), currentUser]);
              });
            } else {
              // if first node is not UserTextNode
            }
          } else {
            // if this node is not mention or userText
          }
        } else if (node.is(lastNode)) {
          console.log('last');
          if ($isUserTextNode(lastNode)) {
            // check if last whole node is selected
            if (focusNode.isDirty() && node.getNextSibling()) {
              // check if anchorNode has default comments
              const writable = node.getNextSibling().getLatest().getWritable();
              if (lastNode.isLocked()) {
                if (node.getNextSibling() && $isUserTextNode(node.getNextSibling())) {
                  writable.setLocked(true);
                  writable.setLockedTime(lastNode.getLockedTime());
                  writable.setUsers(lastNode.getUsers());
                } else {
                  // next sibling is not UserTextNode
                }
              }
              if (!isEmpty(lastNode.getComments())) {
                if (node.getNextSibling() && $isUserTextNode(node.getNextSibling())) {
                  writable.setComments(lastNode.getComments());
                } else {
                  // next sibling is not UserTextNode
                }
              }
              const newUniqueId = uuidv4();
              writable.setFilterType(anchorNode.getFilterType());
              writable.setUniqueId(newUniqueId);
            }
            const writable = node.getWritable();
            writable.setComments(lastNode.getComments());
            writable.setLocked(lastNode.isLocked());
            writable.setLockedTime(lastNode.getLockedTime());
            writable.setUsers(lastNode.getUsers());
            writable.setUniqueId(lastNode.getUniqueId());

            if (lastNode.getParent() && $isBlackoutNode(lastNode.getParent())) {
              // check if current user is blocked, then users = original users
              const writable = lastNode.getParent().getLatest().getWritable();
              if (lastNode.getParent().getUsers().indexOf(currentUser) > -1) {
                writable.setUsers([...not(unblackedUsers, [currentUser]), currentUser]);
              } else {
                writable.setUsers(lastNode.getParent().getUsers());
              }
              return false;
            }
            wrapElement.append(writable);
          } else {
            // if first node is not UserTextNode
          }
        } else {
          console.log('middle');
          if ($isUserTextNode(node)) {
            if ($isUserTextNode(node)) {
              const writable = node.getWritable();
              writable.setComments(node.getComments());
              writable.setUsers(node.getUsers());
              if (node.getParent() && $isBlackoutNode(node.getParent())) {
                // check if current user is blocked, then users = original users
                const writable = node.getParent().getLatest().getWritable();
                if (node.getParent().getUsers().indexOf(currentUser) > -1) {
                  writable.setUsers([...not(unblackedUsers, [currentUser]), currentUser]);
                  // wrapElement = writable;
                  wrapElement.append(node);
                } else {
                  writable.setUsers(node.getParent().getUsers());
                }
                return false;
              }
              wrapElement.append(writable);
            } else {
              // if first node is not UserTextNode
            }
          } else {
            // if it is natural text node
          }
        }
      });
      console.log('wrapElement', wrapElement, unblackedUsers);
    },
    [editor, unblackedUsers, blackedUsers]
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar();
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        BLACKOUT_COMMAND,
        (payload, newEditor) => {
          blackout(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor]);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setShowCarOptionsDropDown(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setShowCarOptionsDropDown(false);
    } else if (event.key === 'Escape') {
      setShowCarOptionsDropDown(false);
    }
  }

  /**
   *
   * @param {MouseEvent} e
   * @param {String} _model
   * @description set car model after car menu click
   */
  const handleCarClick = (e, _model) => {
    setCarModel(_model);
    handleClose(e);
  };

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const unlockNode = () => {
    editor.update(() => {
      const selection = $getSelection();
      const anchorNode = selection.anchor.getNode();
      const focusNode = selection.focus.getNode();
      // check if user selected one node or user cursor pointed node
      if (anchorNode.is(focusNode) && selection.getNodes()?.length === 1) {
        // check if current user is locked for this block edit
        if (unlockedUsers.indexOf(currentUser) === -1) {
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
        const writable = anchorNode.getLatest().getWritable();
        writable.setLocked(false);
        writable.setUsers([]);
      }
    }, [editor, isLocked]);
  };

  const blackoutNode = () => {
    editor.dispatchCommand(BLACKOUT_COMMAND, { unblackedUsers, currentUser });
    setBlackedUsers(USER_OPTIONS);
    setUnblackedUsers([]);
  };
  /**
   *
   * @description lock selected nodes
   * @Todo check and reinforce properties should be preserved
   */
  const lockNode = () => {
    editor.update(() => {
      const selection = $getSelection();
      const anchorNode = selection.anchor.getNode();
      const focusNode = selection.focus.getNode();
      let firstNode = anchorNode;
      let lastNode = focusNode;

      const nodes = selection.extract();
      const isBackward = selection.isBackward();
      if (isBackward) {
        firstNode = focusNode;
        lastNode = anchorNode;
      }

      nodes.forEach((_node) => {
        const node = _node.getLatest();

        if (anchorNode.is(focusNode) && nodes.length === 1) {
          console.log('single node');
          // check if one whole node is selected
          if (anchorNode.isDirty() && node.getNextSibling()) {
            // check if anchorNode has default comments
            const writable = node.getNextSibling()?.getLatest().getWritable();

            // if anchorNode is locked
            if (anchorNode.isLocked()) {
              if (node.getNextSibling() && $isUserTextNode(node.getNextSibling())) {
                writable.setLocked(true);
                writable.setLockedTime(anchorNode.getLockedTime());
              } else {
                // next sibling is not UserTextNode
              }
            }
            if (!isEmpty(anchorNode.getComments())) {
              if (node.getNextSibling() && $isUserTextNode(node.getNextSibling())) {
                writable.setComments(anchorNode.getComments());
              } else {
                // next sibling is not UserTextNode
              }
            }
            writable.setUsers(anchorNode.getUsers());
            writable.setFilterType(anchorNode.getFilterType());
            const newUniqueId = uuidv4();
            writable.setUniqueId(newUniqueId);
          }
          if ($isUserTextNode(anchorNode)) {
            const writable = node.getWritable();
            writable.setComments(anchorNode.getComments());
            writable.setLocked(true);
            /**
             * check if anchorNode is already locked by someone
             */
            if (anchorNode.isLocked()) {
              // check if current user is locked, then users = original users
              if (anchorNode.getUsers().indexOf(currentUser) > -1) {
                writable.setUsers(unlockedUsers);
              } else {
                writable.setUsers(anchorNode.getUsers());
              }
            } else {
              writable.setUsers(not(unlockedUsers, currentUser));
              writable.addUser(currentUser);
            }
            const newUniqueId = uuidv4();
            writable.setUniqueId(newUniqueId);
          } else {
            // if this node is not UserTextNode
          }

          return false;
        }
        if (node.is(firstNode)) {
          console.log('first node');
          if ($isUserTextNode(node)) {
            if ($isUserTextNode(firstNode)) {
              const writable = node.getWritable();
              writable.setComments(firstNode.getComments());
              writable.setLocked(true);
              /**
               * check if firstNode is already locked by someone
               */
              if (firstNode.isLocked()) {
                // check if current user is locked, then users = original users
                if (firstNode.getUsers().indexOf(currentUser) > -1) {
                  writable.setUsers(unlockedUsers);
                } else {
                  writable.setUsers(firstNode.getUsers());
                }
              } else {
                writable.setUsers(not(unlockedUsers, currentUser));
                writable.addUser(currentUser);
              }
              writable.setUniqueId(firstNode.getUniqueId());
            } else {
              // if first node is not UserTextNode
            }
          } else {
            // if this node is not UserTextNode
          }
        } else if (node.getPreviousSibling().is(firstNode)) {
          console.log('first');
          if ($isUserTextNode(firstNode)) {
            if ($isUserTextNode(node)) {
              const writable = node.getWritable();
              writable.setComments(firstNode.getComments());
              writable.setLocked(true);
              /**
               * check if firstNode is already locked by someone
               */
              if (firstNode.isLocked()) {
                // check if current user is locked, then users = original users
                if (firstNode.getUsers().indexOf(currentUser) > -1) {
                  writable.setUsers(unlockedUsers);
                } else {
                  writable.setUsers(firstNode.getUsers());
                }
              } else {
                writable.setUsers(not(unlockedUsers, currentUser));
                writable.addUser(currentUser);
              }
              const newUniqueId = uuidv4();
              writable.setUniqueId(newUniqueId);
            } else {
              // if first node is not UserTextNode
            }
          } else {
            // if this node is not mention or userText
          }
        } else if (node.is(lastNode)) {
          console.log('last');
          if ($isUserTextNode(lastNode)) {
            // check if last whole node is selected
            if (focusNode.isDirty() && node.getNextSibling()) {
              // check if anchorNode has default comments
              const writable = node.getNextSibling().getLatest().getWritable();
              if (lastNode.isLocked()) {
                if (node.getNextSibling() && $isUserTextNode(node.getNextSibling())) {
                  writable.setLocked(true);
                  writable.setLockedTime(lastNode.getLockedTime());
                  writable.setUsers(lastNode.getUsers());
                } else {
                  // next sibling is not UserTextNode
                }
              }
              if (!isEmpty(lastNode.getComments())) {
                if (node.getNextSibling() && $isUserTextNode(node.getNextSibling())) {
                  writable.setComments(lastNode.getComments());
                } else {
                  // next sibling is not UserTextNode
                }
              }
              const newUniqueId = uuidv4();
              writable.setUniqueId(newUniqueId);
            }
            const writable = node.getWritable();
            writable.setComments(lastNode.getComments());
            writable.setLocked(true);
            /**
             * check if firstNode is already locked by someone
             */
            if (lastNode.isLocked()) {
              // check if current user is locked, then users = original users
              if (lastNode.getUsers().indexOf(currentUser) > -1) {
                writable.setUsers([...unlockedUsers, ...lastNode.getUsers()]);
              } else {
                writable.setUsers(lastNode.getUsers());
              }
            } else {
              writable.setUsers(not(unlockedUsers, currentUser));
              writable.addUser(currentUser);
            }
            const newUniqueId = uuidv4();
            writable.setUniqueId(newUniqueId);
          } else {
            // if first node is not UserTextNode
          }
        } else {
          console.log('middle');
          if ($isUserTextNode(node)) {
            if ($isUserTextNode(node)) {
              const writable = node.getWritable();
              writable.setComments(node.getComments());
              /**
               * check if firstNode is already locked by someone
               */
              if (node.isLocked()) {
                // check if current user is locked, then users = original users
                if (node.getUsers().indexOf(currentUser) > -1) {
                  writable.setUsers([...unlockedUsers, ...node.getUsers()]);
                } else {
                  writable.setUsers(node.getUsers());
                }
              } else {
                writable.setUsers(not(unlockedUsers, currentUser));
                writable.addUser(currentUser);
              }
              writable.setLocked(true);
            } else {
              // if first node is not UserTextNode
            }
          } else {
            // if it is natural text node
          }
        }
      });
    }, [editor, isLocked]);
    return false;
  };

  const showLockedNodes = () => {
    setIsLockedShow((prev) => !prev);
    return false;
  };
  return (
    <div className="toolbar" ref={toolbarRef}>
      <>
        <Button
          variant="outlined"
          startIcon={<CarOutlined />}
          onClick={() => setShowCarOptionsDropDown(!showCarOptionsDropDown)}
          aria-controls={showCarOptionsDropDown ? 'car-model-menu' : undefined}
          aria-expanded={showCarOptionsDropDown ? 'true' : undefined}
          aria-haspopup="true"
          ref={anchorRef}
        >
          {carModel}
        </Button>
        {showCarOptionsDropDown && (
          <Popper
            open={showCarOptionsDropDown}
            anchorEl={anchorRef.current}
            role={undefined}
            placement="bottom-start"
            transition
            disablePortal
            sx={{ zIndex: 10008 }}
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom'
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList
                      autoFocusItem={showCarOptionsDropDown}
                      id="composition-menu"
                      aria-labelledby="composition-button"
                      onKeyDown={handleListKeyDown}
                    >
                      <MenuItem
                        selected={carModel === 'all'}
                        onClick={(e) => {
                          handleCarClick(e, 'all');
                        }}
                        sx={{ paddingX: '30px' }}
                      >
                        {`All`}
                      </MenuItem>
                      {CAR_OPTIONS.map((_carModel, _index) => (
                        <MenuItem
                          key={`car-menu-${_index}`}
                          selected={carModel === _carModel}
                          onClick={(e) => {
                            handleCarClick(e, _carModel);
                          }}
                          sx={{ paddingX: '30px' }}
                        >
                          {_carModel}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        )}
      </>
      <>
        <IconButton
          size="large"
          icon="bold"
          aria-label="Format text as bold"
          color={isBold ? 'primary' : 'secondary'}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
          }}
        >
          <BoldOutlined />
        </IconButton>
        <IconButton
          size="large"
          icon="italic"
          aria-label="Format text as italic"
          color={isItalic ? 'primary' : 'secondary'}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
          }}
        >
          <ItalicOutlined />
        </IconButton>
        <IconButton
          size="large"
          icon="bold"
          aria-label="Format text as underline"
          color={isUnderline ? 'primary' : 'secondary'}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
          }}
        >
          <UnderlineOutlined />
        </IconButton>
        <IconButton
          size="large"
          icon="bold"
          aria-label="Format text as strikethrough"
          color={isStrikethrough ? 'primary' : 'secondary'}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
          }}
        >
          <StrikethroughOutlined />
        </IconButton>
        <IconButton
          size="large"
          icon="bold"
          aria-label="Format text as code"
          color={isCode ? 'primary' : 'secondary'}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
          }}
        >
          <CodeOutlined />
        </IconButton>
        <IconButton size="large" icon="link" aria-label="Insert Link" onClick={insertLink} color={isCode ? 'primary' : 'secondary'}>
          <LinkOutlined />
        </IconButton>
        {isLink && createPortal(<FloatingLinkEditor editor={editor} />, document.body)}
      </>
      <IconButton
        size="large"
        icon="link"
        aria-label="Lock Node"
        onClick={() => {
          if (!isLocked || unlockedUsers.includes(currentUser)) {
            setIsLockingUser(true);
          } else {
            toast.error('You do not have the authority to change lock permissions for this block of text.');
          }
        }}
        color={isLocked ? 'error' : 'secondary'}
      >
        {isLocked ? <LockFilled /> : <LockOpenOutlined />}
      </IconButton>
      {isLocked && (
        <IconButton
          size="large"
          icon="link"
          aria-label="Lock Node"
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
        aria-label="Blackout Node"
        onClick={() => {
          if (!isLocked || unlockedUsers.includes(currentUser)) {
            setIsBlacking(true);
          }
          return false;
        }}
        color={isBlacked ? 'error' : 'secondary'}
      >
        {isBlacked ? <HideSourceOutlined /> : <FileTextOutlined />}
      </IconButton>
      <IconButton size="large" icon="link" aria-label="Lock Node" onClick={showLockedNodes} color={isLockedShow ? 'primary' : 'secondary'}>
        {isLockedShow ? <EyeFilled /> : <EyeInvisibleFilled />}
      </IconButton>
      <LockUserDialog
        lockedUsers={lockedUsers}
        setLockedUsers={setLockedUsers}
        unlockedUsers={unlockedUsers}
        setUnlockedUsers={setUnlockedUsers}
        setIsLockingUser={setIsLockingUser}
        isLockingUser={isLockingUser}
        parentUnlockedUsers={parentUnlockedUsers}
        lockNode={lockNode}
        currentUser={currentUser}
        isLocked={isLocked}
      />
      <BlackUserDialog
        blackedUsers={blackedUsers}
        setBlackedUsers={setBlackedUsers}
        unblackedUsers={unblackedUsers}
        setUnblackedUsers={setUnblackedUsers}
        setIsBlacking={setIsBlacking}
        isBlacking={isBlacking}
        parentUnblackedUsers={parentUnblackedUsers}
        blackoutNode={blackoutNode}
        currentUser={currentUser}
        isBlacked={isBlacked}
      />
    </div>
  );
}
