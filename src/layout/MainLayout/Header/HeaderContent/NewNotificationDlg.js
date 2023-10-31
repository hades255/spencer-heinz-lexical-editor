import { useCallback } from 'react';

import PropTypes from 'prop-types';

// project import
import { PopupTransition } from 'components/@extended/Transitions';
import { Dialog, DialogContent, DialogTitle, Divider, Grid, List } from '@mui/material';
import NotificationItem from './NotificationItem';
import { actionSX, avatarSX } from './Notification';

export const NewNotificationDlg = ({ notifications, open, handleClose }) => {
  const handleClickClose = useCallback(() => {
    handleClose(false);
  }, [handleClose]);

  return (
    <Dialog
      maxWidth="sm"
      TransitionComponent={PopupTransition}
      onClose={handleClickClose}
      open={open}
      sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>New Notifications</DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2.5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
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
              {notifications.map((item, key) => (
                <NotificationItem notification={item} key={key} setOpen={null} redirect={null} />
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
  open: PropTypes.bool
};
