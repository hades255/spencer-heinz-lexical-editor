import React, { useEffect } from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import HotelIcon from '@mui/icons-material/Hotel';
import RepeatIcon from '@mui/icons-material/Repeat';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import { dispatch, useSelector } from 'store';
import notification, { getNotifications } from 'store/reducers/notification';
import moment from 'moment';
import { NOTIFICATION_ITEM } from 'config/constants';

const NotificationList = () => {
  const notifications = useSelector((state) => state.notification.all);

  useEffect(() => {
    dispatch(getNotifications());
  }, []);

  return (
    <>
      <MainCard content={false}>
        <Timeline position="alternate">
          {notifications.map((notification, key) => (
            <TimelineItem key={key}>
              <TimelineOppositeContent sx={{ m: 'auto 0' }} align="right" variant="body2" color="text.secondary">
                {moment(notification.createdAt).fromNow()}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineConnector />
                <TimelineDot color={NOTIFICATION_ITEM[notification.type].color}>
                  <FastfoodIcon />
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
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </MainCard>
    </>
  );
};

export default NotificationList;
