import { dispatch } from 'store';
import { createSlice } from '@reduxjs/toolkit';
import axiosServices from 'utils/axios';

const initialState = {
  list: [],
  all: [],
  error: null
};

const message = createSlice({
  name: 'message',
  initialState,
  reducers: {
    hasError(state, action) {
      state.error = action.payload.error;
    },
    addLists(state, action) {
      state.list = [...action.payload, ...state.list];
    },
    setLists(state, action) {
      state.list = action.payload;
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

export default message.reducer;

export const { setLists, hasError, setAll, setRead, setReadAll, addLists } = message.actions;

export function getMessages() {
  return async () => {
    try {
      const response = await axiosServices.get(`/message`);
      dispatch(setAll(response.data.data.messages));
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}
export function setMessagesRead() {
  return async () => {
    try {
      await axiosServices.put(`/message`);
      dispatch(setReadAll());
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}
export function setMessageRead({ _id }) {
  return async () => {
    try {
      await axiosServices.put(`/message/` + _id);
      dispatch(setRead({ _id }));
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}
