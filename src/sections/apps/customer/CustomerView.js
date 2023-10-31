import PropTypes from 'prop-types';
import { format } from 'date-fns';
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

const CustomerView = ({ data, user = false }) => {
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
                      <Typography variant="h5">{data.name}</Typography>
                      {/* <Avatar alt="Avatar 1" size="xl" src={avatarImage(`./avatar-${data.creator.avatar}.png`)} /> */}
                      <Stack spacing={0.5}>
                        {user &&
                          data.event &&
                          data.event.map(
                            (event, key) =>
                              key < 5 && (
                                <Typography variant="p" key={key}>
                                  {event.status} at {format(new Date(event.at), 'MM/dd/yyyy HH:mm')} by{' '}
                                  <abbr title={event.by.email}>{event.by.name}</abbr> {event.comment && `because of ${event.comment}`}
                                </Typography>
                              )
                          )}
                        <Typography variant="p">...</Typography>
                        {/* <Typography variant="h5">{data.name}</Typography>
                        <Typography variant="h5">{data.description}</Typography>
                        <Typography variant="h5">{data.initialText}</Typography>
                        <Typography variant="h5">{data.creator}</Typography> */}
                        {/* <Typography variant="h5">{data.creator.name}</Typography>
                        <Typography color="secondary">{data.creator.role}</Typography> */}
                      </Stack>
                    </Stack>
                  </Grid>
                  {/* <Grid item xs={12}>
                    <Divider />
                  </Grid> */}
                  <Grid item xs={12}>
                    <Stack direction="row" justifyContent="space-around" alignItems="center">
                      {/* <Avatar alt="Avatar 1" size="xl" src={avatarImage(`./avatar-2.png`)} />
                      <Avatar alt="Avatar 1" size="xl" src={avatarImage(`./avatar-3.png`)} />
                      <Avatar alt="Avatar 1" size="xl" src={avatarImage(`./avatar-4.png`)} />
                      <Avatar alt="Avatar 1" size="xl" src={avatarImage(`./avatar-5.png`)} /> */}
                      {/* {data.users.map((user, index) => (
                        <Avatar key={`editor-list-${index}`} alt="Avatar 1" size="xl" src={avatarImage(`./avatar-${user.avatar}.png`)} />
                      ))} */}
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
                          {/* <Typography align="right">{data.creator.email}</Typography> */}
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </MainCard>
            </Grid>
            <Grid item xs={12} sm={7} md={8} lg={8} xl={9}>
              <Stack spacing={2.5}>{/* <MainCard title="Document Details">{data.content}</MainCard> */}</Stack>
            </Grid>
          </Grid>
        </Transitions>
      </TableCell>
    </TableRow>
  );
};

CustomerView.propTypes = {
  data: PropTypes.object,
  user: PropTypes.any
};

export default CustomerView;
