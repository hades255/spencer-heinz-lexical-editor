import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Stack,
  TextField
} from '@mui/material';

import { postDocumentCreate } from 'store/reducers/document';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import { dispatch } from 'store';
import StyledTextarea from 'components/form/StyledTextarea';
import { useSelector } from 'store';
import { getUserLists } from 'store/reducers/user';
import CustomCell from 'components/customers/CustomCell';
import AddContributor from './AddContributor';
import AddTeamLeaders from 'pages/apps/document/AddTeamLeaders';

const steps = ['Title', 'Descriptions', 'Contributors', 'Team'];

const AddDocument = ({ user }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [contributors, setContributors] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const users = useSelector((state) => state.user.lists);
  const nextBtn = useRef(null);
  const firstinput = useRef(null);
  const secondinput = useRef(null);

  const handleAutocompleteChange = (value) => {
    setContributors(value);
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.keyCode === 9) {
        e.preventDefault();
        nextBtn.current.focus();
        return;
      }
    },
    [nextBtn]
  );

  useEffect(() => {
    dispatch(getUserLists());
  }, []);

  useEffect(() => {
    if (user) {
      setContributors([user.email]);
      if (firstinput) firstinput.current?.focus();
    }
  }, [user]);

  useEffect(() => {
    switch (activeStep) {
      case 0:
        firstinput.current?.focus();
        break;
      case 1:
        secondinput.current?.focus();
        break;
      default:
        break;
    }
  }, [activeStep]);

  const handleNext = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, []);

  const handleReset = useCallback(() => {
    setActiveStep(0);
  }, []);

  return (
    <>
      <DialogTitle>New Document</DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2.5, width: '100%', position: 'relative' }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => {
            const stepProps = {};
            const labelProps = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <Formik
          initialValues={{
            name: '',
            description: ``,
            team: '',
            defaultTeam: true,
            emailMethod: ''
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().max(255).required('Document title is required'),
            description: Yup.string().max(1024).required('Document description is required')
          })}
          onSubmit={async (values, { setStatus, setSubmitting }) => {
            const leaderEmails = leaders.map((item) => item.email);

            dispatch(
              postDocumentCreate(
                {
                  ...values,
                  invites: [
                    ...users
                      .filter(
                        (item) => item.email !== user.email && contributors.includes(item.email) && !leaderEmails.includes(item.email)
                      )
                      .map(({ _id, name, email, avatar, status, role, mobilePhone, workPhone }) => ({
                        _id,
                        name,
                        email,
                        avatar,
                        status,
                        role,
                        mobilePhone,
                        workPhone,
                        team: values.defaultTeam || !values.team ? 'authoring' : values.team,
                        reply: 'pending'
                      })),
                    ...leaders
                  ],
                  team: values.defaultTeam || !values.team ? 'authoring' : values.team
                },
                navigate
              )
            );
            setStatus({ success: true });
            setSubmitting(false); //  post document
            // onCancel();
          }}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
            <form noValidate onSubmit={handleSubmit}>
              {activeStep === steps.length ? (
                <>
                  <Stack sx={{ mt: 2, mb: 1 }}>
                    <Typography sx={{ mt: 2, mb: 1 }} variant="h4">
                      {values.name}
                    </Typography>
                    {touched.name && errors.name && (
                      <FormHelperText error id="helper-text-name-doc">
                        {errors.name}
                      </FormHelperText>
                    )}
                    <Typography sx={{ mt: 2, mb: 1 }}>{values.description}</Typography>
                    {touched.description && errors.description && (
                      <FormHelperText error id="helper-text-description-doc">
                        {errors.description}
                      </FormHelperText>
                    )}
                    {users.filter((item) => contributors.includes(item.email) && item.status !== 'active' && item.status !== 'invited')
                      .length !== 0 && (
                      <Typography sx={{ mt: 2, mb: 1, color: 'red' }} variant="subtitle1">
                        * Some contributors will not receive an invitation until admin resolves Locked/Deleted status.
                      </Typography>
                    )}
                    <Stack sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', pt: 2 }}>
                      {users
                        .filter((item) => contributors.includes(item.email))
                        .map((item, key) => (
                          <CustomCell key={key} user={item} />
                        ))}
                    </Stack>
                    <Stack sx={{ my: 2 }} direction={'row'} alignItems={'center'}>
                      <Typography>Emails will be sent {values.emailMethod}.</Typography>-
                      <Button
                        color={'secondary'}
                        onClick={() => {
                          handleChange({ target: { name: 'emailMethod', value: '' } });
                          handleBack();
                        }}
                      >
                        Edit
                      </Button>
                    </Stack>
                  </Stack>
                  <Divider />
                  <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, bottom: 10 }}>
                    <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                      Back
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    <Button onClick={handleReset}>Reset</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      Create
                    </Button>
                  </Box>
                </>
              ) : (
                <StepWrapper activeStep={activeStep} handleBack={handleBack} handleNext={handleNext} nextBtn={nextBtn}>
                  {activeStep === 0 && (
                    <DocumentNameStep
                      values={values}
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      firstinput={firstinput}
                      touched={touched}
                      errors={errors}
                    />
                  )}
                  {activeStep === 1 && (
                    <DocumentDescStep
                      values={values}
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      handleKeyDown={handleKeyDown}
                      secondinput={secondinput}
                      touched={touched}
                      errors={errors}
                    />
                  )}
                  {activeStep === 2 && (
                    <AddContributor
                      users={users.map(({ _id, name, email, avatar, status, setting }) => ({
                        _id,
                        name,
                        email,
                        avatar,
                        status,
                        setting
                      }))}
                      user={user}
                      onChange={handleAutocompleteChange}
                      value={contributors}
                      exist={[user]}
                    />
                  )}
                  {activeStep === 3 && (
                    <>
                      <DocumentTeamStep
                        values={values}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        touched={touched}
                        errors={errors}
                        user={user}
                        contributors={contributors}
                        users={users}
                        leaders={leaders}
                        setLeaders={setLeaders}
                      />
                      <Dialog open={!values.emailMethod} onClose={handleBack}>
                        <DialogTitle>Select sending Email methods</DialogTitle>
                        <DialogContent>
                          <Stack direction={'row'} justifyContent={'center'}>
                            <FormControl>
                              <RadioGroup
                                aria-labelledby="demo-radio-buttons-group-label"
                                value={values.emailMethod}
                                name="emailMethod"
                                onChange={handleChange}
                                required
                              >
                                <FormControlLabel value="automatic" control={<Radio />} label="Automated email notification" />
                                <FormControlLabel value="manual" control={<Radio />} label="Manual email notification" />
                              </RadioGroup>
                            </FormControl>
                          </Stack>
                          <Stack direction={'row'} justifyContent={'center'}>
                            <Button onClick={handleBack}>Back</Button>
                          </Stack>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </StepWrapper>
              )}
            </form>
          )}
        </Formik>
      </DialogContent>
    </>
  );
};

