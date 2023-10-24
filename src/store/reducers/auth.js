// action - state management
import { REGISTER, LOGIN, LOGOUT, UPDATE } from './actions';

// initial state
export const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
  ws: null
};

// ==============================|| AUTH REDUCER ||============================== //

const auth = (state = initialState, action) => {
  switch (action.type) {
    case REGISTER: {
      const { user } = action.payload;
      return {
        ...state,
        user
      };
    }
    case LOGIN: {
      // const ws = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8000/websocket');
      // ws.onopen = () => {
      //   console.log('WebSocket connected');
      // };
      // ws.onmessage = (event) => {
      //   console.log(event);
      // };
      // ws.onerror = (err) => {
      //   console.log(err);
      // };
      // ws.onclose = () => {
      //   console.log('WebSocket connection closed');
      // };
      // console.log(ws);
      const { user } = action.payload;
      return {
        ...state,
        isLoggedIn: true,
        isInitialized: true,
        user
      };
    }
    case LOGOUT: {
      return {
        ...state,
        isInitialized: true,
        isLoggedIn: false,
        user: null
      };
    }
    case UPDATE: {
      return {
        ...state,
        user: action.payload.user
      };
    }
    default: {
      return { ...state };
    }
  }
};

export default auth;
