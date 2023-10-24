import { Link, useNavigate, useParams } from 'react-router-dom';

// material-ui
import { Grid, Stack, Typography } from '@mui/material';

// project import
import useAuth from 'hooks/useAuth';
import AuthWrapper from 'sections/auth/AuthWrapper';
import { useEffect } from 'react';
import axiosServices from 'utils/axios';

// ================================|| LOGIN ||================================ //

const CheckInvite = () => {
  const { isLoggedIn, setUser } = useAuth();
  const token = useParams().token;
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const response = await axiosServices.get('/invite/' + token);
        const { serviceToken, user, document } = response.data.data;
        await setUser(serviceToken, user);
        navigate('/document/' + document);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [token, navigate]);

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Check Invite</Typography>
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
        <Grid item xs={12}></Grid>
      </Grid>
    </AuthWrapper>
  );
};

export default CheckInvite;
