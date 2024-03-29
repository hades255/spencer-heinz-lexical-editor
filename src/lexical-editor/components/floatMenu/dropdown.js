import { useState, useEffect, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import { MenuList, Paper } from '@mui/material';
import PropTypes from 'prop-types';
import { ACTION_REQUEST_USER, ITEM_HEIGHT, PERMISSION_TASK, USER_TASKS } from 'lexical-editor/utils/constants';
import { isEqual } from 'lodash';

let timer = 0;

export default function DropDownMenu({
  setIsDropDownActive,
  step,
  setStep,
  isDropDownActive,
  setAssignee,
  assignee,
  setTask,
  task,
  users,
  setDialogOpen,
  pos,
  currentUser
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (!isDropDownActive || !pos?.x || !pos?.y) {
      setIsDropDownActive(false);
      setAnchorEl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDropDownActive, pos?.x, pos?.y]);

  const handleClick = useCallback(
    (event) => {
      if (open) {
        setAnchorEl(null);
      } else {
        setIsDropDownActive(true);
        setAnchorEl(event.currentTarget);
      }
    },
    [open, setIsDropDownActive]
  );

  const handleClose = useCallback(() => {
    setIsDropDownActive(false);
    setAnchorEl(null);
  }, [setIsDropDownActive]);

  const handleUserClick = useCallback(
    (option) => {
      clearTimeout(timer);
      setAssignee(option);
      setStep(1);
      return false;
    },
    [setAssignee, setStep]
  );

  const handleTaskClick = useCallback(
    (option) => {
      if (step < 1 || !assignee) {
        alert('Please select the user!');
        window.getSelection().removeAllRanges();
        handleClose();
        return false;
      }

      setTask(option);
      setDialogOpen(true);
      setIsDropDownActive(false);
      handleClose();
      return false;
    },
    [step, assignee, handleClose, setDialogOpen, setIsDropDownActive, setTask]
  );

  const handleUserMouseMove = useCallback(
    (event, option) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (isDropDownActive && anchorEl) {
          handleUserClick(option._id);
        }
      }, 200);
    },
    [anchorEl, handleUserClick, isDropDownActive]
  );

  const handleTaskEnter = useCallback(() => {
    clearTimeout(timer);
    return false;
  }, []);

  // if (pos) {
  //   console.log(pos, window.innerHeight);
  // }

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
        <DriveEtaIcon color={`primary`} />
      </IconButton>
      <Paper
        sx={{
          position: 'absolute',
          [pos && pos.y + 200 > window.innerHeight ? 'bottom' : 'top']: '30px',
          display: open && pos?.x && pos?.y ? 'flex' : 'none',
          maxHeight: ITEM_HEIGHT * 4.5,
          overflowY: `auto`,
          width: '15ch',
          overflowX: 'hidden',
          zIndex: 10003
        }}
      >
        <MenuList sx={{ width: '100%' }}>
          {users.map((user) => (
            <MenuItem
              selected={user._id === assignee}
              key={user._id}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleUserClick(user._id);
              }}
              onMouseMove={(event) => {
                handleUserMouseMove(event, user);
              }}
              onMouseEnter={(event) => {
                handleUserMouseMove(event, user);
              }}
            >
              {user.name} {user._id === ACTION_REQUEST_USER._id ? '' : user?.team !== currentUser?.team ? ` (TL ${user?.team})` : ''}
            </MenuItem>
          ))}
        </MenuList>
      </Paper>
      <Paper
        sx={{
          position: 'absolute',
          [pos && pos.y + 200 > window.innerHeight ? 'bottom' : 'top']: '30px',
          display: assignee && step && open ? 'flex' : 'none',
          maxHeight: ITEM_HEIGHT * 4.5,
          overflowY: `auto`,
          width: '12h',
          marginLeft: '15ch'
        }}
      >
        <MenuList onMouseEnter={handleTaskEnter} sx={{ maxHeight: '50vh', overflowY: 'scroll' }}>
          {/* ! @topbot 2023/09/12 #set task only "Permission Request" */}
          {(isEqual(users, [ACTION_REQUEST_USER]) ? PERMISSION_TASK : USER_TASKS).map((option) => (
            <MenuItem
              selected={option === task}
              key={option}
              onClick={() => {
                handleTaskClick(option);
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

DropDownMenu.propTypes = {
  isDropDownActive: PropTypes.bool,
  setIsDropDownActive: PropTypes.func,
  step: PropTypes.number,
  setStep: PropTypes.func,
  assignee: PropTypes.string,
  task: PropTypes.string,
  setAssignee: PropTypes.func,
  setTask: PropTypes.func,
  users: PropTypes.array,
  setDialogOpen: PropTypes.func,
  pos: PropTypes.object,
  currentUser: PropTypes.any
};
