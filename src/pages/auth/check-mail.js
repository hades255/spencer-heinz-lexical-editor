import { Link } from 'react-router-dom';

// material-ui
import { Box, Button, Grid, Divider, Typography } from '@mui/material';

// project import
import useAuth from 'hooks/useAuth';
import AnimateButton from 'components/@extended/AnimateButton';
import AuthWrapper from 'sections/auth/AuthWrapper';
import { GoogleOutlined } from '@ant-design/icons';
import { useCallback } from 'react';

// ================================|| CHECK MAIL ||================================ //

const CheckMail = () => {
  const { isLoggedIn } = useAuth();

  const handleGoogleAuth = useCallback(() => {
    window.location.href = (process.env.REACT_APP_API_URL || 'http://hades.pc.com:8000/') + 'oauth2/google';
  }, []);

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Hi, Check Your Mail</Typography>
            <Typography color="secondary" sx={{ mb: 0.5, mt: 1.25 }}>
              We have sent a password recover instructions to your email.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <AnimateButton>
            <Button
              component={Link}
              to={isLoggedIn ? '/auth/login' : '/login'}
              disableElevation
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              color="primary"
            >
              Sign in
            </Button>
          </AnimateButton>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }}>
            <Typography variant={'subtitle1'} color={'secondary'}>
              Sign in with
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

export default CheckMail;
