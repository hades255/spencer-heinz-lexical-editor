// third-party
import { createSlice } from '@reduxjs/toolkit';

// project imports
import axios from 'utils/axios';
import { dispatch } from '../index';

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  chats: [],
  user: {},
  users: [],
  allUsers: []
};

const chat = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // HAS ERROR
    hasError(state, action) {
      state.error = action.payload;
    },

    // GET USER
    getUserSuccess(state, action) {
      state.user = action.payload;
    },

    // GET USER CHATS
    getUserChatsSuccess(state, action) {
      state.chats = action.payload;
    },

    // GET USERS
    getUsersSuccess(state, action) {
      state.users = action.payload;
    },

    // GET USERS
    getAllUsersSuccess(state, action) {
      state.allUsers = action.payload;
    }
  }
});

// Reducer
export default chat.reducer;

// ----------------------------------------------------------------------

export function getUser(id) {
  return async () => {
    try {
      const response = await axios.post('/api/chat/users/id', { id });
      dispatch(chat.actions.getUserSuccess(response.data));
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export function getUserChats(user) {
  return async () => {
    try {
      const response = await axios.post('/api/chat/filter', { user });
      dispatch(chat.actions.getUserChatsSuccess(response.data));
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export function insertChat(chat) {
  return async () => {
    try {
      await axios.post('/api/chat/insert', chat);
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export function getUsers(uniqueId) {
  return async () => {
    try {
      const response = await axios.get(`/document/users/${uniqueId}`);
      console.log(response)
      dispatch(chat.actions.getUsersSuccess(response.data.data.room.users ?? []));
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export function getAllUsers() {
  return async () => {
    try {
      const response = await axios.get(`/user/get`);
      dispatch(chat.actions.getAllUsersSuccess(response.data.data.users ?? []));
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}
