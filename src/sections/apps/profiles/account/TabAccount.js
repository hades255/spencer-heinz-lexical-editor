import { useCallback, useContext, useEffect, useState } from 'react';

// material-ui
import {
  Button,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip
} from '@mui/material';
import * as Yup from 'yup';

// project import
import MainCard from 'components/MainCard';
import AuthContext from 'contexts/JWTContext';
import useAuth from 'hooks/useAuth';
import { UserItem } from 'pages/apps/document/TeamManagement';
import { useSelector } from 'store';
import { dispatch } from 'store';
import { getUserLists } from 'store/reducers/user';
import axiosServices from 'utils/axios';
import { openSnackbar } from 'store/reducers/snackbar';
import TabPassword from './TabPassword';
import DeleteAccount from './DeleteAccount';
import countries from 'data/countries';

// ==============================|| ACCOUNT PROFILE - MY ACCOUNT ||============================== //

const validator = Yup.object().shape({
  name: Yup.string().max(255).required('Name is required'),
  email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
  mobilePhone: Yup.number()
    .test('len', 'Contact should be exactly 10 digit', (val) => val?.toString().length === 10)
    .required('Mobile Phone number is required'),
  workPhone: Yup.number()
    .test('len', 'Contact should be exactly 10 digit', (val) => val?.toString().length === 10)
    .required('Mobile Phone number is required')
});

