// project import
import { dispatch } from 'store';

// third-party
import { createSlice } from '@reduxjs/toolkit';
import axiosServices from 'utils/axios';
import { openSnackbar } from './snackbar';

const initialState = {
  lists: [],
  document: null,
  navList: [],
  users: [],
  leaders: [],
  emails: [],
  blockTeams: [],
  invitedUsers: [],
  me: null,
  activeTeam: null,
  error: null
};

// ==============================|| INVOICE - SLICE ||============================== //

const document = createSlice({
  name: 'document',
  initialState,
  reducers: {
    hasError(state, action) {
      state.error = action.payload.error;
    },
    setDocUsers(state, action) {
      state.users = action.payload;
    },
    setDocInvitedUsers(state, action) {
      state.invitedUsers = action.payload;
    },
    setDocLeaders(state, action) {
      state.leaders = action.payload;
    },
    setDocEmails(state, action) {
      state.emails = action.payload;
    },
    setDocMe(state, action) {
      state.me = action.payload;
    },
    setDocActiveTeam(state, action) {
      state.activeTeam = action.payload;
    },
    setDocBlockTeams(state, action) {
      state.blockTeams = action.payload;
    },

    // get all invoice list
    getLists(state, action) {
      state.lists = action.payload;
    },

    // get invoice details
    getSingleList(state, action) {
      state.document = action.payload;
    },

    // create invoice
    createDocument(state, action) {
      state.lists = [...state.lists, action.payload];
    },

    // GET USERS
    getNavListSuccess(state, action) {
      state.navList = action.payload;
    },

    // update invoice
    updateDocument(state, action) {
      const { document } = action.payload;
      const DocumentUpdate = state.lists.map((item) => {
        if (item._id === document._id) {
          return document;
        }
        return item;
      });
      state.lists = DocumentUpdate;
    },
    setOnlinestatusToTeam(state, action) {
      state.users = state.users.map((item) => ({
        ...item,
        online_status: action.payload._id === item._id ? action.payload.online_status : item.online_status
      }));
    },

    // delete invoice
    deleteDocument(state, action) {
      const { _id } = action.payload;
      const documents = state.lists.filter((list) => list._id !== _id);
      state.lists = documents;
    }
  }
});

export default document.reducer;

export const {
  getLists,
  hasError,
  getSingleList,
  createDocument,
  updateDocument,
  deleteDocument,
  setDocMe,
  setDocInvitedUsers,
  setDocEmails,
  setDocUsers,
  setDocLeaders,
  setDocActiveTeam,
  setDocBlockTeams,
  setOnlinestatusToTeam
} = document.actions;

export function getDocumentLists() {
  return async () => {
    try {
      const response = await axiosServices.get(`/document`);
      dispatch(getLists(response.data.data.documents));
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}

export function getMyDocumentLists() {
  return async () => {
    try {
      const response = await axiosServices.get(`/document/mine`);
      dispatch(getLists(response.data.data.documents));
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}

export function postDocumentCreate(newDocument, navigate) {
  return async () => {
    try {
      const response = await axiosServices.post(`/document`, newDocument);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Your document has been created successfully.',
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: true
        })
      );
      if (response.data.data.document) {
        dispatch(createDocument(response.data.data.document));
        if (navigate) {
          navigate('/document/' + response.data.data.document._id);
        }
      }
    } catch (error) {
      dispatch(hasError(error));
      dispatch(
        openSnackbar({
          open: true,
          message: 'Something wents wrong. Check again.',
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

export function putDocumentUpdate(newDocument) {
  return async () => {
    try {
      const response = await axiosServices.put(`/document/${newDocument._id}`, newDocument);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Document has been updated successfully.',
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: true
        })
      );
      if (response.data.data.document) {
        dispatch(updateDocument(response.data.data));
        // if (navigate) {
        //   navigate('/document/' + response.data.data.document._id);
        // }
      }
    } catch (error) {
      dispatch(hasError(error));
      dispatch(
        openSnackbar({
          open: true,
          message: 'Something wents wrong. Check again.',
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

export function documentDelete(_id) {
  return async () => {
    try {
      await axiosServices.delete('/document/' + _id);
      dispatch(deleteDocument({ _id }));
      dispatch(
        openSnackbar({
          open: true,
          message: 'Document has been deleted successfully.',
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

export function getDocumentSingleList(documentId) {
  return async () => {
    try {
      const response = await axiosServices.get('/document/' + documentId);
      dispatch(getSingleList(response.data.data.document));
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}

export function getNavList(navList) {
  return dispatch(getNavListSuccess(navList ?? []));
}
