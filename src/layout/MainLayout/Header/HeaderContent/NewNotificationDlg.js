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
      onClose={handleClickClose}
      open={open}
      sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>You have new notifications</DialogTitle>
      <Tooltip title="Mark as all read" sx={{ position: 'absolute', top: 12, right: 12 }}>
        <IconButton color="success" size="small" onClick={handleSetRead}>
          <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
        </IconButton>
      </Tooltip>
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
  open: PropTypes.bool
};
