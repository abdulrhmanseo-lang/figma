import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { Employee, PermissionModule, PermissionAction } from '../types/database';

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
    loading: boolean;
    subscription: Subscription | null;
    currentEmployee: Employee | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    subscribe: (plan: any) => Promise<void>;
    setEmployeeSession: (employee: Employee | null) => void;
    hasEmployeePermission: (module: string, action: string) => boolean;
    employeeLogout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(() => {
        // Load from localStorage on init
        const stored = localStorage.getItem('employeeSession');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Fetch subscription data
                try {
                    const subDoc = await getDoc(doc(db, 'subscriptions', currentUser.uid));
                    if (subDoc.exists()) {
                        const subData = subDoc.data() as Subscription;
                        // Check expiry
                        if (new Date(subData.endDate) < new Date()) {
                            setSubscription({ ...subData, status: 'expired' });
                        } else {
                            setSubscription(subData);
                        }
                    } else {
                        setSubscription(null);
                    }
                } catch (error) {
                    console.error("Error fetching subscription:", error);
                    setSubscription(null);
                }
            } else {
                setSubscription(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        // Demo mode: Allow login with test credentials
        if (email === 'admin@arkan.sa' && password === 'Admin@2024') {
            // Create a mock user object for demo purposes
            const mockUser = {
                uid: 'demo-admin-uid',
                email: 'admin@arkan.sa',
                displayName: 'أحمد محمد الأدمن',
                emailVerified: true,
            } as unknown as User;
            setUser(mockUser);
            // Set demo subscription
            setSubscription({
                planName: 'الباقة الاحترافية',
                price: '199 ر.س/شهر',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active',
                code: 'ARK-DEMO-2024',
            });
            return;
        }
        // Otherwise use Firebase auth
        await signInWithEmailAndPassword(auth, email, password);
    };

    const register = async (name: string, email: string, password: string) => {
        console.log("AuthContext: Attempting registration for", email);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("AuthContext: User created", userCredential.user.uid);

            await updateProfile(userCredential.user, { displayName: name });
            console.log("AuthContext: Profile updated");

            // Create initial user doc
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                name,
                email,
                createdAt: new Date().toISOString()
            }, { merge: true });
            console.log("AuthContext: Firestore doc created");
        } catch (error) {
            console.error("AuthContext: Registration FAILED", error);
            throw error;
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    const setEmployeeSession = (employee: Employee | null) => {
        setCurrentEmployee(employee);
        if (employee) {
            localStorage.setItem('employeeSession', JSON.stringify(employee));
        } else {
            localStorage.removeItem('employeeSession');
        }
    };

    const employeeLogout = () => {
        setCurrentEmployee(null);
        localStorage.removeItem('employeeSession');
    };

    const hasEmployeePermission = (module: string, action: string): boolean => {
        if (!currentEmployee) return false;
        const permission = currentEmployee.permissions.find(p => p.module === module);
        return permission ? permission.actions.includes(action as PermissionAction) : false;
    };

    const subscribe = async (plan: any) => {
        if (!user) return;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30); // 30 days default

        const subData: Subscription = {
            planName: plan.name,
            price: plan.price,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            status: 'active',
            code: `ARK-${Math.floor(Math.random() * 100000)}-PRO`
        };

        // Write to Firestore
        await setDoc(doc(db, 'subscriptions', user.uid), subData);
        setSubscription(subData);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            subscription,
            currentEmployee,
            login,
            register,
            logout,
            subscribe,
            setEmployeeSession,
            hasEmployeePermission,
            employeeLogout
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
