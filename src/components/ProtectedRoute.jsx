import { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const effectiveRole = profile?.role || user?.user_metadata?.role;

  const shouldRedirect = useMemo(() => {
    // Wait for auth to finish resolving
    if (authLoading) return { redirect: false, loading: true };

    // If no user, go to login (do not call DB elsewhere)
    if (!user) return { redirect: true, to: '/login' };

    // If route requires roles but role is still unknown, avoid infinite spinner:
    // - Allow if route accepts 'user'
    // - Otherwise, send to user dashboard as a safe default
    if (allowedRoles.length > 0 && !effectiveRole) {
      if (allowedRoles.includes('user')) return { redirect: false };
      return { redirect: true, to: '/dashboard' };
    }

    // Role resolved but not permitted -> route to the opposite dashboard when possible
    if (allowedRoles.length > 0 && !allowedRoles.includes(effectiveRole)) {
      if (allowedRoles.includes('lister')) return { redirect: true, to: '/dashboard' };
      if (allowedRoles.includes('user')) return { redirect: true, to: '/lister/dashboard' };
      return { redirect: true, to: '/' };
    }

    return { redirect: false };
  }, [user, effectiveRole, allowedRoles, authLoading]);

  if (shouldRedirect.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (shouldRedirect.redirect) {
    return <Navigate to={shouldRedirect.to} replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

