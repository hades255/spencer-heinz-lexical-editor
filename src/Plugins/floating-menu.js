/* eslint-disable prettier/prettier */
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { $isLinkNode } from '@lexical/link';
import { COMMAND_PRIORITY_LOW, $getPreviousSelection, $getSelection, $setSelection, createCommand, UNDO_COMMAND } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// import { IconButton } from "./icon-buttons/icon-button";

import { $isRangeSelected } from './utils/$isRangeSelected';
import { useUserInteractions } from './hooks/useUserInteractions';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import LongMenu from './components/dropdown';
import { inRange, isEmpty, isFunction, isUndefined, trim } from 'lodash';
import { $isMentionNode } from './components/mention-node';
import { $isUserTextNode } from './components/user-text-node';
import { mergeRegister } from '@lexical/utils';
import { v4 as uuidv4 } from 'uuid';
import { BlackOutNode } from './components/black-out-node';

// import { TOGGLE_EDIT_LINK_MENU } from "./EditLink";

const COMMENT_COMMAND = createCommand('COMMENT_COMMAND');

let setPosTimeout = 0;

function FloatingMenu({ show, ...props }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(undefined);
  const [step, setStep] = useState(0);
  const [mousePos, SetMousePos] = useState({ x: undefined, y: undefined, traveL: 0 });
  const [mouseToMenu, setMouseToMenu] = useState(false);
  // const [isMouseInRect, setMouseInReact] = useState(false)
  const [mouseSelecting, setMouseSelecting] = useState(false);

  const nativeSel = window.getSelection();
  const lastPoint = { x: null, y: null, travel: 0 };

  useEffect(() => {
    document.addEventListener('mousemove', (event) => {
      let mousetravel = Math.abs(event.clientY - lastPoint.y);
      SetMousePos({ x: event.clientX, y: event.clientY, travel: mousetravel });
      setMouseToMenu(false);
      lastPoint.x = event.clientX;
      lastPoint.y = event.clientY;
    });
    document.addEventListener('mousedown', (event) => {
      if (!ref.current || !ref.current.contains(event.target)) {
        setMouseSelecting(true);
      }
    });
    document.addEventListener('mouseup', () => {
      setMouseSelecting(false);
    });
  }, []);

  useEffect(() => {
    setStep(0);
    const isCollapsed = nativeSel?.rangeCount === 0 || nativeSel?.isCollapsed;

    if (!show || !ref.current || !nativeSel || isCollapsed) {
      // props.setCarModel('');
      // props.setColor('');
      clearTimeout(setPosTimeout);
      setPos(undefined);
      return;
    }
    const domRange = nativeSel.getRangeAt(0);
    const SelectedRects = domRange.getClientRects();
    var SelectedRectArray = Array.prototype.slice.call(SelectedRects);
    let activeReactY = undefined;
    SelectedRectArray.map((rect) => {
      if (
        (inRange(mousePos.y, rect.top - 10, rect.bottom + 10) && inRange(mousePos.x, rect.left - 10, rect.right + 20)) ||
        props.isDropDownActive
      ) {
        activeReactY = rect.top;
      }

      return false;
    });
    let doc = document.documentElement;
    let left = (window.scrollX || doc.scrollLeft) - (doc.clientLeft || 0);
    let top = (window.scrollY || doc.scrollTop) - (doc.clientTop || 0);
    clearTimeout(setPosTimeout);
    if (isUndefined(pos?.x) || isUndefined(pos?.y)) {
      setPosTimeout = setTimeout(() => {
        setPos({ x: mousePos.x + left - 10, y: activeReactY + top - 20 });
      }, 100);
    } else {
      setPos({ x: mousePos.x + left - 10, y: activeReactY + top - 20 });
    }
  }, [show, nativeSel, nativeSel?.anchorOffset]);

  useEffect(() => {
    const isCollapsed = nativeSel?.rangeCount === 0 || nativeSel?.isCollapsed;

    if (!show || !ref.current || !nativeSel || isCollapsed) {
      clearTimeout(setPosTimeout);
      setPos(undefined);
      return;
    }

    const domRange = nativeSel.getRangeAt(0);
    domRange.cloneContents();
    const SelectedRects = domRange.getClientRects();
    var SelectedRectArray = Array.prototype.slice.call(SelectedRects);

    // check if mouse is in the selection boundary

    let isMouseInRect = false;
    let activeReactY = undefined;
    SelectedRectArray.map((rect) => {
      if (
        (inRange(mousePos.y, rect.top - 10, rect.bottom + 10) && inRange(mousePos.x, rect.left - 10, rect.right + 20)) ||
        props.isDropDownActive
      ) {
        activeReactY = rect.top;
        isMouseInRect = true;
      }

      return false;
    });
    let doc = document.documentElement;
    let left = (window.scrollX || doc.scrollLeft) - (doc.clientLeft || 0);
    let top = (window.scrollY || doc.scrollTop) - (doc.clientTop || 0);

    if (isMouseInRect && (!mouseSelecting || props.isDropDownActive)) {
      if ((mouseToMenu || props.isDropDownActive) && pos?.x && pos?.y) {
        return () => { };
      } else {
        clearTimeout(setPosTimeout);
        if (isUndefined(pos?.x) || isUndefined(pos?.y)) {
          setPosTimeout = setTimeout(() => {
            setPos({ x: mousePos.x + left - 10, y: activeReactY + top - 20 });
          }, 100);
        } else {
          setPos({ x: mousePos.x + left - 10, y: activeReactY + top - 20 });
        }
      }
    } else {
      clearTimeout(setPosTimeout);
      setPos({ x: undefined, y: undefined });
    }
  }, [mousePos.x, mousePos.y, mouseSelecting]);

  const handleMouseMove = () => {
    props.setIsDropDownActive(true);
    return false;
  };

  const handleMouseLeave = () => {
    props.setIsDropDownActive(false);
    return false;
  };

  return (
    <>
      <Box
        ref={ref}
        sx={{ top: pos?.y, left: pos?.x }}
        zIndex={`10001`}
        display={!pos?.x || !pos?.y ? `none` : `flex`}
        position={`absolute`}
        alignItems={`center`}
        justifyContent={`space-between`}
        bgcolor={`white`}
        border={`1px solid black`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <LongMenu
          setIsDropDownActive={props.setIsDropDownActive}
          setStep={setStep}
          step={step}
          index={0}
          isDropDownActive={props.isDropDownActive}
          setCarModel={props.setCarModel}
          carModel={props.carModel}
          setColor={props.setColor}
          color={props.color}
          setDialogOpen={props.setDialogOpen}
          pos={pos}
        />
        {/* <UserFloatMenu setIsDropDownActive={props.setIsDropDownActive} isDropDownActive={props.isDropDownActive} pos={pos} currentUser={props.currentUser} setIsLocked={props.setIsLocked} setSelectedUsers={props.setSelectedUsers} selectedUsers={props.selectedUsers} /> */}
      </Box>
    </>
  );
}

const ANCHOR_ELEMENT = document.body;

export function FloatingMenuPlugin({ currentUser }) {
  const [show, setShow] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isDropDownActive, setIsDropDownActive] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [isMentionNode, setIsMentionNode] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [carModel, setCarModel] = useState('');
  const [color, setColor] = useState('');

  const { isPointerDown, isKeyDown } = useUserInteractions();
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

  const placeComment = useCallback((payload) => {
    const { carModel, color, currentUser } = payload;
    const selection = $getPreviousSelection().clone();
    editor.focus();
    $setSelection(selection);

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
      const newMention = {
        car: carModel,
        color: color,
        comment: commentRef.current.value,
        commentor: currentUser,
        replies: [],
        date: new Date().toISOString()
      };

      const node = _node.getLatest();

      if (anchorNode.is(focusNode) && nodes.length === 1) {
        console.log('single node');
        // check if one whole node is selected
        if (anchorNode.isDirty() && node.getNextSibling()) {
          // check if anchorNode has default comments
          const writable = node.getNextSibling().getLatest().getWritable();
          if (!isEmpty(anchorNode?.getComments())) {
            if (node.getNextSibling() && $isUserTextNode(node.getNextSibling())) {
              writable.setComments(anchorNode.getComments());
            } else {
              // next sibling is not UserTextNode
            }
          }
          writable.setLocked(anchorNode.isLocked());
          writable.setLockedTime(anchorNode.getLockedTime());
          writable.setUsers(anchorNode.getUsers());
          const newUniqueId = uuidv4()
          writable.setUniqueId(newUniqueId);
        }
        if ($isUserTextNode(anchorNode)) {
          const writable = node.getWritable();
          writable.setComments(anchorNode.getComments());
          writable.addComment(newMention);
          writable.setLocked(anchorNode.isLocked());
          writable.setLockedTime(anchorNode.getLockedTime());
          writable.setUsers(anchorNode.getUsers());
          // change this node uniqueid
          const newUniqueId = uuidv4()
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
            writable.addComment(newMention);
            writable.setLocked(firstNode.isLocked());
            writable.setLockedTime(firstNode.getLockedTime());
            writable.setUsers(firstNode.getUsers());
            writable.setUniqueId(firstNode.getUniqueId());
          } else {
            // if first node is not UserTextNode
          }
        } else {
          // if this node is not UserTextNode
        }
      } else if (node.getPreviousSibling()?.is(firstNode)) {
        console.log('first');
        if ($isUserTextNode(firstNode)) {
          if ($isUserTextNode(firstNode)) {
            const writable = node.getWritable();
            writable.setComments(firstNode.getComments());
            writable.addComment(newMention);
            writable.setLocked(firstNode.isLocked());
            writable.setLockedTime(firstNode.getLockedTime());
            writable.setUsers(firstNode.getUsers());
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
            if (!isEmpty(lastNode.getComments())) {
              if (node.getNextSibling() && $isUserTextNode(node.getNextSibling())) {
                writable.setComments(lastNode.getComments());
              } else {
                // next sibling is not UserTextNode
              }
            }
            writable.setLocked(lastNode.isLocked());
            writable.setLockedTime(lastNode.getLockedTime());
            writable.setUsers(lastNode.getUsers());
            writable.setUniqueId(lastNode.getUniqueId());
          }
          const writable = node.getWritable();
          writable.setComments(lastNode.getComments());
          writable.addComment(newMention);
          writable.setLocked(lastNode.isLocked());
          writable.setLockedTime(lastNode.getLockedTime());
          writable.setUsers(lastNode.getUsers());
          const newUniqueId = uuidv4()
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
            writable.addComment(newMention);
            writable.setUniqueId(node.getUniqueId());
            // writable.setLocked(node.isLocked());
            // writable.setLockedTime(node.getLockedTime());
            // writable.setUsers(node.getUsers());
          } else {
            // if first node is not UserTextNode
          }
        } else {
          // if it is natural text node
        }
      }
    });

    commentRef.current.value = '';
    setCarModel('');
    setColor('');
  }, [editor, carModel])

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        COMMENT_COMMAND,
        (payload, newEditor) => {
          placeComment(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  editor.update(() => {
    if (isLocked) {
      setIsLocked(false);
      const selection = $getSelection().clone();
      const _nodes = selection.getNodes();
      // const nodes = selection.getNodes();
      _nodes.forEach((_node) => {
        const node = _node.getLatest();
        if (currentUser === node?.getCreator()) {
          const writable = node.getWritable();
          writable.setLocked(true);
        }
      });
    }
  }, [editor]);

  const handleSubmitComment = () => {
    let comment = commentRef.current.value;
    if (!trim(comment)) {
      setCommentError('Invalid comment!');
      return false;
    }
    setDialogOpen(false);
    editor.dispatchCommand(COMMENT_COMMAND, { carModel, color, currentUser });
  };

  const handleCancelComment = () => {
    console.log('cancelled');
    setDialogOpen(false);
    setCarModel('');
    setColor('');
  };

  const handleCommentKeyDown = (e) => {
    setCommentError('');
    let comment = commentRef.current.value;
    if (e.key === 'Enter' && trim(comment)) {
      e.preventDefault();
      setCommentError('Invalid comment!');
      handleSubmitComment();
    }
  };

  const updateFloatingMenu = useCallback(() => {
    editor.getEditorState().read(() => {
      if (editor.isComposing() || isPointerDown || isKeyDown) return;

      if (editor.getRootElement() !== document.activeElement && !isDropDownActive && (!carModel || !color)) {
        clearTimeout(setPosTimeout);
        setShow(false);
        return;
      }

      const selection = $getSelection();

      if ($isRangeSelected(selection)) {
        const nodes = selection.getNodes();
        setIsBold(selection.hasFormat('bold'));
        setIsCode(selection.hasFormat('code'));
        setIsItalic(selection.hasFormat('italic'));
        setIsUnderline(selection.hasFormat('underline'));
        setIsHighlight(selection.hasFormat('highlight'));
        setIsStrikethrough(selection.hasFormat('strikethrough'));
        setIsLink(nodes.every((node) => $isLinkNode(node.getParent())));
        setIsMentionNode(nodes.every((node) => $isMentionNode(node.getParent())));
        setShow(true);
      } else {
        setShow(false);
      }
    });
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
      <FloatingMenu
        editor={editor}
        show={show}
        isBold={isBold}
        isCode={isCode}
        isLink={isLink}
        isItalic={isItalic}
        isStrikethrough={isStrikethrough}
        isUnderline={isUnderline}
        isHighlight={isHighlight}
        setIsDropDownActive={setIsDropDownActive}
        isDropDownActive={isDropDownActive}
        carModel={carModel}
        setCarModel={setCarModel}
        color={color}
        setColor={setColor}
        setDialogOpen={setDialogOpen}
        currentUser={currentUser}
        setIsLocked={setIsLocked}
      />
      {
        <Dialog
          open={isDialogOpen}
          onClose={() => {
            setDialogOpen(false);
          }}
          sx={{ zIndex: 10002 }}
        >
          <DialogTitle>
            Comment
            <Typography variant="body1">
              Car: {carModel}, Color: {color}
            </Typography>
          </DialogTitle>
          <DialogContent>
            {!!commentError && <Alert severity="error">{commentError}</Alert>}
            <TextField
              id="outlined-multiline-static"
              label="Write here..."
              multiline
              rows={4}
              defaultValue=""
              inputRef={commentRef}
              margin={`dense`}
              onKeyDown={(e) => handleCommentKeyDown(e)}
              focused={isDialogOpen}
            />
          </DialogContent>
          <DialogActions>
            <Button size="small" color="error" onClick={handleCancelComment}>
              Cancel
            </Button>
            <Button size="small" onClick={handleSubmitComment} disabled={!commentRef?.current?.value}>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      }
    </>,
    ANCHOR_ELEMENT
  );
}
