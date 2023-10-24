import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import UserLockList from './lock-user-selection';
import { Typography } from '@mui/material';

export default function LockUserDialog({
  lockedUsers,
  setLockedUsers,
  unlockedUsers,
  setUnlockedUsers,
  isLockingUser,
  setIsLockingUser,
  parentUnlockedUsers,
  lockNode,
  currentUser,
  isLocked
}) {
  const handleClose = () => {
    setIsLockingUser(false);
  };

  const handleSubmit = () => {
    lockNode();
    handleClose();
    return false;
  };

  return (
    <Dialog open={isLockingUser} onClose={handleClose} sx={{ zIndex: 10003 }}>
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
          parentUnlockedUsers={parentUnlockedUsers}
          isLocked={isLocked}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
}
