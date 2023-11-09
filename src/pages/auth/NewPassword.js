import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// material-ui
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import useScriptRef from 'hooks/useScriptRef';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
import { strengthColor, strengthIndicator } from 'utils/password-strength';

// assets
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import axiosServices from 'utils/axios';
import NewPasswordConfirm from './NewPasswordConfirm';

// ============================|| JWT - LOGIN ||============================ //

const NewPassword = ({ GO, token, creator }) => {
  const scriptedRef = useScriptRef();

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const [level, setLevel] = useState();
  const [confirmDlg, setConfirmDlg] = useState(false);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const changePassword = (value) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  };

  useEffect(() => {
    changePassword('');
  }, []);

  return (
    <>
      <Formik
        initialValues={{
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          password: Yup.string().max(255).required('Password is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            const response = await axiosServices.post('/invite/' + token, { password: values.password });
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
            }
            GO(response.data.data.serviceToken);
          } catch (err) {
            console.error(err);
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setSubmitting(false);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6">
                  <b>{creator.name}</b> invited you to edit document. An account for your email has been created automatically for
                  collaborating document.
                </Typography>
                <Stack spacing={1}>
                  <InputLabel htmlFor="password-signup">Please create a new password.</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-signup"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      changePassword(e.target.value);
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="******"
                    inputProps={{}}
                  />
                  {touched.password && errors.password && (
                    <FormHelperText error id="helper-text-password-signup">
                      {errors.password}
                    </FormHelperText>
                  )}
                </Stack>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Box sx={{ bgcolor: level?.color, width: 85, height: 8, borderRadius: '7px' }} />
                    </Grid>
                    <Grid item>
                      <Typography variant="subtitle1" fontSize="0.75rem">
                        {level?.label}
                      </Typography>
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>

              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid item xs={12}>
                <AnimateButton>
                  <Button
                    disableElevation
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    variant="contained"
                    color="primary"
                    onClick={() => setConfirmDlg(true)}
                  >
                    OK
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
            <NewPasswordConfirm open={confirmDlg} onClose={setConfirmDlg} submit={handleSubmit} />
          </form>
        )}
      </Formik>
      {/* <Stack sx={{ mt: 2 }}>Read about document</Stack>
      <Grid sx={{ mt: 1 }}>
        <Stack>
          <Typography variant="subtitle1">Title: </Typography>
          {document.name}
        </Stack>
        <Stack>
          <Typography variant="subtitle1">Description: </Typography>
          {document.description}
        </Stack>
      </Grid> */}
    </>
  );
};

NewPassword.propTypes = {
  GO: PropTypes.func,
  token: PropTypes.string,
  document: PropTypes.object,
  creator: PropTypes.object
};

export default NewPassword;
