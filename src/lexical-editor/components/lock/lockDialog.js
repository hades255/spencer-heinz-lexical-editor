import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import UserLockList from './lockSelection';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
export default function LockUserDialog({
  lockedUsers,
  setLockedUsers,
  unlockedUsers,
  setUnlockedUsers,
  isLockingUser,
  setIsLockingUser,
  lockNode,
  currentUser,
  users
}) {
  const handleClose = () => {
    setIsLockingUser(false);
    setUnlockedUsers([]);
  };

  const handleSubmit = () => {
    lockNode();
    handleClose();
    return false;
  };

  return (
    <Dialog open={isLockingUser} onClose={handleClose} sx={{ zIndex: 10003 }} id={`lock-user-dialog`}>
      <DialogTitle>Lock/Unlock User</DialogTitle>
      <DialogContent>
        <Typography variant="h5" color={`error`} marginBottom={`20`}>
          Default is everyone is locked.
        </Typography>
        <UserLockList
          lockedUsers={lockedUsers}
          setLockedUsers={setLockedUsers}
          unlockedUsers={unlockedUsers}
          setUnlockedUsers={setUnlockedUsers}
          currentUser={currentUser}
          users={users}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
}

LockUserDialog.propTypes = {
  users: PropTypes.array,
  lockedUsers: PropTypes.array,
  setLockedUsers: PropTypes.func,
  unlockedUsers: PropTypes.array,
  setUnlockedUsers: PropTypes.func,
  isLockingUser: PropTypes.bool,
  setIsLockingUser: PropTypes.func,
  lockNode: PropTypes.func,
  currentUser: PropTypes.string
};
