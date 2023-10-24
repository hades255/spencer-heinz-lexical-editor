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
  UnorderedListOutlined
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
  UnorderedListOutlined
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const other = {
  id: 'other',
  title: <FormattedMessage id="others" />,
  type: 'group',
  children: [
    {
      id: 'sample-page',
      title: <FormattedMessage id="sample-page" />,
      type: 'item',
      url: '/sample-page',
      icon: icons.ChromeOutlined
    },
    {
      id: 'documentation',
      title: <FormattedMessage id="documentation" />,
      type: 'item',
      url: 'https://links.codedthemes.com/BQFrl',
      icon: icons.QuestionOutlined,
      external: true,
      target: true,
      chip: {
        label: 'gitbook',
        color: 'secondary',
        size: 'small'
      }
    },
    {
      id: 'roadmap',
      title: <FormattedMessage id="roadmap" />,
      type: 'item',
      url: 'https://links.codedthemes.com/RXnKQ',
      icon: icons.DeploymentUnitOutlined,
      external: true,
      target: true
    },
    {
      id: 'profile',
      title: <FormattedMessage id="Profile" />,
      type: 'collapse',
      icon: icons.ProfileOutlined,
      children: [
        {
          id: 'profiles-edit',
          title: <FormattedMessage id="Edit Profile" />,
          type: 'item',
          url: '/profiles/edit',
          icon: icons.EditOutlined,
          breadcrumbs: true
        },
        {
          id: 'profiles-view',
          title: <FormattedMessage id="View Profile" />,
          type: 'item',
          url: '/profiles/view',
          icon: icons.UserOutlined,
          breadcrumbs: true
        },
        {
          id: 'profiles-social',
          title: <FormattedMessage id="Social Profile" />,
          type: 'item',
          url: '/profiles/social',
          icon: icons.ProfileOutlined,
          breadcrumbs: true
        },
        {
          id: 'profiles-billing',
          title: <FormattedMessage id="Billing" />,
          type: 'item',
          url: '/profiles/billing',
          icon: icons.WalletOutlined,
          breadcrumbs: true
        },
      ]
    },
    {
      id: 'setting',
      title: <FormattedMessage id="Setting" />,
      type: 'collapse',
      icon: icons.SettingOutlined,
      children: [
        {
          id: 'setting-support',
          title: <FormattedMessage id="Support" />,
          type: 'item',
          url: '/settings/support',
          icon: icons.QuestionCircleOutlined,
          breadcrumbs: true
        },
        {
          id: 'setting-account',
          title: <FormattedMessage id="Account Settings" />,
          type: 'item',
          url: '/settings/account-settings',
          icon: icons.UserOutlined,
          breadcrumbs: true
        },
        {
          id: 'setting-privacy',
          title: <FormattedMessage id="Privacy Center" />,
          type: 'item',
          url: '/settings/privacy-center',
          icon: icons.LockOutlined,
          breadcrumbs: true
        },
        {
          id: 'setting-feedback',
          title: <FormattedMessage id="Feedback" />,
          type: 'item',
          url: '/settings/feedback',
          icon: icons.CommentOutlined,
          breadcrumbs: true
        },
        {
          id: 'setting-history',
          title: <FormattedMessage id="History" />,
          type: 'item',
          url: '/settings/history',
          icon: icons.UnorderedListOutlined,
          breadcrumbs: true
        },
      ]
    },
  ]
};

export default other;
