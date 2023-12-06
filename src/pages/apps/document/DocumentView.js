import React, { useCallback, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AuthContext from 'contexts/JWTContext';
import Check from './Check';
import Document from './Document';
import { Button, Grid, Stack, Typography } from '@mui/material';
import { dispatch } from 'store';
import { getDocumentSingleList } from 'store/reducers/document';
import { useSelector } from 'store';

const DocumentView = () => {
  const { uniqueId } = useParams();
  const user = useContext(AuthContext).user;
  const document = useSelector((state) => state.document.document);

  const handleRefresh = useCallback(() => {
    dispatch(getDocumentSingleList(uniqueId));
  }, [uniqueId]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  return (
    <>
      {document &&
        user &&
        (document.creator.email === user.email || document.invites.some((item) => item.email === user.email && item.reply === 'accept') ? (
          <Document user={user} document={document} />
        ) : document.invites.some((item) => item.email === user.email && item.reply === 'pending') ? (
          <Check user={user} document={document} handleRefresh={handleRefresh} />
        ) : (
          <Redirect />
        ))}
    </>
  );
};

export default DocumentView;

const Redirect = () => {
  const navigate = useNavigate();
  const handleRedirect = useCallback(() => {
    navigate('/document/list');
  }, [navigate]);
  return (
    <>
      <Grid item xs={12}>
        <Stack direction={'row'} justifyContent={'center'}>
          <Typography variant="h5">You cannot access this document</Typography>
        </Stack>
        <Stack direction={'row'} justifyContent={'center'}>
          <Button onClick={handleRedirect}>Go Document List</Button>
        </Stack>
      </Grid>
    </>
  );
};
