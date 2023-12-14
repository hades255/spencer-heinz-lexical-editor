import PropTypes from 'prop-types';
// material-ui
import {
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  Stack,
  TableCell,
  TableRow,
  Typography
} from '@mui/material';

// third-party

// project import
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';

// assets
import { Person2Outlined } from '@mui/icons-material';
import CustomCell from 'components/customers/CustomCell';
import moment from 'moment';

// ==============================|| CUSTOMER - VIEW ||============================== //

const DocumentDetail = ({ data }) => {
  return (
    <TableRow sx={{ '&:hover': { bgcolor: `transparent !important` }, overflow: 'hidden' }}>
      <TableCell colSpan={8} sx={{ p: 2.5, overflow: 'hidden' }}>
        <Transitions type="slide" direction="down" in={true}>
          <Grid container spacing={2.5} sx={{ pl: { xs: 0, sm: 5, md: 6, lg: 10, xl: 12 } }}>
            <Grid item xs={10}>
              <MainCard>
                <Chip
                  label={data.status}
                  size="small"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    right: 10,
                    top: 10,
                    fontSize: '0.675rem'
                  }}
                />
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Stack spacing={2.5}>
                      <Stack spacing={0.5} direction={'row'}>
                        <Typography variant="h5" color={'secondary'}>
                          Title:
                        </Typography>
                        <Typography variant="h5">{data.name}</Typography>
                      </Stack>
                      <Stack spacing={0.5} direction={'row'}>
                        <Typography variant="p" color={'secondary'}>
                          Description:
                        </Typography>
                        <Typography variant="p">{data.description}</Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      Contributors
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" alignItems="center">
                      {data.invites.map((item, key) => (
                        <CustomCell key={key} user={item} />
                      ))}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={0.5} direction={'row'}>
                      <Typography variant="p" color={'secondary'}>
                        Created At:
                      </Typography>
                      <Typography variant="p">{moment(data.createdAt).format('MM/DD/YYYY h:mm A')}</Typography>
                    </Stack>
                    <Stack spacing={0.5} direction={'row'}>
                      <Typography variant="p" color={'secondary'}>
                        Last Updated At:
                      </Typography>
                      <Typography variant="p">{moment(data.updatedAt).format('MM/DD/YYYY h:mm A')}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <List component="nav" aria-label="main mailbox folders" sx={{ py: 0 }}>
                      <ListItem>
                        <ListItemIcon>
                          <Person2Outlined />
                        </ListItemIcon>
                        <ListItemSecondaryAction>
                          <Typography align="right">{data.creator.email}</Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </MainCard>
            </Grid>
          </Grid>
        </Transitions>
      </TableCell>
    </TableRow>
  );
};

DocumentDetail.propTypes = {
  data: PropTypes.object
};

export default DocumentDetail;
