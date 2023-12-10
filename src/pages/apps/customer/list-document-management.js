import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import PropTypes from 'prop-types';
// material-ui
import { useTheme } from '@mui/material/styles';
import { Chip, Dialog, Stack, Tooltip, useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// project import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import { PopupTransition } from 'components/@extended/Transitions';

// assets
import { CloseOutlined, EyeTwoTone, EditTwoTone, DeleteTwoTone } from '@ant-design/icons';
import { DOCUMENT_STATUS } from 'Plugins/constants';
import { documentDelete, getDocumentLists } from 'store/reducers/document';
import { useSelector } from 'react-redux';
import { dispatch } from 'store';
import DocumentTable from '../document/document-table';
import DocumentCell from 'components/documents/DocumentCell';
import CustomCell from 'components/customers/CustomCell';
import { InvitesCell } from 'components/documents/InvitesCell';
import AuthContext from 'contexts/JWTContext';
import DocumentDetail from '../document/DocumentDetail';
import EditDocument from 'sections/apps/document/EditDocument';
import AddDocument from 'sections/apps/document/AddDocument';
import ConfirmDelete from 'sections/apps/document/ConfirmDelete';

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

StatusCell.propTypes = {
  value: PropTypes.string
};

const ActionCell = ({ row, setDocument, handleClose, handleDeleteDocument, theme }) => {
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
            setDocument(row.original);
            setTimeout(() => {
              handleClose();
            }, 300);
          }}
        >
          <EditTwoTone twoToneColor={theme.palette.primary.main} />
        </IconButton>
      </Tooltip>
      {/* <Tooltip title="Join">
        <IconButton
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/document/${row.original._id}`, { replace: true });
          }}
        >
          <MessageOutlined twoToneColor={theme.palette.primary.main} />
        </IconButton>
      </Tooltip> */}
      <Tooltip title={'Delete'}>
        <IconButton
          color={row.values.status === 'deleted' ? 'secodnary' : 'error'}
          onClick={(e) => {
            e.stopPropagation();
            if (row.values.status === 'deleted') return;
            handleDeleteDocument(row.original._id);
          }}
        >
          <DeleteTwoTone twoToneColor={row.values.status === 'deleted' ? theme.palette.info.main : theme.palette.error.main} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

ActionCell.propTypes = {
  row: PropTypes.any,
  setDocument: PropTypes.any,
  handleClose: PropTypes.any,
  handleDeleteDocument: PropTypes.any,
  theme: PropTypes.any
};

const DocumentManagementPage = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const user = useContext(AuthContext).user;
  const data = useSelector((state) => state.document.lists);

  const [add, setAdd] = useState(false);
  const [open, setOpen] = useState(false);
  const [document, setDocument] = useState(null);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [controlDoc, setControlDoc] = useState(null);

  useEffect(() => {
    dispatch(getDocumentLists());
  }, []);

  const handleAdd = useCallback(() => {
    setAdd(!add);
    if (document && !add) setDocument(null);
  }, [add, document]);

  const handleClose = useCallback(() => {
    setOpen(!open);
  }, [open]);

  const handleDeleteDocument = useCallback((id) => {
    setControlDoc(id);
    setOpenConfirmDelete(true);
  }, []);

  const handleConfirmDeleteDocument = useCallback((id) => {
    if (id) dispatch(documentDelete(id));
    setControlDoc(null);
    setOpenConfirmDelete(false);
  }, []);

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
        Header: 'Document',
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
        accessor: 'invites',
        Cell: InvitesCell,
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
        Cell: ({ row }) => ActionCell({ row, setDocument, handleClose, handleDeleteDocument, theme })
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
        <AddDocument user={user} />
      </Dialog>
      <Dialog
        maxWidth="md"
        TransitionComponent={PopupTransition}
        fullWidth
        fullScreen={fullScreen}
        onClose={(e, r) => {
          if (r === 'escapeKeyDown') handleClose();
        }}
        open={open}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
        {document && user && <EditDocument user={user} onCancel={handleClose} document={document} />}
      </Dialog>
      <ConfirmDelete
        document={data.find((item) => item._id === controlDoc)}
        open={openConfirmDelete}
        handleClose={handleConfirmDeleteDocument}
      />
    </MainCard>
  );
};

export default DocumentManagementPage;
