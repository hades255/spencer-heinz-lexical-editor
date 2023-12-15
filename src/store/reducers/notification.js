import { dispatch } from 'store';
import { createSlice } from '@reduxjs/toolkit';
import axiosServices from 'utils/axios';
import { getMyDocumentLists } from './document';

const initialState = {
  list: null,
  all: [],
  error: null
};

const notification = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    hasError(state, action) {
      state.error = action.payload.error;
    },
    setLists(state, action) {
      state.list = action.payload;
    },
    addLists(state, action) {
      state.list = state.list ? [...action.payload, ...state.list] : action.payload;
    },
    setAll(state, action) {
      state.all = action.payload;
    },
    setRead(state, action) {
      state.list = state.list.map((item) => ({ ...item, status: action.payload._id === item._id ? 'read' : item.status }));
    },
    setReadAll(state) {
      state.list = state.list.map((item) => ({ ...item, status: 'read' }));
    }
  }
});

export default notification.reducer;

export const { setLists, hasError, setAll, addLists, setRead, setReadAll } = notification.actions;

export function getReadNotifications() {
  return async () => {
    try {
      const response = await axiosServices.get(`/notification/read`);
      dispatch(setLists(response.data.data.notifications));
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}
export function getNotifications() {
  return async () => {
    try {
      const response = await axiosServices.get(`/notification`);
      dispatch(setAll(response.data.data.notifications));
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}
export function setNotificationsRead() {
  return async () => {
    try {
      await axiosServices.put(`/notification`);
      dispatch(setReadAll());
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}
export function setNotificationRead({ _id }, clearRedirect = false) {
  return async () => {
    try {
      await axiosServices.put(`/notification/` + _id, { clearRedirect });
      dispatch(setRead({ _id }));
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}
export function setInvitationStatus(notification, status, leader = '') {
  return async () => {
    try {
      if (status === 'reject' && notification._id) dispatch(setNotificationRead(notification, true));
      await axiosServices.put(`/document/invitation`, { id: notification.redirect, status, leader });
      dispatch(getMyDocumentLists());
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}