const TabAccount = () => {
  const user = useContext(AuthContext).user;
  const users = useSelector((state) => state.user.lists);
  const [loading, setLoading] = useState(true);
  const { init } = useAuth();

  useEffect(() => {
    if (loading) {
      setLoading(false);
      init();
    }
  }, [init, loading]);

  useEffect(() => {
    dispatch(getUserLists());
  }, []);

  // console.log(user);
  const { name, email, favourite, setting, countryCode, mobilePhone, workPhone, company } = user;
  const [state, setState] = useState({ name, email, countryCode, mobilePhone, workPhone, company });
  const [favUsers, setFavUsers] = useState(favourite || []);

  const [checked, setChecked] = useState({ ...setting });

  const handleSetChangedSetting = useCallback(
    (data) => {
      (async () => {
        try {
          await axiosServices.put('/user/' + user._id + '/setting', data);
          dispatch(
            openSnackbar({
              open: true,
              message: `Setting changed successfully.`,
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
              message: `Server connection error. Try again later.`,
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
    [user]
  );

  const handleToggle = useCallback(
    ({ target: { name, checked: check } }) => {
      setChecked({ ...checked, [name]: check });
      handleSetChangedSetting({ [name]: check });
    },
    [checked, handleSetChangedSetting]
  );

  const handleInputChange = useCallback(
    ({ target: { name, value } }) => {
      setState({ ...state, [name]: value });
    },
    [state]
  );

  const handleSetFavourites = useCallback(
    (email, flag) => {
      if (!window.confirm('Are you sure to delete this user from the favorite list?')) return;
      (async () => {
        try {
          const res = await axiosServices.put('/user/favourite', { email, flag });
          const { email: _email, flag: _flag } = res.data.data;
          const f = favUsers.filter((item) => item !== _email);
          setFavUsers(_flag ? [...f, _email] : f);
          dispatch(
            openSnackbar({
              open: true,
              message: `Setting changed successfully.`,
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
              message: `Server connection error. Try again later.`,
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
    [favUsers]
  );

  const handleSubmitState = useCallback(() => {
    (async () => {
      try {
        await validator.validate(state);
        await axiosServices.put('/user/' + user._id + '/info', state);
        init();
        dispatch(
          openSnackbar({
            open: true,
            message: `Setting changed successfully.`,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
      } catch (error) {
        if (error.name === 'ValidationError') {
          dispatch(
            openSnackbar({
              open: true,
              message: error.message,
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
        } else {
          dispatch(
            openSnackbar({
              open: true,
              message: `Server connection error. Try again later.`,
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
        }
      }
    })();
  }, [state, user, init]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard
          title="General Settings"
          secondary={
            <Button size="small" variant="contained" onClick={handleSubmitState}>
              Update Account
            </Button>
          }
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="my-account-username">Username</InputLabel>
                <TextField
                  fullWidth
                  defaultValue={state.name}
                  name="name"
                  onChange={handleInputChange}
                  id="my-account-username"
                  placeholder="Username"
                  autoFocus
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="my-account-email">Account Email</InputLabel>
                <TextField
                  fullWidth
                  defaultValue={state.email}
                  name="email"
                  onChange={handleInputChange}
                  id="my-account-email"
                  placeholder="Account Email"
                  disabled={true}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="mobilePhone-signup">Mobile Phone Number</InputLabel>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <Select value={state.countryCode} name="countryCode" onChange={handleInputChange}>
                    {countries.map((item, key) => (
                      <MenuItem key={key} value={item.phone}>
                        <Tooltip title={item.label} arrow>
                          <span>
                            {item.code} {item.phone}
                          </span>
                        </Tooltip>
                      </MenuItem>
                    ))}
                  </Select>
                  <OutlinedInput
                    fullWidth
                    id="mobilePhone-signup"
                    type="mobilePhone"
                    value={state.mobilePhone}
                    name="mobilePhone"
                    onChange={handleInputChange}
                    placeholder="Mobile Phone Number"
                    inputProps={{}}
                  />
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="workPhone-signup">Work Phone Number</InputLabel>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <Select value={state.countryCode} name="countryCode" onChange={handleInputChange}>
                    {countries.map((item, key) => (
                      <MenuItem key={key} value={item.phone}>
                        <Tooltip title={item.label} arrow>
                          <span>
                            {item.code} {item.phone}
                          </span>
                        </Tooltip>
                      </MenuItem>
                    ))}
                  </Select>
                  <OutlinedInput
                    fullWidth
                    id="workPhone-signup"
                    type="workPhone"
                    value={state.workPhone}
                    name="workPhone"
                    onChange={handleInputChange}
                    placeholder="Work Phone Number"
                    inputProps={{}}
                  />
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="company-signup">Company</InputLabel>
                <OutlinedInput
                  fullWidth
                  id="company-signup"
                  value={state.company}
                  name="company"
                  onChange={handleInputChange}
                  placeholder="Demo Inc."
                  inputProps={{}}
                />
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      <Grid item xs={12} sm={6}>
        <MainCard title="Advance Settings" content={false}>
          <List sx={{ p: 0 }}>
            <ListItem divider>
              <ListItemText
                id="switch-list-label-ln"
                primary="Login Notifications"
                secondary="Notify when login attempted from other place"
              />
              <Switch
                edge="end"
                name="loginNotification"
                onChange={handleToggle}
                checked={checked.loginNotification}
                inputProps={{
                  'aria-labelledby': 'switch-list-label-ln'
                }}
              />
            </ListItem>
            <ListItem divider>
              <ListItemText
                id="switch-list-label-sh"
                primary="Secure Searching"
                secondary="Don't show you when others searching in document"
              />
              <Switch
                edge="end"
                name="hide"
                onChange={handleToggle}
                checked={checked.hide}
                inputProps={{
                  'aria-labelledby': 'switch-list-label-sh'
                }}
              />
            </ListItem>
          </List>
        </MainCard>
      </Grid>
      <Grid item xs={12} sm={6}>
        <MainCard title="Favourite Users" content={false}>
          <List sx={{ p: 0, minHeight: 142, maxHeight: 300, overflowY: 'scroll' }}>
            {users
              .filter((item) => favUsers.includes(item.email))
              .map((item, key) => (
                <UserItem key={key} user={item} favourites={favUsers} makeTeam={false} setFavourites={handleSetFavourites} />
              ))}
          </List>
        </MainCard>
      </Grid>
      <TabPassword />
      <DeleteAccount />
      {/* <Grid item xs={12} sm={6}>
        <MainCard title="Advance Settings" content={false}>
          <List sx={{ p: 0 }}>
            <ListItem divider>
              <ListItemText
                id="switch-list-label-sb"
                primary="Secure Browsing"
                secondary="Browsing Securely ( https ) when it's necessary"
              />
              <Switch
                edge="end"
                onChange={handleToggle('sb')}
                checked={checked.indexOf('sb') !== -1}
                inputProps={{
                  'aria-labelledby': 'switch-list-label-sb'
                }}
              />
            </ListItem>
            <ListItem divider>
              <ListItemText
                id="switch-list-label-ln"
                primary="Login Notifications"
                secondary="Notify when login attempted from other place"
              />
              <Switch
                edge="end"
                onChange={handleToggle('ln')}
                checked={checked.indexOf('ln') !== -1}
                inputProps={{
                  'aria-labelledby': 'switch-list-label-ln'
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                id="switch-list-label-la"
                primary="Login Approvals"
                secondary="Approvals is not required when login from unrecognized devices."
              />
              <Switch
                edge="end"
                onChange={handleToggle('la')}
                checked={checked.indexOf('la') !== -1}
                inputProps={{
                  'aria-labelledby': 'switch-list-label-la'
                }}
              />
            </ListItem>
          </List>
        </MainCard>
      </Grid>
      <Grid item xs={12} sm={6}>
        <MainCard title="Recognized Devices" content={false}>
          <List sx={{ p: 0 }}>
            <ListItem divider>
              <ListItemText primary="Cent Desktop" secondary="4351 Deans Lane, Chelmsford" />
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ width: 6, height: 6, bgcolor: 'success.main', borderRadius: '50%' }} />
                <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>Active</Typography>
              </Stack>
            </ListItem>
            <ListItem divider>
              <ListItemText primary="Imho Tablet" secondary="4185 Michigan Avenue" />
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ width: 6, height: 6, bgcolor: 'secondary.main', borderRadius: '50%' }} />
                <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>Active 5 days ago</Typography>
              </Stack>
            </ListItem>
            <ListItem>
              <ListItemText primary="Albs Mobile" secondary="3462 Fairfax Drive, Montcalm" />
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ width: 6, height: 6, bgcolor: 'secondary.main', borderRadius: '50%' }} />
                <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>Active 1 month ago</Typography>
              </Stack>
            </ListItem>
          </List>
        </MainCard>
      </Grid>
      <Grid item xs={12}>
        <MainCard title="Active Sessions" content={false}>
          <List sx={{ p: 0 }}>
            <ListItem divider>
              <ListItemText primary={<Typography variant="h5">Cent Desktop</Typography>} secondary="4351 Deans Lane, Chelmsford" />
              <Button>Logout</Button>
            </ListItem>
            <ListItem>
              <ListItemText primary={<Typography variant="h5">Moon Tablet</Typography>} secondary="4185 Michigan Avenue" />
              <Button>Logout</Button>
            </ListItem>
          </List>
        </MainCard>
      </Grid> */}
    </Grid>
  );
};

export default TabAccount;
