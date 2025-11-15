import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import useAuthReducer from '../store/AuthReducer';

const PermissionRoutes = ({ to }) => {
  const isLoggedIn = useAuthReducer((state) => state.isLoggedIn);

  const context = useOutletContext();

  return isLoggedIn ? (
    <Outlet context={context && [...context]} />
  ) : (
    <Navigate to={to ?? '/'} replace />
  );
};

export default PermissionRoutes;
