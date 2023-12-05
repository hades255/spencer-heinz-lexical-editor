import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Checkbox, DialogContent, FormControlLabel, FormHelperText, Stack, TextField } from '@mui/material';

import { postDocumentCreate } from 'store/reducers/document';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import { dispatch } from 'store';
import StyledTextarea from 'components/form/StyledTextarea';
import AuthContext from 'contexts/JWTContext';
import { useSelector } from 'store';
import { getUserLists } from 'store/reducers/user';
import CustomCell from 'components/customers/CustomCell';
import AddContributor from 'sections/apps/document/AddContributor';
import MainCard from 'components/MainCard';
import { StepWrapper } from 'sections/apps/document/AddDocument';
import AddTeamLeaders from './AddTeamLeaders';

const steps = ['Title', 'Descriptions', 'Contributors', 'Team'];

const DocumentCreate = () => {
  const navigate = useNavigate();
  const user = useContext(AuthContext).user;
  const [activeStep, setActiveStep] = useState(0);
  const [contributors, setContributors] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const users = useSelector((state) => state.user.lists);
  const nextBtn = useRef(null);
  const firstinput = useRef(null);
  const secondinput = useRef(null);

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

  const handleAutocompleteChange = (value) => {
    setContributors(value);
  };

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
        secondinput.current.focus();
        break;
      default:
        break;
    }
  }, [activeStep]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <MainCard>
      <DialogContent sx={{ p: 2.5 }}>
        <Box sx={{ width: '100%' }}>
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
              defaultTeam: true
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
            }}
          >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
              <form noValidate onSubmit={handleSubmit}>
                {activeStep === steps.length ? (
                  <>
                    <Stack sx={{ mt: 2, mb: 1 }}>
                      <Typography sx={{ mt: 2, mb: 1 }} variant="h5">
                        Title
                      </Typography>
                      <Typography sx={{ mt: 2, mb: 1 }} variant="h4">
                        {values.name}
                      </Typography>
                      <Typography sx={{ mt: 2, mb: 1 }} variant="h5">
                        Description
                      </Typography>
                      <Typography sx={{ mt: 2, mb: 1 }}>{values.description}</Typography>
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
                    </Stack>
                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
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
                    )}
                    {activeStep === 1 && (
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
                    )}
                    {activeStep === 2 && (
                      <AddContributor
                        users={users.map(({ _id, name, email, avatar, status }) => ({
                          _id,
                          name,
                          email,
                          avatar,
                          status
                        }))}
                        onChange={handleAutocompleteChange}
                        value={contributors}
                        user={user}
                        exist={[user]}
                      />
                    )}
                    {activeStep === 3 && (
                      <>
                        <Stack>
                          <FormControlLabel
                            control={
                              <Checkbox checked={values.defaultTeam} onChange={handleChange} id="default-name-team" name="defaultTeam" />
                            }
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
                    )}
                  </StepWrapper>
                )}
              </form>
            )}
          </Formik>
        </Box>
      </DialogContent>
    </MainCard>
  );
};

export default DocumentCreate;
