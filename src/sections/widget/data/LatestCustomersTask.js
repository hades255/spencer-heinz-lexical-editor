import { Link as RouterLink } from 'react-router-dom';

// material-ui
import { CardMedia, Grid, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// assets
// import Flag1 from 'assets/images/widget/AUSTRALIA.jpg';
// import Flag2 from 'assets/images/widget/BRAZIL.jpg';
// import Flag3 from 'assets/images/widget/GERMANY.jpg';
// import Flag4 from 'assets/images/widget/UK.jpg';
// import Flag5 from 'assets/images/widget/USA.jpg';
// import Dashboard2 from 'assets/images/widget/dashborad-3.jpg';
import avatar from 'assets/images/users/avatar-group.png';

// antd
import { PlusOutlined } from '@ant-design/icons';

// table data
// function createData(image, subject, dept, date) {
//   return { image, subject, dept, date };
// }

const mediaSX = {
  width: 90,
  height: 80,
  borderRadius: 1
};

const rows = [
  // createData(Flag1, 'Germany', 'Angelina Jolly', '56.23%'),
  // createData(Flag2, 'USA', 'John Deo', '25.23%'),
  // createData(Flag3, 'Australia', 'Jenifer Vintage', '12.45%'),
  // createData(Flag4, 'United Kingdom', 'Lori Moore', '8.65%'),
  // createData(Flag5, 'Brazil', 'Allianz Dacron', '3.56%'),
  // createData(Flag1, 'Australia', 'Jenifer Vintage', '12.45%'),
  // createData(Flag3, 'USA', 'John Deo', '25.23%'),
  // createData(Flag5, 'Australia', 'Jenifer Vintage', '12.45%'),
  // createData(Flag2, 'United Kingdom', 'Lori Moore', '8.65%')
];

const isEmpty = rows.length === 0;

// =========================|| DATA WIDGET - LATEST CUSTOMERS ||========================= //

const LatestCustomersTask = () => (
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
      {isEmpty ? (
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
                <TableCell sx={{ pl: 3 }}>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created by</TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow hover key={index}>
                  <TableCell sx={{ pl: 3 }}>
                    <CardMedia component="img" image={row.image} title="image" sx={{ width: 30, height: 'auto' }} />
                  </TableCell>
                  <TableCell>{row.subject}</TableCell>
                  <TableCell>{row.dept}</TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}>
                    {row.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </SimpleBar>
  </MainCard>
);

export default LatestCustomersTask;
