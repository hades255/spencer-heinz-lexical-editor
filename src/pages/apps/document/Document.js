import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, IconButton, Stack, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';

import { ThemeMode } from 'config';
import CustomCell from 'components/customers/CustomCell';
import { EditorHistoryStateContext } from 'contexts/LexicalEditor';
import LexicalEditor from 'lexical-editor';
import SimpleBar from 'simplebar-react';
import UsersList from 'sections/apps/document/UsersList';
import TeamManagement from './TeamManagement';
import { dispatch } from 'store';
import {
  setDocActiveTeam,
  setDocBlockTeams,
  setDocEmails,
  setDocInvitedUsers,
  setDocLeaders,
  setDocMe,
  setDocUsers,
  setOnlinestatusToTeam
} from 'store/reducers/document';
import { useSelector } from 'store';
import { TruncatedText } from 'utils/string';
import CheckClipboardPermission from './CheckClipboardPermission';

const drawerWidth = 320;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter
  }),
  marginLeft: open ? 0 : `-${drawerWidth}px`,
  [theme.breakpoints.down('lg')]: {
    paddingLeft: 0,
    marginLeft: 0
  },
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.shorter
    })
  }),
  width: 0
}));

const Document = ({ user, document }) => {
  const theme = useTheme();
  const isMounted = useRef(true);
  const [openDrawer, setOpenDrawer] = useState(true);
  const handleDrawerOpen = useCallback(() => {
    setOpenDrawer((prevState) => !prevState);
  }, []);

  const [socket, setSocket] = useState(null);
  const [load, setLoad] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const blocked = useSelector((state) => state.document.blockTeams.includes(state.document.me?.team));

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleShowDescMore = useCallback(() => setShowDesc(!showDesc), [showDesc]);

  const handleSetSocket = useCallback(() => {
    const ws = new WebSocket(process.env.REACT_APP_DEFAULT_WEBSOCKET_URL + 'userrooms/' + document._id + '?userId=' + user._id);
    ws.onopen = () => {
      console.log('open');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // console.log(data);
      switch (data.type) {
        case 'active-team':
          dispatch(setDocActiveTeam(data.active)); //  active status team
          break;
        case 'block-team':
          dispatch(setDocBlockTeams(data.blocked)); //  active status team
          break;
        case 'online-status':
          dispatch(setOnlinestatusToTeam(data.user)); //  active status team
          break;
        case 'userslistWithTeam':
          dispatch(setDocLeaders(data.leaders)); //  all leaders of each team
          dispatch(setDocUsers(data.users)); //  users in my team
          dispatch(setDocEmails(data.emails)); //  all emails in this doc
          dispatch(setDocMe(data.users.find((item) => item._id === user._id))); //  me
          dispatch(setDocActiveTeam(data.active)); //  active status team
          dispatch(setDocBlockTeams(data.blocked || [])); //  active blocked team
          dispatch(setDocInvitedUsers(data.invitedUsers));
          break;
        default:
          break;
      }
    };

    ws.onclose = () => {
      console.log('close');
      setSocket(null);
    };

    return () => {
      console.log('closing');
      if (ws) ws.close();
    };
  }, [user, document]);

  useEffect(() => {
    if (socket === null) {
      console.log('restart socket');
      handleSetSocket();
    } else {
      setLoad(true);
    }

    return () => {
      if (!isMounted.current) {
        console.log('close socket');
        if (socket) socket.close();
      }
    };
  }, [socket, handleSetSocket]);

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <UsersList handleDrawerOpen={handleDrawerOpen} openDrawer={openDrawer} socket={socket} document={document} />
        <Main theme={theme} open={openDrawer}>
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
                          <IconButton onClick={handleDrawerOpen} color="secondary" size="large">
                            {openDrawer ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                          </IconButton>
                          {document && (
                            <CustomCell
                              user={{
                                online_status: 'none',
                                ...document.creator
                              }}
                            />
                          )}
                          <Typography variant="h4">{document?.name}</Typography>
                        </Stack>
                      </Grid>
                      {load && <TeamManagement socket={socket} />}
                    </Grid>
                  </Grid>
                </Grid>
                {document?.description && (
                  <Grid container spacing={3}>
                    <Grid
                      item
                      xs={12}
                      sx={{
                        bgcolor: theme.palette.background.paper,
                        pr: 2,
                        pb: 1,
                        mb: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Typography variant="subtitle1" color="textSecondary">
                        {showDesc ? document.description : TruncatedText(document.description, 70)}
                        {document.description.length > 70 && (
                          <Typography
                            variant="caption"
                            sx={{ pl: 1, pr: 1, fontWeight: 'bold', color: 'dark', cursor: 'pointer' }}
                            onClick={handleShowDescMore}
                          >
                            {showDesc ? 'Hide' : 'More'}
                          </Typography>
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
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
                          {load && blocked ? (
                            <Stack direction={'row'} justifyContent={'center'}>
                              <Typography>Your team is blocked. You cannot see the document.</Typography>
                            </Stack>
                          ) : (
                            <EditorHistoryStateContext>
                              <LexicalEditor uniqueId={document._id} user={user} />
                            </EditorHistoryStateContext>
                          )}
                        </SimpleBar>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </MainCard>
            </Grid>
          </Grid>
        </Main>
      </Box>
      <CheckClipboardPermission />
    </>
  );
};

export default Document;

Document.propTypes = {
  user: PropTypes.any,
  document: PropTypes.any
};
