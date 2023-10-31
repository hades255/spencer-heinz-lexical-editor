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
        user: {}
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
