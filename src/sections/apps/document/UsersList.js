import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Chip,
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
import { CheckCircleFilled, ClockCircleFilled, MinusCircleFilled, RightOutlined, SearchOutlined, SettingOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import SimpleBar from 'components/third-party/SimpleBar';
import BackgroundLetterAvatar from 'components/@extended/BackgroundLetterAvatar';
import UserList from '../user/UserList';
import UserAvatar from '../user/UserAvatar';
import { ThemeMode } from 'config';

// ==============================|| CHAT DRAWER ||============================== //

function UsersList({ user, document, setAddContributorDlg, openDrawer, handleDrawerOpen }) {
  const theme = useTheme();

  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const drawerBG = theme.palette.mode === ThemeMode.DARK ? 'dark.main' : 'white';

  // show menu to set current user status
  const [anchorEl, setAnchorEl] = useState();
  const handleClickRightMenu = (event) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleCloseRightMenu = () => {
    setAnchorEl(null);
  };

  // set user status on status menu click
  const [status, setStatus] = useState('available');
  const handleRightMenuItemClick = (userStatus) => () => {
    setStatus(userStatus);
    handleCloseRightMenu();
  };

  const [search, setSearch] = useState('');
  const handleSearch = async (event) => {
    const newString = event?.target.value;
    setSearch(newString);
  };

  const users = [document.creator, ...document.invites];

  return (
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
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="h5" color="inherit">
                Users
              </Typography>
              <Chip
                label={users.length+120}
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
              >
                <BackgroundLetterAvatar name="+" style={{ fontSize: '30px', color: '#08c', cursor: 'pointer' }} />
              </Avatar>
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
            <UserList search={search} uniqueId={document._id} users={users} />
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
      </MainCard>
    </Drawer>
  );
}

UsersList.propTypes = {
  user: PropTypes.any,
  document: PropTypes.any,
  setAddContributorDlg: PropTypes.func,
  handleDrawerOpen: PropTypes.func,
  openDrawer: PropTypes.bool
};

export default UsersList;
