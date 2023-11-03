import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axiosServices from 'utils/axios';
import { ReceiveInvitation } from 'layout/MainLayout/Header/HeaderContent/HandleNotification';
import { AvatarGroup, Box, Grid, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import CustomCell from 'components/customers/CustomCell';
import UserAvatar from 'sections/apps/user/UserAvatar';
import { dispatch } from 'store';
import { getDocumentSingleList } from 'store/reducers/document';

const Check = ({ document, user }) => {
  const [noti, setNoti] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await axiosServices.get('/notification/document?document=' + document._id + '&user=' + user._id);
        setNoti(response.data.data.notification);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [document, user]);

  const handleAction = useCallback(() => {
    setTimeout(() => {
      dispatch(getDocumentSingleList(document._id));
    }, 500);
  }, [document]);

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h5">About Document</Typography>
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
                      <CustomCell
                        user={{
                          online_status: 'none',
                          avatar: document.creator.avatar,
                          name: document.creator.name,
                          email: document.creator.email
                        }}
                      />
                    )}
                    <Typography variant="h4">{document?.name}</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Stack direction={'row'} alignItems="center" justifyContent={'end'}>
                    <Typography variant="subtitle1" sx={{ mr: 2 }}>
                      Contributors:{' '}
                    </Typography>
                    <AvatarGroup max={6}>
                      {document?.contributors.map((item, key) => (
                        <UserAvatar
                          key={key}
                          user={{
                            online_status: 'none',
                            avatar: item.avatar,
                            name: item.name,
                            email: item.email
                          }}
                        />
                      ))}
                    </AvatarGroup>
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
              <Typography variant="subtitle1" color="textSecondary">
                {document?.description}
              </Typography>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      <Stack direction={'row'} justifyContent={'center'}>
        <Box>{noti && <ReceiveInvitation notification={noti} onCancel={handleAction} />}</Box>
      </Stack>
    </>
  );
};

export default Check;

Check.propTypes = {
  document: PropTypes.any,
  user: PropTypes.any
};
