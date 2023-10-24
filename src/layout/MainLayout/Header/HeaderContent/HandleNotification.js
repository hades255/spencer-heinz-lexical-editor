import { useCallback } from 'react';
import { DialogContent, DialogTitle, Divider, Stack, Button, Grid, Typography, Dialog } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import PropTypes from 'prop-types';

// project import
import AnimateButton from 'components/@extended/AnimateButton';
import { PopupTransition } from 'components/@extended/Transitions';
import moment from 'moment';
import { dispatch } from 'store';
import { setInvitationStatus } from 'store/reducers/notification';
import { NOTIFICATION_TYPES } from 'config/constants';

export const HandleNotificationDlg = ({ notification, open, handleClose }) => {
  const handleClickClose = useCallback(() => {
    handleClose();
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
      {notification && notification.type === NOTIFICATION_TYPES.DOCUMENT_INVITE_RECEIVE && (
        <ReceiveInvitation notification={notification} onCancel={handleClickClose} />
      )}
    </Dialog>
  );
};

const ReceiveInvitation = ({ notification, onCancel }) => {
  const handleAccept = useCallback(() => {
    onCancel();
    dispatch(setInvitationStatus(notification, "accept"));
  }, [onCancel, dispatch, notification]);

  const handleReject = useCallback(() => {
    onCancel();
    dispatch(setInvitationStatus(notification, "reject"));
  }, [onCancel, dispatch, notification]);

  return (
    <>
      <DialogTitle>Invitation</DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2.5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack spacing={2}>
              <Typography variant="h6">
                {notification.data.map((text, key) => (
                  <span key={key}>
                    {text.variant ? (
                      <Typography component="span" variant={text.variant}>
                        {text.text}
                      </Typography>
                    ) : (
                      text.text
                    )}
                  </span>
                ))}
                .
              </Typography>
              {moment(notification.updatedAt).fromNow()}
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Grid item xs={6}>
                <AnimateButton>
                  <Button disableElevation onClick={handleReject} fullWidth size="large" variant="contained" color="secondary">
                    Reject
                  </Button>
                </AnimateButton>
              </Grid>
              <Grid item xs={6}>
                <AnimateButton>
                  <Button disableElevation onClick={handleAccept} fullWidth size="large" variant="contained" color="primary">
                    Accept
                  </Button>
                </AnimateButton>
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
    </>
  );
};

ReceiveInvitation.propTypes = {
  notification: PropTypes.any,
  onCancel: PropTypes.func
};
