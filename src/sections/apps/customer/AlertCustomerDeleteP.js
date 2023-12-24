import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// material-ui

import { Button, Dialog, DialogContent, Stack, Typography } from '@mui/material';

// project import
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

// assets
import { DeleteFilled } from '@ant-design/icons';
import { setUserDelete } from 'store/reducers/user';
import { dispatch } from 'store';

// ==============================|| CUSTOMER - DELETE ||============================== //

export default function AlertCustomerDeleteP({ title, userDeleteId, open, handleClose }) {
  const btnRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      if (btnRef.current) btnRef.current.focus();
    }, 100);
  }, [btnRef]);

  const handleDelete = (e) => {
    e.preventDefault();
    dispatch(setUserDelete(userDeleteId));
    handleCloseClick();
  };

  const handleCloseClick = () => {
    handleClose(false);
  };

  return (
    <Dialog
      open={open}
      onClose={() => handleClose(false)}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="column-delete-title"
      aria-describedby="column-delete-description"
      // PaperProps={{ style: { backgroundColor: '#d5bdaf' } }}
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <form onSubmit={handleDelete}>
          <Stack alignItems="center" spacing={3.5}>
            <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
              <DeleteFilled />
            </Avatar>
            <Stack spacing={2}>
              <Typography variant="h4" align="center">
                Are you sure you want to delete permanently?
              </Typography>
              <Typography align="center">
                By deleting
                <Typography variant="subtitle1" component="span">
                  {' '}
                  &quot;{title}&quot;{' '}
                </Typography>
                , all data related to this user will also be deleted permanently.
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} sx={{ width: 1 }}>
              <Button type="reset" fullWidth onClick={handleCloseClick} color="secondary" variant="outlined">
                Cancel
              </Button>
              <Button type="submit" fullWidth color="error" variant="contained" autoFocus ref={btnRef}>
                Delete
              </Button>
            </Stack>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}

AlertCustomerDeleteP.propTypes = {
  title: PropTypes.string,
  userDeleteId: PropTypes.string,
  open: PropTypes.bool,
  handleClose: PropTypes.func
};
