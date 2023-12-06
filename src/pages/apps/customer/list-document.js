import { useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
// material-ui
import { useTheme } from '@mui/material/styles';
import { Dialog, IconButton, useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { getMyDocumentLists } from 'store/reducers/document';
import { dispatch } from 'store';
// assets
import DocumentTable from '../document/document-table';
import AddDocument from 'sections/apps/document/AddDocument';
import CheckPremium from 'sections/apps/user/CheckPremium';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { PopupTransition } from 'components/@extended/Transitions';
import DocumentCell from 'components/documents/DocumentCell';
import CustomCell from 'components/customers/CustomCell';
import { InvitesCell } from 'components/documents/InvitesCell';
import AuthContext from 'contexts/JWTContext';

const CreatorCell = ({ value }) => {
  return <CustomCell user={value} />;
};

CreatorCell.propTypes = {
  value: PropTypes.any
};

const DocumentListPage = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const user = useContext(AuthContext).user;

  const data = useSelector((state) => state.document.lists);

  const [add, setAdd] = useState(false);
  const [checkPremium, setCheckPremium] = useState(false);

  useEffect(() => {
    dispatch(getMyDocumentLists());
  }, []);

  const handleAdd = () => {
    if (!add) {
      if (!['super admin', 'admin', 'creator', 'creator-vip'].includes(user.role)) {
        setCheckPremium(true);
        return;
      }
    }
    setAdd(!add);
  };

  const handleCloseCheckPremium = () => {
    setCheckPremium(false);
  };

  const columns = useMemo(
    () => [
      {
        Header: 'description',
        accessor: 'description',
        disableSortBy: true
      },
      {
        Header: '_id',
        accessor: '_id',
        disableSortBy: true
      },
      {
        Header: 'Created',
        accessor: 'createdAt'
      },
      {
        Header: 'team',
        accessor: 'team'
      },
      {
        Header: 'Last Updated',
        accessor: 'updatedAt'
      },
      {
        Header: 'Creator',
        accessor: 'creator',
        Cell: CreatorCell,
        disableSortBy: true
      },
      {
        Header: 'Document',
        accessor: 'name',
        Cell: DocumentCell,
        disableSortBy: true
      },
      {
        Header: 'Contributors',
        accessor: 'invites',
        Cell: ({ row }) => InvitesCell({ row, user }),
        disableSortBy: true
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  return (
    <MainCard content={false}>
      <ScrollX>
        <DocumentTable columns={columns} data={data} handleAdd={handleAdd} getHeaderProps={(column) => column.getSortByToggleProps()} />
      </ScrollX>
      <Dialog
        maxWidth="md"
        TransitionComponent={PopupTransition}
        fullWidth
        fullScreen={fullScreen}
        onClose={(e, r) => {
          if (r === 'escapeKeyDown') handleAdd();
        }}
        open={add}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <IconButton
          aria-label="close"
          onClick={handleAdd}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
        <AddDocument user={user} onCancel={handleAdd} />
      </Dialog>
      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        onClose={handleCloseCheckPremium}
        open={checkPremium}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <CheckPremium onCancel={handleCloseCheckPremium} />
      </Dialog>
    </MainCard>
  );
};

export default DocumentListPage;
