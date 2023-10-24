import { lazy, useState } from 'react';

// material-ui
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Grid,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import IncomeAreaChart from 'sections/dashboard/default/IncomeAreaChart';
import MonthlyBarChart from 'sections/dashboard/default/MonthlyBarChart';
import ReportAreaChart from 'sections/dashboard/default/ReportAreaChart';
import SalesChart from 'sections/dashboard/SalesChart';
import OrdersTable from 'sections/dashboard/default/OrdersTable';
import NavCard from 'layout/MainLayout/Drawer/DrawerContent/NavCard';

import CustomerListPage from 'pages/apps/customer/list-document';
import DashboardDocumentPage from 'pages/apps/customer/list-dashboard-document-test';
import DashboardTaskPage from 'pages/apps/customer/list-dashboard-task';
const AppCustomerList = Loadable(lazy(() => import('pages/apps/customer/list')));


// assets
import { GiftOutlined, MessageOutlined, SettingOutlined } from '@ant-design/icons';
import avatar1 from 'assets/images/users/avatar-1.png';
import avatar2 from 'assets/images/users/avatar-2.png';
import avatar3 from 'assets/images/users/avatar-3.png';
import avatar4 from 'assets/images/users/avatar-4.png';
import Loadable from 'components/Loadable';

// avatar style
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

// action style
const actionSX = {
  mt: 0.75,
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// sales report status
const status = [
  {
    value: 'today',
    label: 'Today'
  },
  {
    value: 'month',
    label: 'This Month'
  },
  {
    value: 'year',
    label: 'This Year'
  }
];

// ==============================|| DASHBOARD - DEFAULT ||============================== //

const DashboardDefault = () => {
  const [value, setValue] = useState('today');
  const [slot, setSlot] = useState('week');

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>

      <Grid item xs={12} sm={2} md={2} lg={2}>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
          <AnalyticEcommerce title="Tasks" count="0" />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
          <AnalyticEcommerce title="Asks" count="0" />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
          <AnalyticEcommerce title="Active Documents" count="0" />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
          <AnalyticEcommerce title="Edits" count="0" />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
          <AnalyticEcommerce title="Reviews" count="0" />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
          <AnalyticEcommerce title="Comments" count="0" />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
          <AnalyticEcommerce title="Approvals" count="0" />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
          <AnalyticEcommerce title="Signatures" count="0" />
        </Grid>
      </Grid>

      <Grid item xs={12} sm={10} md={10} lg={10} >
        <Grid item style={{marginBottom: '13px'}}>
          <DashboardDocumentPage />
        </Grid>
        <Grid item>
          <DashboardTaskPage />
        </Grid>
      </Grid>

      {/* <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} /> */}



    </Grid>
  );
};

export default DashboardDefault;
