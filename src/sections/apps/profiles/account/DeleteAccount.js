import { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Button, Dialog, DialogContent, Grid, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import useAuth from 'hooks/useAuth';
import AuthContext from 'contexts/JWTContext';
import { PopupTransition } from 'components/@extended/Transitions';
import { ToolOutlined } from '@ant-design/icons';
import { dispatch } from 'store';
import { deleteMe } from 'store/reducers/user';

const DeleteAccount = () => {
  const user = useContext(AuthContext).user;
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);

  const handleClose = useCallback(
    (res) => {
      if (res) {
        dispatch(deleteMe(user._id));
        logout();
      }
      ``;
      setOpen(false);
    },
    [logout, user]
  );

  return (
    <>
      <Grid item xs={12}>
        <MainCard
          title="Delete this account"
          content={false}
          secondary={
            <Button size="small" variant="contained" onClick={handleOpen} color="error">
              Delete
            </Button>
          }
        />
      </Grid>
      <AlertDelete open={open} handleClose={handleClose} />
    </>
  );
};

export default DeleteAccount;

const AlertDelete = ({ open, handleClose }) => {
  const handleDelete = (e) => {
    e.preventDefault();
    handleClose(true);
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
            <Avatar color="warning" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
              <ToolOutlined />
            </Avatar>
            <Stack spacing={2}>
              <Typography variant="h4" align="center">
                Are you sure Delete your Account?
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
};

AlertDelete.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func
};
