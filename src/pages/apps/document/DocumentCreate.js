import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Dialog, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, Radio, RadioGroup, Stack } from '@mui/material';

import { postDocumentCreate } from 'store/reducers/document';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import { dispatch } from 'store';
import AuthContext from 'contexts/JWTContext';
import { useSelector } from 'store';
import { getUserLists } from 'store/reducers/user';
import CustomCell from 'components/customers/CustomCell';
import AddContributor from 'sections/apps/document/AddContributor';
import MainCard from 'components/MainCard';
import { DocumentDescStep, DocumentNameStep, DocumentTeamStep, StepWrapper } from 'sections/apps/document/AddDocument';

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
        secondinput.current?.focus();
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
                        onChange={handleAutocompleteChange}
                        value={contributors}
                        user={user}
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
        </Box>
      </DialogContent>
    </MainCard>
  );
};

export default DocumentCreate;
