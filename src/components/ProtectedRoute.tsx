import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

type AppRole = 'customer' | 'designer' | 'delivery_partner' | 'admin';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

/**
 * UI-only route guard for navigation/UX purposes.
 * SECURITY NOTE: This component only controls client-side navigation.
 * Actual data authorization is enforced server-side via RLS policies
 * and edge function authentication. Never rely on this for security.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (allowedRoles && role && !allowedRoles.includes(role)) {
        // Redirect to appropriate dashboard based on role
        const dashboardPath = role === 'designer' ? '/designer' : 
                             role === 'delivery_partner' ? '/delivery' : 
                             role === 'admin' ? '/admin' : '/dashboard';
        navigate(dashboardPath);
      }
    }
  }, [user, role, loading, allowedRoles, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}