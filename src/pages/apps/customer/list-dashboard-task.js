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
  Badge
} from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

import avatar from 'assets/images/users/avatar-group.png';

import { PlusOutlined } from '@ant-design/icons';
import axiosServices from 'utils/axios';
import moment from 'moment';
import styled from '@emotion/styled';
import { TruncatedText } from 'utils/string';

export const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 0,
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

const DashboardTaskPage = ({ select, category }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (select) {
      (async () => {
        try {
          const res = await axiosServices.get('/home/documents/' + select + '/tasks/' + category);
          setTasks(res.data.data);
        } catch (error) {
          console.log(error);
        }
      })();
    } else setTasks([]);
  }, [select, category]);

  const handleAddTask = useCallback(() => navigate('/document/' + select), [navigate, select]);

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
                      <TaskRow key={index} task={item} />
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
  category: PropTypes.any
};

const TaskRow = ({ task }) => {
  const navigate = useNavigate();
  const [more, setMore] = useState(false);

  const handleSetMore = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setMore(!more);
    },
    [more]
  );

  const handleClick = useCallback(() => navigate('/document/' + task.doc), [navigate, task]);

  return (
    <TableRow hover onClick={handleClick} sx={{ cursor: 'pointer' }}>
      <TableCell>{task.commentor.name}</TableCell>
      <TableCell>{task.assignee.name}</TableCell>
      <TableCell>
        {more ? task.comment : TruncatedText(task.comment, 50)}
        {task.comment.length > 50 && (
          <Typography variant="caption" sx={{ pl: 1, pr: 1, fontWeight: 'bold', color: 'dark' }} onClick={handleSetMore}>
            {more ? 'Hide' : 'More'}
          </Typography>
        )}
      </TableCell>
      <TableCell align="center">{task.task}</TableCell>
      <TableCell align="center">
        {task.type.toUpperCase()}
        <StyledBadge badgeContent={task.status.toUpperCase()} color={task.status === 'review' ? 'info' : 'primary'}></StyledBadge>
      </TableCell>
      <TableCell align="center" sx={{ pr: 3 }}>
        {moment(task.createdAt).format('MM/DD/YYYY h:mm A')}
      </TableCell>
    </TableRow>
  );
};

TaskRow.propTypes = {
  task: PropTypes.object
};
