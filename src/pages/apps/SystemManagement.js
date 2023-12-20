import { Button, Grid, Stack, TextField } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import axiosServices from 'utils/axios';

const { default: MainCard } = require('components/MainCard');

const SystemManagement = () => {
  const [state, setState] = useState({ dbpath: '', frontend: '' });

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosServices.get('/system/env');
        setState(res.data.data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const update = useCallback((val) => {
    (async () => {
      try {
        await axiosServices.post('/system/env', val);
        dispatch(
          openSnackbar({
            open: true,
            message: 'Environment variable updated.',
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
            message: 'Error: ' + error.message,
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
      }
    })();
  }, []);

  const handleChange = useCallback(
    ({ target: { name, value } }) => {
      setState({ ...state, [name]: value });
    },
    [state]
  );

  const handleDBUpdate = useCallback(() => {
    update({ dbpath: state.dbpath });
  }, [update, state]);

  const handleFrontendUpdate = useCallback(() => {
    update({ frontend: state.frontend });
  }, [update, state]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <MainCard
          title="Database"
          secondary={
            <Button size="small" variant="contained" onClick={handleDBUpdate} disabled>
              Update
            </Button>
          }
        >
          <Stack spacing={1.25}>
            <TextField
              fullWidth
              name="dbpath"
              id="my-system-dbpath"
              placeholder="Database Path"
              autoFocus
              value={state.dbpath}
              onChange={handleChange}
              disabled
            />
          </Stack>
        </MainCard>
      </Grid>
      <Grid item xs={12} sm={6}>
        <MainCard
          title="Frontend"
          secondary={
            <Button size="small" variant="contained" onClick={handleFrontendUpdate}>
              Update
            </Button>
          }
        >
          <Stack spacing={1.25}>
            <TextField
              fullWidth
              name="frontend"
              id="my-system-frontend"
              placeholder="Frontend Path"
              autoFocus
              value={state.frontend}
              onChange={handleChange}
            />
          </Stack>
        </MainCard>
      </Grid>
      <Grid item xs={12} sm={6}>
        <MainCard
          title="AWS SES"
          secondary={
            <Button size="small" variant="contained">
              Update
            </Button>
          }
        >
          <Stack spacing={1.25}></Stack>
        </MainCard>
      </Grid>
      <Grid item xs={12} sm={6}>
        <MainCard
          title="Google OAuth2 Credentials"
          secondary={
            <Button size="small" variant="contained">
              Update
            </Button>
          }
        >
          <Stack spacing={1.25}></Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default SystemManagement;
