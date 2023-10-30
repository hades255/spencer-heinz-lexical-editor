import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

// material-ui
import { Box, Stack, Typography, Dialog, DialogContent, Button } from '@mui/material';
// project import
import MainCard from 'components/MainCard';

// assets
import { useSelector } from 'store';
import { dispatch } from 'store';
import { getUserLists } from 'store/reducers/user';
import { PopupTransition } from 'components/@extended/Transitions';
import AddContributor from 'sections/apps/document/AddContributor1';

export default function AddContributorsFromContributor({ open: openThis, onClose, user, exist, creator }) {
  const users = useSelector((state) => state.user.lists).filter(
    (item) => item._id !== user._id && item._id !== creator._id && (user._id === creator._id ? true : !exist.includes(item.email))
  );
  const [value, setValue] = useState(user._id === creator._id ? exist : []);

  useEffect(() => {
    dispatch(getUserLists());
  }, []);

  return (
    <Dialog
      maxWidth="sm"
      TransitionComponent={PopupTransition}
      keepMounted
      fullWidth
      onClose={() => {
        onClose();
      }}
      open={openThis}
      sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogContent>
        <MainCard sx={{ minHeight: '50vh' }}>
          <Box>
            <Stack direction={'row'} justifyContent={'space-between'} sx={{ mb: '20px' }}>
              <Stack>
                {users.filter((item) => value.includes(item.email) && item.status !== 'active' && item.status !== 'invited').length !==
                  0 && (
                  <Typography sx={{ color: 'red' }} variant="subtitle1">
                    * Some contributors will not receive an invitation until
                    <br /> admin resolves Locked/Deleted status.
                  </Typography>
                )}
              </Stack>
              <Stack alignItems="center">
                <Button
                  size="large"
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    onClose(users.filter((item) => value.includes(item.email)));
                  }}
                >
                  Send Invitation
                </Button>
              </Stack>
            </Stack>
          </Box>
          <AddContributor users={users} value={value} onChange={setValue} />
        </MainCard>
      </DialogContent>
    </Dialog>
  );
}

AddContributorsFromContributor.propTypes = {
  open: PropTypes.bool,
  user: PropTypes.object,
  exist: PropTypes.any,
  onClose: PropTypes.any,
  creator: PropTypes.object
};
