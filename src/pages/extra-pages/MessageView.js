import { useEffect, useState } from 'react';
import { Grid, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import { useParams } from 'react-router-dom';
import axiosServices from 'utils/axios';
import AdminHandleInvites from './message/AdminHandleInvites';

const MessageView = () => {
  const msgId = useParams().uniqueId;
  const [message, setMessage] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await axiosServices.get('/message/' + msgId);
        setMessage(response.data.data.message);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [msgId]);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MainCard
            sx={{
              minHeight: '80vh'
            }}
          >
            <Stack direction="row" spacing={2} justifyContent={'center'} sx={{ pt: 3 }}>
              {message && (
                <Grid item xs={12} md={10} lg={8}>
                  <Typography
                    variant="h4"
                    sx={{
                      pt: 5
                    }}
                  >
                    <Typography component="span" variant="subtitle2">
                      From:
                    </Typography>
                    {'  '}
                    <Typography component="span" variant="subtitle1">
                      {message.from.name}
                    </Typography>
                    {'  '}
                    <Typography component="span" variant="subtitle2">
                      {message.from.email}
                    </Typography>
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      pt: 5
                    }}
                  >
                    <Typography component="span" variant="subtitle2">
                      Message:
                    </Typography>
                    {'  '}
                    {message.data.map((text, key) => (
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
                  </Typography>
                  {message.attachment && <AdminHandleInvites items={JSON.parse(message.attachment)} />}
                </Grid>
              )}
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default MessageView;
