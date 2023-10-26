import { Grid, Stack } from '@mui/material';
import MainCard from 'components/MainCard';
import { MessageItem } from 'layout/MainLayout/Header/HeaderContent/Message';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'store';
import { dispatch } from 'store';
import { getMessages } from 'store/reducers/message';

const MessageList = () => {
  const navigate = useNavigate();
  const messages = useSelector((state) => state.message.all);

  useEffect(() => {
    dispatch(getMessages());
  }, []);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MainCard>
            <Stack direction="row" spacing={2} justifyContent={'center'} sx={{ pt: 3 }}>
              <Grid
                item
                xs={12}
                md={9}
                lg={7}
                sx={{
                  height: '80vh',
                  overflowY: 'scroll'
                }}
              >
                {messages.map((item, key) => (
                  <MessageItem key={key} message={item} navigate={navigate} />
                ))}
              </Grid>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default MessageList;
