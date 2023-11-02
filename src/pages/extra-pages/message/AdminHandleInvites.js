import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { CheckOutlined } from '@ant-design/icons';
import { Box, Button, Grid, IconButton, Stack, useTheme } from '@mui/material';
import AnimateButton from 'components/@extended/AnimateButton';
import CustomCell from 'components/customers/CustomCell';
import { StatusCell } from 'pages/apps/customer/list';
import { dispatch } from 'store';
import { setUserStatus, setUsersStatus } from 'store/reducers/user';
import axiosServices from 'utils/axios';

const AdminHandleInvites = ({ items }) => {
  const theme = useTheme();
  const [users, setusers] = useState([]);

  const handleRefresh = useCallback(() => {
    (async () => {
      try {
        const response = await axiosServices.get('/user/email?users=' + JSON.stringify(items.map((item) => item.email)));
        setusers(response.data.users);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [items]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  console.log(users);

  return (
    <>
      <Stack
        sx={{
          p: 5
        }}
        spacing={2}
      >
        {items.map((item, index) => (
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
                {users.find((x) => x.email === item.email)?.status !== item.status && (
                  <>
                    <code> Now</code>
                    <StatusCell value={users.find((x) => x.email === item.email)?.status} />
                  </>
                )}
              </Box>
              <Box sx={{ width: '30%' }}>
                <IconButton
                  color="success"
                  onClick={() => {
                    if (item.status === 'active' || item.status === 'invited') return;
                    dispatch(setUserStatus(item._id, 'active'));
                    setTimeout(() => {
                      handleRefresh();
                    }, 500);
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
                  if (users.filter((item) => item.status !== 'active' && item.status !== 'invited').length === 0) return;
                  dispatch(
                    setUsersStatus(
                      users.filter((item) => item.status !== 'active' && item.status !== 'invited').map((item) => item._id),
                      'active'
                    )
                  );
                  setTimeout(() => {
                    handleRefresh();
                  }, 500);
                }}
              >
                Approve ALL
              </Button>
            </AnimateButton>
          </Grid>
        </Stack>
      </Grid>
    </>
  );
};

export default AdminHandleInvites;

AdminHandleInvites.propTypes = {
  items: PropTypes.any
};
