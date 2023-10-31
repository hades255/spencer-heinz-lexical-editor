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
        if (item.uniqueId === document.uniqueId) {
          return document;
        }
        return item;
      });
      state.lists = DocumentUpdate;
    },

    // delete invoice
    deleteDocument(state, action) {
      const { uniqueId } = action.payload;
      const documents = state.lists.filter((list) => list._id !== uniqueId);
      state.lists = documents;
    }
  }
});

export default document.reducer;

export const { getLists, hasError, getSingleList, createDocument, updateDocument, deleteDocument } = document.actions;

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
      dispatch(createDocument(response.data.data.document));
      if (navigate) {
        navigate('/document/' + response.data.data.document._id);
      }
      dispatch(
        openSnackbar({
          open: true,
          message: 'Your document has been created successfully.',
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: false
        })
      );
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
          close: false
        })
      );
    }
  };
}

export function getDocumentUpdate(uniqueId, updatedDocument) {
  const { name, description, initialText } = updatedDocument;
  return async () => {
    try {
      const response = await axiosServices.post(`/document/update/${uniqueId}`, { name, description, initialText });
      dispatch(updateDocument(response.data.data));
    } catch (error) {
      dispatch(hasError(error));
    }
  };
}

export function documentDelete(uniqueId) {
  return async () => {
    try {
      await axiosServices.delete('/document/' + uniqueId);
      dispatch(deleteDocument({ uniqueId }));
      dispatch(
        openSnackbar({
          open: true,
          message: 'Document has been deleted successfully.',
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: false
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
