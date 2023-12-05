import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { SaveOutlined, StarFilled } from '@ant-design/icons';
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tab,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import { dispatch } from 'store';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { getUserLists } from 'store/reducers/user';
import axiosServices from 'utils/axios';
import { LeaderItem, TeamLeaderItem, UserItem } from './TeamManagement';

const AddTeamLeaders = ({ me, allUsers, defaultTeam, leaders, setLeaders }) => {
  const leaderEmails = leaders.map((item) => item.email);
  const users = allUsers.filter((item) => !item.setting?.hide && !leaderEmails.includes(item.email) && item.email !== me.email);
  const [favourites, setFavourites] = useState([]);
  const [showStars, setShowStars] = useState(false);
  const [value, setValue] = useState('tab-1');
  const [newTeamLeader, setNewTeamLeader] = useState(users[0]?.email);

  const handleShowStars = useCallback(() => {
    setShowStars(!showStars);
  }, [showStars]);

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

  const handleChange = useCallback((event, newValue) => {
    setValue(newValue);
  }, []);

  const handleNewTeam = useCallback(
    (team, leader) => {
      setLeaders([...leaders, { ...leader, leader: true, team, invitor: me._id, reply: 'pending' }]);
      setNewTeamLeader(users[0]?.email);
    },
    [leaders, me, setLeaders, users]
  );

  const handleRemoveTeam = useCallback(
    (userId) => {
      setLeaders(leaders.filter((item) => item._id !== userId));
    },
    [leaders, setLeaders]
  );

  useEffect(() => {
    dispatch(getUserLists());
  }, []);

  useEffect(() => {
    getFavouriteUsers();
  }, [getFavouriteUsers]);

  return (
    <>
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
                    .filter((item) => (showStars ? favourites.includes(item.email) : true))
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
                  <LeaderItem
                    user={{ ...me, team: defaultTeam, leader: true }}
                    me={me}
                    team={defaultTeam}
                    creator={me}
                    activeTeam={''}
                    removeTeam={handleRemoveTeam}
                    setActiveTeam={() => {}}
                    favourites={favourites}
                    setFavourites={setFavouriteUser}
                    edit={false}
                  />
                  {leaders
                    .filter((item) => (showStars ? favourites.includes(item.email) : true))
                    .map((item, key) => (
                      <LeaderItem
                        key={key}
                        user={item}
                        me={me}
                        team={defaultTeam}
                        creator={me}
                        activeTeam={''}
                        removeTeam={handleRemoveTeam}
                        setActiveTeam={() => {}}
                        favourites={favourites}
                        setFavourites={setFavouriteUser}
                        edit={false}
                      />
                    ))}
                </List>
              </TabPanel>
            </TabContext>
          </Grid>
          <Grid item xs={10} sm={6}>
            <NewTeam users={users} leaders={leaders} favourites={favourites} newTeamLeader={newTeamLeader} addTeam={handleNewTeam} />
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
};

export default AddTeamLeaders;

const NewTeam = ({ favourites, users, newTeamLeader, leaders, addTeam }) => {
  const [error, setError] = useState({ teamName: '' });
  const [teamName, setTeamName] = useState('');
  const [teamLeader, setTeamLeader] = useState(users[0]?.email);

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
    addTeam(teamName, getTeamUserFromUsers(teamLeader));
  }, [teamName, teamLeader, getTeamUserFromUsers, addTeam, leaders]);

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
          options={users.map((item) => item.email)}
          renderInput={(params) => <TextField {...params} label="Select Team Leader" />}
          value={teamLeader}
          onChange={(e, v) => setTeamLeader(v)}
          renderOption={(props, option, { selected }, { options }) =>
            options.includes(option) ? (
              <ListItemButton {...props}>
                <ListItemIcon>{favourites.includes(option) && <StarFilled style={{ fontSize: 15, color: 'gold' }} />}</ListItemIcon>
                <ListItemText>{option}</ListItemText>
              </ListItemButton>
            ) : (
              <></>
            )
          }
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
    </Stack>
  );
};

AddTeamLeaders.propTypes = {
  me: PropTypes.any,
  allUsers: PropTypes.any,
  defaultTeam: PropTypes.any,
  leaders: PropTypes.any,
  setLeaders: PropTypes.any
};

NewTeam.propTypes = {
  users: PropTypes.any,
  leaders: PropTypes.any,
  favourites: PropTypes.any,
  newTeamLeader: PropTypes.any,
  addTeam: PropTypes.func
};
