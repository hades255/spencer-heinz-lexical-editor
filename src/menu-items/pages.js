// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { DashboardOutlined, FileWordOutlined, EditOutlined } from '@ant-design/icons';

// icons
const icons = { DashboardOutlined, FileWordOutlined, EditOutlined };

// ==============================|| MENU ITEMS - PAGES ||============================== //

const pages = {
  id: 'group-pages',
  title: <FormattedMessage id="pages" />,
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: <FormattedMessage id="dashboard" />,
      type: 'item',
      url: '/dashboard',
      icon: icons.DashboardOutlined
    },
    {
      id: 'documents',
      title: <FormattedMessage id="documents" />,
      type: 'collapse',
      icon: icons.FileWordOutlined,
      children: [
        {
          id: 'documentslist',
          title: <FormattedMessage id="document-list" />,
          icon: icons.FileWordOutlined,
          type: 'item',
          url: '/document/list'
        },
        {
          id: 'documentscreate',
          title: <FormattedMessage id="document-create" />,
          icon: icons.EditOutlined,
          type: 'item',
          url: '/document/create'
        }
      ]
    }
  ]
};

export default pages;

/**
 * 
    {
      id: 'authentication',
      title: <FormattedMessage id="authentication" />,
      type: 'collapse',
      icon: icons.LoginOutlined,
      children: [
        {
          id: 'login',
          title: <FormattedMessage id="login" />,
          type: 'item',
          url: '/auth/login'
        },
        {
          id: 'register',
          title: <FormattedMessage id="register" />,
          type: 'item',
          url: '/auth/register'
        }
      ]
    }
 */
