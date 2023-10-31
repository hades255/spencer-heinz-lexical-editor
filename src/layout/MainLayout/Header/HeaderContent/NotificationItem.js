import { useCallback } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
// import { BellOutlined, CheckCircleOutlined, GiftOutlined, MessageOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Divider, ListItemButton, ListItemAvatar, ListItemText, ListItemSecondaryAction, Typography } from '@mui/material';
import { NOTIFICATION_ITEM } from 'config/constants';
import { dispatch } from 'store';
import { setNotificationRead } from 'store/reducers/notification';

const NotificationItem = ({ notification, setOpen, redirect }) => {
  const handleRedirect = useCallback(() => {
    dispatch(setNotificationRead(notification));
    if (setOpen && redirect)
      if (notification.redirect) {
        redirect(notification);
      }
    setOpen(false);
  }, [notification, setOpen, redirect]);

  return (
    <>
      <ListItemButton selected={notification.status === 'unread'} onClick={handleRedirect}>
        <ListItemAvatar>
          <Avatar
            sx={{
              color: NOTIFICATION_ITEM[notification.type].color + '.main',
              bgcolor: NOTIFICATION_ITEM[notification.type].bgcolor + '.lighter'
            }}
          >
            {NOTIFICATION_ITEM[notification.type].avatar(notification)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
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
          }
          secondary={moment(notification.createdAt).fromNow()}
        />
        {notification.createdAt !== notification.updatedAt && (
          <ListItemSecondaryAction>
            <Typography variant="caption" noWrap>
              {moment(notification.createdAt).format('h:mm A')}
            </Typography>
          </ListItemSecondaryAction>
        )}
      </ListItemButton>
      <Divider />
    </>
  );
};

export default NotificationItem;

NotificationItem.propTypes = {
  notification: PropTypes.any,
  setOpen: PropTypes.any,
  redirect: PropTypes.any
};
