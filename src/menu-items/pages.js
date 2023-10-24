// third-party
import { FormattedMessage } from 'react-intl';

// assets
import {
  DollarOutlined,
  LoginOutlined,
  PhoneOutlined,
  RocketOutlined,
  DashboardOutlined,
  FileWordOutlined,
  EditOutlined,
  FileAddTwoTone
} from '@ant-design/icons';

// icons
const icons = {
  DollarOutlined,
  LoginOutlined,
  PhoneOutlined,
  RocketOutlined,
  DashboardOutlined,
  FileWordOutlined,
  EditOutlined,
  FileAddTwoTone
};

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
          id: 'login',
          title: <FormattedMessage id="document-list" />,
          icon: icons.FileAddTwoTone,
          type: 'item',
          url: '/document/list'
        },
        {
          id: 'register',
          title: <FormattedMessage id="document-edit" />,
          icon: icons.EditOutlined,
          type: 'item',
          url: '/document/edit/f76ecaeb-300f-4594-b57f-8bd8e96ad650'
        }
      ]
    },
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
  ]
};

export default pages;
