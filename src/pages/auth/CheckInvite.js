import { Link, useNavigate, useParams } from 'react-router-dom';

// material-ui
import { Button, Divider, Grid, Stack, Typography } from '@mui/material';

// project import
import useAuth from 'hooks/useAuth';
import AuthWrapper from 'sections/auth/AuthWrapper';
import { useCallback, useEffect, useState } from 'react';
import axiosServices from 'utils/axios';
import AnimateButton from 'components/@extended/AnimateButton';
import NewPassword from './NewPassword';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { GoogleOutlined } from '@ant-design/icons';

// ================================|| LOGIN ||================================ //

const CheckInvite = () => {
  const token = useParams().token;
  const navigate = useNavigate();
  const { isLoggedIn, setUser } = useAuth();

  const [c, setC] = useState('');
  const [u, setU] = useState({});
  const [d, setD] = useState({});
  const [creator, setCreator] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const response = await axiosServices.get('/invite?token=' + token);
        setC(response.data.code);
        const { user, document, creator: creator_ } = response.data.data;
        setU(user);
        setD(document);
        setCreator(creator_);
      } catch (error) {
        console.log(error);
        setC('error');
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
  }, [token, navigate]);

  const GO = useCallback(
    (t) => {
      if (c === 'success') {
        setUser(t, u);
        navigate('/document/' + d._id);
      }
      if (c === 'error') {
        navigate('/login?email=' + u.email);
      }
    },
    [c, u, d, navigate, setUser]
  );

  const handleGoogleAuth = useCallback(() => {
    window.location.href = (process.env.REACT_APP_API_URL || 'http://hades.pc.com:8000/') + 'oauth2/google';
  }, []);

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Welcome {u.name}</Typography>
            <Typography
              component={Link}
              to={isLoggedIn ? '/auth/login' : '/login'}
              variant="body1"
              sx={{ textDecoration: 'none' }}
              color="primary"
            >
              Already have an account?
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          {c === 'success' && <NewPassword GO={GO} user={u} document={d} creator={creator} />}
          {c === 'error' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack>
                  <Grid item xs={12}>
                    You have already an account.
                  </Grid>
                  <Grid item xs={12}>
                    <AnimateButton>
                      <Button disableElevation onClick={GO} fullWidth size="large" variant="contained" color="primary">
                        Go Login
                      </Button>
                    </AnimateButton>
                  </Grid>
                </Stack>
              </Grid>
            </Grid>
          )}
          <Divider sx={{ my: 2 }}>
            <Typography variant={'subtitle1'} color={'secondary'}>
              Or sign in with
            </Typography>
          </Divider>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Button disableElevation fullWidth size="large" type="submit" variant="outlined" color="secondary" onClick={handleGoogleAuth}>
                <GoogleOutlined style={{ marginRight: 4, fontSize: 28 }} />
                Google
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
};

export default CheckInvite;
