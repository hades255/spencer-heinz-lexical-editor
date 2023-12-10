import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axiosServices from 'utils/axios';
import { HandleInvitation } from 'layout/MainLayout/Header/HeaderContent/HandleNotification';
import { Box, Grid, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import CustomCell from 'components/customers/CustomCell';

const Check = ({ user, document, handleRefresh, searchParams }) => {
  const [noti, setNoti] = useState(null);

  useEffect(() => {
    if (searchParams.get('notification')) {
      (async () => {
        try {
          const response = await axiosServices.get('/notification/' + searchParams.get('notification'));
          setNoti(response.data.data.notification);
        } catch (error) {
          setNoti({ redirect: document._id });
        }
      })();
    } else {
      setNoti({ redirect: document._id });
    }
  }, [document, searchParams]);

  const handleAction = useCallback(() => {
    setTimeout(() => {
      handleRefresh();
    }, 500);
  }, [handleRefresh]);

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h5">Document Details</Typography>
        <MainCard
          content={false}
          sx={{
            bgcolor: 'grey.50',
            pt: 2,
            pl: 2
          }}
        >
          <Grid container spacing={3}>
            <Grid
              item
              xs={12}
              sx={{
                pr: 2,
                pb: 2
              }}
            >
              <Grid container justifyContent="space-between">
                <Grid item xs={12} sm={8}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {document && (
                      <Box>
                        Creator:
                        <CustomCell
                          user={{
                            online_status: 'none',
                            avatar: document.creator.avatar,
                            name: document.creator.name,
                            email: document.creator.email
                          }}
                        />
                      </Box>
                    )}
                    <Typography variant="h4">{document?.name}</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Stack direction={'row'} alignItems="center" justifyContent={'end'}>
                    <Typography variant="subtitle1" sx={{ mr: 2 }}>
                      {document?.invites.length} Contributors
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid
              item
              xs={12}
              sx={{
                pr: 2,
                pb: 2
              }}
            >
              Description:
              <Typography variant="subtitle1" color="textSecondary">
                {document?.description}
              </Typography>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      <Stack direction={'row'} justifyContent={'center'}>
        <Box
          sx={{
            width: '50vw',
            minWidth: '300px'
          }}
        >
          {noti && <HandleInvitation user={user} document={document} notification={noti} onCancel={handleAction} />}
        </Box>
      </Stack>
    </>
  );
};

export default Check;

Check.propTypes = {
  user: PropTypes.any,
  searchParams: PropTypes.any,
  document: PropTypes.any,
  handleRefresh: PropTypes.func
};
