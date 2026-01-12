import { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const shouldRedirect = useMemo(() => {
    if (!isAuthenticated) {
      return { redirect: true, to: '/login' };
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      return { redirect: true, to: '/' };
    }
    return { redirect: false };
  }, [isAuthenticated, user, allowedRoles]);

  if (shouldRedirect.redirect) {
    return <Navigate to={shouldRedirect.to} replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

