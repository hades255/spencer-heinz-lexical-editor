import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import PropTypes from 'prop-types';
// material-ui
import { useTheme } from '@mui/material/styles';
import { Chip, Dialog, Stack, Tooltip } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import { PopupTransition } from 'components/@extended/Transitions';

// assets
import { CloseOutlined, EyeTwoTone, EditTwoTone, MessageOutlined } from '@ant-design/icons';
import { DOCUMENT_STATUS } from 'Plugins/constants';
import { getDocumentLists } from 'store/reducers/document';
import { useSelector } from 'react-redux';
import { dispatch } from 'store';
import { useNavigate } from 'react-router';
import DocumentTable from '../document/document-table';
import DocumentCell from 'components/documents/DocumentCell';
import CustomCell from 'components/customers/CustomCell';
import ContributorsCell from 'components/documents/ContributorsCell';
import AddDocument from 'sections/apps/document/AddDocument';
import AuthContext from 'contexts/JWTContext';
import DocumentDetail from '../document/DocumentDetail';

const CreatorCell = ({ value }) => {
  return <CustomCell user={value} />;
};

CreatorCell.propTypes = {
  value: PropTypes.any
};

const StatusCell = ({ value }) => {
  switch (value) {
    case DOCUMENT_STATUS.CREATED:
      return <Chip color="success" label="Created" size="small" variant="light" />;
    case DOCUMENT_STATUS.EDITING:
      return <Chip color="success" label="Editing" size="small" variant="light" />;
    case DOCUMENT_STATUS.COMPLETED:
      return <Chip color="error" label="Completed" size="small" variant="light" />;
    default:
      return <Chip color="info" label="Blocked" size="small" variant="light" />;
  }
};

const ActionCell = (row, setDocument, handleAdd, handleClose, theme) => {
  const navigate = useNavigate();
  const collapseIcon = row.isExpanded ? (
    <CloseOutlined style={{ color: theme.palette.error.main }} />
  ) : (
    <EyeTwoTone twoToneColor={theme.palette.secondary.main} />
  );
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
      <Tooltip title="View">
        <IconButton
          color="secondary"
          onClick={(e) => {
            e.stopPropagation();
            row.toggleRowExpanded();
          }}
        >
          {collapseIcon}
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            setDocument(row.values);
            handleAdd();
          }}
        >
          <EditTwoTone twoToneColor={theme.palette.primary.main} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Join">
        <IconButton
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/document/edit/${row.original._id}`, { replace: true });
          }}
        >
          <MessageOutlined twoToneColor={theme.palette.primary.main} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

StatusCell.propTypes = {
  value: PropTypes.string
};

const DocumentManagementPage = () => {
  const theme = useTheme();
  const user = useContext(AuthContext).user;

  // const data = useMemo(() => makeData(5), []);
  const data = useSelector((state) => state.document.lists);

  const [add, setAdd] = useState(false);
  const [open, setOpen] = useState(false);
  const [document, setDocument] = useState();

  useEffect(() => {
    dispatch(getDocumentLists());
  }, []);

  const handleAdd = () => {
    setAdd(!add);
    if (document && !add) setDocument(null);
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const columns = useMemo(
    () => [
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
        Header: 'Document Name',
        accessor: 'name',
        Cell: DocumentCell,
        disableSortBy: true
      },
      {
        Header: 'description',
        accessor: 'description',
        disableSortBy: true
      },
      {
        Header: 'Contributors',
        accessor: 'contributors',
        Cell: ContributorsCell,
        disableSortBy: true
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: StatusCell
      },
      {
        Header: 'Actions',
        className: 'cell-center',
        disableSortBy: true,
        Cell: ({ row }) => ActionCell(row, setDocument, handleAdd, handleClose, theme)
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  const renderRowSubComponent = useCallback(({ row }) => <DocumentDetail data={data[row.id]} />, [data]);

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
      {/* add user dialog */}
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
    </MainCard>
  );
};

export default DocumentManagementPage;
