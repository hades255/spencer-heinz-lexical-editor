import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// material-ui
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  Link,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  Select,
  MenuItem
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { strengthColor, strengthIndicator } from 'utils/password-strength';

// assets
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { getUserLists } from 'store/reducers/user';

// ============================|| JWT - REGISTER ||============================ //

const AuthRegister = ({ redirect = true, onCancel = null, customer = null }) => {
  const { register } = useAuth();
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();

  const [level, setLevel] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

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
          firstname: '',
          lastname: '',
          email: '',
          company: '',
          password: redirect ? '' : 'Welcome123.!@#',
          countryCode: '+91',
          mobilePhone: '',
          workPhone: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          firstname: Yup.string().max(255).required('First Name is required'),
          lastname: Yup.string().max(255).required('Last Name is required'),
          email: redirect ? Yup.string().email('Must be a valid email').max(255).required('Email is required') : null,
          password: Yup.string().max(255).required('Password is required'),
          mobilePhone: Yup.number()
            .test('len', 'Contact should be exactly 10 digit', (val) => val?.toString().length === 10)
            .required('Mobile Phone number is required'),
          workPhone: Yup.number()
            .test('len', 'Contact should be exactly 10 digit', (val) => val?.toString().length === 10)
            .required('Mobile Phone number is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            const response = await register(values);
            if (scriptedRef.current) {
              setSubmitting(false);
              if (response.code === 'error' || response.error) {
                setStatus({ success: false });
                setErrors({ submit: response.message });
                dispatch(
                  openSnackbar({
                    open: true,
                    message: response.message || 'Your registration has not been successfully completed.',
                    variant: 'alert',
                    alert: {
                      color: 'error'
                    },
                    close: true
                  })
                );
              } else {
                setStatus({ success: true });
                dispatch(
                  openSnackbar({
                    open: true,
                    message: 'Your registration has been successfully completed.',
                    variant: 'alert',
                    alert: {
                      color: 'success'
                    },
                    close: true
                  })
                );
                if (redirect)
                  setTimeout(() => {
                    navigate('/login', { replace: true });
                  }, 1500);
                else {
                  onCancel();
                  dispatch(getUserLists());
                }
              }
            }
          } catch (err) {
            console.error(err);
            dispatch(
              openSnackbar({
                open: true,
                message: err.message || 'Your registration has not been successfully completed.',
                variant: 'alert',
                alert: {
                  color: 'error'
                },
                close: true
              })
            );
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
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="firstname-signup">First Name*</InputLabel>
                  <OutlinedInput
                    id="firstname-signup"
                    type="firstname"
                    value={values.firstname}
                    name="firstname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="John"
                    fullWidth
                    error={Boolean(touched.firstname && errors.firstname)}
                  />
                  {touched.firstname && errors.firstname && (
                    <FormHelperText error id="helper-text-firstname-signup">
                      {errors.firstname}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="lastname-signup">Last Name*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.lastname && errors.lastname)}
                    id="lastname-signup"
                    type="lastname"
                    value={values.lastname}
                    name="lastname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Doe"
                    inputProps={{}}
                  />
                  {touched.lastname && errors.lastname && (
                    <FormHelperText error id="helper-text-lastname-signup">
                      {errors.lastname}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="company-signup">Company</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.company && errors.company)}
                    id="company-signup"
                    value={values.company}
                    name="company"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Demo Inc."
                    inputProps={{}}
                  />
                  {touched.company && errors.company && (
                    <FormHelperText error id="helper-text-company-signup">
                      {errors.company}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="mobilePhone-signup">Mobile Phone Number</InputLabel>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Select value={values.countryCode} name="countryCode" onBlur={handleBlur} onChange={handleChange}>
                      <MenuItem value="+91">+91</MenuItem>
                      <MenuItem value="1-671">1-671</MenuItem>
                      <MenuItem value="+36">+36</MenuItem>
                      <MenuItem value="(225)">(255)</MenuItem>
                      <MenuItem value="+39">+39</MenuItem>
                      <MenuItem value="1-876">1-876</MenuItem>
                      <MenuItem value="+7">+7</MenuItem>
                      <MenuItem value="(254)">(254)</MenuItem>
                      <MenuItem value="(373)">(373)</MenuItem>
                      <MenuItem value="1-664">1-664</MenuItem>
                      <MenuItem value="+95">+95</MenuItem>
                      <MenuItem value="(264)">(264)</MenuItem>
                    </Select>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.mobilePhone && errors.mobilePhone)}
                      id="mobilePhone-signup"
                      type="mobilePhone"
                      value={values.mobilePhone}
                      name="mobilePhone"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Mobile Phone Number"
                      inputProps={{}}
                    />
                  </Stack>
                  {touched.mobilePhone && errors.mobilePhone && (
                    <FormHelperText error id="helper-text-mobilePhone-signup">
                      {errors.mobilePhone}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="workPhone-signup">Work Phone Number</InputLabel>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Select value={values.countryCode} name="countryCode" onBlur={handleBlur} onChange={handleChange}>
                      <MenuItem value="+91">+91</MenuItem>
                      <MenuItem value="1-671">1-671</MenuItem>
                      <MenuItem value="+36">+36</MenuItem>
                      <MenuItem value="(225)">(255)</MenuItem>
                      <MenuItem value="+39">+39</MenuItem>
                      <MenuItem value="1-876">1-876</MenuItem>
                      <MenuItem value="+7">+7</MenuItem>
                      <MenuItem value="(254)">(254)</MenuItem>
                      <MenuItem value="(373)">(373)</MenuItem>
                      <MenuItem value="1-664">1-664</MenuItem>
                      <MenuItem value="+95">+95</MenuItem>
                      <MenuItem value="(264)">(264)</MenuItem>
                    </Select>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.workPhone && errors.workPhone)}
                      id="workPhone-signup"
                      type="workPhone"
                      value={values.workPhone}
                      name="workPhone"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Work Phone Number"
                      inputProps={{}}
                    />
                  </Stack>
                  {touched.workPhone && errors.workPhone && (
                    <FormHelperText error id="helper-text-workPhone-signup">
                      {errors.workPhone}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-signup">Email Address*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    id="email-signup"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="demo@company.com"
                    inputProps={{}}
                  />
                  {touched.email && errors.email && (
                    <FormHelperText error id="helper-text-email-signup">
                      {errors.email}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              {redirect && (
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="password-signup">Password</InputLabel>
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
              )}
              {redirect && (
                <Grid item xs={12}>
                  <Typography variant="body2">
                    By Signing up, you agree to our &nbsp;
                    <Link variant="subtitle2" component={RouterLink} to="#">
                      Terms of Service
                    </Link>
                    &nbsp; and &nbsp;
                    <Link variant="subtitle2" component={RouterLink} to="#">
                      Privacy Policy
                    </Link>
                  </Typography>
                </Grid>
              )}
              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} alignItems="center">
                  {!redirect && (
                    <Grid item xs={6}>
                      <AnimateButton>
                        <Button disableElevation onClick={onCancel} fullWidth size="large" variant="contained" color="secondary">
                          Cancel
                        </Button>
                      </AnimateButton>
                    </Grid>
                  )}
                  <Grid item xs={redirect ? 12 : 6}>
                    <AnimateButton>
                      <Button
                        disableElevation
                        disabled={isSubmitting}
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        {redirect ? 'Add Account' : customer ? 'Edit User' : 'Create User'}
                      </Button>
                    </AnimateButton>
                  </Grid>
                </Stack>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
};

AuthRegister.propTypes = {
  redirect: PropTypes.any,
  onCancel: PropTypes.any,
  customer: PropTypes.any
};

export default AuthRegister;
