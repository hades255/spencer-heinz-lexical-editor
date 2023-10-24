import { $getSelection, $isRangeSelection, SELECTION_CHANGE_COMMAND } from 'lexical';
import { $isJumpNode } from 'lexical-editor/nodes/jumpNode';

const { LinkOutlined } = require('@ant-design/icons');
const { LinkOffOutlined } = require('@mui/icons-material');
const { IconButton, Popper, Grow, Paper, ClickAwayListener, MenuList, MenuItem } = require('@mui/material');
const { useState, useRef, useCallback, useEffect } = require('react');
import { mergeRegister } from '@lexical/utils';
import { JUMP_COMMAND, UNJUMP_COMMAND } from 'lexical-editor/plugins/jumpPlugin';
import { v4 as uuidv4 } from 'uuid';
import { JUMP_LEVELS } from 'Plugins/constants';
import { getSelectedNode } from 'lexical-editor/plugins/toolbarPlugin';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import PropTypes from 'prop-types';

const LowPriority = 1;

const ToolbarJump = ({ editor }) => {
  const [isJumped, setIsJumped] = useState(false);
  const [isJumpingNode, setIsJumpingNode] = useState(false);
  const anchorRef = useRef(null);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setIsJumpingNode(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setIsJumpingNode(false);
    } else if (event.key === 'Escape') {
      setIsJumpingNode(false);
    }
  }
  /**
   *
   * @param {MouseEvent} e
   * @param {String} _model
   * @description set car model after car menu click
   */
  const handleLevelClick = (e, level) => {
    editor.dispatchCommand(JUMP_COMMAND, { uniqueId: uuidv4(), level: level });
    handleClose(e);
  };

  const unJumpNode = () => {
    editor.dispatchCommand(UNJUMP_COMMAND);
  };

  const updateJumpbar = useCallback(() => {
    const selection = $getSelection();
    setIsJumped(false);
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      if ($isJumpNode(node)) {
        setIsJumped(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateJumpbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        // eslint-disable-next-line no-unused-vars
        (_payload, newEditor) => {
          updateJumpbar();
          return false;
        },
        LowPriority
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, updateJumpbar]);

  return (
    <>
      <IconButton
        size="large"
        icon="link"
        aria-label="Jump Node"
        ref={anchorRef}
        onClick={() => {
          if (!isJumped) {
            setIsJumpingNode(true);
          } else {
            dispatch(
              openSnackbar({
                open: true,
                message: `This block of text is already jumped.`,
                variant: 'alert',
                alert: {
                  color: 'error'
                },
                close: false
              })
            );
          }
        }}
        id={`jump-btn`}
        color={isJumped ? 'error' : 'secondary'}
      >
        {!isJumped ? <LinkOutlined /> : <LinkOffOutlined />}
      </IconButton>
      {isJumpingNode && (
        <Popper
          open={isJumpingNode}
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
                    autoFocusItem={isJumpingNode}
                    id="level-menu"
                    aria-labelledby="composition-button"
                    onKeyDown={handleListKeyDown}
                  >
                    {Object.entries(JUMP_LEVELS).map(([key, value], _index) => (
                      <MenuItem
                        key={`level-menu-${_index}`}
                        onClick={(e) => {
                          handleLevelClick(e, value);
                        }}
                        sx={{ paddingX: '30px' }}
                      >
                        {key}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      )}
      {isJumped && (
        <IconButton
          size="large"
          icon="link"
          aria-label="Jump Node"
          onClick={() => {
            unJumpNode();
          }}
          color={'primary'}
        >
          <LinkOffOutlined />
        </IconButton>
      )}
    </>
  );
};

ToolbarJump.propTypes = {
  editor: PropTypes.object
};

export default ToolbarJump;
