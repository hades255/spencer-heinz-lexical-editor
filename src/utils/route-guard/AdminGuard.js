import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// project import
import AuthContext from 'contexts/JWTContext';

// ==============================|| AUTH GUARD ||============================== //

const AdminGuard = ({ children }) => {
  const user = useContext(AuthContext).user;
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role !== 'admin' && user.role !== 'super admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return children;
};

AdminGuard.propTypes = {
  children: PropTypes.node
};

export default AdminGuard;
