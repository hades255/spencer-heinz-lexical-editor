import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Grid, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import { useParams } from 'react-router-dom';
import axiosServices from 'utils/axios';
import AdminHandleInvites from './message/AdminHandleInvites';
import { MESSAGE_TYPES } from 'config/constants';

const MessageView = () => {
  const navigate = useNavigate();
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

  const handleRedirect = useCallback(() => {
    const url = new URL(message.redirect);
    // console.log(url.searchParams.get("invitation"))
    navigate(url.pathname + url.search);
  }, [message, navigate]);

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
                    {message.data.map((text, key) => (
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
                  </Typography>
                  {message.attachment && (
                    <>
                      {message.type === MESSAGE_TYPES.DOCUMENT_INVITE_RESOLVE && (
                        <AdminHandleInvites items={JSON.parse(message.attachment)} />
                      )}
                    </>
                  )}
                  {message.redirect && (
                    <>
                      {message.type === MESSAGE_TYPES.DOCUMENT_INVITATION_SEND && (
                        <Stack direction={'row'} justifyContent={'center'}>
                          <Button onClick={handleRedirect} sx={{ width: 300 }} variant="contained">
                            Go Document
                          </Button>
                        </Stack>
                      )}
                    </>
                  )}
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
