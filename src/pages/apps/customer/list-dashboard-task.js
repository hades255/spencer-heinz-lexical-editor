import { lazy } from 'react';
import Loadable from 'components/Loadable';

const WidgetDataTask = Loadable(lazy(() => import('pages/widget/data-task')));


const DashboardTaskPage = () => {
    return (
        <WidgetDataTask></WidgetDataTask>
    );
};

export default DashboardTaskPage;