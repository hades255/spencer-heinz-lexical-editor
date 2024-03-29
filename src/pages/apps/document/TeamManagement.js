import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowRightOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  MobileOutlined,
  PhoneOutlined,
  SaveOutlined,
  StarFilled
} from '@ant-design/icons';
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tab,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import CloseIcon from '@mui/icons-material/Close';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import { useSelector } from 'store';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import UserAvatar from 'sections/apps/user/UserAvatar';
import { PatternFormat } from 'react-number-format';
import { StatusCell } from '../customer/list';
import CustomCell from 'components/customers/CustomCell';
import BackgroundLetterAvatar from 'components/@extended/BackgroundLetterAvatar';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { getUserLists } from 'store/reducers/user';
import axiosServices from 'utils/axios';
import { StarOutline } from '@mui/icons-material';
import AddNewInviteConfirmDlg from 'sections/apps/document/AddNewInviteConfirmDlg';
import AddNewInviteDlg from 'sections/apps/document/AddNewInviteDlg';
const filter = createFilterOptions();

const TeamManagement = ({ socket }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);

  return (
    <>
      <Grid item xs={12} sm={4}>
        <Stack direction="row" justifyContent={'end'}>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              setOpen(true);
            }}
          >
            <Stack spacing={0}>
              <Typography variant="subtitle1" sx={{ textDecorationLine: 'underline', textDecorationColor: 'Highlight' }}>
                Teams
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Grid>
      <Dialog
        maxWidth="md"
        TransitionComponent={PopupTransition}
        fullWidth
        fullScreen={fullScreen}
        onClose={(e, r) => {
          if (r === 'escapeKeyDown') setOpen(false);
        }}
        open={open}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <IconButton
          aria-label="close"
          onClick={() => {
            setOpen(false);
          }}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
        {open && <Team onClose={setOpen} socket={socket} />}
      </Dialog>
    </>
  );
};

export default TeamManagement;

