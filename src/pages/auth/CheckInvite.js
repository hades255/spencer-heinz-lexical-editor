import { Link, useNavigate, useParams } from 'react-router-dom';

// material-ui
import { Button, Grid, Stack, Typography } from '@mui/material';

// project import
import useAuth from 'hooks/useAuth';
import AuthWrapper from 'sections/auth/AuthWrapper';
import { useCallback, useEffect, useState } from 'react';
import axiosServices from 'utils/axios';
import AnimateButton from 'components/@extended/AnimateButton';
import NewPassword from './NewPassword';

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
        const response = await axiosServices.get('/invite/' + token);
        setC(response.data.code);
        const { user, document, creator: creator_ } = response.data.data;
        setU(user);
        setD(document);
        setCreator(creator_);
      } catch (error) {
        console.log(error);
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

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Welcome</Typography>
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
          {c === 'success' && <NewPassword GO={GO} token={token} document={d} creator={creator} />}
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
        </Grid>
      </Grid>
    </AuthWrapper>
  );
};

export default CheckInvite;
