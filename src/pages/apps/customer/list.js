import { useCallback, useEffect, useMemo, useState, Fragment, useContext } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import {
  Button,
  Chip,
  Dialog,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';

// third-party
import { PatternFormat } from 'react-number-format';
import { useFilters, useExpanded, useGlobalFilter, useRowSelect, useSortBy, useTable, usePagination } from 'react-table';

// project import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import { PopupTransition } from 'components/@extended/Transitions';
import { CSVExport, HeaderSort, SortingSelect, TablePagination, TableRowSelection } from 'components/third-party/ReactTable';

import AddCustomer from 'sections/apps/customer/AddCustomer';
import CustomerView from 'sections/apps/customer/CustomerView';
import AlertCustomerDelete from 'sections/apps/customer/AlertCustomerDelete';

import { renderFilterTypes, GlobalFilter } from 'utils/react-table';

// assets
import {
  ToolOutlined,
  CloseOutlined,
  CheckOutlined,
  MobileOutlined,
  PhoneOutlined,
  PlusOutlined,
  EyeTwoTone,
  EditTwoTone,
  DeleteTwoTone,
  UnlockOutlined,
  ArrowUpOutlined,
  UserDeleteOutlined
} from '@ant-design/icons';

import { useSelector } from 'react-redux';
import { dispatch } from 'store';
import { getUserLists, setUserRole, setUserStatus } from 'store/reducers/user';
import AlertCustomerLock from 'sections/apps/customer/AlertCustomerLock';
import AuthContext from 'contexts/JWTContext';
import AlertCustomerPwdreset from 'sections/apps/customer/AlertCustomerPwdreset';
import { SelectionCell, SelectionHeader } from 'components/table/Selection';
import CustomCell from 'components/customers/CustomCell';
import { USER_ROLES } from 'config/constants';
import AlertCustomerDeleteP from 'sections/apps/customer/AlertCustomerDeleteP';

const CustomerCell = ({ row: { values } }) => {
  return <CustomCell user={values} />;
};

CustomerCell.propTypes = {
  row: PropTypes.any
};
// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, getHeaderProps, renderRowSubComponent, handleAdd, advancedSearch, handleSearchFilter }) {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const filterTypes = useMemo(() => renderFilterTypes, []);
  const sortBy = { id: 'name', desc: false };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    setHiddenColumns,
    allColumns,
    visibleColumns,
    rows,
    page,
    gotoPage,
    setPageSize,
    state: { globalFilter, selectedRowIds, pageIndex, pageSize, expanded },
    preGlobalFilteredRows,
    setGlobalFilter,
    setSortBy,
    selectedFlatRows
  } = useTable(
    {
      columns,
      data,
      filterTypes,
      initialState: {
        pageIndex: Number(searchParams.get('page') || '1') - 1,
        pageSize: Number(searchParams.get('perpage') || '100'),
        hiddenColumns: ['avatar', 'email', 'workPhone', 'countryCode'],
        sortBy: [sortBy]
      }
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect
  );

  useEffect(() => {
    if (matchDownSM) {
      setHiddenColumns(['age', 'contact', 'visits', 'email', 'status', 'avatar', 'workPhone', 'countryCode']);
    } else {
      setHiddenColumns(['avatar', 'email', 'workPhone', 'countryCode']);
    }
    // eslint-disable-next-line
  }, [matchDownSM]);

  return (
    <>
      <TableRowSelection selected={Object.keys(selectedRowIds).length} />
      <Stack spacing={3}>
        <Stack
          direction={matchDownSM ? 'column' : 'row'}
          spacing={1}
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 3, pb: 0 }}
        >
          <GlobalFilter
            preGlobalFilteredRows={preGlobalFilteredRows}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            size="small"
            advancedSearch={advancedSearch}
            handleSearchFilter={handleSearchFilter}
          />
          <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={1}>
            <SortingSelect sortBy={sortBy.id} setSortBy={setSortBy} allColumns={allColumns} />
            <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleAdd} size="small">
              Add Customer
            </Button>
            <CSVExport data={selectedFlatRows.length > 0 ? selectedFlatRows.map((d) => d.original) : data} filename={'customer-list.csv'} />
          </Stack>
        </Stack>

        <Table {...getTableProps()}>
          <TableHead>
            {headerGroups.map((headerGroup, i) => (
              <TableRow key={i} {...headerGroup.getHeaderGroupProps()} sx={{ '& > th:first-of-type': { width: '58px' } }}>
                {headerGroup.headers.map((column, index) => (
                  <TableCell key={index} {...column.getHeaderProps([{ className: column.className }, getHeaderProps(column)])}>
                    <HeaderSort column={column} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row);
              const rowProps = row.getRowProps();

              return (
                <Fragment key={i}>
                  <TableRow
                    {...row.getRowProps()}
                    onClick={() => {
                      row.toggleRowSelected();
                    }}
                    sx={{ cursor: 'pointer', bgcolor: row.isSelected ? alpha(theme.palette.primary.lighter, 0.35) : 'inherit' }}
                  >
                    {row.cells.map((cell, index) => (
                      <TableCell key={index} {...cell.getCellProps([{ className: cell.column.className }])}>
                        {cell.render('Cell')}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.isExpanded && renderRowSubComponent({ row, rowProps, visibleColumns, expanded })}
                </Fragment>
              );
            })}
            <TableRow sx={{ '&:hover': { bgcolor: 'transparent !important' } }}>
              <TableCell sx={{ p: 2, py: 3 }} colSpan={9}>
                <TablePagination gotoPage={gotoPage} rows={rows} setPageSize={setPageSize} pageSize={pageSize} pageIndex={pageIndex} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Stack>
    </>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  getHeaderProps: PropTypes.func,
  handleAdd: PropTypes.func,
  renderRowSubComponent: PropTypes.any,
  advancedSearch: PropTypes.any,
  handleSearchFilter: PropTypes.any
};

// ==============================|| CUSTOMER - LIST ||============================== //

// Section Cell and Header

const NumberFormatCell = ({ row }) => {
  const { values } = row;

  return (
    <Stack spacing={0}>
      <Typography variant="" color="textSecondary">
        <MobileOutlined style={{ borderRadius: '10px' }} />
        {values.mobilePhone !== '0' && (
          <PatternFormat displayType="text" format={` ${values.countryCode} (###) ###-####`} mask="_" defaultValue={values.mobilePhone} />
        )}
      </Typography>
      <Typography variant="" color="textSecondary">
        <PhoneOutlined />
        {values.workPhone !== '0' && (
          <PatternFormat displayType="text" format={` ${values.countryCode} (###) ###-####`} mask="_" defaultValue={values.workPhone} />
        )}
      </Typography>
    </Stack>
  );
};

export const StatusCell = ({ value }) => {
  switch (value) {
    case 'locked':
      return <Chip color="error" label="Locked" size="small" variant="light" />;
    case 'pending':
      return <Chip color="info" label="Pending" size="small" variant="light" />;
    case 'deleted':
      return <Chip color="warning" label="Deleted" size="small" variant="light" />;
    case 'invited':
      return <Chip color="primary" label="Invited" size="small" variant="light" />;
    default:
      return <Chip color="success" label="Active" size="small" variant="light" />;
  }
};

StatusCell.propTypes = {
  value: PropTypes.string
};

const getFlag = (value) => (value ? value[0].toUpperCase() + value.substr(1) : 'Person');

const FlagCell = ({ value }) => (
  <Chip color={value === 'organization' ? 'success' : 'primary'} label={getFlag(value)} size="small" variant="light" />
);

const RoleCell = ({ row, value, handleUpdateRole, role }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    event.stopPropagation();
    if (value !== role) setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleSelect = (event, nRole) => {
    if (value !== nRole) handleUpdateRole(row.original._id, nRole);
    handleClose(event);
  };

  return (
    <div>
      <Chip
        onClick={handleClick}
        label={
          <>
            {value.toUpperCase()}{' '}
            {value === 'creator' && (
              <Tooltip title="Upgrade to VIP">
                <Chip
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(e, USER_ROLES.CREATOR_VIP);
                  }}
                  label={<ArrowUpOutlined />}
                  size="small"
                  variant="dark"
                  color="error"
                />
              </Tooltip>
            )}
          </>
        }
        size="small"
        variant="light"
        color={value === role ? 'secondary' : value === 'admin' ? 'success' : value.includes('creator') ? 'primary' : 'info'}
      />
      <Menu id="roles-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {role === 'super admin' && (
          <MenuItem onClick={(e) => handleSelect(e, USER_ROLES.ADMIN)}>
            <Chip label="Admin" size="small" variant="dark" color="success" />
          </MenuItem>
        )}
        <MenuItem onClick={(e) => handleSelect(e, USER_ROLES.CREATOR)}>
          <Chip label="Creator" size="small" variant="dark" color="primary" />
        </MenuItem>
        <MenuItem onClick={(e) => handleSelect(e, USER_ROLES.CREATOR_VIP)}>
          <Chip label="Creator-VIP" size="small" variant="dark" color="primary" />
        </MenuItem>
        <MenuItem onClick={(e) => handleSelect(e, USER_ROLES.CONTRIBUTOR)}>
          <Chip label="Contributor" size="small" variant="dark" color="info" />
        </MenuItem>
      </Menu>
    </div>
  );
};

