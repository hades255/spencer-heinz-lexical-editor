// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { UserOutlined, FileWordOutlined } from '@ant-design/icons';

// icons
const icons = { UserOutlined, FileWordOutlined };

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const admin = {
  id: 'admin',
  title: <FormattedMessage id="admins" />,
  type: 'group',
  children: [
    {
      id: 'user-management',
      title: <FormattedMessage id="user-Management" />,
      type: 'item',
      url: '/admin/user-management',
      icon: icons.UserOutlined
    },
    {
      id: 'document-management',
      title: <FormattedMessage id="document-Management" />,
      type: 'item',
      url: '/admin/document-management',
      icon: icons.FileWordOutlined
    }
  ]
};

export default admin;
