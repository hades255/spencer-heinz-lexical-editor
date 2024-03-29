import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Badge,
  Box,
  ClickAwayListener,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Popper,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import { ThemeMode } from 'config';

// assets
import { BellOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'store';
import { dispatch } from 'store';
import { addLists, setLists, setNotificationsRead } from 'store/reducers/notification';
import { addLists as addMessageLists, setLists as setMessageLists } from 'store/reducers/message';
import NotificationItem from './NotificationItem';
import AuthContext from 'contexts/JWTContext';
import { HandleNotificationDlg } from './HandleNotification';
import { NewNotificationDlg } from './NewNotificationDlg';
import { NOTIFICATION_TYPES, RELOAD_REQUIRED_NOTIFICATION_TYPES } from 'config/constants';
import useAuth from 'hooks/useAuth';
import { openSnackbar } from 'store/reducers/snackbar';
import { getDocumentLists, getDocumentSingleList, getMyDocumentLists } from 'store/reducers/document';
import { getUserLists } from 'store/reducers/user';

// sx styles
export const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

export const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',

  transform: 'none'
};

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

const Notification = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { uniqueId } = useParams();
  const user = useContext(AuthContext).user;
  const { logout } = useAuth();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const notifications = useSelector((state) => state.notification.list);

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [firstShow, setFirstShow] = useState(user.setting?.loginNotification || false);

  const [notiHandle, setNotiHandle] = useState(null);
  const [openHandle, setOpenHandle] = useState(false);

  const handleAfterReceiveNotification = useCallback(
    (notification) => {
      if (RELOAD_REQUIRED_NOTIFICATION_TYPES.includes(notification.type)) {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Admin changed your status. You have to login again.',
            variant: 'alert',
            alert: {
              color: 'info'
            },
            close: true
          })
        );
        logout();
      } else {
        switch (notification.type) {
          case NOTIFICATION_TYPES.DOCUMENT_INVITE_RECEIVE:
            //  if /document/list page-> reload documents data
            if (pathname === '/document/list') {
              dispatch(getMyDocumentLists());
            }
            break;
          case NOTIFICATION_TYPES.DOCUMENT_CREATE_NEW:
            //  if /admin/document-management page-> reload documents data
            if (pathname === '/admin/document-management') {
              dispatch(getDocumentLists());
            }
            break;
          case NOTIFICATION_TYPES.DOCUMENT_INVITE_DELETE:
            //  if /document/list page-> reload documents data
            //  if /document/:id page-> reload document data
            if (pathname === '/document/list') {
              dispatch(getMyDocumentLists());
            } else if (uniqueId === notification.redirect) {
              dispatch(getDocumentSingleList(uniqueId));
            }
            break;
          case NOTIFICATION_TYPES.USER_CREATE_NEW:
            //  if /admin/user-management page-> reload users data
            if (pathname === '/admin/user-management') {
              console.log('D');
              dispatch(getUserLists());
            }
            break;
          default:
            break;
        }
      }
    },
    [logout, pathname, uniqueId]
  );

  const handleToggle = useCallback(() => {
    setOpen((prevOpen) => !prevOpen);
  }, []);

  const handleSetRead = useCallback(() => {
    if (notifications?.filter((item) => item.status === 'unread').length) {
      dispatch(setNotificationsRead());
    }
  }, [notifications]);

  const handleGoNotificationList = useCallback(
    (e) => {
      e.preventDefault();
      navigate('/notifications');
      setOpen(false);
    },
    [navigate]
  );

  const handleRedirect = useCallback((params) => {
    // if (params?.status === 'read') return;
    setNotiHandle(params);
    setOpenHandle(true);
  }, []);

  const handleCloseRedirect = useCallback(() => {
    setNotiHandle(null);
    setOpenHandle(false);
  }, []);

  useEffect(() => {
    dispatch(setLists(null));
    dispatch(setMessageLists([]));
  }, []);

  const [flag, setFlag] = useState(0);

  useEffect(() => {
    if (flag > 1) {
      notifications.forEach((item) => {
        if (item.status === 'unread') {
          handleAfterReceiveNotification(item);
        }
      });
    }
  }, [notifications, flag, handleAfterReceiveNotification]);

  useEffect(() => {
    if (!user) return;
    const ws = new WebSocket(process.env.REACT_APP_NOTIFICATION_WEBSOCKET_URL || 'ws://192.168.148.86:8000/notification/socket');
    ws.onopen = () => {
      ws.send(JSON.stringify({ _id: user._id, role: user.role }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.notifications.length !== 0) {
        setFlag((f) => f + 1);
      }
      dispatch(addLists(data.notifications));
      dispatch(addMessageLists(data.messages));
    };

    ws.onclose = () => {};

    return () => {
      ws.close();
    };
  }, [user]);

  const handleClose = useCallback(
    (event) => {
      if (anchorRef.current && anchorRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    },
    [anchorRef]
  );

  const iconBackColorOpen = theme.palette.mode === ThemeMode.DARK ? 'grey.200' : 'grey.300';
  const iconBackColor = theme.palette.mode === ThemeMode.DARK ? 'background.default' : 'grey.100';

  return (
    <>
      <Box sx={{ flexShrink: 0, ml: 0.75 }}>
        <IconButton
          color="secondary"
          variant="light"
          sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : iconBackColor }}
          aria-label="open profile"
          ref={anchorRef}
          aria-controls={open ? 'profile-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <Badge badgeContent={notifications?.filter((item) => item.status === 'unread').length} color="primary">
            <BellOutlined />
          </Badge>
        </IconButton>
        <Popper
          placement={matchesXs ? 'bottom' : 'bottom-end'}
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
          popperOptions={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [matchesXs ? -5 : 0, 9]
                }
              }
            ]
          }}
        >
          {({ TransitionProps }) => (
            <Transitions type="grow" position={matchesXs ? 'top' : 'top-right'} sx={{ overflow: 'hidden' }} in={open} {...TransitionProps}>
              <Paper
                sx={{
                  boxShadow: theme.customShadows.z1,
                  width: '100%',
                  minWidth: 285,
                  maxWidth: 420,
                  [theme.breakpoints.down('md')]: {
                    maxWidth: 285
                  }
                }}
              >
                <ClickAwayListener onClickAway={handleClose}>
                  <MainCard
                    title="Notification"
                    elevation={0}
                    border={true}
                    content={false}
                    secondary={
                      <Tooltip title="Mark as all read">
                        <IconButton color="success" size="small" onClick={handleSetRead}>
                          <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <List
                      component="nav"
                      sx={{
                        p: 0,
                        maxHeight: '400px',
                        overflowY: 'scroll',
                        '& .MuiListItemButton-root': {
                          py: 0.5,
                          '&.Mui-selected': { bgcolor: 'grey.50', color: 'text.primary' },
                          '& .MuiAvatar-root': avatarSX,
                          '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                        }
                      }}
                    >
                      {notifications?.map((item, key) => (
                        <NotificationItem notification={item} key={key} setOpen={handleToggle} redirect={handleRedirect} />
                      ))}
                    </List>
                    <ListItemButton sx={{ textAlign: 'center', py: `${12}px !important` }}>
                      <ListItemText
                        onClick={handleGoNotificationList}
                        primary={
                          <Typography variant="h6" color="primary">
                            View All
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </MainCard>
                </ClickAwayListener>
              </Paper>
            </Transitions>
          )}
        </Popper>
      </Box>
      <HandleNotificationDlg user={user} notification={notiHandle} open={openHandle} handleClose={handleCloseRedirect} />
      <NewNotificationDlg
        notifications={notifications?.filter((item) => item.status === 'unread')}
        open={firstShow}
        handleClose={setFirstShow}
        redirect={handleRedirect}
      />
    </>
  );
};

export default Notification;