const ActionCell = (
  row,
  theme,
  setCustomer,
  setCustomerDeleteId,
  setUserDeleteId,
  handleAdd,
  handleClose,
  handleCloseLockDlg,
  handleUpdateStatus,
  handleClosePwdresetDlg,
  handleClosePDelete,
  role
) => {
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
      <Tooltip title={'Approve'}>
        <IconButton
          color={
            row.values.status === 'active' || row.values.status === 'locked' || (row.values.role === 'admin' && role !== 'super admin')
              ? 'secondary'
              : 'success'
          }
          onClick={(e) => {
            e.stopPropagation();
            if (row.values.status === 'active' || row.values.status === 'locked' || (row.values.role === 'admin' && role !== 'super admin'))
              return;
            handleUpdateStatus(row.original._id, 'active');
          }}
        >
          <CheckOutlined twoToneColor={theme.palette.success.main} />
        </IconButton>
      </Tooltip>
      <Tooltip title={row.values.status === 'locked' ? (row.values.comment ? `Locked because ${row.values.comment}` : 'Unlock') : 'Lock'}>
        <IconButton
          color={
            row.values.status === 'deleted' || (row.values.role === 'admin' && role !== 'super admin')
              ? 'secondary'
              : row.values.status === 'locked'
              ? 'info'
              : 'error'
          }
          onClick={(e) => {
            e.stopPropagation();
            if (row.values.status === 'deleted' || (row.values.role === 'admin' && role !== 'super admin')) return;
            if (row.values.status === 'locked') {
              handleUpdateStatus(row.original._id, 'active');
            } else {
              handleCloseLockDlg();
              setCustomerDeleteId(row.values.name);
              setUserDeleteId(row.original._id);
            }
          }}
        >
          <UnlockOutlined twoToneColor={theme.palette.info.main} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton
          color={row.values.role === 'admin' && role !== 'super admin' ? 'secondary' : 'primary'}
          onClick={(e) => {
            e.stopPropagation();
            if (row.values.role === 'admin' && role !== 'super admin') return;
            setCustomer(row.original);
            handleAdd();
          }}
        >
          <EditTwoTone twoToneColor={theme.palette.primary.main} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Reset Password">
        <IconButton
          color={row.values.status !== 'active' || (row.values.role === 'admin' && role !== 'super admin') ? 'secondary' : 'warning'}
          onClick={(e) => {
            e.stopPropagation();
            if (row.values.status !== 'active' || (row.values.role === 'admin' && role !== 'super admin')) return;
            handleClosePwdresetDlg();
            setCustomerDeleteId(row.values.name);
            setUserDeleteId(row.original._id);
          }}
        >
          <ToolOutlined twoToneColor={theme.palette.warning.main} />
        </IconButton>
      </Tooltip>
      {row.values.role === 'admin' && role !== 'super admin' ? (
        <Tooltip title={`Permanent Delete `}>
          <IconButton
            color={'secondary'}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <UserDeleteOutlined />
          </IconButton>
        </Tooltip>
      ) : row.values.status === 'deleted' ? (
        <Tooltip title={`Permanent Delete `}>
          <IconButton
            color={'error'}
            onClick={(e) => {
              e.stopPropagation();
              handleClosePDelete();
              setCustomerDeleteId(row.values.name);
              setUserDeleteId(row.original._id);
            }}
          >
            <UserDeleteOutlined twoToneColor={theme.palette.info.main} />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title={row.values.status === 'deleted' && row.values.comment ? `Deleted because ${row.values.comment}` : 'Delete'}>
          <IconButton
            color={row.values.status === 'deleted' ? 'secodnary' : 'error'}
            onClick={(e) => {
              e.stopPropagation();
              if (row.values.status === 'deleted') return;
              handleClose();
              setCustomerDeleteId(row.values.name);
              setUserDeleteId(row.original._id);
            }}
          >
            <DeleteTwoTone twoToneColor={row.values.status === 'deleted' ? theme.palette.info.main : theme.palette.error.main} />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
};

FlagCell.propTypes = {
  value: PropTypes.string
};

RoleCell.propTypes = {
  value: PropTypes.string,
  row: PropTypes.object,
  handleUpdateRole: PropTypes.func,
  role: PropTypes.string
};

NumberFormatCell.propTypes = {
  row: PropTypes.object
};

const UserManagementPage = () => {
  const theme = useTheme();

  const data = useSelector((state) => state.user.lists)?.filter((item) => item.role !== 'super admin');

  const user = useContext(AuthContext).user;
  const [add, setAdd] = useState(false);
  const [open, setOpen] = useState(false);
  const [openPDelete, setOpenPDelete] = useState(false);
  const [openLockDlg, setOpenLockDlg] = useState(false);
  const [openPwdresetDlg, setOpenPwdresetDlg] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [customerDeleteId, setCustomerDeleteId] = useState(null);
  const [userDeleteId, setUserDeleteId] = useState(null);
  const [advancedSearch, setAdvancedSearch] = useState({
    active: true,
    deleted: false,
    locked: false,
    pending: false,
    invited: false
  });

  const handleSearchFilter = ({ target: { name, checked } }) => {
    if (name === 'all') {
      if (checked)
        setAdvancedSearch({
          deleted: true,
          locked: true,
          pending: true,
          invited: true
        });
      else
        setAdvancedSearch({
          deleted: false,
          locked: false,
          pending: false,
          invited: false
        });
    } else
      setAdvancedSearch({
        ...advancedSearch,
        [name]: checked
      });
  };

  useEffect(() => {
    dispatch(getUserLists());
  }, []);

  const handleAdd = () => {
    setAdd(!add);
    if (customer && !add) setCustomer(null);
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const handleClosePDelete = () => {
    setOpenPDelete(!openPDelete);
  };

  const handleCloseLockDlg = () => {
    setOpenLockDlg(!openLockDlg);
  };

  const handleClosePwdresetDlg = () => {
    setOpenPwdresetDlg(!openPwdresetDlg);
  };

  const handleUpdateStatus = (userId, status) => {
    dispatch(setUserStatus(userId, status));
  };

  const handleUpdateRole = (userId, role) => {
    dispatch(setUserRole(userId, role));
  };

  const columns = useMemo(
    () => [
      {
        title: 'Row Selection',
        Header: SelectionHeader,
        accessor: 'selection',
        Cell: SelectionCell,
        disableSortBy: true
      },
      {
        Header: 'User Name',
        accessor: 'name',
        Cell: CustomerCell
      },
      {
        Header: 'Avatar',
        accessor: 'avatar',
        disableSortBy: true
      },
      {
        Header: 'Email',
        accessor: 'email'
      },
      {
        Header: 'Contact',
        accessor: 'mobilePhone',
        Cell: NumberFormatCell,
        disableSortBy: true
      },
      {
        Header: 'workPhone',
        accessor: 'workPhone'
      },
      {
        Header: 'countryCode',
        accessor: 'countryCode'
      },
      {
        Header: 'Flag',
        accessor: 'flag',
        Cell: FlagCell
      },
      {
        Header: 'Role',
        accessor: 'role',
        Cell: ({ row, value }) => RoleCell({ row, value, handleUpdateRole, role: user.role })
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: StatusCell
      },
      {
        Header: 'Actions',
        className: 'cell-center',
        accessor: 'comment',
        disableSortBy: true,
        Cell: ({ row }) =>
          ActionCell(
            row,
            theme,
            setCustomer,
            setCustomerDeleteId,
            setUserDeleteId,
            handleAdd,
            handleClose,
            handleCloseLockDlg,
            handleUpdateStatus,
            handleClosePwdresetDlg,
            handleClosePDelete,
            user.role
          )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  const renderRowSubComponent = useCallback(({ row }) => <CustomerView data={row.original} user={true} />, []);
  return (
    <MainCard content={false}>
      <ScrollX>
        <ReactTable
          columns={columns}
          data={data.filter(
            (item) =>
              (advancedSearch.active && item.status === 'active') ||
              (advancedSearch.pending && item.status === 'pending') ||
              (advancedSearch.locked && item.status === 'locked') ||
              (advancedSearch.deleted && item.status === 'deleted') ||
              (advancedSearch.invited && item.status === 'invited')
          )}
          handleAdd={handleAdd}
          getHeaderProps={(column) => column.getSortByToggleProps()}
          renderRowSubComponent={renderRowSubComponent}
          advancedSearch={advancedSearch}
          handleSearchFilter={handleSearchFilter}
        />
      </ScrollX>
      <AlertCustomerDelete title={customerDeleteId} userDeleteId={userDeleteId} open={open} handleClose={handleClose} />
      <AlertCustomerDeleteP title={customerDeleteId} userDeleteId={userDeleteId} open={openPDelete} handleClose={handleClosePDelete} />
      <AlertCustomerLock title={customerDeleteId} userDeleteId={userDeleteId} open={openLockDlg} handleClose={handleCloseLockDlg} />
      <AlertCustomerPwdreset
        title={customerDeleteId}
        userDeleteId={userDeleteId}
        open={openPwdresetDlg}
        handleClose={handleClosePwdresetDlg}
      />
      {/* add user dialog */}
      {add && (
        <Dialog
          maxWidth="sm"
          TransitionComponent={PopupTransition}
          keepMounted
          fullWidth
          onClose={handleAdd}
          open={add}
          sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
          aria-describedby="alert-dialog-slide-description"
        >
          <AddCustomer customer={customer} onCancel={handleAdd} />
        </Dialog>
      )}
    </MainCard>
  );
};

export default UserManagementPage;
