import { Link } from 'react-router-dom';

// material-ui
import { Button, Divider, Grid, Stack, Typography } from '@mui/material';

// project import
import useAuth from 'hooks/useAuth';
import AuthWrapper from 'sections/auth/AuthWrapper';
import FirebaseRegister from 'sections/auth/auth-forms/AuthRegister';
import { GoogleOutlined } from '@ant-design/icons';
import { useCallback } from 'react';

// ================================|| REGISTER ||================================ //

const Register = () => {
  const { isLoggedIn } = useAuth();

  const handleGoogleAuth = useCallback(() => {
    window.location.href = (process.env.REACT_APP_API_URL || 'http://192.168.148.86:8000/') + 'oauth2/google';
  }, []);

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Sign up</Typography>
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
          <FirebaseRegister />
          <Divider sx={{ my: 2 }}>
            <Typography variant={'subtitle1'} color={'secondary'}>
              Sign up with
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

export default Register;
