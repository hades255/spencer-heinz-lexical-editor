import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Typography } from '@mui/material';
import UserBlackoutList from './black-out-user-selection';

export default function BlackUserDialog({
  blackedUsers,
  setBlackedUsers,
  unblackedUsers,
  setUnblackedUsers,
  setIsBlacking,
  isBlacking,
  parentUnblackedUsers,
  blackoutNode,
  currentUser,
  isBlacked
}) {
  const handleClose = () => {
    setIsBlacking(false);
  };

  const handleSubmit = () => {
    blackoutNode();
    handleClose();
    return false;
  };

  return (
    <Dialog open={isBlacking} onClose={handleClose} sx={{ zIndex: 10003 }}>
      <DialogTitle>Blackout/Unblackout User</DialogTitle>
      <DialogContent>
        <Typography variant="h5" color={`error`} marginBottom={`20`}>
          Default is everyone is blacked out.
        </Typography>
        <UserBlackoutList
          blackedUsers={blackedUsers}
          setBlackedUsers={setBlackedUsers}
          unblackedUsers={unblackedUsers}
          setUnblackedUsers={setUnblackedUsers}
          currentUser={currentUser}
          parentUnblackedUsers={parentUnblackedUsers}
          isBlacked={isBlacked}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
}
