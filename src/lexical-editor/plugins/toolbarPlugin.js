import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SELECTION_CHANGE_COMMAND, FORMAT_TEXT_COMMAND, $getSelection, $isRangeSelection } from 'lexical';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $isAtNodeEnd } from '@lexical/selection';
import { mergeRegister } from '@lexical/utils';
import { BoldOutlined, ItalicOutlined, StrikethroughOutlined, UnderlineOutlined } from '@ant-design/icons';
import { IconButton } from '@mui/material';
import { CodeOutlined, LinkOutlined } from '@mui/icons-material';
import UserFilter from 'lexical-editor/components/userFilter';
import ToolbarLock from 'lexical-editor/components/ToolbarLock';
import PropTypes from 'prop-types';
import ToolbarBlackout from 'lexical-editor/components/ToolbarBlackout';
import ToolbarJump from 'lexical-editor/components/ToolbarJump';

export function getSelectedNode(selection) {
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

const LowPriority = 1;

export default function ToolbarPlugin({ user, users, allUsers }) {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        // eslint-disable-next-line no-unused-vars
        (_payload, newEditor) => {
          updateToolbar();
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  return (
    <div className="toolbar" ref={toolbarRef}>
      <UserFilter users={users} editor={editor} />
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
        {/* {isLink && createPortal(<FloatingLinkEditor editor={editor} />, document.body)} */}
      </>
      <ToolbarLock users={allUsers} user={user} editor={editor} />
      <ToolbarBlackout users={allUsers} user={user} editor={editor} />
      <ToolbarJump editor={editor} />
    </div>
  );
}

ToolbarPlugin.propTypes = {
  user: PropTypes.string,
  users: PropTypes.array,
  allUsers: PropTypes.array
};

export const getUserIds = (userData) => {
  return userData.map((user) => user._id);
};
