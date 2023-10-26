import { useEffect, useState } from 'react';
import { Box, Button, Grid, IconButton, Stack, Typography, useTheme } from '@mui/material';
import MainCard from 'components/MainCard';
import { useParams } from 'react-router-dom';
import axiosServices from 'utils/axios';
import CustomCell from 'components/customers/CustomCell';
import { StatusCell } from 'pages/apps/customer/list';
import AnimateButton from 'components/@extended/AnimateButton';
import { CheckOutlined } from '@ant-design/icons';
import { dispatch } from 'store';
import { setUserStatus, setUsersStatus } from 'store/reducers/user';

const MessageView = () => {
  const theme = useTheme();
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
                  <Stack
                    sx={{
                      p: 5
                    }}
                    spacing={2}
                  >
                    {message.attachment &&
                      JSON.parse(message.attachment).map((item, index) => (
                        <Stack key={index}>
                          <Stack direction="row">
                            <Box
                              sx={{
                                width: '40%'
                              }}
                            >
                              <CustomCell user={item} />
                            </Box>
                            <Box sx={{ width: '30%' }}>
                              <StatusCell value={item.status} />
                            </Box>
                            <Box sx={{ width: '30%' }}>
                              <IconButton
                                color="success"
                                onClick={() => {
                                  dispatch(setUserStatus(item._id, 'active'));
                                }}
                              >
                                <CheckOutlined twoToneColor={theme.palette.success.main} />
                              </IconButton>
                            </Box>
                          </Stack>
                        </Stack>
                      ))}
                  </Stack>
                  <Grid
                    item
                    xs={12}
                    sx={{
                      pt: 5
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent={'center'}>
                      <Grid item xs={6}>
                        <AnimateButton>
                          <Button
                            disableElevation
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              dispatch(
                                setUsersStatus(
                                  JSON.parse(message.attachment).map((item) => item._id),
                                  'active'
                                )
                              );
                            }}
                          >
                            Approve ALL
                          </Button>
                        </AnimateButton>
                      </Grid>
                    </Stack>
                  </Grid>
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
