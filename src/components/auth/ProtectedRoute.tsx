import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingScreen } from '../ui/LoadingScreen';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, subscription, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if subscription exists and is active
    // Allow access to /app and other routes after subscription
    const isPublicAuthRoute = ['/profile', '/renew', '/pricing', '/dashboard', '/app'].some(
        path => location.pathname === path || location.pathname.startsWith('/app')
    );

    if (!isPublicAuthRoute && (!subscription || subscription.status === 'expired')) {
        return <Navigate to="/pricing" replace state={{ message: "انتهت صلاحية اشتراكك، يرجى التجديد للمتابعة." }} />;
    }

    return <>{children}</>;
};

