import { useCallback, useEffect, useState } from 'react';
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
import AddContributorsFromContributor from './AddContributorsFromContributor';
import UsersList from 'sections/apps/document/UsersList';
import TeamManagement from './TeamManagement';

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
  const [addContributorDlg, setAddContributorDlg] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(true);
  const handleDrawerOpen = useCallback(() => {
    setOpenDrawer((prevState) => !prevState);
  }, []);

  const [allUsers, setAllUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(process.env.REACT_APP_DEFAULT_WEBSOCKET_URL + 'userrooms/' + document._id + '?userId=' + user._id);
    ws.onopen = () => {
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'userslist':
          setMe(data.users.find((item) => item._id === user._id));
          setAllUsers(data.users);
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
      ws.close();
    };
  }, [user, document]);

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <UsersList
          user={user}
          users={allUsers}
          document={document}
          setAddContributorDlg={setAddContributorDlg}
          handleDrawerOpen={handleDrawerOpen}
          openDrawer={openDrawer}
        />
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
                      {me && <TeamManagement allUsers={allUsers} user={me} socket={socket} />}
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
                      pb: 1,
                      mb: 2,
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
                          {me && (
                            <EditorHistoryStateContext>
                              <LexicalEditor
                                uniqueId={document._id}
                                user={me}
                                users={me.team ? allUsers.filter((item) => item.team === me.team || item.leader) : allUsers}
                                allUsers={allUsers}
                              />
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
      <AddContributorsFromContributor
        open={addContributorDlg}
        onClose={setAddContributorDlg}
        user={user}
        exist={allUsers}
        creator={document.creator}
        uniqueId={document._id}
      />
    </>
  );
};

export default Document;

Document.propTypes = {
  user: PropTypes.any,
  document: PropTypes.any
};
