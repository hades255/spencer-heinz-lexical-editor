import React from 'react';
import PropTypes from 'prop-types';

// material-ui

import { Button, Dialog, DialogContent, Stack, Typography } from '@mui/material';

// project import
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

// assets
import { DeleteFilled } from '@ant-design/icons';

// ==============================|| CUSTOMER - DELETE ||============================== //

export default function ConfirmDelete({ document, open, handleClose }) {
  const handleDelete = (e) => {
    e.preventDefault();
    handleClose(document._id);
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
    >
      {document && (
        <DialogContent sx={{ mt: 2, my: 1 }}>
          <form onSubmit={handleDelete}>
            <Stack alignItems="center" spacing={3.5}>
              <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
                <DeleteFilled />
              </Avatar>
              <Stack spacing={2}>
                <Typography variant="h4" align="center">
                  Are you sure delete this document?
                  <br />
                  Document: {document.name}
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
      )}
    </Dialog>
  );
}

ConfirmDelete.propTypes = {
  open: PropTypes.bool,
  document: PropTypes.any,
  handleClose: PropTypes.func
};
