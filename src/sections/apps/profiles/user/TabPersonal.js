// material-ui
import { useOutletContext } from 'react-router';

// material-ui
import {
  Autocomplete,
  Box,
  Button,
  CardHeader,
  Divider,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import useAuth from 'hooks/useAuth';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import countries from 'data/countries';
import MainCard from 'components/MainCard';

import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

// assets
import { getUserUpdate } from 'store/reducers/user';
// styles & constant
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
};

function useInputRef() {
  return useOutletContext();
}

// ==============================|| TAB - PERSONAL ||============================== //

const TabPersonal = () => {
  const { user, updateProfile } = useAuth();
  const handleChangeDay = (event, date, setFieldValue) => {
    setFieldValue('dob', new Date(date.setDate(parseInt(event.target.value, 10))));
  };

  const handleChangeMonth = (event, date, setFieldValue) => {
    setFieldValue('dob', new Date(date.setMonth(parseInt(event.target.value, 10))));
  };

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  const inputRef = useInputRef();

  return (
    <MainCard content={false} title="Personal Information" sx={{ '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}>
      {user ? (
        <Formik
          initialValues={{
            firstname: user.name.split(' ')[0],
            lastname: user.name.split(' ')[user.name.split(' ').length - 1],
            user_id: user.user_id,
            email: user.email,
            dob: new Date(user.dob),
            countryCode: user.countryCode,
            contact: user.contact,
            mobilePhone: user.mobilePhone,
            workPhone: user.workPhone,
            designation: user.designation,
            address: user.address,
            address1: user.address1,
            country: user.country,
            state: user.state,
            city: user.city,
            zip: user.zip,
            flag: user.flag,
            skill: user.skill,
            note: user.note,
            submit: null
          }}
          validationSchema={Yup.object().shape({
            firstname: Yup.string().max(255).required('First Name is required.'),
            lastname: Yup.string().max(255).required('Last Name is required.'),
            user_id: Yup.string().max(255).required('ID is required.'),
            email: Yup.string().email('Invalid email address.').max(255).required('Email is required.'),
            dob: Yup.date().max(maxDate, 'Age should be 18+ years.').required('Date of birth is requird.'),
            // contact: Yup.number()
            //   .test('len', 'Contact should be exactly 10 digit', (val) => val?.toString().length === 10)
            //   .required('Phone number is required'),
            mobilePhone: Yup.number()
              .test('len', 'Contact should be exactly 10 digit', (val) => val?.toString().length === 10)
              .required('Mobile Phone number is required'),
            workPhone: Yup.number()
              .test('len', 'Contact should be exactly 10 digit', (val) => val?.toString().length === 10)
              .required('Work Phone number is required'),
            designation: Yup.string().required('Designation is required'),
            address: Yup.string().min(20, 'Address 01 too short.').required('Address 01 is required'),
            address1: Yup.string().min(20, 'Address 02 too short.').required('Address 02 is required'),
            country: Yup.string().required('Country is required'),
            state: Yup.string().required('State is required'),
            city: Yup.string().required('City is required'),
            zip: Yup.string().required('Zip is required'),
            note: Yup.string().min(150, 'Note should be more then 150 char.')
          })}
          onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
            try {
              const newUser = {
                name: values.firstname + ' ' + values.lastname,
                _id: user._id,
                user_id: values.user_id,
                email: values.email,
                dob: values.dob,
                countryCode: values.countryCode,
                contact: values.contact,
                mobilePhone: values.mobilePhone,
                workPhone: values.workPhone,
                designation: values.designation,
                address: values.address,
                address1: values.address1,
                country: values.country,
                state: values.state,
                city: values.city,
                zip: values.zip,
                flag: values.flag,
                skill: values.skill
              };

              dispatch(getUserUpdate(user._id, newUser));
              dispatch(
                openSnackbar({
                  open: true,
                  message: 'Personal profile updated successfully.',
                  variant: 'alert',
                  alert: {
                    color: 'success'
                  },
                  close: true
                })
              );
              updateProfile(newUser);
              setStatus({ success: false });
              setSubmitting(false);
              onCancel();
            } catch (err) {
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setSubmitting(false);
            }
          }}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, setFieldValue, touched, values }) => (
            <form noValidate onSubmit={handleSubmit}>
              <Box sx={{ p: 2.5 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-firstname">First Name</InputLabel>
                      <TextField
                        fullWidth
                        id="personal-firstname"
                        value={values.firstname}
                        name="firstname"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="First Name"
                        autoFocus
                        inputRef={inputRef}
                      />
                      {touched.firstname && errors.firstname && (
                        <FormHelperText error id="personal-firstname-helper">
                          {errors.firstname}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-lastname">Last Name</InputLabel>
                      <TextField
                        fullWidth
                        id="personal-lastname"
                        value={values.lastname}
                        name="lastname"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Last Name"
                      />
                      {touched.lastname && errors.lastname && (
                        <FormHelperText error id="personal-lastname-helper">
                          {errors.lastname}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-user_id">ID</InputLabel>
                      <TextField
                        fullWidth
                        id="personal-user_id"
                        value={values.user_id}
                        name="user_id"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="ID"
                      />
                      {touched.user_id && errors.user_id && (
                        <FormHelperText error id="personal-user_id-helper">
                          {errors.user_id}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-email">Email Address</InputLabel>
                      <TextField
                        type="email"
                        fullWidth
                        value={values.email}
                        name="email"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        id="personal-email"
                        placeholder="Email Address"
                      />
                      {touched.email && errors.email && (
                        <FormHelperText error id="personal-email-helper">
                          {errors.email}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-dob">Date of Birth (+18)</InputLabel>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Select
                          fullWidth
                          value={values.dob.getMonth().toString()}
                          name="dob-month"
                          onChange={(e) => handleChangeMonth(e, values.dob, setFieldValue)}
                        >
                          <MenuItem value="0">January</MenuItem>
                          <MenuItem value="1">February</MenuItem>
                          <MenuItem value="2">March</MenuItem>
                          <MenuItem value="3">April</MenuItem>
                          <MenuItem value="4">May</MenuItem>
                          <MenuItem value="5">June</MenuItem>
                          <MenuItem value="6">July</MenuItem>
                          <MenuItem value="7">August</MenuItem>
                          <MenuItem value="8">September</MenuItem>
                          <MenuItem value="9">October</MenuItem>
                          <MenuItem value="10">November</MenuItem>
                          <MenuItem value="11">December</MenuItem>
                        </Select>
                        <Select
                          fullWidth
                          value={values.dob.getDate().toString()}
                          name="dob-date"
                          onBlur={handleBlur}
                          onChange={(e) => handleChangeDay(e, values.dob, setFieldValue)}
                          MenuProps={MenuProps}
                        >
                          {[
                            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
                            31
                          ].map((i) => (
                            <MenuItem
                              key={i}
                              value={i}
                              disabled={
                                (values.dob.getMonth() === 1 && i > (values.dob.getFullYear() % 4 === 0 ? 29 : 28)) ||
                                (values.dob.getMonth() % 2 !== 0 && values.dob.getMonth() < 7 && i > 30) ||
                                (values.dob.getMonth() % 2 === 0 && values.dob.getMonth() > 7 && i > 30)
                              }
                            >
                              {i}
                            </MenuItem>
                          ))}
                        </Select>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            sx={{ width: 1 }}
                            views={['year']}
                            value={values.dob}
                            maxDate={maxDate}
                            onChange={(newValue) => {
                              setFieldValue('dob', newValue);
                            }}
                          />
                        </LocalizationProvider>
                      </Stack>
                      {touched.dob && errors.dob && (
                        <FormHelperText error id="personal-dob-helper">
                          {errors.dob}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-designation">Designation</InputLabel>
                      <TextField
                        fullWidth
                        id="personal-designation"
                        value={values.designation}
                        name="designation"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Designation"
                      />
                      {touched.designation && errors.designation && (
                        <FormHelperText error id="personal-designation-helper">
                          {errors.designation}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-mobilePhone">Mobile Phone Number</InputLabel>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Select value={values.countryCode} name="countryCode" onBlur={handleBlur} onChange={handleChange}>
                          {countries.map((item, key) => (
                            <MenuItem key={key} value={item.phone}>
                              <Tooltip title={item.label} arrow>
                                <span>
                                  {item.code} {item.phone}
                                </span>
                              </Tooltip>
                            </MenuItem>
                          ))}
                        </Select>
                        <TextField
                          fullWidth
                          id="personal-mobilePhone"
                          value={values.mobilePhone}
                          name="mobilePhone"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Mobile Phone Number"
                        />
                      </Stack>
                      {touched.mobilePhone && errors.mobilePhone && (
                        <FormHelperText error id="personal-mobilePhone-helper">
                          {errors.mobilePhone}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-workPhone">Work Phone Number</InputLabel>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Select value={values.countryCode} name="countryCode" onBlur={handleBlur} onChange={handleChange}>
                          {countries.map((item, key) => (
                            <MenuItem key={key} value={item.phone}>
                              <Tooltip title={item.label} arrow>
                                <span>
                                  {item.code} {item.phone}
                                </span>
                              </Tooltip>
                            </MenuItem>
                          ))}
                        </Select>
                        <TextField
                          fullWidth
                          id="personal-workPhone"
                          value={values.workPhone}
                          name="workPhone"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Wrok Phone Number"
                        />
                      </Stack>
                      {touched.workPhone && errors.workPhone && (
                        <FormHelperText error id="personal-workPhone-helper">
                          {errors.workPhone}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
              <CardHeader title="Address" />
              <Divider />
              <Box sx={{ p: 2.5 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-address">Address 01</InputLabel>
                      <TextField
                        multiline
                        rows={3}
                        fullWidth
                        id="personal-address"
                        value={values.address}
                        name="address"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Address 01"
                      />
                      {touched.address && errors.address && (
                        <FormHelperText error id="personal-address-helper">
                          {errors.address}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-address1">Address 02</InputLabel>
                      <TextField
                        multiline
                        rows={3}
                        fullWidth
                        id="personal-address1"
                        value={values.address1}
                        name="address1"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Address 02"
                      />
                      {touched.address1 && errors.address1 && (
                        <FormHelperText error id="personal-address1-helper">
                          {errors.address1}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-country">Country</InputLabel>
                      <Autocomplete
                        id="personal-country"
                        fullWidth
                        value={countries.filter((item) => item.code === values?.country)[0]}
                        onBlur={handleBlur}
                        onChange={(event, newValue) => {
                          setFieldValue('country', newValue === null ? '' : newValue.code);
                        }}
                        options={countries}
                        autoHighlight
                        isOptionEqualToValue={(option, value) => option.code === value?.code}
                        getOptionLabel={(option) => option.label}
                        renderOption={(props, option) => (
                          <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                            {option.code && (
                              <img
                                loading="lazy"
                                width="20"
                                src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                                srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                                alt=""
                              />
                            )}
                            {option.label}
                            {option.code && `(${option.code}) ${option.phone}`}
                          </Box>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Choose a country"
                            name="country"
                            inputProps={{
                              ...params.inputProps,
                              autoComplete: 'new-password' // disable autocomplete and autofill
                            }}
                          />
                        )}
                      />
                      {touched.country && errors.country && (
                        <FormHelperText error id="personal-country-helper">
                          {errors.country}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-state">State</InputLabel>
                      <TextField
                        fullWidth
                        id="personal-state"
                        value={values.state}
                        name="state"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="State"
                      />
                      {touched.state && errors.state && (
                        <FormHelperText error id="personal-state-helper">
                          {errors.state}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-city">City</InputLabel>
                      <TextField
                        fullWidth
                        id="personal-city"
                        value={values.city}
                        name="city"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="City"
                      />
                      {touched.city && errors.city && (
                        <FormHelperText error id="personal-city-helper">
                          {errors.city}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-zip">Zip</InputLabel>
                      <TextField
                        fullWidth
                        id="personal-zip"
                        value={values.zip}
                        name="zip"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Zip"
                      />
                      {touched.zip && errors.zip && (
                        <FormHelperText error id="personal-zip-helper">
                          {errors.zip}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-flag">Flag</InputLabel>
                      <Select value={values.flag} name="flag" onBlur={handleBlur} onChange={handleChange}>
                        <MenuItem value="organization">Organization</MenuItem>
                        <MenuItem value="person">Person</MenuItem>
                      </Select>
                    </Stack>
                  </Grid>
                </Grid>
                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 2.5 }}>
                  <Button variant="outlined" color="secondary">
                    Cancel
                  </Button>
                  {/* {Object.keys(errors)} */}
                  <Button disabled={isSubmitting || Object.keys(errors).length !== 0} type="submit" variant="contained">
                    Save
                  </Button>
                </Stack>
              </Box>
              {/* <CardHeader title="Skills" />
              <Divider />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', listStyle: 'none', p: 2.5, m: 0 }} component="ul">
                <Autocomplete
                  multiple
                  fullWidth
                  id="tags-outlined"
                  options={skills}
                  value={values.skill}
                  onBlur={handleBlur}
                  getOptionLabel={(label) => label}
                  onChange={(event, newValue) => {
                    setFieldValue('skill', newValue);
                  }}
                  renderInput={(params) => <TextField {...params} name="skill" placeholder="Add Skills" />}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={index}
                        {...getTagProps({ index })}
                        variant="combined"
                        label={option}
                        deleteIcon={<CloseOutlined style={{ fontSize: '0.75rem' }} />}
                        sx={{ color: 'text.primary' }}
                      />
                    ))
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      p: 0,
                      '& .MuiAutocomplete-tag': {
                        m: 1
                      },
                      '& fieldset': {
                        display: 'none'
                      },
                      '& .MuiAutocomplete-endAdornment': {
                        display: 'none'
                      },
                      '& .MuiAutocomplete-popupIndicator': {
                        display: 'none'
                      }
                    }
                  }}
                />
              </Box>
              <CardHeader title="Note" />
              <Divider />
              <Box sx={{ p: 2.5 }}>
                <TextField
                  multiline
                  rows={5}
                  fullWidth
                  value={values.note}
                  name="note"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  id="personal-note"
                  placeholder="Note"
                />
                {touched.note && errors.note && (
                  <FormHelperText error id="personal-note-helper">
                    {errors.note}
                  </FormHelperText>
                )}
              </Box> */}
            </form>
          )}
        </Formik>
      ) : (
        ''
      )}
    </MainCard>
  );
};

export default TabPersonal;
