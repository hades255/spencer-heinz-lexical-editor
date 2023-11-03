import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Avatar, AvatarGroup, Box, Grid, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { UserSwitchOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import UserAvatar from 'sections/apps/user/UserAvatar';

import { ThemeMode } from 'config';
import AuthContext from 'contexts/JWTContext';
import CustomCell from 'components/customers/CustomCell';
import { EditorHistoryStateContext } from 'contexts/LexicalEditor';
import LexicalEditor from 'lexical-editor';
import SimpleBar from 'simplebar-react';
import { dispatch } from 'store';
import { getDocumentSingleList, getSingleList } from 'store/reducers/document';
import { useSelector } from 'store';
import BackgroundLetterAvatar from 'components/@extended/BackgroundLetterAvatar';
import AddContributorsFromContributor from './AddContributorsFromContributor';
import Check from './Check';

const DocumentView = () => {
  const theme = useTheme();
  const { uniqueId } = useParams();
  const user = useContext(AuthContext).user;
  const document = useSelector((state) => state.document.document);

  const [addContributorDlg, setAddContributorDlg] = useState(false);

  useEffect(() => {
    dispatch(getSingleList(null));
    dispatch(getDocumentSingleList(uniqueId));
  }, [uniqueId]);

  return (
    <>
      {document &&
        user &&
        (document.creator.email === user.email || document.contributors.some((item) => item.email === user.email) ? (
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
                                <AvatarGroup>
                                  <Avatar
                                    onClick={() => {
                                      setAddContributorDlg(true);
                                    }}
                                  >
                                    <UserSwitchOutlined style={{ fontSize: '30px', color: '#08c', cursor: 'pointer' }} />
                                  </Avatar>
                                </AvatarGroup>
                                <AvatarGroup max={5}>
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
                              <EditorHistoryStateContext>
                                {user && document && (
                                  <LexicalEditor uniqueId={uniqueId} user={user} allUsers={[document.creator, ...document.invites]} />
                                )}
                              </EditorHistoryStateContext>
                            </SimpleBar>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </MainCard>
                </Grid>
              </Grid>
            </Box>
            {document && (
              <AddContributorsFromContributor
                open={addContributorDlg}
                onClose={setAddContributorDlg}
                user={user}
                exist={[document.creator, ...document.invites]}
                creator={document.creator}
                uniqueId={uniqueId}
              />
            )}
          </>
        ) : document.invites.some((item) => item.email === user.email && item.reply === 'pending') ? (
          <Check document={document} user={user} />
        ) : (
          <Redirect />
        ))}
    </>
  );
};

export default DocumentView;

const Redirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/');
  }, [navigate]);
  return <></>;
};
