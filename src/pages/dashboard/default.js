// material-ui
import { Grid } from '@mui/material';

// project import
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';

import DashboardDocumentPage from 'pages/apps/customer/list-dashboard-document-test';
import DashboardTaskPage from 'pages/apps/customer/list-dashboard-task';

const DashboardDefault = () => {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12} sm={2} md={2} lg={2}>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
          <AnalyticEcommerce title="Tasks" count="1" />
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

      <Grid item xs={12} sm={10} md={10} lg={10}>
        <Grid item style={{ marginBottom: '13px' }}>
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
