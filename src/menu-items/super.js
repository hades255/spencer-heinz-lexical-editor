// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { ToolOutlined } from '@ant-design/icons';

// icons
const icons = { ToolOutlined };

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const superadmin = {
  id: 'superadmin',
  title: <FormattedMessage id="superadmin" />,
  type: 'group',
  children: [
    {
      id: 'system-management',
      title: <FormattedMessage id="system-Management" />,
      type: 'item',
      url: '/admin/system-management',
      icon: icons.ToolOutlined
    }
  ]
};

export default superadmin;
