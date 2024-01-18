import { useCallback, useEffect, useState } from 'react';
// material-ui
import { Grid } from '@mui/material';

// project import
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';

import DashboardDocumentPage from 'pages/apps/customer/list-dashboard-document-test';
import DashboardTaskPage from 'pages/apps/customer/list-dashboard-task';
import axiosServices from 'utils/axios';
import { CATEGORIES } from 'config/constants';

const DashboardDefault = () => {
  const [category, setCategory] = useState('tasks');
  const [counts, setCounts] = useState({ tasks: 0, asks: 0, myDocs: 0 });
  const [select, setSelect] = useState('');

  const handleClickCategory = useCallback((index) => {
    setCategory(index);
    setSelect('');
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosServices.get('/home/documents/category');
        setCounts(res.data.data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12} sm={2} md={2} lg={2}>
        {CATEGORIES.map((item, key) => (
          <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }} key={key}>
            <AnalyticEcommerce onClick={handleClickCategory} index={item.key} title={item.title} count={counts[item.key]} />
          </Grid>
        ))}
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
          <AnalyticEcommerce onClick={handleClickCategory} index={'tasks'} title="Comments" count="0" />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
          <AnalyticEcommerce onClick={handleClickCategory} index={'tasks'} title="Approvals" count="0" />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
          <AnalyticEcommerce onClick={handleClickCategory} index={'tasks'} title="Signatures" count="0" />
        </Grid>
      </Grid>

      <Grid item xs={12} sm={10} md={10} lg={10}>
        <Grid item style={{ marginBottom: '13px' }}>
          <DashboardDocumentPage category={category} setSelect={setSelect} select={select} />
        </Grid>
        <Grid item>
          <DashboardTaskPage select={select} category={category} />
        </Grid>
      </Grid>

      {/* <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} /> */}
    </Grid>
  );
};

export default DashboardDefault;
