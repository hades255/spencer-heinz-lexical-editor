import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import DownloadIcon from '@mui/icons-material/Download';
import { ClickAwayListener, Grow, MenuList, Paper, Popper } from '@mui/material';
import { useSelector } from 'store';

export default function Download({ user }) {
  const doc = useSelector((state) => state.document.document);
  const [showDropDown, setShowDropDown] = useState(false);
  const anchorRef = useRef(null);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setShowDropDown(false);
  };

  const handleClick = (event, type) => {
    if (type === 'json') {
      //
    } else if (type === 'html') {
      //
    }
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setShowDropDown(false);
  };

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
          <DownloadIcon color={`info`} />
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
                    <MenuList autoFocusItem={showDropDown} id="composition-menu" aria-labelledby="composition-button">
                      <MenuItem onClick={(event) => handleClick(event, 'json')} sx={{ paddingX: '30px' }}>
                        JSON
                      </MenuItem>
                      <MenuItem onClick={(event) => handleClick(event, 'html')} sx={{ paddingX: '30px' }}>
                        HTML
                      </MenuItem>
                    </MenuList>
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
