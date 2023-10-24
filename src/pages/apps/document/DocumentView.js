import React, { useContext, useEffect } from 'react';
import { useParams } from 'react-router';
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

const DocumentView = () => {
  const theme = useTheme();
  const { uniqueId } = useParams();
  const user = useContext(AuthContext).user;
  const document = useSelector((state) => state.document.document);

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
                        <AvatarGroup max={5}>
                          {document?.contributors.map((item, key) => (
                            <UserAvatar
                              key={key}
                              user={{
                                online_status: item.online_status ?? 'none',
                                avatar: item.avatar,
                                name: item.name,
                                email: item.email
                              }}
                            />
                          ))}
                        </AvatarGroup>
                        <UserAvatar
                          user={{
                            online_status: 'available',
                            avatar: user.avatar,
                            name: user.name,
                            email: user.email
                          }}
                        />
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
                  <Typography variant="h5">About Document</Typography>
                  <Typography variant="subtitle1" color="textSecondary">{document?.description}</Typography>
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
                          <LexicalEditor uniqueId={uniqueId} />
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
    </>
  );
};

export default DocumentView;
