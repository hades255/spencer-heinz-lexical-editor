import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

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
import { compareArraysByKey } from 'utils/array';
import { openSnackbar } from 'store/reducers/snackbar';
import axiosServices from 'utils/axios';
import { getDocumentSingleList } from 'store/reducers/document';

export default function AddContributorsFromContributor({ open: openThis = false, onClose, user, exist, creator, uniqueId }) {
  const users = useSelector((state) => state.user.lists);
  const [value, setValue] = useState(exist.map((item) => item.email));

  const handleAddContributors = useCallback(() => {
    const changes = compareArraysByKey(
      exist,
      users.filter((item) => value.includes(item.email)),
      'email'
    );
    if (changes.A.length === 0 && changes.B.length === 0) {
      onClose(false);
      return;
    }
    (async () => {
      try {
        if (changes.A.length !== 0) {
          await axiosServices.post('/document/' + uniqueId + '/clearinvite', {
            contributors: changes.A
          });
          dispatch(
            openSnackbar({
              open: true,
              message: 'Delete contributors successfully.',
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: true
            })
          );
        }
        if (changes.B.length !== 0) {
          await axiosServices.post('/document/' + uniqueId + '/invite', {
            contributors: changes.B
          });
          dispatch(
            openSnackbar({
              open: true,
              message: 'Invitation sended successfully.',
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: true
            })
          );
        }
        dispatch(getDocumentSingleList(uniqueId));
        onClose(false);
      } catch (error) {
        console.log(error);
        openSnackbar({
          open: true,
          message: 'Error! Try again.',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        });
      }
    })();
  }, [uniqueId, value, exist, onClose, users]);

  useEffect(() => {
    dispatch(getUserLists());
  }, []);

  return (
    <Dialog
      maxWidth="md"
      TransitionComponent={PopupTransition}
      keepMounted
      fullWidth
      onClose={(r) => {
        if (r === 'escapeKeyDown') onClose(false);
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
                <Stack direction={'row'} justifyContent={'space-between'}>
                  <Button
                    size="large"
                    variant="contained"
                    color="info"
                    onClick={() => {
                      onClose(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="large"
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      handleAddContributors();
                    }}
                  >
                    Save
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Box>
          <AddContributor users={users} value={value} onChange={setValue} exist={exist} mine={creator} user={user} />
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
  creator: PropTypes.object,
  uniqueId: PropTypes.any
};
