import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { DialogContent, FormHelperText, Stack } from '@mui/material';

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
import AddContributor from 'sections/apps/document/AddContributor1';
import MainCard from 'components/MainCard';
import { StepWrapper } from 'sections/apps/document/AddDocument';

const steps = ['Title', 'Descriptions', 'Contributors'];

const DocumentCreate = () => {
  const navigate = useNavigate();
  const user = useContext(AuthContext).user;
  const [activeStep, setActiveStep] = useState(0);
  const [contributors, setContributors] = useState([]);
  const users = useSelector((state) => state.user.lists);
  const nextBtn = useRef(null);

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
    if (user) setContributors([user.email]);
  }, [user]);

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
              description: ``
            }}
            validationSchema={Yup.object().shape({
              name: Yup.string().max(255).required('Document title is required'),
              description: Yup.string().max(1024).required('Document description is required')
            })}
            onSubmit={async (values, { setStatus, setSubmitting }) => {
              dispatch(
                postDocumentCreate(
                  {
                    ...values,
                    contributors: users
                      .filter((item) => contributors.includes(item.email))
                      .map(({ _id, name, email, avatar, status, role }) => ({ _id, name, email, avatar, status, role }))
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
                      <Typography sx={{ mt: 2, mb: 1 }} variant="h4">
                        {values.name}
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
                            <CustomCell key={key} user={item} status />
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