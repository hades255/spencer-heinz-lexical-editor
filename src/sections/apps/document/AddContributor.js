import PropTypes from 'prop-types';
import React, { useState } from 'react';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import { autocompleteClasses, Autocomplete, Box, ButtonBase, ClickAwayListener, InputBase, Popper, Stack } from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
// project import
import MainCard from 'components/MainCard';
import { ThemeMode } from 'config';

// assets
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import CustomCell from 'components/customers/CustomCell';
import BackgroundLetterAvatar from 'components/@extended/BackgroundLetterAvatar';
import AddNewInviteDlg from './AddNewInviteDlg';
const filter = createFilterOptions();

const StyledAutocompletePopper = styled('div')(({ theme }) => ({
  [`& .${autocompleteClasses.paper}`]: {
    boxShadow: 'none',
    margin: 0,
    color: 'inherit',
    fontSize: 13
  },
  [`& .${autocompleteClasses.listbox}`]: {
    backgroundColor: theme.palette.mode === ThemeMode.DARK ? '#1c2128' : '#fff',
    padding: 0,
    [`& .${autocompleteClasses.option}`]: {
      minHeight: 'auto',
      alignItems: 'flex-start',
      padding: 8,
      borderBottom: `1px solid  ${theme.palette.mode === ThemeMode.DARK ? '#30363d' : '#eaecef'}`,
      '&[aria-selected="true"]': {
        backgroundColor: 'transparent'
      },
      '&[data-focus="true"], &[data-focus="true"][aria-selected="true"]': {
        backgroundColor: theme.palette.action.hover
      }
    }
  },
  [`&.${autocompleteClasses.popperDisablePortal}`]: {
    position: 'relative'
  }
}));

function PopperComponent(props) {
  const { disablePortal, anchorEl, ...other } = props;
  return <StyledAutocompletePopper disableportal={disablePortal.toString()} anchorel={anchorEl.toString()} {...other} />;
}

PopperComponent.propTypes = {
  disablePortal: PropTypes.bool,
  anchorEl: PropTypes.any
};

const StyledPopper = styled(Popper)(({ theme }) => ({
  border: `1px solid ${theme.palette.mode === ThemeMode.DARK ? '#30363d' : '#e1e4e8'}`,
  boxShadow: `0 8px 24px ${theme.palette.mode === ThemeMode.DARK ? 'rgb(1, 4, 9)' : 'rgba(149, 157, 165, 0.2)'}`,
  borderRadius: 6,
  width: 300,
  zIndex: theme.zIndex.modal,
  fontSize: 13,
  color: theme.palette.mode === ThemeMode.DARK ? '#c9d1d9' : '#24292e',
  backgroundColor: theme.palette.mode === ThemeMode.DARK ? '#1c2128' : '#fff'
}));

const StyledInput = styled(InputBase)(({ theme }) => ({
  padding: 10,
  width: '100%',
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& input': {
    borderRadius: 4,
    backgroundColor: theme.palette.background.paper,
    padding: 8,
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    border: `1px solid ${theme.palette.primary.main}`,
    fontSize: 14,
    '&:focus-visible': {
      boxShadow: theme.customShadows.primary,
      borderColor: theme.palette.primary.main
    }
  }
}));

const Button = styled(ButtonBase)(({ theme }) => ({
  fontSize: 13,
  width: '100%',
  textAlign: 'left',
  marginBottom: 8,
  color: theme.palette.text.primary,
  fontWeight: 600,
  '&:hover': {
    color: theme.palette.primary.main
  },
  '&:focus-visible': {
    borderRadius: 2,
    outline: `2px solid ${theme.palette.secondary.dark}`,
    outlineOffset: 2
  },
  '& span': {
    width: '100%'
  },
  '& svg': {
    width: 16,
    height: 16
  }
}));

// From https://github.com/abdonrd/github-users

// ==============================|| AUTOCOMPLETE - GITHUB ||============================== //

