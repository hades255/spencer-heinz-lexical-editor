// third-party
import { combineReducers } from 'redux';

// project import
import menu from './menu';
import snackbar from './snackbar';
import document from './document';
import chat from './chat';
import user from './user';
import auth from './auth';
import notification from './notification';
import message from './message';

// ==============================|| COMBINE REDUCERS ||============================== //

const reducers = combineReducers({
  auth,
  menu,
  snackbar,
  document,
  chat,
  user,
  notification,
  message
});

export default reducers;
