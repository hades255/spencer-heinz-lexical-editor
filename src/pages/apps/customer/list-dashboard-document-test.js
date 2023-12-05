import { lazy } from 'react';
import Loadable from 'components/Loadable';

const WidgetData = Loadable(lazy(() => import('pages/widget/data')));

const DashboardDocumentPage = () => {
  return <WidgetData></WidgetData>;
};

export default DashboardDocumentPage;
