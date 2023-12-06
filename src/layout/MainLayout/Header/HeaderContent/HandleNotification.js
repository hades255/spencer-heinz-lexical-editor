import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DialogContent, DialogTitle, Divider, Stack, Button, Grid, Typography, Dialog } from '@mui/material';

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
      {notification &&
        (notification.type === NOTIFICATION_TYPES.DOCUMENT_INVITE_SEND ||
          notification.type === NOTIFICATION_TYPES.DOCUMENT_INVITE_ACCEPT ||
          notification.type === NOTIFICATION_TYPES.DOCUMENT_INVITE_REJECT ||
          notification.type === NOTIFICATION_TYPES.DOCUMENT_INVITE_DELETE) && (
          <ReceiveInvitation notification={notification} onCancel={handleClickClose} send />
        )}
    </Dialog>
  );
};

export const ReceiveInvitation = ({ notification, onCancel, send = false }) => {
  const navigate = useNavigate();
  const handleAccept = useCallback(() => {
    onCancel();
    dispatch(setInvitationStatus(notification, 'accept'));
    navigate('/document/' + notification.redirect);
  }, [onCancel, notification, navigate]);

  const handleReject = useCallback(() => {
    onCancel();
    dispatch(setInvitationStatus(notification, 'reject'));
  }, [onCancel, notification]);

  const handleRedirect = useCallback(() => {
    onCancel();
    navigate('/document/' + notification.redirect);
  }, [onCancel, notification, navigate]);

  return (
    <>
      <DialogTitle>Invitation</DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2.5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {notification._id && (
              <Stack spacing={2}>
                <Typography variant="h6">
                  {notification.data.map((text, key) => (
                    <span key={key}>
                      {text.text === '<br/>' ? (
                        <br />
                      ) : text.variant ? (
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
              </Stack>
            )}
            {notification._id && (
              <Stack spacing={2}>
                <Typography variant="subtitle1">{moment(notification.createdAt).fromNow()}</Typography>
              </Stack>
            )}
            {send ? (
              <Stack direction="row" spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <AnimateButton>
                    <Button disableElevation onClick={handleRedirect} fullWidth size="large" variant="contained" color="secondary">
                      View Document
                    </Button>
                  </AnimateButton>
                </Grid>
              </Stack>
            ) : (
              <Stack direction="row" spacing={2} alignItems="center">
                <>
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
                </>
              </Stack>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </>
  );
};

ReceiveInvitation.propTypes = {
  user: PropTypes.object,
  notification: PropTypes.object,
  onCancel: PropTypes.func,
  send: PropTypes.bool
};

HandleNotificationDlg.propTypes = {
  notification: PropTypes.object,
  handleClose: PropTypes.func,
  open: PropTypes.bool
};

export const HandleInvitation = ({ user, document, notification, onCancel }) => {
  const navigate = useNavigate();
  const me = document.invites?.find((item) => item._id === user._id);
  const team = me.team || document.team;
  const leader = me.team
    ? [{ ...document.creator, team: document.team, leader: true }, ...document.invites].find((item) => item.team === team && item.leader)
        ._id
    : document.creator._id;
  console.log(leader);
  const handleAccept = useCallback(() => {
    onCancel();
    dispatch(setInvitationStatus(notification, 'accept', leader));
    navigate('/document/' + notification.redirect);
  }, [onCancel, notification, navigate, leader]);

  const handleReject = useCallback(() => {
    onCancel();
    dispatch(setInvitationStatus(notification, 'reject'));
  }, [onCancel, notification]);

  const handleRedirect = useCallback(() => {
    onCancel();
    navigate('/document/' + notification.redirect);
  }, [onCancel, notification, navigate]);

  useEffect(() => {
    if (!me) handleRedirect();
  }, [me, handleRedirect]);

  return (
    <>
      <DialogTitle>Invitation</DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2.5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {notification._id && (
              <Stack spacing={2}>
                <Typography variant="h6">
                  {notification.data.map((text, key) => (
                    <span key={key}>
                      {text.text === '<br/>' ? (
                        <br />
                      ) : text.variant ? (
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
              </Stack>
            )}
            {notification._id && (
              <Stack spacing={2}>
                <Typography variant="subtitle1">{moment(notification.createdAt).fromNow()}</Typography>
              </Stack>
            )}
            <Stack direction="row" spacing={2} alignItems="center">
              <>
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
              </>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
    </>
  );
};

HandleInvitation.propTypes = {
  user: PropTypes.object,
  document: PropTypes.object,
  notification: PropTypes.object,
  onCancel: PropTypes.func
};
