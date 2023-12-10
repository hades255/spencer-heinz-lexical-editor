import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Box, Button, Grid, Stack, Tooltip, Typography } from '@mui/material';
import base64url from 'base64url';

import AuthContext from 'contexts/JWTContext';
import Check from './Check';
import Document from './Document';
import { useSelector, dispatch } from 'store';
import { getDocumentSingleList } from 'store/reducers/document';
import BackgroundLetterAvatar from 'components/@extended/BackgroundLetterAvatar';
import MainCard from 'components/MainCard';
import CustomCell from 'components/customers/CustomCell';
import axiosServices from 'utils/axios';
import { openSnackbar } from 'store/reducers/snackbar';

const DocumentView = () => {
  const { uniqueId } = useParams();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location]);
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
          <Check searchParams={searchParams} user={user} document={document} handleRefresh={handleRefresh} />
        ) : (
          <Redirect searchParams={searchParams} document={document} handleRefresh={handleRefresh} />
        ))}
    </>
  );
};

export default DocumentView;

const Redirect = ({ document, searchParams, handleRefresh }) => {
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [invitor, setInvitor] = useState(null);
  const [leader, setLeader] = useState('');

  const compareDate = useCallback((d) => {
    return d < new Date().getTime();
  }, []);

  useEffect(() => {
    if (searchParams.get('invitation')) {
      const dec = base64url.decode(searchParams.get('invitation'));
      const { e, x } = JSON.parse(dec);
      if (compareDate(x)) {
        setError('Your invitation is expired.');
        return;
      }
      if (e === document.creator.email) {
        setLeader(document.creator._id);
        setInvitor({ ...document.creator, team: document.team });
        return;
      }
      for (let inv of document.invites) {
        if (e === inv.email) {
          setLeader(
            [{ ...document.creator, team: document.team, leader: true }, ...document.invites].find(
              (item) => item.team === inv.team && item.leader
            )?._id || document.creator._id
          );
          setInvitor(inv);
          return;
        }
      }
      setError('Your invitor is not exist in this document.');
    } else {
      setError('You cannot access this document');
    }
  }, [document, searchParams, compareDate]);

  const handleInvitation = useCallback(() => {
    (async () => {
      try {
        await axiosServices.put(`/document/${document._id}/t`, { team: invitor.team, invitor: invitor._id, leader });
        handleRefresh();
      } catch (error) {
        console.log(error);
        dispatch(
          openSnackbar({
            open: true,
            message: 'Server connection error.',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
      }
    })();
  }, [document, leader, invitor, handleRefresh]);

  const handleRedirect = useCallback(() => {
    navigate('/document/list');
  }, [navigate]);

  return (
    <>
      <Grid item xs={12}>
        {error ? (
          <Stack direction={'row'} justifyContent={'center'}>
            <Typography variant="h4">{error}</Typography>
          </Stack>
        ) : (
          invitor && (
            <Box>
              <Stack direction={'row'} justifyContent={'center'} sx={{ my: 3 }}>
                <Typography variant="h4">You have been invited to edit this document.</Typography>
              </Stack>
              <Stack>
                <Typography variant="h5">Document Details</Typography>
                <MainCard
                  content={false}
                  sx={{
                    bgcolor: 'grey.50',
                    pt: 2,
                    pl: 2
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid
                      item
                      xs={12}
                      sx={{
                        pr: 2,
                        pb: 2
                      }}
                    >
                      <Grid container justifyContent="space-between">
                        <Grid item xs={12} sm={8}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {document && (
                              <Box>
                                Creator:
                                <CustomCell
                                  user={{
                                    online_status: 'none',
                                    avatar: document.creator.avatar,
                                    name: document.creator.name,
                                    email: document.creator.email
                                  }}
                                />
                              </Box>
                            )}
                            <Typography variant="h4">{document?.name}</Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Stack direction={'row'} alignItems="center" justifyContent={'end'}>
                            <Typography variant="subtitle1" sx={{ mr: 2 }}>
                              {document?.invites.length} Contributors
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid container spacing={3}>
                    <Grid
                      item
                      xs={12}
                      sx={{
                        pr: 2,
                        pb: 2
                      }}
                    >
                      Description:
                      <Typography variant="subtitle1" color="textSecondary">
                        {document?.description}
                      </Typography>
                    </Grid>
                  </Grid>
                </MainCard>
              </Stack>
              <Stack direction={'row'} justifyContent={'center'} alignItems={'center'} sx={{ my: 2 }}>
                <BackgroundLetterAvatar name={invitor.name} />{' '}
                <Typography sx={{ ml: 2, fontSize: 16 }}>
                  Invited by{' '}
                  <Tooltip title={invitor.email}>
                    <b>{invitor.name}</b>
                  </Tooltip>
                </Typography>
              </Stack>
              <Stack direction={'row'} justifyContent={'center'} sx={{ my: 2 }}>
                <Button onClick={handleInvitation} sx={{ width: 300 }} color="primary" variant="contained">
                  Accept Invitation
                </Button>
              </Stack>
            </Box>
          )
        )}
        <Stack direction={'row'} justifyContent={'center'}>
          <Button onClick={handleRedirect}>Go Document List</Button>
        </Stack>
      </Grid>
    </>
  );
};

Redirect.propTypes = {
  document: PropTypes.any,
  searchParams: PropTypes.any,
  handleRefresh: PropTypes.any
};
