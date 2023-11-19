import PropTypes from 'prop-types';
import { Person4Rounded } from '@mui/icons-material';
import { Button, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from '@mui/material';
import { FILTER_COMMENT } from 'lexical-editor/plugins/commentPlugin';
import { useRef, useState } from 'react';

const UserFilter = ({ users, me, editor }) => {
  const team = me ? me.team : '';
  const [selectedUser, setSelectedUser] = useState('');
  const [showDropDown, setShowDropDown] = useState(false);

  const anchorRef = useRef(null);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setShowDropDown(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setShowDropDown(false);
    } else if (event.key === 'Escape') {
      setShowDropDown(false);
    }
  }
  /**
   *
   * @param {MouseEvent} e
   * @param {String} _model
   * @description set car model after car menu click
   */
  const handleUserClick = (e, _user) => {
    editor.dispatchCommand(FILTER_COMMENT, { filter: _user._id ?? '' });
    setSelectedUser(_user._id ?? '');
    handleClose(e);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<Person4Rounded />}
        onClick={() => setShowDropDown(!showDropDown)}
        aria-controls={showDropDown ? 'car-model-menu' : undefined}
        aria-expanded={showDropDown ? 'true' : undefined}
        aria-haspopup="true"
        ref={anchorRef}
      >
        {!selectedUser ? 'All' : users.find((_user) => _user._id === selectedUser)?.name}
      </Button>
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
                  <MenuList
                    autoFocusItem={showDropDown}
                    id="composition-menu"
                    aria-labelledby="composition-button"
                    onKeyDown={handleListKeyDown}
                  >
                    <MenuItem
                      selected={selectedUser === ''}
                      onClick={(e) => {
                        handleUserClick(e, {});
                      }}
                      sx={{ paddingX: '30px' }}
                    >
                      {`All`}
                    </MenuItem>
                    {users.map((_user, _index) => (
                      <MenuItem
                        key={`car-menu-${_index}`}
                        selected={selectedUser === _user._id}
                        onClick={(e) => {
                          handleUserClick(e, _user);
                        }}
                        sx={{ paddingX: '30px' }}
                      >
                        {_user?.name} {_user?.team !== team ? ` (TL ${_user?.team})` : ''}
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
  );
};

export default UserFilter;

UserFilter.propTypes = {
  users: PropTypes.any,
  me: PropTypes.any,
  editor: PropTypes.any
};
