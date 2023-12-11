import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogContent,
  Stack,
  Typography,
  IconButton,
  Box,
  Button,
  Autocomplete,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import { LinkOutlined } from '@ant-design/icons';
import base64url from 'base64url';
import { PopupTransition } from 'components/@extended/Transitions';
import { useSelector } from 'store';
import { dispatch } from 'store';
import { getUserLists } from 'store/reducers/user';
import axiosServices from 'utils/axios';
import { openSnackbar } from 'store/reducers/snackbar';

const Invitation = ({ open, onClose, user, docId }) => {
  const allUsers = useSelector((state) => state.user.lists);
  const emails = useMemo(() => allUsers.filter((item) => !item.setting.hide).map((item) => item.email), [allUsers]);

  const [openSetting, setOpenSetting] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [expired, setExpired] = useState(30);
  const [value, setValues] = useState([]);

  useEffect(() => {
    dispatch(getUserLists());
  }, []);

  const handleOpenSettingDlg = useCallback(() => {
    setOpenSetting(true);
  }, []);

  const handleCloseSettingDlg = useCallback((val) => {
    if (val) setExpired(val);
    setOpenSetting(false);
  }, []);

  const handleEmailsChange = useCallback((e, val) => {
    setValues(val);
  }, []);

  const generateToken = useCallback(() => {
    return (
      window.location.origin +
      '/document/' +
      docId +
      '?invitation=' +
      base64url(JSON.stringify({ e: user.email, x: expired === 100 ? 0 : new Date().getTime() + expired * 24 * 3600 * 1000 }))
    );
  }, [expired, user, docId]);

  const handleCopyToken = useCallback(() => {
    const text = generateToken();
    console.log(text);
    (async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(text)
            .then(() => {
              console.log('Text copied to clipboard');
              setShowCopied(true);
              setTimeout(() => {
                setShowCopied(false);
              }, 1000);
            })
            .catch((error) => {
              console.error('Failed to copy text to clipboard:', error);
            });
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          console.log('Text copied to clipboard');
          setShowCopied(true);
          setTimeout(() => {
            setShowCopied(false);
          }, 1000);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [generateToken]);

  const handleSendToken = useCallback(() => {
    if (value.length === 0) return;
    if (value.filter((item) => !(item.includes('@') && item.includes('.'))).length) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Email format error. Please check again.',
          variant: 'alert',
          alert: {
            color: 'info'
          },
          close: true
        })
      );
      return;
    }
    (async () => {
      try {
        const text = generateToken();
        const invites = allUsers.filter((item) => value.includes(item.email)).map((item) => item._id);
        await axiosServices.post(`/document/${docId}/t`, { text, invites, emails: value });
        dispatch(
          openSnackbar({
            open: true,
            message: 'Send invitation successfully.',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        onClose(false);
      } catch (error) {
        console.log(error);
        dispatch(
          openSnackbar({
            open: true,
            message: 'Server connection error.',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
      }
    })();
  }, [generateToken, onClose, value, docId, allUsers]);

  return (
    <>
      <Dialog
        maxWidth="xs"
        fullWidth
        TransitionComponent={PopupTransition}
        onClose={(r) => {
          if (r === 'escapeKeyDown') onClose(false);
        }}
        open={open}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogContent>
          <IconButton
            aria-label="close"
            onClick={() => {
              onClose(false);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h4">Invite people to this document</Typography>
          <Autocomplete
            multiple
            freeSolo
            autoHighlight
            disableCloseOnSelect
            filterSelectedOptions
            includeInputInList
            clearIcon={null}
            clearOnBlur={false}
            disableClearable={false}
            id="emails-select"
            options={emails}
            renderInput={(params) => <TextField {...params} label="To:" placeholder="name.email.com" />}
            sx={{
              my: 1,
              minHeight: 80
            }}
            onChange={handleEmailsChange}
          />
          <Stack direction={'row'} justifyContent={'space-between'}>
            <Box>
              <Tooltip
                PopperProps={{ disablePortal: true }}
                open={showCopied}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                title={`Link copied - expires in ${expired} days`}
              >
                <Button onClick={handleCopyToken}>
                  <LinkOutlined /> &nbsp;Copy invite link
                </Button>
              </Tooltip>
              -
              <Button color="secondary" onClick={handleOpenSettingDlg}>
                Edit link setting
              </Button>
            </Box>
            <Button variant="outlined" onClick={handleSendToken}>
              Send
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
      <Setting open={openSetting} onClose={handleCloseSettingDlg} defaultExpired={expired} />
    </>
  );
};

const Setting = ({ open, onClose, defaultExpired }) => {
  const [expired, setExpired] = useState(defaultExpired);
  const [changed, setChanged] = useState(false);

  const handleChange = useCallback(
    ({ target: { value } }) => {
      setExpired(value);
      if (value !== defaultExpired) {
        setChanged(true);
      } else {
        setChanged(false);
      }
    },
    [defaultExpired]
  );

  const handleClose = useCallback(() => onClose(null), [onClose]);

  const handleSetChange = useCallback(() => {
    onClose(expired);
  }, [onClose, expired]);

  return (
    <Dialog
      maxWidth="xs"
      fullWidth
      TransitionComponent={PopupTransition}
      onClose={(r) => {
        if (r === 'escapeKeyDown') onClose(null);
      }}
      open={open}
      sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogContent>
        <IconButton
          aria-label="close"
          onClick={() => {
            onClose(null);
          }}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h4">Invitation link settings</Typography>
        <Typography>For security reasons, links must expire.</Typography>
        <Typography>A link can be shared with up to 400 people.</Typography>
        <FormControl variant="standard" sx={{ my: 1, width: '100%' }}>
          <InputLabel id="demo-simple-select-standard-label">Link set to expire after…</InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={expired}
            onChange={handleChange}
            label="Link set to expire after…"
          >
            <MenuItem value={1}>1 day</MenuItem>
            <MenuItem value={7}>7 days</MenuItem>
            <MenuItem value={30}>30 days</MenuItem>
            <MenuItem value={100}>Never expires</MenuItem>
          </Select>
        </FormControl>
        <Stack direction={'row'} justifyContent={'end'}>
          <Button variant="outlined" color="secondary" sx={{ mx: 1 }} onClick={handleClose}>
            Back
          </Button>
          <Button variant="contained" color={'success'} sx={{ mx: 1 }} disabled={!changed} onClick={handleSetChange}>
            Save
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default Invitation;

Invitation.propTypes = {
  open: PropTypes.any,
  onClose: PropTypes.any,
  user: PropTypes.any,
  docId: PropTypes.any
};

Setting.propTypes = {
  open: PropTypes.any,
  onClose: PropTypes.any,
  defaultExpired: PropTypes.any
};
