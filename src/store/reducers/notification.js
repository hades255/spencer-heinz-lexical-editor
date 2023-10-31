import { dispatch } from 'store';
import { createSlice } from '@reduxjs/toolkit';
import axiosServices from 'utils/axios';
import { getMyDocumentLists } from './document';

const initialState = {
  list: [],
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
      state.list = [...action.payload.map((item) => ({ ...item, status: 'unread' })), ...state.list];
    },
    setAll(state, action) {
      state.all = action.payload;
    },
    setRead(state) {
      state.list = state.list.map((item) => ({ ...item, status: 'read' }));
    }
  }
});

export default notification.reducer;

export const { setLists, hasError, setAll, addLists, setRead } = notification.actions;

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
export function setInvitationStatus(notification, status) {
  return async () => {
    try {
      const docid =
        notification.redirect.indexOf('/') === -1
          ? notification.redirect
          : notification.redirect.substr(notification.redirect.lastIndexOf('/') + 1);
      await axiosServices.put(`/document/invitation`, { id: docid, status });
      dispatch(getMyDocumentLists());
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}
