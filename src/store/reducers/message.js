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
    setLists(state, action) {
      state.list = action.payload;
    },
    setAll(state, action) {
      state.all = action.payload;
    }
  }
});

export default message.reducer;

export const { setLists, hasError, setAll } = message.actions;

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
      dispatch(setLists([]));
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}
