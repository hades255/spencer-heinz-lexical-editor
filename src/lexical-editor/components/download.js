import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import {
  Box,
  Button,
  ButtonGroup,
  ClickAwayListener,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grow,
  Paper,
  Popper,
  Radio,
  RadioGroup,
  Stack
} from '@mui/material';
import { useSelector } from 'store';
import { DOWNLOAD_ALL_JSON } from 'lexical-editor/plugins/focusPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FormOutlined } from '@ant-design/icons';

export default function Download({ user }) {
  const doc = useSelector((state) => state.document.document);
  const [showDropDown, setShowDropDown] = useState(false);
  const [type, setType] = useState('json');
  const anchorRef = useRef(null);
  const [editor] = useLexicalComposerContext();

  const handleClose = useCallback((event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setShowDropDown(false);
  }, []);

  // const handleClick = useCallback(
  //   (event, type) => {
  //     editor.dispatchCommand(DOWNLOAD_ALL_JSON, { type, name: doc.name });
  //     if (anchorRef.current && anchorRef.current.contains(event.target)) {
  //       return;
  //     }
  //     setShowDropDown(false);
  //   },
  //   [editor]
  // );

  const handleDownload = useCallback(
    (event) => {
      editor.dispatchCommand(DOWNLOAD_ALL_JSON, { type, name: doc.name });
      if (anchorRef.current && anchorRef.current.contains(event.target)) {
        return;
      }
      setShowDropDown(false);
    },
    [editor, type, doc]
  );

  const handleRadioChange = useCallback((event) => setType(event.target.value), []);

  return (
    doc &&
    doc.creator._id === user && (
      <>
        <IconButton
          size="large"
          icon="link"
          aria-label="more"
          id={`download-button-0`}
          aria-controls={open ? `long-menu-0` : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={() => setShowDropDown(!showDropDown)}
          ref={anchorRef}
        >
          <FormOutlined />
          {/* <DownloadIcon color={`info`} /> */}
        </IconButton>
        {showDropDown && (
          <Popper
            open={showDropDown}
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
                    <Box sx={{ width: 200, p: 1 }}>
                      <Stack direction={'row'} justifyContent={'center'}>
                        <FormControl>
                          <FormLabel id="demo-controlled-radio-buttons-group">Download</FormLabel>
                          <RadioGroup
                            aria-labelledby="demo-radio-buttons-group-label"
                            defaultValue="json"
                            value={type}
                            onChange={handleRadioChange}
                            name="radio-buttons-group"
                          >
                            <FormControlLabel value="json" control={<Radio />} label="Document" />
                            <FormControlLabel value="tags" control={<Radio />} label="JSON tags and data" />
                          </RadioGroup>
                        </FormControl>
                      </Stack>
                      <Stack direction={'row'} justifyContent={'center'}>
                        <ButtonGroup size="sm" variant="text" aria-label="download button group">
                          <Button onClick={handleDownload} color="primary">
                            Download
                          </Button>
                          <Button onClick={handleClose} color="secondary">
                            Cancel
                          </Button>
                        </ButtonGroup>
                      </Stack>
                    </Box>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        )}
      </>
    )
  );
}

Download.propTypes = {
  user: PropTypes.string
};

/*
<MenuList autoFocusItem={showDropDown} id="composition-menu" aria-labelledby="composition-button">
  <MenuItem onClick={(event) => handleClick(event, 'json')} sx={{ paddingX: '30px' }}>
    JSON
  </MenuItem>
  <MenuItem onClick={(event) => handleClick(event, 'html')} sx={{ paddingX: '30px' }}>
    HTML
  </MenuItem>
</MenuList>
*/
