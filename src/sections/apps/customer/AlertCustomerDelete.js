import React, { useState } from 'react';
import PropTypes from 'prop-types';

// material-ui

import { Button, Dialog, DialogContent, OutlinedInput, Stack, Typography, Select, MenuItem } from '@mui/material';

// project import
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

// assets
import { DeleteFilled } from '@ant-design/icons';
import { setUserStatus } from 'store/reducers/user';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { USER_STATUS_COMMENTS } from 'config/constants';

// ==============================|| CUSTOMER - DELETE ||============================== //

export default function AlertCustomerDelete({ title, userDeleteId, open, handleClose }) {
  const handleDelete = (e) => {
    e.preventDefault();
    let finalReason = reason === 0 ? comment : reason;
    if (!finalReason) {
      finalReason = 'Other.';
    }
    dispatch(setUserStatus(userDeleteId, 'deleted', finalReason));
    dispatch(
      openSnackbar({
        open: true,
        message: 'User Deleted successfully.',
        variant: 'alert',
        alert: {
          color: 'success'
        },
        close: true
      })
    );
    handleCloseClick();
  };

  const handleCloseClick = () => {
    setReason('');
    setComment('');
    handleClose(false);
  };

  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');

  const handleReasonChange = ({ target: { value } }) => {
    setReason(value);
  };
  const handleCommentChange = ({ target: { value } }) => {
    setComment(value);
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
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <form onSubmit={handleDelete}>
          <Stack alignItems="center" spacing={3.5}>
            <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
              <DeleteFilled />
            </Avatar>
            <Stack spacing={2}>
              <Typography variant="h4" align="center">
                Are you sure you want to delete?
              </Typography>
              <Typography align="center">
                By deleting
                <Typography variant="subtitle1" component="span">
                  {' '}
                  &quot;{title}&quot;{' '}
                </Typography>
                document, all data related to this document will also be deleted.
              </Typography>
            </Stack>

            <Stack spacing={2} style={{ width: '100%' }}>
              <Select style={{ width: '100%', maxWidth: '100%' }} value={reason} onChange={handleReasonChange} fullWidth>
                {[
                  USER_STATUS_COMMENTS.map((item, key) => (
                    <MenuItem value={item.comment} key={key}>
                      {item.msg}
                    </MenuItem>
                  ))
                ]}
                <MenuItem value={0}>Other</MenuItem>
              </Select>
              {reason === 0 && (
                <OutlinedInput
                  id="comment"
                  type="text"
                  name="comment"
                  placeholder="Leave Comment"
                  value={comment}
                  onChange={handleCommentChange}
                  fullWidth
                />
              )}
            </Stack>

            <Stack direction="row" spacing={2} sx={{ width: 1 }}>
              <Button type="reset" fullWidth onClick={handleCloseClick} color="secondary" variant="outlined">
                Cancel
              </Button>
              <Button type="submit" fullWidth color="error" variant="contained" autoFocus>
                Delete
              </Button>
            </Stack>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}

AlertCustomerDelete.propTypes = {
  title: PropTypes.string,
  userDeleteId: PropTypes.string,
  open: PropTypes.bool,
  handleClose: PropTypes.func
};
