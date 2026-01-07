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

    // Demo user bypass - always allowed
    if (user.email === 'admin@arkan.sa') {
        return <>{children}</>;
    }

    // Super Admin emails - always allowed
    const superAdminEmails = ['abdulrhmanseo@gmail.com', 'admin@arkan.sa'];
    if (superAdminEmails.includes(user.email?.toLowerCase() || '')) {
        return <>{children}</>;
    }

    // Routes that don't require subscription
    const noSubscriptionRoutes = ['/profile', '/pricing', '/app/profile', '/app/billing'];
    const isNoSubscriptionRoute = noSubscriptionRoutes.some(
        path => location.pathname === path || location.pathname.startsWith(path)
    );

    // If on a route that doesn't require subscription, allow access
    if (isNoSubscriptionRoute) {
        return <>{children}</>;
    }

    // Allow if subscription exists and is active (including trial)
    if (subscription && subscription.status === 'active') {
        return <>{children}</>;
    }

    // If subscription is still loading (null but user exists), give a short grace period
    // This handles the case right after registration when subscription is being created
    if (subscription === null && user) {
        // Allow brief access while subscription loads
        // The actual subscription check will happen on next render
        return <>{children}</>;
    }

    // Only redirect to pricing if subscription is explicitly expired
    if (subscription?.status === 'expired') {
        return <Navigate to="/pricing" replace state={{ message: "انتهت صلاحية اشتراكك. يرجى التجديد." }} />;
    }

    // Default: allow access (prevents blocking new users)
    return <>{children}</>;
};
