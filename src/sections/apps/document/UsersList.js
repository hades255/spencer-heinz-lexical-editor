import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Badge,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Drawer,
  Grid,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  OutlinedInput,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircleFilled,
  ClockCircleFilled,
  InfoOutlined,
  MailOutlined,
  MinusCircleFilled,
  RightOutlined,
  SearchOutlined,
  SettingOutlined
} from '@ant-design/icons';

// project imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import SimpleBar from 'components/third-party/SimpleBar';
import UserList from '../user/UserList';
import UserAvatar from '../user/UserAvatar';
import { ThemeMode } from 'config';
import AddContributorsFromContributor from 'pages/apps/document/AddContributorsFromContributor';
import { useSelector } from 'store';
import ShowEmailSending from './ShowEmailSending';

// ==============================|| CHAT DRAWER ||============================== //

function UsersList({ openDrawer, handleDrawerOpen, socket, document }) {
  const users = useSelector((state) => state.document.users);
  const user = useSelector((state) => state.document.me);
  const invitedUsers = useSelector((state) => state.document.invitedUsers);

  const theme = useTheme();
  const [addContributorDlg, setAddContributorDlg] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const drawerBG = theme.palette.mode === ThemeMode.DARK ? 'dark.main' : 'white';

  // show menu to set current user status
  const [anchorEl, setAnchorEl] = useState();
  const handleClickRightMenu = useCallback((event) => setAnchorEl(event?.currentTarget), []);

  const handleCloseRightMenu = useCallback(() => setAnchorEl(null), []);

  const handleCloseShowPopup = useCallback(() => setShowPopup(false), []);

  // set user status on status menu click
  const [status, setStatus] = useState('available');
  const handleRightMenuItemClick = useCallback(
    (userStatus) => () => {
      setStatus(userStatus);
      handleCloseRightMenu();
    },
    [handleCloseRightMenu]
  );

  const [search, setSearch] = useState('');
  const handleSearch = useCallback((event) => {
    const newString = event?.target.value;
    setSearch(newString);
  }, []);

  const [openEmailDlg, setOpenEmailDlg] = useState(false);
  const handleOpenEmailSendingDlg = useCallback(() => setOpenEmailDlg(true), []);
  const handleCloseEmailSendingDlg = useCallback(() => setOpenEmailDlg(false), []);

  return (
    <>
      <Drawer
        sx={{
          width: 320,
          flexShrink: 0,
          top: { xs: 50, lg: 0 },
          zIndex: { xs: 1100, lg: 0 },
          '& .MuiDrawer-paper': {
            height: matchDownLG ? '100%' : 'auto',
            width: 320,
            boxSizing: 'border-box',
            position: 'relative',
            border: 'none'
          }
        }}
        variant={matchDownLG ? 'temporary' : 'persistent'}
        anchor="left"
        open={openDrawer}
        ModalProps={{ keepMounted: true }}
        onClose={handleDrawerOpen}
      >
        <MainCard
          sx={{
            bgcolor: matchDownLG ? 'transparent' : drawerBG,
            borderRadius: '4px 0 0 4px',
            borderRight: 'none'
          }}
          border={!matchDownLG}
          content={false}
        >
          <Box sx={{ p: 3, pb: 1 }}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent={'space-between'}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="h5" color="inherit">
                    Users
                  </Typography>
                  <Chip
                    label={users.length}
                    component="span"
                    color="success"
                    sx={{
                      minWidth: 20,
                      height: 20,
                      borderRadius: 10,
                      '& .MuiChip-label': {
                        px: 0.5
                      }
                    }}
                  />
                  <Avatar
                    onClick={() => {
                      setAddContributorDlg(true);
                    }}
                    sx={{ cursor: 'pointer', width: 30, height: 30 }}
                  >
                    +
                  </Avatar>
                </Stack>
                <IconButton onClick={handleOpenEmailSendingDlg}>
                  <Badge badgeContent={invitedUsers.filter((item) => !item.mailStatus).length} color="primary">
                    <MailOutlined color="action" />
                  </Badge>
                </IconButton>
              </Stack>

              <OutlinedInput
                fullWidth
                id="input-search-header"
                placeholder="Search"
                value={search}
                onChange={handleSearch}
                sx={{
                  '& .MuiOutlinedInput-input': {
                    p: '10.5px 0px 12px'
                  }
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchOutlined style={{ fontSize: 'small' }} />
                  </InputAdornment>
                }
              />
            </Stack>
          </Box>

          <SimpleBar
            sx={{
              overflowX: 'hidden',
              height: matchDownLG ? 'calc(100vh - 120px)' : 'calc(100vh - 428px)',
              minHeight: matchDownLG ? 0 : 420
            }}
          >
            <Box sx={{ p: 3, pt: 0 }}>
              <UserList search={search} users={users} socket={socket} />
            </Box>
          </SimpleBar>
          <Box sx={{ p: 3, pb: 0 }}>
            <List component="nav">
              <ListItemButton divider>
                <ListItemIcon>
                  <SettingOutlined />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </List>
          </Box>
          {user && (
            <Box sx={{ p: 3, pt: 1, pl: 5 }}>
              <Grid container>
                <Grid item xs={12}>
                  <Grid container spacing={1} alignItems="center" sx={{ flexWrap: 'nowrap' }}>
                    <Grid item>
                      <UserAvatar user={{ online_status: status, ...user }} />
                    </Grid>
                    <Grid item xs zeroMinWidth>
                      <Stack sx={{ cursor: 'pointer', textDecoration: 'none' }} component={Link} to="/profiles/view">
                        <Typography align="left" variant="h5" color="textPrimary">
                          {user.name}
                        </Typography>
                        <Typography align="left" variant="caption" color="textSecondary">
                          {user.role}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item>
                      <IconButton onClick={handleClickRightMenu} size="small" color="secondary">
                        <RightOutlined />
                      </IconButton>
                      <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleCloseRightMenu}
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right'
                        }}
                        transformOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right'
                        }}
                        sx={{
                          '& .MuiMenu-list': {
                            p: 0
                          },
                          '& .MuiMenuItem-root': {
                            pl: '6px',
                            py: '3px'
                          }
                        }}
                      >
                        <MenuItem onClick={handleRightMenuItemClick('available')}>
                          <IconButton
                            size="small"
                            sx={{
                              color: theme.palette.success.main,
                              '&:hover': { color: theme.palette.success.main, bgcolor: 'transparent', transition: 'none', padding: 0 }
                            }}
                          >
                            <CheckCircleFilled />
                          </IconButton>
                          <Typography>Active</Typography>
                        </MenuItem>
                        <MenuItem onClick={handleRightMenuItemClick('offline')}>
                          <IconButton
                            size="small"
                            sx={{
                              color: theme.palette.warning.main,
                              '&:hover': { color: theme.palette.warning.main, bgcolor: 'transparent', transition: 'none', padding: 0 }
                            }}
                          >
                            <ClockCircleFilled />
                          </IconButton>
                          <Typography>Away</Typography>
                        </MenuItem>
                        <MenuItem onClick={handleRightMenuItemClick('do_not_disturb')}>
                          <IconButton
                            size="small"
                            sx={{
                              color: theme.palette.grey[400],
                              '&:hover': { color: theme.palette.grey[400], bgcolor: 'transparent', transition: 'none', padding: 0 }
                            }}
                          >
                            <MinusCircleFilled />
                          </IconButton>
                          <Typography>Do not disturb</Typography>
                        </MenuItem>
                      </Menu>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
        </MainCard>
      </Drawer>
      {addContributorDlg && (
        <AddContributorsFromContributor
          open={addContributorDlg}
          onClose={setAddContributorDlg}
          exist={users}
          me={user}
          document={document}
          setShowPopup={setShowPopup}
        />
      )}
      {openEmailDlg && <ShowEmailSending open={openEmailDlg} onClose={handleCloseEmailSendingDlg} />}
      <AlertDlg open={showPopup} onClose={handleCloseShowPopup}>
        <Typography>Newly added users must be invited/emailed manually</Typography>
      </AlertDlg>
    </>
  );
}

UsersList.propTypes = {
  handleDrawerOpen: PropTypes.func,
  openDrawer: PropTypes.bool,
  socket: PropTypes.any,
  document: PropTypes.any
};

export default UsersList;

export const AlertDlg = ({ open, onClose, children }) => (
  <Dialog
    open={open}
    onClose={(r) => {
      if (r === 'escapeKeyDown') onClose();
    }}
  >
    <DialogContent>
      <Stack direction={'row'} justifyContent={'center'}>
        <Avatar color="info" sx={{ width: 72, height: 72, fontSize: '3rem' }}>
          <InfoOutlined />
        </Avatar>
      </Stack>
      <Stack sx={{ my: 3 }}>{children}</Stack>
      <Stack>
        <Button onClick={onClose} variant="contained">
          OK
        </Button>
      </Stack>
    </DialogContent>
  </Dialog>
);

AlertDlg.propTypes = {
  open: PropTypes.any,
  onClose: PropTypes.any,
  children: PropTypes.any
};
