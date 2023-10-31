import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// project import
import AuthContext from 'contexts/JWTContext';
import useAuth from 'hooks/useAuth';

// ==============================|| AUTH GUARD ||============================== //

const AdminGuard = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const user = useContext(AuthContext).user;
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && user.role !== 'admin' && user.role !== 'super admin') {
      navigate('/dashboard');
    }
  }, [user, isLoggedIn, navigate]);

  return children;
};

AdminGuard.propTypes = {
  children: PropTypes.node
};

export default AdminGuard;
