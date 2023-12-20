import { Link, useLocation } from 'react-router-dom';

// material-ui
import { CircularProgress, Grid, Stack, Typography } from '@mui/material';

// project import
import useAuth from 'hooks/useAuth';
import AuthWrapper from 'sections/auth/AuthWrapper';
import { useEffect } from 'react';
import axiosServices from 'utils/axios';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { LOGIN_ERROR_MESSAGES } from 'config/constants';

// ================================|| LOGIN ||================================ //

const OAuth = () => {
  const { isLoggedIn, setUser } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const accessToken = searchParams.get('access_token') || '';

  useEffect(() => {
    if (accessToken) {
      (async () => {
        try {
          const response = await axiosServices.post('/oauth2/login', { accessToken });
          const { code } = response.data;
          if (code === 'success') {
            const { serviceToken, user } = response.data.data;
            setUser(serviceToken, user);
          } else {
            const { message } = response.data;
            const { status } = response.data.data;
            dispatch(
              openSnackbar({
                open: true,
                message: message ?? LOGIN_ERROR_MESSAGES[status].message,
                variant: 'alert',
                alert: {
                  color: message ? 'error' : LOGIN_ERROR_MESSAGES[status].color
                },
                close: true
              })
            );
          }
        } catch (error) {
          dispatch(
            openSnackbar({
              open: true,
              message: error.toString(),
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
        }
      })();
    }
  }, [accessToken, setUser]);

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Login</Typography>
            <Typography
              component={Link}
              to={isLoggedIn ? '/auth/register' : '/register'}
              variant="body1"
              sx={{ textDecoration: 'none' }}
              color="primary"
            >
              Don&apos;t have an account?
            </Typography>
          </Stack>
          <Stack direction={'row'} justifyContent={'center'} alignItems={'center'} sx={{ width: 400, height: 400 }}>
            <CircularProgress size={80} />
          </Stack>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
};

export default OAuth;
