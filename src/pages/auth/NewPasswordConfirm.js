import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
// import TextField from '@mui/material/TextField';
// import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function NewPasswordConfirm({ open, onClose, submit }) {
  const handleClose = () => {
    onClose(false);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Please remember this password for future access</DialogTitle>
        {/* <DialogContent>
          <TextField autoFocus margin="dense" id="confirm-password" label="Retype password" type="password" fullWidth variant="standard" />
        </DialogContent> */}
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" onClick={submit}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

NewPasswordConfirm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  submit: PropTypes.func
};
