import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    id: string;
    name: string;
    email: string;
}

interface Subscription {
    planName: string;
    price: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'expired';
    code: string;
}

interface AuthContextType {
    user: User | null;
    subscription: Subscription | null;
    login: (email: string) => void;
    register: (name: string, email: string) => void;
    logout: () => void;
    subscribe: (planName: string, price: string, durationDays: number) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Load state from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('arkan_user');
        const storedSub = localStorage.getItem('arkan_subscription');

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        if (storedSub) {
            const sub = JSON.parse(storedSub);
            // Check if expired
            const today = new Date();
            const end = new Date(sub.endDate);
            if (end < today) {
                sub.status = 'expired';
                localStorage.setItem('arkan_subscription', JSON.stringify(sub));
            }
            setSubscription(sub);
        }
        setIsLoading(false);
    }, []);

    const login = (email: string) => {
        // Simulating login - normally we'd verify password
        // For this mock, we just recover the user or create a mock one if not found matches (simplified)
        // Actually, let's just create a mock user session
        const mockUser = {
            id: 'user_' + Math.floor(Math.random() * 10000),
            name: 'User', // In a real app we'd get this from backend
            email: email,
        };

        // Check if we have a stored user with this email to persist name? 
        // Simplified: Just set state
        setUser(mockUser);
        localStorage.setItem('arkan_user', JSON.stringify(mockUser));

        // Redirect logic handled in component or based on subscription
        // But context typically just updates state
    };

    const register = (name: string, email: string) => {
        const newUser = {
            id: 'user_' + Math.floor(Math.random() * 10000),
            name,
            email,
        };
        setUser(newUser);
        localStorage.setItem('arkan_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        setSubscription(null);
        localStorage.removeItem('arkan_user');
        localStorage.removeItem('arkan_subscription');
        navigate('/login');
    };

    const subscribe = (planName: string, price: string, durationDays: number) => {
        if (!user) return;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + durationDays);

        const code = `ARK-${Math.floor(10000 + Math.random() * 90000)}-${planName.substring(0, 2).toUpperCase()}`;

        const newSub: Subscription = {
            planName,
            price,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            status: 'active',
            code
        };

        setSubscription(newSub);
        localStorage.setItem('arkan_subscription', JSON.stringify(newSub));

        navigate('/dashboard');
    };

    return (
        <AuthContext.Provider value={{ user, subscription, login, register, logout, subscribe, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
