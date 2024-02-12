import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import {
  CardMedia,
  Grid,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Badge,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack
} from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

import avatar from 'assets/images/users/avatar-group.png';

import { PlusOutlined } from '@ant-design/icons';
import axiosServices from 'utils/axios';
import moment from 'moment';
import styled from '@emotion/styled';
import useAuth from 'hooks/useAuth';
import BackgroundLetterAvatar from 'components/@extended/BackgroundLetterAvatar';
import MailIcon from '@mui/icons-material/Mail';

export const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 20,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px'
  }
}));

const mediaSX = {
  width: 90,
  height: 80,
  borderRadius: 1
};

const DashboardTaskPage = ({ group, select, category }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('all');

  useEffect(() => {
    if (select) {
      if (!group || !select) return;
      (async () => {
        try {
          setStatus('all');
          const res = await axiosServices.get('/home/documents/select/' + group + '/' + (category || group) + '/' + select);
          setTasks(res.data.data);
        } catch (error) {
          console.log(error);
        }
      })();
    } else setTasks([]);
  }, [select, category, group]);

  const handleAddTask = useCallback(() => navigate('/document/' + select), [navigate, select]);

  const handleStatusSelectChange = useCallback(({ target: { value } }) => {
    setStatus(value);
  }, []);

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
            <Button variant="contained" startIcon={<PlusOutlined />} size="small" onClick={handleAddTask}>
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
                      <TableCell align="center" width={'15%'} sx={{ pl: 3, pb: 0 }}>
                        Commentor
                      </TableCell>
                      <TableCell align="center" width={'15%'} sx={{ pb: 0 }}>
                        Assignee
                      </TableCell>
                      <TableCell align="center" width={'10%'} sx={{ pb: 0 }}>
                        Task
                      </TableCell>
                      <TableCell align="center" width={'15%'} sx={category ? { pb: 0 } : { p: 0 }}>
                        {category ? (
                          'Status'
                        ) : (
                          <FormControl variant="standard" sx={{ m: 0, minWidth: 120, border: 'none', outline: 'none' }}>
                            <InputLabel id="status-select">Status</InputLabel>
                            <Select labelId="status-select" value={status} onChange={handleStatusSelectChange}>
                              <MenuItem value={'all'}>All</MenuItem>
                              <MenuItem value={'assign'}>Assign</MenuItem>
                              <MenuItem value={'completed'}>Completed</MenuItem>
                              <MenuItem value={'review'}>Review</MenuItem>
                              <MenuItem value={'rework'}>Rework</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      </TableCell>
                      <TableCell align="center" width={'20%'} sx={{ pr: 3, pb: 0 }}>
                        Date
                      </TableCell>
                      <TableCell align="center" width={'25%'} sx={{ pr: 3, pb: 0 }}>
                        Last Activity
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks
                      .filter((item) => status === 'all' || item.status === status)
                      .map((item, index) => (
                        <TaskRow key={index} task={item} category={category} group={group} />
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
  select: PropTypes.any,
  group: PropTypes.any,
  category: PropTypes.any
};

const TaskRow = ({ task, group }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // const [more, setMore] = useState(false);

  // const handleSetMore = useCallback(
  //   (e) => {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     setMore(!more);
  //   },
  //   [more]
  // );

  const handleClick = useCallback(
    () => navigate('/document/' + task.doc + '?comment=' + task.uniqueId + '&group=' + group),
    [navigate, task, group]
  );

  return (
    <TableRow hover onClick={handleClick} sx={{ cursor: 'pointer' }} title={task.comment}>
      <TableCell align="center">{task.commentor._id === user._id ? 'You' : task.commentor.name}</TableCell>
      <TableCell align="center">{task.assignee._id === user._id ? 'You' : task.assignee.name}</TableCell>
      <TableCell align="center">{task.task}</TableCell>
      <TableCell align="center" sx={{ p: 0 }}>
        {task.type.toUpperCase()}
        <StyledBadge
          badgeContent={task.status.toUpperCase()}
          color={
            task.status === 'completed' ? 'success' : task.status === 'rework' ? 'warning' : task.status === 'review' ? 'info' : 'primary'
          }
        ></StyledBadge>
      </TableCell>
      <TableCell align="center" sx={{ p: 1 }}>
        {moment(task.updatedAt).format('h:mm A MM/DD/YYYY')}
      </TableCell>
      <TableCell sx={{ p: 0, pl: 2 }}>
        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
          <Stack direction={'row'} alignItems={'center'}>
            <BackgroundLetterAvatar name={task.lastActivity.who} xs />
            <Typography ml={2}>{task.lastActivity.what.substr(0, 1).toUpperCase() + task.lastActivity.what.substr(1)}</Typography>
          </Stack>
          {task.replies.length !== 0 && (
            <Badge badgeContent={task.replies.length} color={task.lastActivity.what === 'Reply' ? 'error' : 'primary'}>
              <MailIcon color="action" />
            </Badge>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
};

TaskRow.propTypes = {
  task: PropTypes.object,
  group: PropTypes.any
};
