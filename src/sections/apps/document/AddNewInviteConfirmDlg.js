import PropTypes from 'prop-types';

// material-ui
import { Button, Grid, Dialog, DialogTitle, DialogContent, Stack } from '@mui/material';

// assets
// import { getUserLists } from 'store/reducers/user';
import { PopupTransition } from 'components/@extended/Transitions';
import AnimateButton from 'components/@extended/AnimateButton';

const AddNewInviteConfirmDlg = ({ open, onClose }) => {
  return (
    <>
      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        onClose={onClose}
        open={open}
        sx={{ '& .MuiDialog-paper': { p: 2 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Do you want to create this user as a contributor?</DialogTitle>
        <DialogContent sx={{ p: 2.5 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Grid item xs={6}>
                  <AnimateButton>
                    <Button disableElevation onClick={() => onClose(false)} fullWidth size="large" variant="contained" color="secondary">
                      Cancel
                    </Button>
                  </AnimateButton>
                </Grid>
                <Grid item xs={6}>
                  <AnimateButton>
                    <Button disableElevation onClick={() => onClose(true)} fullWidth size="large" variant="contained" color="primary">
                      Yes
                    </Button>
                  </AnimateButton>
                </Grid>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

AddNewInviteConfirmDlg.propTypes = {
  open: PropTypes.any,
  onClose: PropTypes.func
};

export default AddNewInviteConfirmDlg;
