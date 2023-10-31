import { lazy } from 'react';
import Loadable from 'components/Loadable';

// project import
import MainLayout from 'layout/MainLayout';
import CommonLayout from 'layout/CommonLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import DocumentListPage from 'pages/apps/customer/list-document';
import UserManagementPage from 'pages/apps/customer/list';
import Chat from 'pages/apps/chat';
import DocumentView from 'pages/apps/document/DocumentView';
const NotificationList = Loadable(lazy(() => import('pages/extra-pages/NotificationList')));
// import NotificationList from 'pages/extra-pages/NotificationList';
import DocumentManagementPage from 'pages/apps/customer/list-document-management';
// import DocumentView from 'pages/apps/document/view';
// import GuestGuard from 'utils/route-guard/GuestGuard';
import MessageList from 'pages/extra-pages/MessageList';
import MessageView from 'pages/extra-pages/MessageView';
import DocumentCreate from 'pages/apps/document/DocumentCreate';
import AdminGuard from 'utils/route-guard/AdminGuard';
import ContributorGuard from 'utils/route-guard/ContributorGuard';

// render - dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
// pages routing
const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon')));

// const AppCustomerList = Loadable(lazy(() => import('pages/apps/customer/list')));

// const AccountProfile = Loadable(lazy(() => import('pages/apps/profiles/account')));
const AccountTabProfile = Loadable(lazy(() => import('sections/apps/profiles/account/TabProfile')));
// const AccountTabPersonal = Loadable(lazy(() => import('sections/apps/profiles/account/TabPersonal')));
const AccountTabAccount = Loadable(lazy(() => import('sections/apps/profiles/account/TabAccount')));
const AccountTabPassword = Loadable(lazy(() => import('sections/apps/profiles/account/TabPassword')));
const AccountTabSettings = Loadable(lazy(() => import('sections/apps/profiles/account/TabSettings')));
// const AccountTabRole = Loadable(lazy(() => import('sections/apps/profiles/account/TabRole')));

const UserProfile = Loadable(lazy(() => import('pages/apps/profiles/user')));
const UserTabPersonal = Loadable(lazy(() => import('sections/apps/profiles/user/TabPersonal')));
const UserTabPayment = Loadable(lazy(() => import('sections/apps/profiles/user/TabPayment')));
const UserTabPassword = Loadable(lazy(() => import('sections/apps/profiles/user/TabPassword')));
const UserTabSettings = Loadable(lazy(() => import('sections/apps/profiles/user/TabSettings')));
const PricingPage = Loadable(lazy(() => import('pages/extra-pages/pricing')));

// pages routing
// const AuthLogin = Loadable(lazy(() => import('pages/auth/login')));
// const AuthRegister = Loadable(lazy(() => import('pages/auth/register')));
// const AuthForgotPassword = Loadable(lazy(() => import('pages/auth/forgot-password')));
// const AuthResetPassword = Loadable(lazy(() => import('pages/auth/reset-password')));
// const AuthCheckMail = Loadable(lazy(() => import('pages/auth/check-mail')));
// const AuthCodeVerification = Loadable(lazy(() => import('pages/auth/code-verification')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: 'dashboard',
          url: 'dashboard',
          element: <DashboardDefault />
        },
        {
          path: 'notifications',
          element: <NotificationList />
        },
        {
          path: 'sample-page',
          element: <SamplePage />
        },
        {
          path: 'profiles',
          children: [
            {
              path: 'view',
              element: <AccountTabProfile />
            },
            {
              path: 'edit',
              element: <UserProfile />,
              children: [
                {
                  path: 'personal',
                  element: <UserTabPersonal />
                },
                {
                  path: 'payment',
                  element: <UserTabPayment />
                },
                {
                  path: 'password',
                  element: <UserTabPassword />
                },
                {
                  path: 'settings',
                  element: <UserTabSettings />
                }
              ]
            },
            {
              path: 'social',
              element: <AccountTabProfile />
            },
            {
              path: 'billing',
              element: <PricingPage />
            }
          ]
        },
        {
          path: 'settings',
          children: [
            {
              path: 'support',
              element: <AccountTabSettings />
            },
            {
              path: 'account-settings',
              element: <AccountTabAccount />
            },
            {
              path: 'privacy-center',
              element: <AccountTabPassword />
            },
            {
              path: 'feedback',
              element: <AccountTabSettings />
            },
            {
              path: 'history',
              element: <AccountTabSettings />
            }
          ]
        },
        {
          path: 'admin',
          children: [
            {
              path: 'document-management',
              element: (
                <AdminGuard>
                  <DocumentManagementPage />
                </AdminGuard>
              )
            },
            {
              path: 'user-management',
              element: (
                <AdminGuard>
                  <UserManagementPage />
                </AdminGuard>
              )
            }
          ]
        },
        {
          path: 'document',
          children: [
            {
              path: 'list',
              element: <DocumentListPage />
            },
            {
              path: 'create',
              element: (
                <ContributorGuard>
                  <DocumentCreate />
                </ContributorGuard>
              )
            },
            {
              path: 'edit/:uniqueId',
              element: <Chat />
            },
            {
              path: ':uniqueId',
              element: <DocumentView />
            }
          ]
        },
        {
          path: 'message',
          children: [
            {
              path: '',
              element: <MessageList />
            },
            {
              path: ':uniqueId',
              element: <MessageView />
            }
          ]
        }
      ]
    },
    {
      path: 'maintenance',
      element: <CommonLayout />,
      children: [
        {
          path: '404',
          element: <MaintenanceError />
        },
        {
          path: '500',
          element: <MaintenanceError500 />
        },
        {
          path: 'under-construction',
          element: <MaintenanceUnderConstruction />
        },
        {
          path: 'coming-soon',
          element: <MaintenanceComingSoon />
        }
      ]
    }
  ]
};

export default MainRoutes;
