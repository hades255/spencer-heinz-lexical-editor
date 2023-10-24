import { DialogActions, Dialog, DialogTitle, Typography, DialogContent, Alert, TextField, Button } from '@mui/material';
import { ACTION_REQUEST_USER } from 'lexical-editor/utils/constants';
import PropTypes from 'prop-types';

const FloatDialog = ({
  isDialogOpen,
  setDialogOpen,
  assignee,
  task,
  users,
  commentError,
  commentRef,
  handleSubmitComment,
  handleCommentKeyDown,
  handleCancelComment
}) => {
  return (
    <Dialog
      open={isDialogOpen}
      onClose={() => {
        setDialogOpen(false);
      }}
      sx={{ zIndex: 10002 }}
    >
      <DialogTitle>
        Comment
        <Typography variant="body1">
          Assign To: {[...users, ACTION_REQUEST_USER].find((user) => user._id === assignee)?.name}, Action: {task}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {!!commentError && <Alert severity="error">{commentError}</Alert>}
        <TextField
          id="outlined-multiline-static"
          label="Write here..."
          fullWidth
          multiline
          rows={4}
          defaultValue=""
          inputRef={commentRef}
          margin={`dense`}
          onKeyDown={(e) => handleCommentKeyDown(e)}
          focused={isDialogOpen}
        />
      </DialogContent>
      <DialogActions>
        <Button size="small" color="error" onClick={handleCancelComment}>
          Cancel
        </Button>
        <Button size="small" onClick={handleSubmitComment}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

FloatDialog.propTypes = {
  isDialogOpen: PropTypes.bool,
  setDialogOpen: PropTypes.func,
  assignee: PropTypes.string,
  task: PropTypes.string,
  users: PropTypes.array,
  commentError: PropTypes.string,
  handleCommentKeyDown: PropTypes.func,
  handleSubmitComment: PropTypes.func,
  handleCancelComment: PropTypes.func,
  commentRef: PropTypes.object
};

export default FloatDialog;
