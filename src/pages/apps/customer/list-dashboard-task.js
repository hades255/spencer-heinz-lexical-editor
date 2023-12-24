import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import { CardMedia, Grid, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

import avatar from 'assets/images/users/avatar-group.png';

import { PlusOutlined } from '@ant-design/icons';
import axiosServices from 'utils/axios';
import moment from 'moment';

const mediaSX = {
  width: 90,
  height: 80,
  borderRadius: 1
};

const DashboardTaskPage = ({ select }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (select) {
      (async () => {
        try {
          const res = await axiosServices.get('/home/documents/' + select + '/tasks');
          setTasks(res.data.data);
        } catch (error) {
          console.log(error);
        }
      })();
    } else setTasks([]);
  }, [select]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12} md={12}>
        <MainCard
          title="Tasks"
          content={false}
          secondary={
            // <Link component={RouterLink} to="#" color="primary">
            //   + Create one
            // </Link>
            <Button variant="contained" startIcon={<PlusOutlined />} size="small">
              Add Task
            </Button>
          }
        >
          <SimpleBar
            sx={{
              height: 354
            }}
          >
            {tasks.length === 0 ? (
              <Grid container alignItems="center" justifyContent="center" direction="column" style={{ height: '354px' }}>
                <Typography variant="h5" style={{ marginBottom: '15px' }}>
                  Requests
                </Typography>
                <CardMedia component="img" image={avatar} title="image" sx={mediaSX} style={{ marginBottom: '15px' }} />
                <Typography variant="h6" style={{ marginBottom: '15px' }}>
                  You don&apos;t have any tasks yet
                </Typography>
                <Link component={RouterLink} to="#" color="primary">
                  + Create one
                </Link>
              </Grid>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width={'17%'} sx={{ pl: 3 }}>
                        Commentor
                      </TableCell>
                      <TableCell width={'18%'}>Assignee</TableCell>
                      <TableCell width={'40%'}>Comment</TableCell>
                      <TableCell width={'10%'} align="center">
                        Task
                      </TableCell>
                      <TableCell width={'10%'} align="center">
                        Type
                      </TableCell>
                      <TableCell width={'10%'} align="center" sx={{ pr: 3 }}>
                        Date
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks.map((item, index) => (
                      <TableRow
                        hover
                        key={index}
                        onClick={() => {
                          navigate('/document/' + item.doc);
                        }}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{item.commentor.name}</TableCell>
                        <TableCell>{item.assignee.name}</TableCell>
                        <TableCell>{item.comment}</TableCell>
                        <TableCell align="center">{item.task}</TableCell>
                        <TableCell align="center">{item.type.toUpperCase()}</TableCell>
                        <TableCell align="center" sx={{ pr: 3 }}>
                          {moment(item.createdAt).format('MM/DD/YYYY h:mm A')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SimpleBar>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default DashboardTaskPage;

DashboardTaskPage.propTypes = {
  select: PropTypes.any
};