export default function AddContributor({ users, value, onChange }) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [pendingValue, setPendingValue] = useState([]);
  const [dialogValue, setDialogValue] = useState('');
  const [openDlg, toggleOpenDlg] = React.useState(false);

  const handleClick = (event) => {
    setPendingValue(value);
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDlg = (email = '') => {
    toggleOpenDlg(false);
    if (email) onChange([...value, email]);
    setDialogValue('');
  };

  const handleClose = () => {
    onChange(pendingValue);
    if (anchorEl) {
      anchorEl.focus();
    }
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'select-contributors' : undefined;

  return (
    <MainCard>
      <Box>
        <Stack direction={'row'}>
          {value.map((option, index) => (
            <CustomCell key={index} user={users.find((item) => item.email === option)} />
          ))}
          <Stack spacing={1.5} alignItems="center">
            <Button disableRipple aria-describedby={id} onClick={handleClick}>
              <BackgroundLetterAvatar name={'+'} />
            </Button>
          </Stack>
        </Stack>
      </Box>

      <StyledPopper id={id} open={open} anchorEl={anchorEl} placement="bottom-start">
        <ClickAwayListener onClickAway={handleClose}>
          <div>
            <Autocomplete
              open
              multiple
              onClose={(event, reason) => {
                if (reason === 'escape') {
                  handleClose();
                }
              }}
              value={pendingValue}
              onChange={(event, newValue, reason) => {
                if (event.type === 'keydown' && event.key === 'Backspace' && reason === 'removeOption') {
                  return;
                }
                setPendingValue(newValue);
              }}
              freeSolo
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              disableCloseOnSelect
              PopperComponent={PopperComponent}
              renderTags={() => null}
              noOptionsText="No users"
              renderOption={(props, option, { selected }, { options }) =>
                typeof option !== 'string' ? (
                  options.includes(option.inputValue) ? null : (
                    <li {...props} key={'add new'}>
                      <Box
                        component={CheckOutlined}
                        sx={{ width: 17, height: 17, mr: '5px', ml: '-2px', mt: 0.25 }}
                        style={{
                          visibility: 'hidden'
                        }}
                      />
                      <Box
                        sx={{
                          flexGrow: 1,
                          '& span': {
                            color: theme.palette.mode === ThemeMode.DARK ? '#586069' : '#8b949e'
                          }
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleClose();
                          toggleOpenDlg(true);
                          setDialogValue(option.inputValue);
                        }}
                      >
                        <CustomCell user={{ name: 'Add New', email: option.inputValue, avatar: '' }} />
                      </Box>
                    </li>
                  )
                ) : (
                  <li {...props}>
                    <Box
                      component={CheckOutlined}
                      sx={{ width: 17, height: 17, mr: '5px', ml: '-2px', mt: 0.25 }}
                      style={{
                        visibility: selected ? 'visible' : 'hidden'
                      }}
                    />
                    <Box
                      sx={{
                        flexGrow: 1,
                        '& span': {
                          color: theme.palette.mode === ThemeMode.DARK ? '#586069' : '#8b949e'
                        }
                      }}
                    >
                      <CustomCell user={users.find((item) => item.email === option)} />
                    </Box>
                    <Box
                      component={CloseOutlined}
                      sx={{ opacity: 0.6, width: 18, height: 18, mt: 0.25 }}
                      style={{
                        visibility: selected ? 'visible' : 'hidden'
                      }}
                    />
                  </li>
                )
              }
              options={[...users]
                .sort((a, b) => {
                  return value.includes(b.email) - value.includes(a.email);
                })
                .map((item) => item.email)}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);

                if (params.inputValue !== '') {
                  filtered.push({
                    inputValue: params.inputValue
                  });
                }

                return filtered;
              }}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option;
                }
                return option.inputValue;
              }}
              renderInput={(params) => (
                <StyledInput ref={params.InputProps.ref} inputProps={params.inputProps} autoFocus placeholder="Filter users" />
              )}
            />
          </div>
        </ClickAwayListener>
      </StyledPopper>
      {openDlg && <AddNewInviteDlg open={openDlg} email={dialogValue} onClose={handleCloseDlg} />}
    </MainCard>
  );
}
