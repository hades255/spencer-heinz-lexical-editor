import { DialogContent, DialogTitle, Divider, Grid } from '@mui/material';
import PropTypes from 'prop-types';
import FirebaseRegister from 'sections/auth/auth-forms/AuthRegister';

const getName = (name) => {
  const d = name.split(' ');
  return { firstname: d[0], lastname: d[1] };
};

const AddCustomer = ({ onCancel, customer }) => {
  return (
    <>
      <DialogTitle>{customer ? 'Edit User' : 'New User'}</DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2.5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FirebaseRegister redirect={false} onCancel={onCancel} customer={{ ...customer, ...getName(customer.name) }} />
          </Grid>
        </Grid>
      </DialogContent>
    </>
  );
};

AddCustomer.propTypes = {
  customer: PropTypes.any,
  onCancel: PropTypes.func
};

export default AddCustomer;
