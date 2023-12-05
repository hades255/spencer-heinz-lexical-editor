import { useCallback } from 'react';

import PropTypes from 'prop-types';

// project import
import { PopupTransition } from 'components/@extended/Transitions';
import { Dialog, DialogContent, DialogTitle, Divider, Grid, IconButton, List, Tooltip } from '@mui/material';
import NotificationItem from './NotificationItem';
import { actionSX, avatarSX } from './Notification';
import { CheckCircleOutlined } from '@ant-design/icons';
import { dispatch } from 'store';
import { setNotificationsRead } from 'store/reducers/notification';
import CloseIcon from '@mui/icons-material/Close';

export const NewNotificationDlg = ({ notifications, open, handleClose, redirect }) => {
  const handleClickClose = useCallback(() => {
    handleClose(false);
  }, [handleClose]);

  const handleSetRead = useCallback(() => {
    if (notifications?.filter((item) => item.status === 'unread').length) {
      dispatch(setNotificationsRead());
    }
  }, [notifications]);

  return (
    <Dialog
      maxWidth="sm"
      TransitionComponent={PopupTransition}
      onClose={(r) => {
        if (r === 'escapeKeyDown') handleClickClose();
      }}
      open={open}
      sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
      aria-describedby="alert-dialog-slide-description"
    >
      <IconButton
        aria-label="close"
        onClick={handleClickClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500]
        }}
      >
        <CloseIcon />
      </IconButton>
      <Tooltip title="Mark all as read" sx={{ position: 'absolute', top: 11, right: 40 }}>
        <IconButton color="success" size="small" onClick={handleSetRead}>
          <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
        </IconButton>
      </Tooltip>
      <DialogTitle>{notifications.length ? 'You have new notifications' : 'You have no new notifications'}</DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2.5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <List
              component="nav"
              sx={{
                p: 0,
                width: '400px',
                height: '400px',
                overflowY: 'scroll',
                '& .MuiListItemButton-root': {
                  py: 0.5,
                  '&.Mui-selected': { bgcolor: 'grey.50', color: 'text.primary' },
                  '& .MuiAvatar-root': avatarSX,
                  '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                }
              }}
            >
              {notifications.map((item, key) => (
                <NotificationItem notification={item} key={key} setOpen={null} redirect={redirect} />
              ))}
            </List>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

NewNotificationDlg.propTypes = {
  notifications: PropTypes.any,
  handleClose: PropTypes.func,
  redirect: PropTypes.func,
  open: PropTypes.any
};
