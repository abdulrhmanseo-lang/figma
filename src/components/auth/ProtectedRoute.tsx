import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, subscription, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if subscription exists and is active
    // EXCEPT if we are going to /profile or /renew or /pricing OR /dashboard (handled internally)
    const isPublicAuthRoute = ['/profile', '/renew', '/pricing', '/dashboard'].includes(location.pathname);

    if (!isPublicAuthRoute && (!subscription || subscription.status === 'expired')) {
        return <Navigate to="/pricing" replace state={{ message: "انتهت صلاحية اشتراكك، يرجى التجديد للمتابعة." }} />;
    }

    return <>{children}</>;
};
