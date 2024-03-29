// project import
import { dispatch } from 'store';

// third-party
import { createSlice } from '@reduxjs/toolkit';
import axiosServices from 'utils/axios';
import { openSnackbar } from './snackbar';

const initialState = {
  lists: []
};

// ==============================|| INVOICE - SLICE ||============================== //

const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    hasError(state, action) {
      state.error = action.payload.error;
    },

    // get all invoice list
    getLists(state, action) {
      state.lists = action.payload;
    },

    // create user
    createUser(state, action) {
      state.lists = [...state.lists, action.payload];
    },

    // update user
    updateUser(state, action) {
      const { user } = action.payload;
      const UserUpdate = state.lists.map((list) => {
        if (list.uniqueId === user.uniqueId) {
          return user;
        }
        return list;
      });
      state.lists = UserUpdate;
    },

    // delete user
    deleteUser(state, action) {
      const { uniqueId } = action.payload;
      const users = state.lists.filter((list) => list._id !== uniqueId);
      state.lists = users;
    }
  }
});

export default user.reducer;

export const { getLists, deleteUser, updateUser, createUser } = user.actions;

export function addNewUser(newUser) {
  return async () => {
    try {
      dispatch(createUser(newUser));
    } catch (error) {
      console.log(error);
    }
  };
}

export function getUserLists() {
  return async () => {
    try {
      const response = await axiosServices.get(`/user`);
      dispatch(getLists(response.data.data.users));
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}

export function getUserUpdate(uniqueId, updatedUser) {
  const {
    name,
    user_id,
    email,
    dob,
    countryCode,
    contact,
    mobilePhone,
    workPhone,
    designation,
    address,
    address1,
    country,
    state,
    city,
    zip,
    flag,
    skill
  } = updatedUser;

  return async () => {
    try {
      const response = await axiosServices.post(`/user/update/${uniqueId}`, {
        name,
        user_id,
        email,
        dob,
        countryCode,
        contact,
        mobilePhone,
        workPhone,
        designation,
        address,
        address1,
        country,
        state,
        city,
        zip,
        flag,
        skill
      });
      dispatch(updateUser(response.data.data));
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}

export function setUserDelete(uniqueId) {
  return async () => {
    try {
      await axiosServices.delete('/user/' + uniqueId + '/permanently');
      dispatch(deleteUser({ uniqueId }));
      dispatch(
        openSnackbar({
          open: true,
          message: 'User Deleted permanently.',
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: true
        })
      );
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Server connection error. Try later.',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };
}

export function deleteMe(uniqueId) {
  return async () => {
    try {
      await axiosServices.delete('/user/' + uniqueId);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Your account deleted successfully.',
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: true
        })
      );
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Server connection error. Try later.',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };
}

export function setUserStatus(userId, status, comment = '') {
  return async () => {
    try {
      const data = await axiosServices.put('/user', { userId, status, comment });
      dispatch(getUserLists());

      dispatch(
        openSnackbar({
          open: true,
          message: `${data.data.data.name} ${status} successfully.`,
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: true
        })
      );
      // dispatch(deleteUser({ userId }));
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}

export function setUsersStatus(userIds, status, comment = '') {
  return async () => {
    try {
      await axiosServices.put('/user/s/status', { userIds, status, comment });
      dispatch(getUserLists());

      dispatch(
        openSnackbar({
          open: true,
          message: `${status} users successfully.`,
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: true
        })
      );
      // dispatch(deleteUser({ userId }));
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}

export function setUserRole(userId, role) {
  return async () => {
    try {
      const data = await axiosServices.put('/user/role', { userId, role });
      dispatch(getUserLists());
      dispatch(
        openSnackbar({
          open: true,
          message: `Set ${data.data.data.name}'s role as ${role} successfully.`,
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: true
        })
      );
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}

export function resetUserPassword(userId) {
  return async () => {
    try {
      const data = await axiosServices.post('/user/password', { userId });
      dispatch(getUserLists());
      dispatch(
        openSnackbar({
          open: true,
          message: `${data.data.data.name}'s password was updated successfully. Welcome123.!@#`,
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: true
        })
      );
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}
