import React, { useEffect } from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import { dispatch, useSelector } from 'store';
import { getNotifications } from 'store/reducers/notification';
import moment from 'moment';
import { NOTIFICATION_ITEM } from 'config/constants';
import { Avatar, Grid, Stack } from '@mui/material';

const NotificationList = () => {
  const notifications = useSelector((state) => state.notification.all);

  useEffect(() => {
    dispatch(getNotifications());
  }, []);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MainCard content={false}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent={'center'} alignItems="center" sx={{ pt: 3 }}>
                  <Typography variant="h4">Notifications</Typography>
                </Stack>
              </Grid>
              <Timeline position="alternate">
                {notifications.map((notification, key) => (
                  <TimelineItem key={key}>
                    <TimelineOppositeContent sx={{ m: 'auto 0' }} align="right" variant="body2" color="text.secondary">
                      {moment(notification.createdAt).fromNow()}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineConnector />
                      <TimelineDot color={NOTIFICATION_ITEM[notification.type].color}>
                        <Avatar
                          sx={{
                            color: NOTIFICATION_ITEM[notification.type].color + '.main',
                            bgcolor: NOTIFICATION_ITEM[notification.type].bgcolor + '.lighter'
                          }}
                        >
                          {NOTIFICATION_ITEM[notification.type].avatar(notification)}
                        </Avatar>
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }}>
                      <Typography variant="h6" component="span">
                        {NOTIFICATION_ITEM[notification.type].title}
                      </Typography>
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
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Grid>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default NotificationList;
