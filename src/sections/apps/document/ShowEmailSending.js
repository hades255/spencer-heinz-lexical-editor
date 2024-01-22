import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { CopyOutlined, MobileOutlined, PhoneOutlined, SendOutlined } from '@ant-design/icons';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import { PopupTransition } from 'components/@extended/Transitions';
import CustomCell from 'components/customers/CustomCell';
import { PatternFormat } from 'react-number-format';
import { useSelector } from 'store';
import axiosServices from 'utils/axios';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { invitationEmailToUser } from 'config/helpers';
import { Setting } from 'pages/apps/document/Invitation';

const ShowEmailSending = ({ open, onClose }) => {
  const invitedUsers = useSelector((state) => state.document.invitedUsers);
  const document = useSelector((state) => state.document.document);
  const me = useSelector((state) => state.document.me);
  const [favourites, setFavourites] = useState([]);
  const [showStars, setShowStars] = useState(false);
  const [select, setSelect] = useState(null);
  const [selected, setSelected] = useState([]);
  const [openSetting, setOpenSetting] = useState(false);
  const [expired, setExpired] = useState(30);

  const handleClickUserItem = useCallback(
    (val) => {
      setExpired(30);
      if (select?._id === val._id) {
        if (selected.includes(val._id)) {
          setSelected(selected.filter((item) => item !== val._id));
          setSelect(null);
        } else {
          setSelected([...selected, val._id]);
          setSelect(val);
        }
      } else {
        if (selected.includes(val._id)) {
          setSelect(val);
        } else {
          setSelected([...selected, val._id]);
          setSelect(val);
        }
      }
    },
    [selected, select]
  );

  const handleClickToggle = useCallback(
    (val) => {
      setExpired(30);
      if (selected.includes(val._id)) {
        setSelected(selected.filter((item) => item !== val._id));
        setSelect(null);
      } else {
        setSelected([...selected, val._id]);
        setSelect(val);
      }
    },
    [selected]
  );

  const getFavouriteUsers = useCallback(() => {
    (async () => {
      try {
        const res = await axiosServices.get('/user/favourite');
        setFavourites(res.data.data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const setFavouriteUser = useCallback(
    (email, flag) => {
      (async () => {
        try {
          const res = await axiosServices.put('/user/favourite', { email, flag });
          const { email: _email, flag: _flag } = res.data.data;
          const f = favourites.filter((item) => item !== _email);
          setFavourites(_flag ? [...f, _email] : f);
        } catch (error) {
          console.log(error);
        }
      })();
    },
    [favourites]
  );

  const handleSaveStatus = useCallback(() => {
    if (selected.length === 0) return;
    (async () => {
      try {
        await axiosServices.post(`/document/${document._id}/sendEmail`, {
          invites: selected //invitedUsers.filter((item) => selected.includes(item._id)).map(({ email, status }) => ({ email, status }))
        });
        dispatch(
          openSnackbar({
            open: true,
            message: `Save successfully.`,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
      } catch (error) {
        console.log(error);
        dispatch(
          openSnackbar({
            open: true,
            message: `Server Connection Error.`,
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
      }
    })();
  }, [selected, document]);

  const handleSendEmail = useCallback(() => {
    (async () => {
      try {
        await axiosServices.put(`/document/${document._id}/sendEmail`, {
          to: { _id: select._id, email: select.email, status: select.status }
        });
        dispatch(
          openSnackbar({
            open: true,
            message: `Send successfully.`,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
      } catch (error) {
        console.log(error);
        dispatch(
          openSnackbar({
            open: true,
            message: `Server Connection Error.`,
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
      }
    })();
  }, [select, document]);

  const handleCloseSettingDlg = useCallback((val) => {
    if (val) setExpired(val);
    setOpenSetting(false);
  }, []);

  const handleOpenSettingDlg = useCallback(() => {
    setOpenSetting(true);
  }, []);

  useEffect(() => getFavouriteUsers(), [getFavouriteUsers]);

  const inviteText = useMemo(
    () => me && select && document && invitationEmailToUser(me, select, document, window.location.origin),
    [me, select, document]
  );

  return (
    <>
      <Dialog
        maxWidth="md"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={(r) => {
          if (r === 'escapeKeyDown') onClose();
        }}
        open={open}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogActions>
          <Button onClick={handleSaveStatus} color="success" variant="contained" disabled={selected.length === 0}>
            Save Status
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
        <DialogContent>
          <Grid container justifyContent={'center'} spacing={2}>
            <Grid item xs={10} sm={6}>
              {/* <Box>
              <Tooltip title={`${showStars ? 'Hide' : 'Show'} favorite users`}>
                <IconButton onClick={handleShowStars} sx={{ borderRadius: 20 }}>
                  <StarFilled style={{ transition: 'ease-in-out 0.2s', color: showStars ? 'gold' : 'grey' }} />
                </IconButton>
              </Tooltip>
              Favorite users
            </Box> */}
              <List sx={{ height: 400, width: '100%', overflowY: 'scroll' }}>
                {invitedUsers.length === 0 ? (
                  <ListItem>
                    <ListItemText>You have not invited users</ListItemText>
                  </ListItem>
                ) : (
                  invitedUsers
                    .filter((item) => (showStars ? favourites.includes(item.email) : true))
                    .map((item, key) => (
                      <UserItem
                        user={item}
                        key={key}
                        favourites={favourites}
                        setFavourites={setFavouriteUser}
                        onClick={handleClickUserItem}
                        onClickToggle={handleClickToggle}
                        select={select?._id}
                        selected={selected}
                      />
                    ))
                )}
              </List>
            </Grid>
            <Grid item xs={10} sm={6}>
              {select ? (
                <Box>
                  <Stack direction={'row'} justifyContent={'space-between'} sx={{ mx: 2 }}>
                    <Box>
                      <Typography>
                        <b>Name:</b> {select.name}
                      </Typography>
                      <Typography>
                        <b>Email:</b> {select.email}
                      </Typography>
                      <Typography>
                        <b>Mobile Phone:</b> {select.mobilePhone}
                      </Typography>
                      <Typography>
                        <b>Work Phone:</b> {select.workPhone}
                      </Typography>
                    </Box>
                    <Box>
                      {!select.mailStatus && (
                        <Tooltip title={`Send email via this`}>
                          <Button color="info" variant="outlined" onClick={handleSendEmail}>
                            <SendOutlined />
                          </Button>
                        </Tooltip>
                      )}
                      <CopyButton
                        text={inviteText}
                        title={'Copy document link'}
                        copiedTitle={
                          select.status === 'invited'
                            ? expired === 100
                              ? 'Link copied - never expires'
                              : `Link copied - expires in ${expired} days`
                            : 'Link copied'
                        }
                      />
                    </Box>
                  </Stack>
                  {select.status === 'invited' && (
                    <Stack direction={'row'} justifyContent={'end'}>
                      <Stack direction={'row'}>
                        <Typography color={'secondary'} sx={{ py: 1 }}>
                          {expired === 100 ? 'Never expires -' : `Expires in ${expired} days -`}
                        </Typography>
                        <Button color="secondary" onClick={handleOpenSettingDlg}>
                          Edit link setting
                        </Button>
                      </Stack>
                    </Stack>
                  )}
                  <Stack sx={{ m: 2 }}>
                    <Stack direction={'row'} justifyContent={'space-between'}>
                      <Stack direction={'row'}>
                        <Typography variant="subtitle1" sx={{ mr: 1 }}>
                          Subject:
                        </Typography>
                        <Typography>Please collaborate with me on {document.name}</Typography>
                      </Stack>
                      <Box>
                        <CopyButton text={`Please collaborate with me on ${document.name}`} title={'Copy subject'} />
                      </Box>
                    </Stack>
                    <Stack direction={'row'} justifyContent={'space-between'}>
                      <Stack direction={'row'}>
                        <Typography variant="subtitle1" sx={{ mr: 1 }}>
                          Content:
                        </Typography>
                        <Stack sx={{ flexGrow: '1', flexWrap: 'wrap' }}>
                          <Typography>I would like to work with you.</Typography>
                          <Link sx={{ width: 200, wordWrap: 'break-word' }}>{inviteText}</Link>
                        </Stack>
                      </Stack>
                      <Box>
                        <CopyButton text={`I would like to work with you. ${inviteText}`} title={'Copy content'} />
                      </Box>
                    </Stack>
                  </Stack>
                </Box>
              ) : (
                <Typography sx={{ mt: 2 }}>Select a user from the users list to see details</Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      {openSetting && <Setting open={openSetting} onClose={handleCloseSettingDlg} defaultExpired={expired} />}
    </>
  );
};

export const UserItem = ({ user, onClick, select, selected, onClickToggle }) => {
  // const handleClickStar = useCallback(() => {
  //   setFavourites(user.email, !favourites.includes(user.email));
  // }, [setFavourites, favourites, user]);

  const handleClick = useCallback(() => onClick(user), [onClick, user]);
  const handleToggle = useCallback(() => onClickToggle(user), [onClickToggle, user]);

  return (
    <ListItemButton role="listitem" divider onClick={handleClick} selected={user._id === select}>
      <ListItemAvatar>
        {/* <IconButton onClick={handleClickStar} sx={{ borderRadius: 20 }}> */}
        <Checkbox
          onClick={handleToggle}
          checked={user.mailStatus || selected.includes(user._id)}
          // indeterminate={numberOfChecked(ids) !== ids.length && numberOfChecked(ids) !== 0}
          disabled={user.mailStatus}
          inputProps={{
            'aria-label': 'all items selected'
          }}
        />
        {/* </IconButton> */}
      </ListItemAvatar>
      <ListItemText
        id={user._id}
        primary={
          <Stack flexGrow={'inherit'} direction={'row'} alignItems={'center'} spacing={0.1} width={'100%'} flexWrap={'wrap'}>
            <Box sx={{ width: 200, overflowX: 'hidden' }}>
              <CustomCell user={user} />
            </Box>
            <Stack sx={{ width: 150 }} spacing={0}>
              <Typography variant="" color="textSecondary">
                <MobileOutlined style={{ borderRadius: '10px' }} />
                <PatternFormat displayType="text" format=" +1 (###) ###-####" mask="_" defaultValue={user.mobilePhone} />
              </Typography>
              <Typography variant="" color="textSecondary">
                <PhoneOutlined />
                <PatternFormat displayType="text" format=" +1 (###) ###-####" mask="_" defaultValue={user.workPhone} />
              </Typography>
            </Stack>
          </Stack>
        }
      />
    </ListItemButton>
  );
};

export const CopyButton = ({ text, title, copiedTitle = 'Copied' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    (async () => {
      try {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 1500);
          })
          .catch((error) => {
            console.error('Failed to copy text:', error);
          });
      } catch (error) {
        console.log(error);
      }
    })();
  }, [text]);

  return (
    <Tooltip title={copied ? copiedTitle : title}>
      <Button onClick={handleCopy}>
        <CopyOutlined />
      </Button>
    </Tooltip>
  );
};

export default ShowEmailSending;

ShowEmailSending.propTypes = {
  open: PropTypes.any,
  onClose: PropTypes.any
};

UserItem.propTypes = {
  user: PropTypes.any,
  favourites: PropTypes.any,
  setFavourites: PropTypes.any,
  onClick: PropTypes.any,
  select: PropTypes.any,
  selected: PropTypes.any,
  onClickToggle: PropTypes.any
};

CopyButton.propTypes = {
  text: PropTypes.any,
  title: PropTypes.any,
  copiedTitle: PropTypes.any
};

/**
          {favourites.includes(user.email) ? (
            <StarFilled style={{ fontSize: 20, color: 'gold' }} />
          ) : (
            <StarOutline style={{ fontSize: 20, color: 'gold' }} />
          )} */

// /window.location.origin + window.location.pathname
