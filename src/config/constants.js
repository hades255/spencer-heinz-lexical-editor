export const LOGIN_ERROR_MESSAGES = {
  active: { color: 'success', message: 'active' },
  pending: { color: 'info', message: 'Your account is pending. Please wait for your account is active.' },
  locked: { color: 'warning', message: 'Your account is locked. Please contact admin and check your email.' },
  deleted: { color: 'error', message: 'Your account is deleted. Please contact admin and check your email.' }
};

export const MESSAGE_TYPES = {
  DOCUMENT_INVITE_RESOLVE: '@document/invite/resolve/nonactive-users'
};

export const NOTIFICATION_TYPES = {
  DOCUMENT_INVITE_SEND: '@document/invite/send',
  DOCUMENT_INVITE_RECEIVE: '@document/invite/receive',
  DOCUMENT_INVITE_ACCEPT: '@document/invite/accept',
  DOCUMENT_INVITE_REJECT: '@document/invite/reject',
  DOCUMENT_INVITE_DELETE: '@document/invite/delete',
  DOCUMENT_CREATE_NEW: '@document/new',
  USER_SETTING_ROLE: '@user/setting/role',
  USER_SETTING_STATUS: '@user/setting/status',
  USER_RESET_PASSWORD: '@user/reset/password',
  USER_CREATE_NEW: '@user/new'
};

export const RELOAD_REQUIRED_NOTIFICATION_TYPES = [
  NOTIFICATION_TYPES.USER_SETTING_ROLE,
  NOTIFICATION_TYPES.USER_SETTING_STATUS,
  NOTIFICATION_TYPES.USER_RESET_PASSWORD
];

export const NOTIFICATION_ITEM = {
  [NOTIFICATION_TYPES.DOCUMENT_INVITE_SEND]: {
    color: 'primary',
    bgcolor: 'primary',
    avatar: (data) => data.data[0].text[0],
    title: 'Invitation'
  },
  [NOTIFICATION_TYPES.DOCUMENT_INVITE_RECEIVE]: {
    color: 'info',
    bgcolor: 'info',
    avatar: (data) => data.data[0].text[0],
    title: 'Invitation'
  },
  [NOTIFICATION_TYPES.DOCUMENT_INVITE_ACCEPT]: {
    color: 'success',
    bgcolor: 'success',
    avatar: (data) => data.data[0].text[0],
    title: 'Invitation'
  },
  [NOTIFICATION_TYPES.DOCUMENT_INVITE_REJECT]: {
    color: 'error',
    bgcolor: 'error',
    avatar: (data) => data.data[0].text[0],
    title: 'Invitation'
  },
  [NOTIFICATION_TYPES.DOCUMENT_INVITE_DELETE]: {
    color: 'warning',
    bgcolor: 'warning',
    avatar: (data) => data.data[0].text[0],
    title: 'Invitation'
  },
  [NOTIFICATION_TYPES.DOCUMENT_CREATE_NEW]: {
    color: 'info',
    bgcolor: 'info',
    avatar: () => 'D',
    title: 'New Document'
  },
  [NOTIFICATION_TYPES.USER_SETTING_ROLE]: {
    color: 'error',
    bgcolor: 'error',
    avatar: (data) => data.data[0].text[0],
    title: 'User Role'
  },
  [NOTIFICATION_TYPES.USER_SETTING_STATUS]: {
    color: 'error',
    bgcolor: 'error',
    avatar: (data) => data.data[0].text[0],
    title: 'User Status'
  },
  [NOTIFICATION_TYPES.USER_RESET_PASSWORD]: {
    color: 'error',
    bgcolor: 'error',
    avatar: (data) => data.data[0].text[0],
    title: 'Reset Password'
  },
  [NOTIFICATION_TYPES.USER_CREATE_NEW]: {
    color: 'warning',
    bgcolor: 'warning',
    avatar: () => 'U',
    title: 'New User'
  }
};

export const USER_STATUS_COMMENTS = [
  {
    msg: 'Password',
    comment: 'because password error'
  },
  {
    msg: 'Access',
    comment: 'access more than 3 times'
  }
];

export const USER_ROLES = {
  ADMIN: 'admin',
  SUPERADMIN: 'super admin',
  CREATOR: 'creator',
  CREATOR_VIP: 'creator-vip',
  CONTRIBUTOR: 'contributor'
};
