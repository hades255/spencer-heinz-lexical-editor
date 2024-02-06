import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Avatar, Button, Dialog, DialogContent, Stack, Tooltip, Typography } from '@mui/material';
import { DeleteFilled } from '@ant-design/icons';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { PopupTransition } from 'components/@extended/Transitions';

const RemoveCommentBtn = ({ comment, handleRemoveComment }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(
    (value) => {
      setOpen(false);
      if (value) handleRemoveComment(comment);
    },
    [comment, handleRemoveComment]
  );

  return (
    <>
      <Tooltip title={'Remove this comment'} placement="top" arrow>
        <IconButton
          variant={'outlined'}
          sx={{
            paddingX: '0',
            position: 'absolute',
            bottom: '20px',
            right: '-10px',
            transform: 'translate(-50%, 10px)'
          }}
          size={'medium'}
          onClick={handleOpen}
        >
          <DeleteOutlineIcon color={'error'} />
        </IconButton>
      </Tooltip>
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
          <Stack alignItems="center" spacing={3.5}>
            <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
              <DeleteFilled color="error" />
            </Avatar>
            <Stack spacing={2}>
              <Typography variant="h4" align="center">
                Are you sure delete this comment?
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ width: 1 }}>
              <Button type="reset" fullWidth onClick={() => handleClose(false)} color="secondary" variant="outlined">
                Cancel
              </Button>
              <Button type="submit" fullWidth onClick={() => handleClose(true)} color="error" variant="contained" autoFocus>
                Yes
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RemoveCommentBtn;

RemoveCommentBtn.propTypes = {
  comment: PropTypes.any,
  handleRemoveComment: PropTypes.any
};
