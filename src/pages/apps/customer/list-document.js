import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
// material-ui
import { useTheme } from '@mui/material/styles';
import { Dialog } from '@mui/material';
import AuthContext from 'contexts/JWTContext';

// third-party
// project import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { PopupTransition } from 'components/@extended/Transitions';

import CustomerView from 'sections/apps/customer/CustomerView';

// assets
import { getMyDocumentLists } from 'store/reducers/document';
import { useSelector } from 'react-redux';
import { dispatch } from 'store';
import DocumentTable from '../document/document-table';
import AddDocument from 'sections/apps/document/AddDocument';
import CheckPremium from 'sections/apps/user/CheckPremium';
import { SelectionCell, SelectionHeader } from 'components/table/Selection';
import DocumentCell from 'components/documents/DocumentCell';
import CustomCell from 'components/customers/CustomCell';
import ContributorsCell from 'components/documents/ContributorsCell';

const CreatorCell = ({ value }) => {
  return <CustomCell user={value} />;
};

const DocumentListPage = () => {
  const theme = useTheme();
  const user = useContext(AuthContext).user;

  const data = useSelector((state) => state.document.lists);

  const [add, setAdd] = useState(false);
  const [checkPremium, setCheckPremium] = useState(false);

  useEffect(() => {
    dispatch(getMyDocumentLists());
  }, []);

  const handleAdd = () => {
    if (!add) {
      if (!['super admin', 'admin', 'creator'].includes(user.role)) {
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
        accessor: 'contributors',
        Cell: ContributorsCell,
        disableSortBy: true
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  const renderRowSubComponent = useCallback(({ row }) => <CustomerView data={data[row.id]} />, [data]);

  return (
    <MainCard content={false}>
      <ScrollX>
        <DocumentTable
          columns={columns}
          data={data}
          handleAdd={handleAdd}
          getHeaderProps={(column) => column.getSortByToggleProps()}
          renderRowSubComponent={renderRowSubComponent}
        />
      </ScrollX>
      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        fullWidth
        onClose={handleAdd}
        open={add}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <AddDocument user={user} onCancel={handleAdd} />
      </Dialog>
      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        fullWidth
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
