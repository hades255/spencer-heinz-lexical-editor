import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { CheckOutlined, DeleteOutlined, MobileOutlined, PhoneOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Dialog,
  DialogContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
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
                Add Team
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

  const handleRemoveTeam = useCallback(
    (oldTeam, newTeam) => {
      if (!window.confirm(`Do you really want to delete team ${oldTeam} and put all its members into team ${newTeam}?`)) return;
      (async () => {
        (async () => {
          try {
            socket.send(JSON.stringify({ type: 'remove-team', oldTeam, newTeam }));
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

  return (
    <>
      {activeTeam && (
        <DialogContent>
          <Stack direction={'row'} justifyContent={'center'}>
            Add / Remove Teams
          </Stack>
          <MainCard sx={{ mt: 2 }}>
            <Grid container justifyContent={'center'} spacing={2}>
              <Grid item xs={10} sm={6}>
                <List sx={{ m: 2, height: 400, width: 400, overflowY: 'scroll' }}>
                  <ListItem>
                    <Typography variant="subtitle1" color={'secondary'}>
                      All Teams
                    </Typography>
                  </ListItem>
                  {leaders.map((item, key) => (
                    <LeaderItem
                      key={key}
                      user={item}
                      me={me}
                      creator={document?.creator}
                      activeTeam={activeTeam}
                      removeTeam={handleRemoveTeam}
                      setActiveTeam={handlesetActiveTeam}
                    />
                  ))}
                </List>
              </Grid>
              <Grid item xs={10} sm={6}>
                <NewTeam socket={socket} />
              </Grid>
            </Grid>
          </MainCard>
        </DialogContent>
      )}
    </>
  );
};

const LeaderItem = ({ user, me, creator = {}, activeTeam, removeTeam, setActiveTeam }) => {
  const handleRemoveTeam = useCallback(() => {
    removeTeam(user.team, user._id === me._id ? creator.team : me.team);
  }, [user, me, creator, removeTeam]);

  const handleSetActiveTeam = useCallback(() => {
    setActiveTeam(user.team);
  }, [user, setActiveTeam]);

  return (
    <ListItemButton sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
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
            {me.team === user.team && (
              <Tooltip title="Your Team">
                <IconButton size="small" color="primary">
                  <BackgroundLetterAvatar name={'M'} sx={{ width: 24, height: 24, background: '#efe', color: '#777' }} />
                </IconButton>
              </Tooltip>
            )}
            {((creator._id === me._id && !user.invitor) || user.invitor === me._id) && (
              <Tooltip title="Team you have created">
                <IconButton size="small" color="primary">
                  <BackgroundLetterAvatar name={'Y'} sx={{ width: 24, height: 24, background: '#eef', color: '#777' }} />
                </IconButton>
              </Tooltip>
            )}
            {user.team === activeTeam && (
              <Tooltip title="Active Team">
                <IconButton size="small" color="primary">
                  <BackgroundLetterAvatar name={'A'} sx={{ width: 24, height: 24, background: '#edf', color: '#777' }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
          <ButtonGroup variant="text">
            {creator._id !== user._id && user._id !== me._id && me.leader && user.team !== activeTeam && (
              <Tooltip title="Remove Team">
                <IconButton color="error" onClick={handleRemoveTeam}>
                  <DeleteOutlined />
                </IconButton>
              </Tooltip>
            )}
            {user.team !== activeTeam && me.leader && (me.team === activeTeam || me._id === creator._id) && (
              <Tooltip title="Set Active Team">
                <IconButton color="primary" onClick={handleSetActiveTeam}>
                  <CheckOutlined />
                </IconButton>
              </Tooltip>
            )}
          </ButtonGroup>
        </Stack>
        <Stack flexGrow={'inherit'} direction={'row'} alignItems={'center'} spacing={0.3} width={'100%'} flexWrap={'wrap'}>
          <Box sx={{ width: '30%', minWidth: 180 }}>
            <CustomCell user={user} />
          </Box>
          <Stack sx={{ width: '30%', minWidth: 150 }} spacing={0}>
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

const NewTeam = ({ socket }) => {
  const leaders = useSelector((state) => state.document.leaders);
  const users = useSelector((state) => state.document.users);
  const [error, setError] = useState({ teamName: '' });
  const [teamName, setTeamName] = useState('');
  const [teamLeader, setTeamLeader] = useState('');

  const handleTeamNameChange = useCallback(({ target: { value } }) => {
    setTeamName(value);
    setError({ teamName: '' });
  }, []);
  const handleTeamLeaderChange = useCallback(({ target: { value } }) => setTeamLeader(value), []);

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
        socket.send(JSON.stringify({ type: 'add-team', teamName, teamLeader }));
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
  }, [leaders, teamName, teamLeader, socket]);

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
        <InputLabel id="team-leader-email-label">Select Leader</InputLabel>
        <Select
          labelId="team-leader-email-label"
          id="team-leader-email"
          sx={{ minWidth: 300, width: '50%' }}
          value={teamLeader}
          onChange={handleTeamLeaderChange}
        >
          {users
            .filter((item) => !item.leader)
            .map((item, key) => (
              <MenuItem key={key} value={item._id}>
                {item.email}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      {teamLeader && (
        <Stack direction={'row'}>
          <TeamLeaderItem user={users.find((item) => item._id === teamLeader)} />
          <Box>
            <Button variant="outlined" size="small" color="primary" onClick={handleSave} endIcon={<SaveOutlined />}>
              Add
            </Button>
          </Box>
        </Stack>
      )}
    </Stack>
  );
};

const TeamLeaderItem = ({ user }) => {
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
        <Stack direction={'row'}>
          <Typography color={'textSecondary'} textAlign={'center'}>
            Reply:
          </Typography>
          <Chip
            label={user.reply.toUpperCase()}
            size="small"
            variant="light"
            color={user.reply === 'accept' ? 'success' : user.reply === 'pending' ? 'primary' : 'info'}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

TeamManagement.propTypes = {
  socket: PropTypes.any
};

NewTeam.propTypes = {
  socket: PropTypes.any
};

Team.propTypes = {
  onClose: PropTypes.func,
  socket: PropTypes.any
};

TeamLeaderItem.propTypes = {
  user: PropTypes.any
};

LeaderItem.propTypes = {
  user: PropTypes.any,
  creator: PropTypes.any,
  me: PropTypes.any,
  activeTeam: PropTypes.any,
  removeTeam: PropTypes.any,
  setActiveTeam: PropTypes.any
};
