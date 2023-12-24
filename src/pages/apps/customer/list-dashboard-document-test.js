import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
// material-ui
import { CardMedia, Grid, Link, Table, TableBody, TableCell, TableContainer, TableRow, Typography, Button } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

import avatar from 'assets/images/users/avatar-group.png';

import { PlusOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';
import axiosServices from 'utils/axios';
import moment from 'moment';
import DocumentCell from 'components/documents/DocumentCell';

const mediaSX = {
  width: 90,
  height: 80,
  borderRadius: 1
};

const DashboardDocumentPage = ({ category, setSelect, select }) => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosServices.get('/home/documents/' + category);
        setDocs(res.data.data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [category]);

  const handleGoNewDoc = useCallback(() => navigate('/document/create'), [navigate]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12} md={12}>
        <MainCard
          title="Documents"
          content={false}
          secondary={
            <Button variant="contained" startIcon={<PlusOutlined />} size="small" onClick={handleGoNewDoc}>
              Add Document
            </Button>
          }
        >
          <SimpleBar sx={{ height: 354 }}>
            {docs.find((item) => item.docs.length !== 0) ? (
              <TableContainer>
                <Table>
                  <TableBody>
                    {docs.map((row, index) => (
                      <DocumentRow row={row} key={index} setSelect={setSelect} select={select} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Grid container alignItems="center" justifyContent="center" direction="column" style={{ height: '354px' }}>
                <Typography variant="h5" style={{ marginBottom: '15px' }}>
                  Pending Documents
                </Typography>
                <CardMedia component="img" image={avatar} title="image" sx={mediaSX} style={{ marginBottom: '15px' }} />
                <Typography variant="h6" style={{ marginBottom: '15px' }}>
                  You don&apos;t have any documents here
                </Typography>
                <Link component={RouterLink} to="#" color="primary">
                  + Create one
                </Link>
              </Grid>
            )}
          </SimpleBar>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default DashboardDocumentPage;

DashboardDocumentPage.propTypes = {
  category: PropTypes.any,
  setSelect: PropTypes.any,
  select: PropTypes.any
};

const DocumentRow = ({ row, setSelect, select }) => {
  return row.docs.length ? (
    <>
      {row.title && (
        <TableRow>
          <TableCell align="center" colSpan={'4'} sx={{ borderBottom: '1px solid lightgray' }}>
            <Typography variant="subtitle1" color={'secondary'}>
              {row.title}
            </Typography>
          </TableCell>
        </TableRow>
      )}
      {row.docs.map((item, key) => (
        <TableRow
          key={key}
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            setSelect(item._id);
          }}
          selected={select === item._id}
        >
          <TableCell width={15}>{key + 1}</TableCell>
          <TableCell>
            <DocumentCell row={{ values: item }} />
          </TableCell>
          <TableCell width={175} align="right" sx={{ pr: 3 }}>
            {moment(item.createdAt).format('MM/DD/YYYY h:mm A')}
          </TableCell>
        </TableRow>
      ))}
    </>
  ) : null;
};

DocumentRow.propTypes = {
  row: PropTypes.any,
  setSelect: PropTypes.any,
  select: PropTypes.any
};
