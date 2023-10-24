// third-party
import { FormattedMessage } from 'react-intl';

// assets
import {
  BorderOutlined,
  BoxPlotOutlined,
  ChromeOutlined,
  DeploymentUnitOutlined,
  GatewayOutlined,
  MenuUnfoldOutlined,
  QuestionOutlined,
  SmileOutlined,
  StopOutlined,
  ProfileOutlined,
  EditOutlined,
  UserOutlined,
  WalletOutlined,
  QuestionCircleOutlined,
  LockOutlined,
  SettingOutlined,
  CommentOutlined,
  UnorderedListOutlined,
  FileWordOutlined
} from '@ant-design/icons';

// icons
const icons = {
  ChromeOutlined,
  MenuUnfoldOutlined,
  BoxPlotOutlined,
  StopOutlined,
  BorderOutlined,
  SmileOutlined,
  GatewayOutlined,
  QuestionOutlined,
  DeploymentUnitOutlined,
  ProfileOutlined,
  EditOutlined,
  UserOutlined,
  WalletOutlined,
  QuestionCircleOutlined,
  LockOutlined,
  SettingOutlined,
  CommentOutlined,
  UnorderedListOutlined,
  FileWordOutlined
};

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
