import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import { CAR_OPTIONS, COLOR_OPTIONS, USER_OPTIONS } from 'Plugins/constants';
import { MenuList, Paper } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

const ITEM_HEIGHT = 48;

export default function UserFloatMenu({
  setIsDropDownActive,
  isDropDownActive,
  pos,
  currentUser,
  setIsLocked,
  setSelectedUsers,
  selectedUsers
}) {
  console.log("B")
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  React.useEffect(() => {
    if (!isDropDownActive || !pos?.x || !pos?.y) {
      setIsDropDownActive(false);
      setAnchorEl(null);
    }
  }, [isDropDownActive, pos?.x, pos?.y]);

  const handleClose = () => {
    setIsDropDownActive(false);
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setIsDropDownActive(true);
    setAnchorEl(event.currentTarget);
    setIsLocked(true);
    return false;
  };
  const handleUserClick = (option) => {
    console.log(option);
    setSelectedUsers((prev) => [...prev, option]);
    return false;
  };

  // const handleColorClick = (option) => {
  //   if (step < 1 || !carModel) {
  //     alert('Please select the car!');
  //     window.getSelection().removeAllRanges();
  //     handleClose();
  //     return false;
  //   }

  //   setColor(option);
  //   setDialogOpen(true);
  //   setIsDropDownActive(false);
  //   handleClose();
  //   return false;
  // };

  // const handleCarMouseMove = (event, option) => {
  //   clearTimeout(timer);
  //   timer = setTimeout(() => {
  //     if (isDropDownActive && anchorEl) {
  //       handleCarClick(option);
  //     }
  //   }, 200);
  // };
  // const handleColorEnter = () => {
  //   clearTimeout(timer);
  //   return false;
  // };
  return (
    <div>
      <IconButton
        aria-label="more"
        id={`long-button-0`}
        aria-controls={open ? `long-menu-0` : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <LockOutlined color={`error`} />
      </IconButton>
      <Paper
        sx={{
          position: 'absolute',
          top: '30px',
          display: open && pos?.x && pos?.y ? 'flex' : 'none',
          maxHeight: ITEM_HEIGHT * 4.5,
          width: '10ch'
        }}
      >
        <MenuList>
          {USER_OPTIONS.map((option) => (
            <MenuItem
              selected={option === currentUser || selectedUsers.includes(option)}
              key={option}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleUserClick(option);
              }}
            >
              {option}
            </MenuItem>
          ))}
        </MenuList>
      </Paper>
    </div>
  );
}
