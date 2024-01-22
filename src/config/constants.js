export const LOGIN_ERROR_MESSAGES = {
  active: { color: 'success', message: 'active' },
  pending: { color: 'info', message: 'Your account is pending. Please wait for your account is active.' },
  locked: { color: 'warning', message: 'Your account is locked. Please contact admin and check your email.' },
  deleted: { color: 'error', message: 'Your account is deleted. Please contact admin and check your email.' },
  password: { color: 'warning', message: 'You must login with your Google account to change your Login preference.' }
};

export const MESSAGE_TYPES = {
  DOCUMENT_INVITE_RESOLVE: '@document/invite/resolve/nonactive-users',
  DOCUMENT_INVITATION_SEND: '@document/invitation/send'
};

export const NOTIFICATION_TYPES = {
  DOCUMENT_INVITE_SEND: '@document/invite/send',
  DOCUMENT_INVITE_RECEIVE: '@document/invite/receive',
  DOCUMENT_INVITE_ACCEPT: '@document/invite/accept',
  DOCUMENT_INVITE_REJECT: '@document/invite/reject',
  DOCUMENT_INVITE_DELETE: '@document/invite/delete',
  // DOCUMENT_INVITATION_SEND: '@document/invitation/send',
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
    avatar: () => 'I S',
    title: 'Invitation'
  },
  [NOTIFICATION_TYPES.DOCUMENT_INVITE_RECEIVE]: {
    color: 'info',
    bgcolor: 'info',
    avatar: () => 'I R',
    title: 'Invitation'
  },
  [NOTIFICATION_TYPES.DOCUMENT_INVITE_ACCEPT]: {
    color: 'success',
    bgcolor: 'success',
    avatar: () => 'I A',
    title: 'Invitation'
  },
  [NOTIFICATION_TYPES.DOCUMENT_INVITE_REJECT]: {
    color: 'error',
    bgcolor: 'error',
    avatar: () => 'I R',
    title: 'Invitation'
  },
  [NOTIFICATION_TYPES.DOCUMENT_INVITE_DELETE]: {
    color: 'warning',
    bgcolor: 'warning',
    avatar: () => 'I D',
    title: 'Invitation'
  },
  // [NOTIFICATION_TYPES.DOCUMENT_INVITATION_SEND]: {
  //   color: 'info',
  //   bgcolor: 'info',
  //   avatar: () => 'I',
  //   title: 'Invitation'
  // },
  [NOTIFICATION_TYPES.DOCUMENT_CREATE_NEW]: {
    color: 'info',
    bgcolor: 'info',
    avatar: () => 'D N',
    title: 'New Document'
  },
  [NOTIFICATION_TYPES.USER_SETTING_ROLE]: {
    color: 'error',
    bgcolor: 'error',
    avatar: () => 'U R',
    title: 'User Role'
  },
  [NOTIFICATION_TYPES.USER_SETTING_STATUS]: {
    color: 'error',
    bgcolor: 'error',
    avatar: () => 'U S',
    title: 'User Status'
  },
  [NOTIFICATION_TYPES.USER_RESET_PASSWORD]: {
    color: 'error',
    bgcolor: 'error',
    avatar: () => 'U P',
    title: 'Reset Password'
  },
  [NOTIFICATION_TYPES.USER_CREATE_NEW]: {
    color: 'warning',
    bgcolor: 'warning',
    avatar: () => 'U N',
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

export const CATEGORIES = [
  { key: 'tasks', title: 'Tasks' },
  { key: 'asks', title: 'Asks' },
  { key: 'myDocs', title: 'Active Documents' },
  { key: 'editDocs', title: 'Edits' },
  { key: 'reviews', title: 'Reviews' },
  { key: 'comments', title: 'Comments' },
  { key: 'approvals', title: 'Approvals' }
];