const Team = ({ socket }) => {
  const leaders = useSelector((state) => state.document.leaders);
  const me = useSelector((state) => state.document.me);
  const document = useSelector((state) => state.document.document);
  const activeTeam = useSelector((state) => state.document.activeTeam);
  const blocked = useSelector((state) => state.document.blockTeams);
  const leaderEmails = leaders.map((item) => item.email);
  const allUsers = useSelector((state) => state.user.lists);
  const users = useSelector((state) => state.user.lists).filter(
    (item) => !leaderEmails.includes(item.email) && item.email !== document.creator?.email
  );
  const [favourites, setFavourites] = useState([]);
  const [collaborates, setCollaborates] = useState([]);
  const [showStars, setShowStars] = useState(false);
  const [openDeleteDlg, setOpenDeleteDlg] = useState(false);
  const [value, setValue] = useState('tab-2');
  const [newTeamLeader, setNewTeamLeader] = useState('');
  const [newTeam, setNewTeam] = useState('');
  const [oldTeam, setOldTeam] = useState('');

  const handleShowStars = useCallback(() => setShowStars(!showStars), [showStars]);

  const getCollaborateUsers = useCallback(() => {
    (async () => {
      try {
        const res = await axiosServices.get('/user/collaborates');
        setCollaborates(res.data.data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handlePerformRemoveTeam = useCallback(
    (res) => {
      if (res === 0) {
        setOpenDeleteDlg(false);
      } else if (res === 1 || res === 2) {
        (async () => {
          (async () => {
            try {
              socket.send(JSON.stringify({ type: res === 1 ? 'remove-team' : 'delete-team', oldTeam, newTeam, me }));
              dispatch(
                openSnackbar({
                  open: true,
                  message: `Deletion of Team successfull.`,
                  variant: 'alert',
                  alert: {
                    color: 'success'
                  },
                  close: true
                })
              );
              setOpenDeleteDlg(false);
            } catch (error) {
              console.log(error);
              dispatch(
                openSnackbar({
                  open: true,
                  message: `Connection Error! Please refresh page and try again.`,
                  variant: 'alert',
                  alert: {
                    color: 'error'
                  },
                  close: true
                })
              );
            }
          })();
        })();
      }
    },
    [socket, oldTeam, newTeam, me]
  );

  const handleRemoveTeam = useCallback((_oldTeam, _newTeam) => {
    setOldTeam(_oldTeam);
    setNewTeam(_newTeam);
    setOpenDeleteDlg(true);
  }, []);

  const setBlockTeam = useCallback(
    (team, flag) => {
      (async () => {
        try {
          socket.send(JSON.stringify({ type: (flag ? 'set' : 'remove') + '-block', team }));
          dispatch(
            openSnackbar({
              open: true,
              message: `${flag ? 'Set' : 'Remove'} team block successfully.`,
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
              message: `Error.`,
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
        }
      })();
    },
    [socket]
  );

  const handlesetActiveTeam = useCallback(
    (team) => {
      (async () => {
        try {
          socket.send(JSON.stringify({ type: 'set-active', team }));
          dispatch(
            openSnackbar({
              open: true,
              message: `Set active team successfully.`,
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
              message: `Error.`,
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
        }
      })();
    },
    [socket]
  );

  useEffect(() => {
    dispatch(getUserLists());
  }, []);

  useEffect(() => {
    getFavouriteUsers();
    getCollaborateUsers();
  }, [getFavouriteUsers, getCollaborateUsers]);

  return (
    <>
      {activeTeam && (
        <>
          <DialogContent>
            <Stack direction={'row'} justifyContent={'center'}>
              Teams
            </Stack>
            <MainCard sx={{ mt: 2 }}>
              <Grid container justifyContent={'center'} spacing={2}>
                <Grid item xs={10} sm={6}>
                  <TabContext value={value}>
                    <Stack
                      sx={{ borderBottom: 1, borderColor: 'divider' }}
                      direction={'row'}
                      alignItems={'center'}
                      justifyContent={'space-between'}
                    >
                      <TabList onChange={handleChange}>
                        <Tab label="Available Users" value={'tab-1'} />
                        <Tab label="Teams" value={'tab-2'} />
                      </TabList>
                      <Box>
                        <Tooltip title={`${showStars ? 'Hide' : 'Show'} favorite users`}>
                          <IconButton onClick={handleShowStars} sx={{ borderRadius: 20 }}>
                            <StarFilled style={{ transition: 'ease-in-out 0.2s', color: showStars ? 'gold' : 'grey' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Stack>
                    <TabPanel value={'tab-1'} sx={{ p: 0, pt: 1 }}>
                      <List sx={{ height: 400, width: '100%', overflowY: 'scroll' }}>
                        {users
                          .filter(
                            (item) =>
                              (showStars ? favourites.includes(item.email) : true) &&
                              (favourites.includes(item.email) || collaborates.includes(item.email) || !item.setting.hide)
                          )
                          .map((item, key) => (
                            <UserItem
                              user={item}
                              key={key}
                              favourites={favourites}
                              setFavourites={setFavouriteUser}
                              setLeader={setNewTeamLeader}
                            />
                          ))}
                      </List>
                    </TabPanel>
                    <TabPanel value={'tab-2'} sx={{ p: 0, pt: 1 }}>
                      <List sx={{ height: 400, width: '100%', overflowY: 'scroll' }}>
                        {leaders
                          .filter((item) => (showStars ? favourites.includes(item.email) : true))
                          .map((item, key) => (
                            <LeaderItem
                              key={key}
                              user={item}
                              me={me}
                              team={document?.team}
                              creator={document?.creator}
                              activeTeam={activeTeam}
                              blocked={blocked}
                              removeTeam={handleRemoveTeam}
                              setActiveTeam={handlesetActiveTeam}
                              favourites={favourites}
                              setFavourites={setFavouriteUser}
                              setBlockTeam={setBlockTeam}
                            />
                          ))}
                      </List>
                    </TabPanel>
                  </TabContext>
                </Grid>
                <Grid item xs={10} sm={6}>
                  <NewTeam
                    socket={socket}
                    users={users}
                    allUsers={allUsers}
                    favourites={favourites}
                    newTeamLeader={newTeamLeader}
                    showStars={showStars}
                  />
                </Grid>
              </Grid>
            </MainCard>
          </DialogContent>
          <DeleteDialog open={openDeleteDlg} handleClose={handlePerformRemoveTeam} newTeam={newTeam} oldTeam={oldTeam} />
        </>
      )}
    </>
  );
};

export const LeaderItem = ({
  user,
  me,
  creator = {},
  team,
  activeTeam,
  blocked,
  removeTeam,
  setActiveTeam,
  favourites,
  setFavourites,
  setBlockTeam,
  edit = true
}) => {
  const handleRemoveTeam = useCallback(() => {
    if (edit) removeTeam(user.team, user._id === me._id ? team : me.team);
    else removeTeam(user._id);
  }, [user, me, team, removeTeam, edit]);

  const handleSetActiveTeam = useCallback(() => {
    setActiveTeam(user.team);
  }, [user, setActiveTeam]);

  const handleSetBlockTeam = useCallback(() => {
    if (creator._id === me._id) setBlockTeam(user.team, true);
  }, [user, setBlockTeam, creator, me]);

  const handleRemoveBlockTeam = useCallback(() => {
    if (creator._id === me._id) setBlockTeam(user.team, false);
  }, [user, setBlockTeam, creator, me]);

  const handleClickStar = useCallback(() => {
    setFavourites(user.email, !favourites.includes(user.email));
  }, [setFavourites, favourites, user]);

  return (
    <ListItemButton sx={{ borderBottom: '1px solid', borderColor: 'divider' }} divider>
      <ListItemIcon>
        <IconButton onClick={handleClickStar} sx={{ borderRadius: 20 }}>
          {favourites.includes(user.email) ? (
            <StarFilled style={{ fontSize: 20, color: 'gold' }} />
          ) : (
            <StarOutline style={{ fontSize: 20, color: 'gold' }} />
          )}
        </IconButton>
      </ListItemIcon>
      <Grid>
        <Stack direction={'row'} justifyContent={'space-between'}>
          <Stack direction={'row'} alignItems={'center'}>
            <Typography variant="subtitle1" color={creator._id === user._id ? 'textSecondary' : 'textPrimary'} sx={{ ml: 2, mr: 2 }}>
              {user.team}
            </Typography>
            {creator._id === user._id && (
              <Tooltip title="Creator's Team">
                <IconButton size="small" color="primary">
                  <BackgroundLetterAvatar name={'C'} sx={{ width: 24, height: 24, background: '#fee', color: '#777' }} />
                </IconButton>
              </Tooltip>
            )}
            {edit && me.team === user.team && (
              <Tooltip title="Your Team">
                <IconButton size="small" color="primary">
                  <BackgroundLetterAvatar name={'M'} sx={{ width: 24, height: 24, background: '#efe', color: '#777' }} />
                </IconButton>
              </Tooltip>
            )}
            {edit && ((creator._id === me._id && !user.invitor) || user.invitor === me._id) && (
              <Tooltip title="Team you have created">
                <IconButton size="small" color="primary">
                  <BackgroundLetterAvatar name={'Y'} sx={{ width: 24, height: 24, background: '#eef', color: '#777' }} />
                </IconButton>
              </Tooltip>
            )}
            {edit && user.team === activeTeam && (
              <Tooltip title="Active Team">
                <IconButton size="small" color="primary">
                  <BackgroundLetterAvatar name={'A'} sx={{ width: 24, height: 24, background: '#edf', color: '#777' }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
          <ButtonGroup variant="text">
            {user.team !== activeTeam && ((creator._id !== user._id && me.leader) || user.invitor === me._id) && (
              <Tooltip title="Remove Team">
                <IconButton color="error" onClick={handleRemoveTeam}>
                  <DeleteOutlined />
                </IconButton>
              </Tooltip>
            )}
            {edit && user.team !== activeTeam && me.leader && (me.team === activeTeam || me._id === creator._id) && (
              <Tooltip title="Set Active Team">
                <IconButton color="primary" onClick={handleSetActiveTeam}>
                  <CheckOutlined />
                </IconButton>
              </Tooltip>
            )}
            {edit && user.team !== activeTeam && creator._id !== user._id && (
              <Tooltip title="Show/Hide document contents">
                {blocked.includes(user.team) ? (
                  <IconButton color="warning" onClick={handleRemoveBlockTeam}>
                    <EyeInvisibleOutlined />
                  </IconButton>
                ) : (
                  <IconButton color="info" onClick={handleSetBlockTeam}>
                    <EyeOutlined />
                  </IconButton>
                )}
              </Tooltip>
            )}
          </ButtonGroup>
        </Stack>
        <Stack flexGrow={'inherit'} direction={'row'} alignItems={'center'} spacing={0.3} width={'100%'} flexWrap={'wrap'}>
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
      </Grid>
    </ListItemButton>
  );
};

export const UserItem = ({ user, favourites = [], setFavourites, setLeader, makeTeam = true }) => {
  const [show, setShow] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setShow(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShow(false);
  }, []);

  const handleClickStar = useCallback(() => {
    setFavourites(user.email, !favourites.includes(user.email));
  }, [setFavourites, favourites, user]);

  const handleSetTeamLeader = useCallback(
    (e) => {
      e.stopPropagation();
      setLeader(user.email);
    },
    [setLeader, user]
  );

  return (
    <ListItemButton role="listitem" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} divider>
      <ListItemIcon>
        <IconButton onClick={handleClickStar} sx={{ borderRadius: 20 }}>
          {favourites.includes(user.email) ? (
            <StarFilled style={{ fontSize: 20, color: 'gold' }} />
          ) : (
            <StarOutline style={{ fontSize: 20, color: 'gold' }} />
          )}
        </IconButton>
      </ListItemIcon>
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
            {makeTeam && (
              <Box
                sx={{
                  position: 'absolute',
                  right: '20px',
                  top: '10px',
                  visibility: show ? 'visible' : 'hidden',
                  width: 20,
                  height: 20,
                  borderRadius: 10
                }}
                onClick={handleClickStar}
              >
                <Tooltip title="Add new Team with this user">
                  <IconButton sx={{ borderRadius: 20 }} onClick={handleSetTeamLeader}>
                    <ArrowRightOutlined style={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Stack>
        }
      />
    </ListItemButton>
  );
};

const NewTeam = ({ socket, allUsers, favourites, users, newTeamLeader, showStars }) => {
  const me = useSelector((state) => state.document.me);
  const leaders = useSelector((state) => state.document.leaders);
  const emails = useSelector((state) => state.document.emails);
  const [error, setError] = useState({ teamName: '' });
  const [teamName, setTeamName] = useState('');
  const [teamLeader, setTeamLeader] = useState('');
  const [teamLeaderInputValue, setTeamLeaderInputValue] = useState('');

  const [openDlg, toggleOpenDlg] = useState(false);
  const [openCDlg, toggleOpenCDlg] = useState(false);

  const handleCloseCDlg = useCallback((res = false) => {
    toggleOpenCDlg(false);
    toggleOpenDlg(res);
  }, []);

  const handleCloseDlg = useCallback((email = '') => {
    toggleOpenDlg(false);
    if (email) {
      setTeamLeader(email);
    }
  }, []);

  useEffect(() => {
    setTeamLeader(newTeamLeader);
  }, [newTeamLeader]);

  const handleTeamNameChange = useCallback(({ target: { value } }) => {
    setTeamName(value);
    setError({ teamName: '' });
  }, []);

  const getTeamUserFromUsers = useCallback(
    (email) => {
      const user = users.find((item) => item.email === email);
      if (!user) return null;
      const { _id, name, avatar, status, mobilePhone, workPhone } = user;
      return { _id, name, email, avatar, status, mobilePhone, workPhone };
    },
    [users]
  );

  const handleSave = useCallback(() => {
    if (!teamName) {
      setError({ teamName: '* You have to type team name' });
      return;
    }
    if (leaders.map((item) => item.team).includes(teamName)) {
      setError({ teamName: '* Team of this name is already exist' });
      return;
    }
    (async () => {
      try {
        if (emails.includes(teamLeader)) {
          socket.send(JSON.stringify({ type: 'add-team', teamName, teamLeader: getTeamUserFromUsers(teamLeader)._id }));
        } else {
          socket.send(
            JSON.stringify({
              type: 'add-new-team',
              teamName,
              teamLeader: getTeamUserFromUsers(teamLeader),
              user: { _id: me._id, email: me.email, name: me.name, avatar: me.avatar, status: me.status, role: me.role }
            })
          );
        }
        setTeamLeader('');
        setTeamName('');
        dispatch(
          openSnackbar({
            open: true,
            message: `Add team successfully.`,
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
            message: `Connection Error! Please refresh page and try again.`,
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
      }
    })();
  }, [leaders, teamName, teamLeader, emails, socket, getTeamUserFromUsers, me]);

  return (
    <Stack spacing={1}>
      <TextField
        id="standard-basic"
        label="Type name of new Team"
        variant="standard"
        sx={{ minWidth: 300, width: '50%' }}
        value={teamName}
        onChange={handleTeamNameChange}
      />
      {error.teamName && <Typography color={'red'}>{error.teamName}</Typography>}
      <FormControl variant="standard">
        <Autocomplete
          disablePortal
          autoHighlight
          id="team-leader-email-select"
          sx={{ minWidth: 300, width: '50%', mt: 2 }}
          options={['', ...users.filter((item) => (showStars ? favourites.includes(item.email) : true)).map((item) => item.email)]}
          renderInput={(params) => <TextField {...params} label="Select Team Leader" />}
          value={teamLeader}
          onChange={(event, v, reason) => {
            setTeamLeader(v);
            console.log(v);
            if (
              (event.type === 'keydown' && event.key === 'Backspace' && reason === 'removeOption') ||
              (event.type === 'change' && reason === 'clear') ||
              !v ||
              allUsers.map((item) => item.email.toLowerCase()).includes(v.toLowerCase())
            )
              return;
            toggleOpenCDlg(true);
          }}
          onInputChange={(e, v) => {
            setTeamLeaderInputValue(v);
          }}
          filterOptions={(options, params) => {
            let filtered = filter(options, params);
            if (
              teamLeaderInputValue &&
              teamLeaderInputValue.includes('@') &&
              teamLeaderInputValue.includes('.') &&
              !allUsers.map((item) => item.email.toLowerCase()).includes(teamLeaderInputValue.toLowerCase())
            )
              filtered.push(`Add "${teamLeaderInputValue}"`);
            return filtered;
          }}
          renderOption={(props, option) => (
            <ListItemButton {...props}>
              <ListItemIcon>{favourites.includes(option) && <StarFilled style={{ fontSize: 15, color: 'gold' }} />}</ListItemIcon>
              <ListItemText>{option}</ListItemText>
            </ListItemButton>
          )}
          getOptionLabel={(option) => {
            if (option.includes('"')) return teamLeaderInputValue;
            return option;
          }}
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          freeSolo
        />
      </FormControl>
      {teamLeader && users.find((item) => item.email === teamLeader) && (
        <Stack direction={'row'}>
          <TeamLeaderItem user={users.find((item) => item.email === teamLeader)} />
          <Box>
            <Button variant="outlined" size="small" color="primary" onClick={handleSave} endIcon={<SaveOutlined />}>
              Add
            </Button>
          </Box>
        </Stack>
      )}
      {openCDlg && <AddNewInviteConfirmDlg open={openCDlg} onClose={handleCloseCDlg} />}
      {openDlg && <AddNewInviteDlg open={openDlg} email={teamLeaderInputValue} onClose={handleCloseDlg} />}
    </Stack>
  );
};

export const TeamLeaderItem = ({ user = {} }) => {
  return (
    <Stack direction="row" spacing={2}>
      <UserAvatar
        user={{
          online_status: 'none',
          avatar: user.avatar,
          name: user.name
        }}
      />
      <Stack spacing={1}>
        <Typography variant="subtitle1">{user.name}</Typography>
        <Typography variant="caption" color="textSecondary">
          {user.email}
        </Typography>
        <Typography variant="" color="textSecondary">
          <MobileOutlined style={{ borderRadius: '10px' }} />
          <PatternFormat displayType="text" format=" +1 (###) ###-####" mask="_" defaultValue={user.mobilePhone} />
        </Typography>
        <Typography variant="" color="textSecondary">
          <PhoneOutlined />
          <PatternFormat displayType="text" format=" +1 (###) ###-####" mask="_" defaultValue={user.workPhone} />
        </Typography>
        <Stack direction={'row'}>
          <Typography color={'textSecondary'} textAlign={'center'}>
            Status:
          </Typography>
          <StatusCell value={user.status} />
        </Stack>
      </Stack>
    </Stack>
  );
};

const DeleteDialog = ({ newTeam, oldTeam, open, handleClose }) => {
  const handleCancel = useCallback(() => {
    handleClose(0);
  }, [handleClose]);

  const handleRemove1 = useCallback(() => {
    handleClose(1);
  }, [handleClose]);

  const handleRemove2 = useCallback(() => {
    handleClose(2);
  }, [handleClose]);

  return (
    <Dialog onClose={handleCancel} open={open}>
      <DialogTitle>Are you sure delete &quot;{oldTeam}&quot; team?</DialogTitle>
      <DialogContent>
        <List sx={{ pt: 0 }}>
          <ListItem disableGutters>
            <ListItemButton autoFocus onClick={handleRemove1}>
              <ListItemAvatar>
                <Avatar>
                  <DeleteOutlined />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={`Yes. Delete team "${oldTeam}" and put all its members into team "${newTeam}" (your team).`} />
            </ListItemButton>
          </ListItem>
          <ListItem disableGutters>
            <ListItemButton autoFocus onClick={handleRemove2}>
              <ListItemAvatar>
                <Avatar>
                  <DeleteOutlined />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={`Yes. Delete team "${oldTeam}" and remove all its members from this document.`} />
            </ListItemButton>
          </ListItem>
          <ListItem disableGutters>
            <ListItemButton autoFocus onClick={handleCancel}>
              <ListItemAvatar>
                <Avatar>
                  <CloseCircleOutlined />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={`No. Don't delete team "${oldTeam}".`} />
            </ListItemButton>
          </ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
};

TeamManagement.propTypes = {
  socket: PropTypes.any
};

NewTeam.propTypes = {
  socket: PropTypes.any,
  allUsers: PropTypes.any,
  users: PropTypes.any,
  favourites: PropTypes.any,
  newTeamLeader: PropTypes.any,
  showStars: PropTypes.any
};

Team.propTypes = {
  onClose: PropTypes.func,
  socket: PropTypes.any
};

TeamLeaderItem.propTypes = {
  user: PropTypes.any
};

UserItem.propTypes = {
  user: PropTypes.any,
  makeTeam: PropTypes.any,
  favourites: PropTypes.any,
  setFavourites: PropTypes.func,
  setLeader: PropTypes.func
};

LeaderItem.propTypes = {
  user: PropTypes.any,
  edit: PropTypes.any,
  blocked: PropTypes.any,
  creator: PropTypes.any,
  me: PropTypes.any,
  activeTeam: PropTypes.any,
  removeTeam: PropTypes.any,
  setActiveTeam: PropTypes.any,
  team: PropTypes.any,
  favourites: PropTypes.any,
  setFavourites: PropTypes.func,
  setBlockTeam: PropTypes.func
};

DeleteDialog.propTypes = {
  newTeam: PropTypes.any,
  oldTeam: PropTypes.any,
  open: PropTypes.any,
  handleClose: PropTypes.any
};
