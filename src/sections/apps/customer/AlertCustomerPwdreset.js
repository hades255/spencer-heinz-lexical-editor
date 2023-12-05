import React from 'react';
import PropTypes from 'prop-types';

// material-ui

import { Button, Dialog, DialogContent, Stack, Typography } from '@mui/material';

// project import
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

// assets
import { ToolOutlined } from '@ant-design/icons';
import { dispatch } from 'store';
import { resetUserPassword } from 'store/reducers/user';

// ==============================|| CUSTOMER - DELETE ||============================== //

export default function AlertCustomerPwdreset({ title, userDeleteId, open, handleClose }) {
  const handlePwdReset = (e) => {
    e.preventDefault();
    dispatch(resetUserPassword(userDeleteId));
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
      // PaperProps={{ style: { backgroundColor: '#fcd5ce' } }}
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <form onSubmit={handlePwdReset}>
          <Stack alignItems="center" spacing={3.5}>
            <Avatar color="warning" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
              <ToolOutlined />
            </Avatar>
            <Stack spacing={2}>
              <Typography variant="h4" align="center">
                Are you sure reset {title}
                {"'s"} password?
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ width: 1 }}>
              <Button type="reset" fullWidth onClick={() => handleClose(false)} color="secondary" variant="outlined">
                Cancel
              </Button>
              <Button type="submit" fullWidth color="error" variant="contained" autoFocus>
                Yes
              </Button>
            </Stack>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}

AlertCustomerPwdreset.propTypes = {
  title: PropTypes.string,
  userDeleteId: PropTypes.string,
  open: PropTypes.bool,
  handleClose: PropTypes.func
};
