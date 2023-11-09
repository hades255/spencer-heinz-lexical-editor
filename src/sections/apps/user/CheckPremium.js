import { DialogContent, DialogTitle, Divider, Stack, Button, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import PropTypes from 'prop-types';

// project import
import AnimateButton from 'components/@extended/AnimateButton';

const CheckPremium = ({ onCancel }) => {
  return (
    <>
      <DialogTitle>You have to subscribe to create a new document.</DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2.5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Grid item xs={6}>
                <AnimateButton>
                  <Button disableElevation onClick={onCancel} fullWidth size="large" variant="contained" color="secondary">
                    Cancel
                  </Button>
                </AnimateButton>
              </Grid>
              <Grid item xs={6}>
                <AnimateButton>
                  <Button
                    component={RouterLink}
                    to="/profiles/billing"
                    disableElevation
                    fullWidth
                    size="large"
                    variant="contained"
                    color="primary"
                  >
                    Go Premium
                  </Button>
                </AnimateButton>
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
    </>
  );
};

CheckPremium.propTypes = {
  customer: PropTypes.any,
  onCancel: PropTypes.func
};

export default CheckPremium;
