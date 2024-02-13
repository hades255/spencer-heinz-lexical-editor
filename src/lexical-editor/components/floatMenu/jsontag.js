import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { JSON_TAG_COMMAND } from 'lexical-editor/plugins/jsontagPlugin';
import TagIcon from '@mui/icons-material/Tag';
import { isFunction } from 'lodash';

export default function JsontagDropdown({ setIsDropDownActive, isDropDownActive, pos }) {
  const tagRef = useRef();
  const [editor] = useLexicalComposerContext();
  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!isDropDownActive || !pos?.x || !pos?.y) {
      setIsDropDownActive(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDropDownActive, pos?.x, pos?.y]);

  const handleClick = useCallback(() => {
    if (!isDialogOpen) {
      setTimeout(() => {
        if (isFunction(tagRef.current.focus)) {
          tagRef.current.focus();
        }
      }, 100);
    }
    setDialogOpen(!isDialogOpen);
  }, [isDialogOpen, tagRef]);

  const handleClose = useCallback(() => {
    editor.dispatchCommand(JSON_TAG_COMMAND, { tag: tagRef.current.value });
    setIsDropDownActive(false);
    handleClick();
  }, [editor, setIsDropDownActive, handleClick]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleClose();
      }
    },
    [handleClose]
  );

  return (
    <div>
      <IconButton aria-label="more" id={`long-button-0`} aria-haspopup="true" onClick={handleClick} color={`warning`}>
        <TagIcon />
      </IconButton>

      <Dialog
        open={isDialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        sx={{ zIndex: 10002 }}
      >
        <DialogTitle>Tag</DialogTitle>
        <DialogContent>
          <TextField
            id="outlined-multiline-static"
            label="Write here..."
            fullWidth
            multiline
            rows={4}
            defaultValue=""
            inputRef={tagRef}
            margin={`dense`}
            onKeyDown={(e) => handleKeyDown(e)}
            focused={isDialogOpen}
          />
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            color="error"
            onClick={() => {
              setDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button size="small" onClick={handleClose}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

JsontagDropdown.propTypes = {
  isDropDownActive: PropTypes.bool,
  setIsDropDownActive: PropTypes.func,
  pos: PropTypes.object
};
