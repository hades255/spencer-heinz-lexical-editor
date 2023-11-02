import PropTypes from 'prop-types';

// material-ui
import {
  Button,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  Stack,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  Divider,
  DialogContent
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import AnimateButton from 'components/@extended/AnimateButton';

import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

// assets
// import { getUserLists } from 'store/reducers/user';
import { PopupTransition } from 'components/@extended/Transitions';
import { addNewUser } from 'store/reducers/user';

const AddNewInviteDlg = ({ open, email, onClose }) => {
  const { register } = useAuth();
  const scriptedRef = useScriptRef();

  return (
    <>
      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={(e, r) => {
          if (r === 'escapeKeyDown') onClose();
        }}
        open={open}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>New User</DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 2.5 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Formik
                initialValues={{
                  firstname: '',
                  lastname: '',
                  email,
                  company: '',
                  countryCode: '+91',
                  mobilePhone: '',
                  workPhone: '',
                  submit: null
                }}
                validationSchema={Yup.object().shape({
                  firstname: Yup.string().max(255).required('First Name is required'),
                  lastname: Yup.string().max(255).required('Last Name is required'),
                  mobilePhone: Yup.number()
                    .test('len', 'Contact should be exactly 10 digit', (val) => val?.toString().length === 10)
                    .required('Mobile Phone number is required'),
                  workPhone: Yup.number()
                    .test('len', 'Contact should be exactly 10 digit', (val) => val?.toString().length === 10)
                    .required('Mobile Phone number is required')
                })}
                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                  try {
                    const response = await register({ ...values, status: 'invited', email });
                    if (scriptedRef.current) {
                      setSubmitting(false);
                      if (response.code === 'error') {
                        setStatus({ success: false });
                        setErrors({ submit: response.message });
                        dispatch(
                          openSnackbar({
                            open: true,
                            message: 'Your registration has not been successfully completed.',
                            variant: 'alert',
                            alert: {
                              color: 'error'
                            },
                            close: true
                          })
                        );
                      } else {
                        dispatch(addNewUser(response.data.user));
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
                        setTimeout(() => {
                          onClose(email);
                        }, 100);
                      }
                    }
                  } catch (err) {
                    if (scriptedRef.current) {
                      setStatus({ success: false });
                      setErrors({ submit: err.message });
                      setSubmitting(false);
                      dispatch(
                        openSnackbar({
                          open: true,
                          message: 'Your registration has not been successfully completed.',
                          variant: 'alert',
                          alert: {
                            color: 'error'
                          },
                          close: true
                        })
                      );
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
                            value={email}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            name="email"
                            placeholder="demo@company.com"
                            inputProps={{}}
                            readOnly
                          />
                          {touched.email && errors.email && (
                            <FormHelperText error id="helper-text-email-signup">
                              {errors.email}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                      {errors.submit && (
                        <Grid item xs={12}>
                          <FormHelperText error>{errors.submit}</FormHelperText>
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Grid item xs={6}>
                            <AnimateButton>
                              <Button disableElevation onClick={onClose} fullWidth size="large" variant="contained" color="secondary">
                                Cancel
                              </Button>
                            </AnimateButton>
                          </Grid>
                          <Grid item xs={6}>
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
                                Add Account
                              </Button>
                            </AnimateButton>
                          </Grid>
                        </Stack>
                      </Grid>
                    </Grid>
                  </form>
                )}
              </Formik>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

AddNewInviteDlg.propTypes = {
  email: PropTypes.string,
  open: PropTypes.any,
  onClose: PropTypes.func
};

export default AddNewInviteDlg;
