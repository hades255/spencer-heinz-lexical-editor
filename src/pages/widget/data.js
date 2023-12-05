// material-ui
import { Grid } from '@mui/material';

// project imports
// import ToDoList from 'sections/widget/data/ToDoList';
// import TrafficSources from 'sections/widget/data/TrafficSources';
// import TeamMembers from 'sections/widget/data/TeamMembers';

// import UserActivity from 'sections/widget/data/UserActivity';
// import LatestMessages from 'sections/widget/data/LatestMessages';

// import ProjectTable from 'sections/widget/data/ProjectTable';
// import ProductSales from 'sections/widget/data/ProductSales';

// import TasksCard from 'sections/widget/data/TasksCard';
// import ApplicationSales from 'sections/widget/data/ApplicationSales';

// import ActiveTickets from 'sections/widget/data/ActiveTickets';
// import LatestPosts from 'sections/widget/data/LatestPosts';

// import FeedsCard from 'sections/widget/data/FeedsCard';
import LatestCustomers from 'sections/widget/data/LatestCustomers';

// import LatestOrder from 'sections/widget/data/LatestOrder';

// import IncomingRequests from 'sections/widget/data/IncomingRequests';
// import TotalRevenue from 'sections/widget/data/TotalRevenue';
// import NewCustomers from 'sections/widget/data/NewCustomers';

// import RecentTickets from 'sections/widget/data/RecentTickets';

// ===========================|| WIDGET - DATA ||=========================== //

const WidgetData = () => (
  <Grid container spacing={3}>
    <Grid item xs={12} lg={12} md={12}>
      <LatestCustomers />
    </Grid>
  </Grid>
);

export default WidgetData;
