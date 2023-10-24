import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer, useState } from 'react';

// third-party
import { Chance } from 'chance';
import jwtDecode from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT, UPDATE } from 'store/reducers/actions';
import authReducer from 'store/reducers/auth';

// project import
import Loader from 'components/Loader';
import axios from 'utils/axios';
import { dispatch as dispatch_ } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { LOGIN_ERROR_MESSAGES } from 'config/constants';

const chance = new Chance();

// constant
const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

const verifyToken = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }
  const decoded = jwtDecode(serviceToken);
  /**
   * Property 'exp' does not exist on type '<T = unknown>(token: string, options?: JwtDecodeOptions | undefined) => T'.
   */
  return decoded.exp > new Date().getTime() / 1000;
};

const setSession = (serviceToken) => {
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
    axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
  } else {
    localStorage.removeItem('serviceToken');
    delete axios.defaults.headers.common.Authorization;
  }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = window.localStorage.getItem('serviceToken');
        if (serviceToken && verifyToken(serviceToken)) {
          setSession(serviceToken);
          const response = await axios.get('/auth/me');

          const { code } = response.data;
          if (code === 'success') {
            const { user } = response.data.data;
            dispatch({
              type: LOGIN,
              payload: {
                isLoggedIn: true,
                user
              }
            });
          } else {
            const { message } = response.data;
            const { status } = response.data.data;
            dispatch_(
              openSnackbar({
                open: true,
                message: message ?? LOGIN_ERROR_MESSAGES[status].message,
                variant: 'alert',
                alert: {
                  color: message ? 'error' : LOGIN_ERROR_MESSAGES[status].color
                },
                close: true
              })
            );
          }
        } else {
          dispatch({
            type: LOGOUT
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/signin', { email, password });
      const { code } = response.data;
      if (code === 'success') {
        const { serviceToken, user } = response.data.data;
        setSession(serviceToken);
        dispatch({
          type: LOGIN,
          payload: {
            isLoggedIn: true,
            user
          }
        });
      } else {
        const { message } = response.data;
        const { status } = response.data.data;
        dispatch_(
          openSnackbar({
            open: true,
            message: message ?? LOGIN_ERROR_MESSAGES[status].message,
            variant: 'alert',
            alert: {
              color: message ? 'error' : LOGIN_ERROR_MESSAGES[status].color
            },
            close: true
          })
        );
      }
    } catch (error) {
      dispatch_(
        openSnackbar({
          open: true,
          message: error.toString(),
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };

  const register = async ({
    company,
    email,
    password = 'Welcome123.!@#',
    firstname,
    lastname,
    countryCode,
    mobilePhone,
    workPhone,
    status = 'pending'
  }) => {
    // todo: this flow need to be recode as it not verified
    try {
      const name = `${firstname} ${lastname}`;
      const response = await axios.post('/auth/signup', {
        name,
        company,
        email,
        password,
        countryCode,
        mobilePhone,
        workPhone,
        status
      });
      console.log(response.data);
      let { user } = response.data.data;
      return user;
    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
    setSession(null);
    dispatch({ type: LOGOUT });
  };

  const resetPassword = async (currentPassword, newPassword) => {
    const response = await axios.post('/auth/resetPassword', {
      currentPassword,
      newPassword
    });
  };

  const forgetPassword = async (email) => {
    const response = await axios.post('/auth/forgetPassword', {
      email
    });
  };

  const updateProfile = (user) => {
    dispatch({ type: UPDATE, payload: { user } });
  };

  const setUser = (serviceToken, user) => {
    setSession(serviceToken);
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user
      }
    });
  };

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return (
    <JWTContext.Provider value={{ ...state, setUser, login, logout, register, resetPassword, forgetPassword, updateProfile }}>
      {children}
    </JWTContext.Provider>
  );
};

JWTProvider.propTypes = {
  children: PropTypes.node
};

export default JWTContext;
