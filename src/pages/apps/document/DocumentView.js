import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AvatarGroup, Box, Grid, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import MainCard from 'components/MainCard';
import UserAvatar from 'sections/apps/user/UserAvatar';

import { ThemeMode } from 'config';
import AuthContext from 'contexts/JWTContext';
import CustomCell from 'components/customers/CustomCell';
import { EditorHistoryStateContext } from 'contexts/LexicalEditor';
import LexicalEditor from 'lexical-editor';
import SimpleBar from 'simplebar-react';
import { dispatch } from 'store';
import { getDocumentSingleList } from 'store/reducers/document';
import { useSelector } from 'store';
import BackgroundLetterAvatar from 'components/@extended/BackgroundLetterAvatar';
import AddContributorsFromContributor from './AddContributorsFromContributor';
import axiosServices from 'utils/axios';
import { openSnackbar } from 'store/reducers/snackbar';

const DocumentView = () => {
  const theme = useTheme();
  const { uniqueId } = useParams();
  const user = useContext(AuthContext).user;
  const document = useSelector((state) => state.document.document);

  const [addContributorDlg, setAddContributorDlg] = useState(false);

  const handleAddContributors = useCallback(
    (params = null) => {
      setAddContributorDlg(false);
      if (params && params.length) {
        (async () => {
          try {
            await axiosServices.post('/document/' + uniqueId + '/invite', { contributors: params });
            dispatch(getDocumentSingleList(uniqueId));
            dispatch(
              openSnackbar({
                open: true,
                message: 'Invitation sended successfully.',
                variant: 'alert',
                alert: {
                  color: 'success'
                },
                close: true
              })
            );
          } catch (error) {
            console.log(error);
          }
        })();
      }
    },
    [uniqueId]
  );

  useEffect(() => {
    dispatch(getDocumentSingleList(uniqueId));
  }, [uniqueId]);

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Grid container>
          <Grid
            item
            xs={12}
            sx={{
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.shorter + 200
              })
            }}
          >
            <MainCard
              content={false}
              sx={{
                bgcolor: theme.palette.mode === ThemeMode.DARK ? 'dark.main' : 'grey.50',
                pt: 2,
                pl: 2,
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.easeOut,
                  duration: theme.transitions.duration.shorter + 200
                })
              }}
            >
              <Grid container spacing={3}>
                <Grid
                  item
                  xs={12}
                  sx={{
                    bgcolor: theme.palette.background.paper,
                    pr: 2,
                    pb: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Grid container justifyContent="space-between">
                    <Grid item xs={12} sm={8}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {document && (
                          <CustomCell
                            user={{
                              online_status: 'none',
                              avatar: document.creator.avatar,
                              name: document.creator.name,
                              email: document.creator.email
                            }}
                          />
                        )}
                        <Typography variant="h4">{document?.name}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Stack direction="row" alignItems="center" justifyContent={'space-between'} spacing={1}>
                        <Stack direction="row">
                          <AvatarGroup max={6}>
                            {document?.contributors.map((item, key) => (
                              <UserAvatar
                                key={key}
                                user={{
                                  online_status: 'none',
                                  avatar: item.avatar,
                                  name: item.name,
                                  email: item.email
                                }}
                              />
                            ))}
                            <BackgroundLetterAvatar
                              name={'+'}
                              onClick={() => {
                                setAddContributorDlg(true);
                              }}
                            />
                          </AvatarGroup>
                        </Stack>
                        {user && (
                          <UserAvatar
                            user={{
                              online_status: 'none',
                              avatar: user.avatar,
                              name: user.name,
                              email: user.email
                            }}
                          />
                        )}
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
                    bgcolor: theme.palette.background.paper,
                    pr: 2,
                    pb: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  {/* <Typography variant="h5">About Document</Typography> */}
                  <Typography variant="subtitle1" color="textSecondary">
                    {document?.description}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container spacing={3}>
                <Grid
                  item
                  xs={12}
                  sx={{
                    bgcolor: theme.palette.background.paper,
                    pr: 2,
                    pb: 2
                  }}
                >
                  <Grid container justifyContent="space-between">
                    <Grid item xs={12}>
                      <SimpleBar
                        sx={{
                          overflowX: 'hidden',
                          height: 'calc(100vh - 133px)',
                          minHeight: 420
                        }}
                      >
                        <EditorHistoryStateContext>{user && <LexicalEditor uniqueId={uniqueId} user={user} />}</EditorHistoryStateContext>
                      </SimpleBar>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
        </Grid>
      </Box>
      {addContributorDlg && (
        <AddContributorsFromContributor
          open={addContributorDlg}
          onClose={handleAddContributors}
          user={user}
          exist={document.invites.map((item) => item.email)}
          creator={document.creator}
        />
      )}
    </>
  );
};

export default DocumentView;