AddDocument.propTypes = {
  user: PropTypes.any,
  onCancel: PropTypes.func
};

export const StepWrapper = ({ children, activeStep, handleBack, handleNext, nextBtn }) => {
  return (
    <>
      <Stack sx={{ minHeight: '30vh', maxHeight: '80vh', m: 2 }}>{children}</Stack>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', bottom: 30 }}>
        <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
          Back
        </Button>
        {activeStep < steps.length && (
          <Button ref={nextBtn} onClick={handleNext}>
            {activeStep === steps.length - 1 ? 'Overview' : 'Next'}
          </Button>
        )}
      </Box>
    </>
  );
};

StepWrapper.propTypes = {
  children: PropTypes.any,
  activeStep: PropTypes.any,
  handleBack: PropTypes.any,
  handleNext: PropTypes.any,
  nextBtn: PropTypes.any
};

export default AddDocument;

export const DocumentNameStep = ({ values, handleBlur, handleChange, firstinput, touched, errors }) => {
  return (
    <>
      <StyledTextarea
        id="name-doc"
        value={values.name}
        name="name"
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder="Document Title"
        maxRows={30}
        minRows={15}
        ref={firstinput}
      />
      {touched.name && errors.name && (
        <FormHelperText error id="helper-text-name-doc">
          {errors.name}
        </FormHelperText>
      )}
    </>
  );
};

export const DocumentDescStep = ({ values, handleBlur, handleChange, handleKeyDown, secondinput, touched, errors }) => {
  return (
    <>
      <StyledTextarea
        id="description-doc"
        value={values.description}
        name="description"
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder="Document Description"
        maxRows={30}
        minRows={15}
        ref={secondinput}
      />
      {touched.description && errors.description && (
        <FormHelperText error id="helper-text-description-doc">
          {errors.description}
        </FormHelperText>
      )}
    </>
  );
};

export const DocumentTeamStep = ({ values, handleChange, handleBlur, touched, errors, user, contributors, users, leaders, setLeaders }) => {
  return (
    <>
      <Stack>
        <FormControlLabel
          control={<Checkbox checked={values.defaultTeam} onChange={handleChange} id="default-name-team" name="defaultTeam" />}
          label={'Use default Team name "authoring"'}
        />
        <Box>
          <TextField
            id="name-team"
            value={values.team}
            name="team"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="Name of Team"
            label="Type name of Team"
            variant="standard"
            sx={{ minWidth: 300, width: '50%', display: values.defaultTeam ? 'none' : 'block' }}
          />
          {touched.team && errors.team && (
            <FormHelperText error id="helper-text-team-doc">
              {errors.team}
            </FormHelperText>
          )}
        </Box>
        <AddTeamLeaders
          me={user}
          contributors={contributors}
          allUsers={users}
          defaultTeam={values.defaultTeam ? 'authoring' : values.team}
          leaders={leaders}
          setLeaders={setLeaders}
        />
      </Stack>
    </>
  );
};

DocumentNameStep.propTypes = {
  values: PropTypes.any,
  handleBlur: PropTypes.any,
  handleChange: PropTypes.any,
  firstinput: PropTypes.any,
  touched: PropTypes.any,
  errors: PropTypes.any
};

DocumentDescStep.propTypes = {
  values: PropTypes.any,
  handleBlur: PropTypes.any,
  handleKeyDown: PropTypes.any,
  handleChange: PropTypes.any,
  secondinput: PropTypes.any,
  touched: PropTypes.any,
  errors: PropTypes.any
};

DocumentTeamStep.propTypes = {
  values: PropTypes.any,
  handleChange: PropTypes.any,
  handleBlur: PropTypes.any,
  touched: PropTypes.any,
  errors: PropTypes.any,
  user: PropTypes.any,
  contributors: PropTypes.any,
  users: PropTypes.any,
  leaders: PropTypes.any,
  setLeaders: PropTypes.any
};
