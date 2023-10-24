import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import { MenuList, Paper } from '@mui/material';
import PropTypes from 'prop-types';

import { CAR_OPTIONS, COLOR_OPTIONS } from 'Plugins/constants';

const ITEM_HEIGHT = 48;
let timer = 0;

export default function DropDownMenu({
  setIsDropDownActive,
  step,
  setStep,
  isDropDownActive,
  setCarModel,
  setColor,
  color,
  carModel,
  setDialogOpen,
  pos
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  React.useEffect(() => {
    if (!isDropDownActive || !pos?.x || !pos?.y) {
      setIsDropDownActive(false);
      setAnchorEl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDropDownActive, pos?.x, pos?.y]);

  const handleClick = (event) => {
    setIsDropDownActive(true);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setIsDropDownActive(false);
    setAnchorEl(null);
  };
  const handleCarClick = (option) => {
    clearTimeout(timer);
    setCarModel(option);
    setStep(1);
    return false;
  };

  const handleColorClick = (option) => {
    if (step < 1 || !carModel) {
      alert('Please select the car!');
      window.getSelection().removeAllRanges();
      handleClose();
      return false;
    }

    setColor(option);
    setDialogOpen(true);
    setIsDropDownActive(false);
    handleClose();
    return false;
  };

  const handleCarMouseMove = (event, option) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (isDropDownActive && anchorEl) {
        handleCarClick(option);
      }
    }, 200);
  };
  const handleColorEnter = () => {
    clearTimeout(timer);
    return false;
  };
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
          top: '30px',
          display: open && pos?.x && pos?.y ? 'flex' : 'none',
          maxHeight: ITEM_HEIGHT * 4.5,
          width: '10ch'
        }}
      >
        <MenuList>
          {CAR_OPTIONS.map((option) => (
            <MenuItem
              selected={option === carModel}
              key={option}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleCarClick(option);
              }}
              onMouseMove={(event) => {
                handleCarMouseMove(event, option);
              }}
              onMouseEnter={(event) => {
                handleCarMouseMove(event, option);
              }}
            >
              {option}
            </MenuItem>
          ))}
        </MenuList>
      </Paper>
      <Paper
        sx={{
          position: 'absolute',
          top: '30px',
          display: carModel && step && open ? 'flex' : 'none',
          maxHeight: ITEM_HEIGHT * 4.5,
          width: '10ch',
          marginLeft: '5rem'
        }}
      >
        <MenuList onMouseEnter={handleColorEnter}>
          {COLOR_OPTIONS.map((option) => (
            <MenuItem
              selected={option === color}
              key={option}
              onClick={() => {
                handleColorClick(option);
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
  carModel: PropTypes.string,
  color: PropTypes.string,
  setCarModel: PropTypes.func,
  setColor: PropTypes.func,
  setDialogOpen: PropTypes.func,
  pos: PropTypes.object
};
