import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { SaveOutlined, UserSwitchOutlined } from '@ant-design/icons';
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddContributor from 'sections/apps/document/AddContributor1';
import UserAvatar from 'sections/apps/user/UserAvatar';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import { not } from 'utils/array';

const TeamManagement = ({ user, allUsers, socket }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const team = user.team;
  let members = [];
  if (team) {
    members = allUsers.filter((item) => item.team === user.team);
  }
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
              if (!user.team || user.leader) setOpen(true);
            }}
          >
            {(!user.team || user.leader) && (
              <Stack spacing={0}>
                <Typography variant="subtitle1" sx={{ textDecorationLine: 'underline', textDecorationColor: 'Highlight' }}>
                  {team ? `Manage Team ${team}` : 'Create Team'}
                </Typography>
              </Stack>
            )}
            {team ? (
              <UserAvatar
                user={{
                  online_status: 'none',
                  ...members.find((item) => item.leader)
                }}
              />
            ) : (
              <Avatar>
                <UserSwitchOutlined style={{ fontSize: '30px', color: '#08c', cursor: 'pointer' }} />
              </Avatar>
            )}
          </Stack>
          <AvatarGroup sx={{ ml: 2 }} max={5}>
            {members
              .filter((item) => !item.leader)
              .map((item, key) => (
                <UserAvatar
                  key={key}
                  user={{
                    online_status: 'none',
                    avatar: item.avatar,
                    name: item.name,
                    email: item.email
                  }}
                />
              ))}
          </AvatarGroup>
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
        {open && (
          <Team
            team={team}
            exist={team ? members : [user]}
            user={user}
            users={allUsers.filter((item) => !item.team || item.team === team)}
            onClose={setOpen}
            socket={socket}
          />
        )}
      </Dialog>
    </>
  );
};

export default TeamManagement;

const Team = ({ team, exist, users, onClose, user, socket }) => {
  const [value, setValue] = useState(exist.map((item) => item.email));
  const [name, setName] = useState(team || '');

  const handleChange = useCallback(({ target: { value } }) => {
    setName(value);
  }, []);

  const handleSave = useCallback(() => {
    if (name && value.length) {
      const v = users.filter((item) => value.includes(item.email)).map((item) => item._id);
      if (team) {
        const old = exist.map((item) => item._id);
        const a = not(v, old);
        const r = not(old, v);
        const _v = not(v, a);
        socket.send(JSON.stringify({ type: 'edit-team', name, team: name !== team, a, r, value: _v }));
      } else {
        socket.send(JSON.stringify({ type: 'new-team', name, value: v }));
      }
      onClose(false);
    }
  }, [team, exist, value, name, onClose, socket, users]);

  return (
    <DialogContent>
      <Stack direction={'row'} justifyContent={'center'}>
        <Typography variant="subtitle1">{user.team ? 'Team management' : 'Create your Team'}</Typography>
      </Stack>
      <MainCard sx={{ mt: 1, minHeight: '50vh' }}>
        <Stack direction={'row'} justifyContent={'space-between'} sx={{ mb: 3 }}>
          <TextField
            id="standard-basic"
            label="Type name of Team"
            variant="standard"
            sx={{ minWidth: 300, width: '50%' }}
            value={name}
            onChange={handleChange}
            disabled={team ? true : false}
          />
          <Box>
            <Button size="small" variant="outlined" color="primary" onClick={handleSave} endIcon={<SaveOutlined />}>
              Save
            </Button>
          </Box>
        </Stack>
        <AddContributor
          users={users}
          value={value}
          onChange={setValue}
          exist={exist}
          mine={exist.find((item) => item.leader)}
          user={user}
          team
        />
      </MainCard>
    </DialogContent>
  );
};

TeamManagement.propTypes = {
  user: PropTypes.any,
  allUsers: PropTypes.any,
  socket: PropTypes.any
};

Team.propTypes = {
  exist: PropTypes.any,
  users: PropTypes.any,
  onClose: PropTypes.any,
  user: PropTypes.any,
  socket: PropTypes.any,
  team: PropTypes.any
};
