import { useCallback, useEffect, useState } from 'react';
// material-ui
import { Grid } from '@mui/material';

// project import
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';

import DashboardDocumentPage from 'pages/apps/customer/list-dashboard-document-home';
import DashboardTaskPage from 'pages/apps/customer/list-dashboard-task';
import axiosServices from 'utils/axios';
import { CATEGORIES } from 'config/constants';

const DashboardDefault = () => {
  const [group, setGroup] = useState('tasks');
  const [category, setCategory] = useState('');
  const [counts, setCounts] = useState({ tasks: 0, asks: 0, myDocs: 0 });
  const [select, setSelect] = useState('');

  const getGroupDataFromServer = useCallback((group) => {
    (async () => {
      try {
        const res = await axiosServices.get('/home/documents/group/' + group);
        setCounts(res.data.data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const handleClickCategory = useCallback((index) => {
    setCategory(index);
    setSelect('');
  }, []);

  const handleClickCategoryGroup = useCallback(
    (index) => {
      setGroup(index);
      setCategory('');
      setSelect('');
      if (index !== 'myDocs') getGroupDataFromServer(index);
    },
    [getGroupDataFromServer]
  );

  useEffect(() => getGroupDataFromServer('tasks'), [getGroupDataFromServer]);

  useEffect(() => {}, []);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12} sm={2} md={2} lg={2}>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
          <AnalyticEcommerce
            onClick={handleClickCategoryGroup}
            index={'tasks'}
            title={'Tasks'}
            count={counts.tasks}
            bgcolor={`rgba(22,119,255, ${group === 'tasks' ? '0.2' : '0.1'})`}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
          <AnalyticEcommerce
            onClick={handleClickCategoryGroup}
            index={'asks'}
            title={'Asks'}
            count={counts.asks}
            bgcolor={`rgba(22,119,255, ${group === 'asks' ? '0.2' : '0.1'})`}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
          <AnalyticEcommerce
            onClick={handleClickCategoryGroup}
            index={'myDocs'}
            title={'Active Documents'}
            count={counts.myDocs}
            bgcolor={`rgba(201,218,37, ${group === 'myDocs' ? '0.2' : '0.1'})`}
          />
        </Grid>
        {CATEGORIES.map((item, key) => (
          <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }} key={key}>
            <AnalyticEcommerce
              onClick={handleClickCategory}
              index={item.key}
              title={item.title}
              count={counts[item.key]}
              percentage={item.key === 'approvals' && counts.approvals !== 0 ? (counts[item.key] / counts[group]) * 100 : null}
              isLoss={false}
              bgcolor={`rgba(230,255,251, ${item.key === category ? '0.7' : '0'})`}
            />
          </Grid>
        ))}
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
          <AnalyticEcommerce onClick={handleClickCategory} index={'tasks'} title="Signatures" count="0" />
        </Grid>
      </Grid>

      <Grid item xs={12} sm={10} md={10} lg={10}>
        <Grid item style={{ marginBottom: '13px' }}>
          <DashboardDocumentPage category={category} group={group} setSelect={setSelect} select={select} />
        </Grid>
        <Grid item>
          <DashboardTaskPage select={select} category={category} group={group} />
        </Grid>
      </Grid>

      {/* <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} /> */}
    </Grid>
  );
};

export default DashboardDefault;
