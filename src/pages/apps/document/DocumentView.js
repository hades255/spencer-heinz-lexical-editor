import React, { useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AuthContext from 'contexts/JWTContext';
import { dispatch } from 'store';
import { getDocumentSingleList, getSingleList } from 'store/reducers/document';
import { useSelector } from 'store';
import Check from './Check';
import Document from './Document';


const DocumentView = () => {
  const { uniqueId } = useParams();
  const user = useContext(AuthContext).user;
  const document = useSelector((state) => state.document.document);

  useEffect(() => {
    dispatch(getSingleList(null)); //  set init document as null.
    dispatch(getDocumentSingleList(uniqueId)); //  get document and use getSingleList action to set.
  }, [uniqueId]);

  return (
    <>
      {document &&
        user &&
        (document.creator.email === user.email || document.invites.some((item) => item.email === user.email && item.reply === 'accept') ? (
          <Document user={user} document={document} />
        ) : document.invites.some((item) => item.email === user.email && item.reply === 'pending') ? (
          <Check document={document} />
        ) : (
          <Redirect />
        ))}
    </>
  );
};

export default DocumentView;

const Redirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/');
  }, [navigate]);
  return <></>;
};
