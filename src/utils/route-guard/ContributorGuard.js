import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// project import
import AuthContext from 'contexts/JWTContext';
import { Dialog } from '@mui/material';
import CheckPremium from 'sections/apps/user/CheckPremium';
import { PopupTransition } from 'components/@extended/Transitions';

// ==============================|| AUTH GUARD ||============================== //

const ContributorGuard = ({ children }) => {
  const user = useContext(AuthContext).user;
  const navigate = useNavigate();
  const [checkPremium, setCheckPremium] = useState(false);

  useEffect(() => {
    if (user.role === 'contributor') {
      setCheckPremium(true);
    }
  }, [user]);

  const handleCloseCheckPremium = useCallback(() => {
    setCheckPremium(false);
    navigate('/document/list');
  }, [navigate]);

  return (
    <>
      {children}
      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        onClose={handleCloseCheckPremium}
        open={checkPremium}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <CheckPremium onCancel={handleCloseCheckPremium} />
      </Dialog>
    </>
  );
};

ContributorGuard.propTypes = {
  children: PropTypes.node
};

export default ContributorGuard;
