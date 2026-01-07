import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendEmailVerification,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { Employee, PermissionAction } from '../types/database';
import { CompanyContextService } from '../services/CompanyContext';
import { FirestoreCompanyService } from '../services/FirestoreCompanyService';
import type { UserRole, TenantUser } from '../types/multiTenantTypes';

// Super Admin emails - these users get SUPER_ADMIN role
const SUPER_ADMIN_EMAILS = [
    'abdulrhmanseo@gmail.com',
    'admin@arkan.sa'
];

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
    isSuperAdmin: boolean;
    tenantUser: TenantUser | null;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    subscribe: (plan: any) => Promise<void>;
    setEmployeeSession: (employee: Employee | null) => void;
    hasEmployeePermission: (module: string, action: string) => boolean;
    employeeLogout: () => void;
    resendVerificationEmail: () => Promise<void>;
    isEmailVerified: boolean;
    switchToCompany: (companyId: string) => void;
    exitCompanyView: () => void;
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
    const [tenantUser, setTenantUser] = useState<TenantUser | null>(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(() => {
        // Load from localStorage on init
        const stored = localStorage.getItem('employeeSession');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Check if Super Admin
                const userEmail = currentUser.email || '';
                const isSuper = SUPER_ADMIN_EMAILS.includes(userEmail.toLowerCase());
                setIsSuperAdmin(isSuper);

                // Register tenant user
                let existingTenantUser = CompanyContextService.getUserByFirebaseUid(currentUser.uid);
                if (!existingTenantUser) {
                    const role: UserRole = isSuper ? 'SUPER_ADMIN' : 'company_admin';
                    existingTenantUser = CompanyContextService.registerUser(
                        currentUser.uid,
                        userEmail,
                        currentUser.displayName || 'User',
                        isSuper ? null : 'default-company',
                        role
                    );
                }
                setTenantUser(existingTenantUser);

                // Create session
                CompanyContextService.createSession(existingTenantUser);

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
                setTenantUser(null);
                setIsSuperAdmin(false);
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

            // Set Super Admin for demo mode (admin@arkan.sa is in SUPER_ADMIN_EMAILS)
            setIsSuperAdmin(true);

            // Create tenant user for demo mode
            let demoTenantUser = CompanyContextService.getUserByFirebaseUid('demo-admin-uid');
            if (!demoTenantUser) {
                demoTenantUser = CompanyContextService.registerUser(
                    'demo-admin-uid',
                    'admin@arkan.sa',
                    'أحمد محمد الأدمن',
                    null, // Super Admin has no company
                    'SUPER_ADMIN'
                );
            }
            setTenantUser(demoTenantUser);
            CompanyContextService.createSession(demoTenantUser);

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

    // Google Sign-in
    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user exists in Firestore, if not create doc
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                // Create user doc
                await setDoc(doc(db, 'users', user.uid), {
                    name: user.displayName || 'مستخدم Google',
                    email: user.email,
                    emailVerified: true,
                    authProvider: 'google',
                    createdAt: new Date().toISOString()
                }, { merge: true });

                // Create company for new Google user
                await FirestoreCompanyService.createCompany(
                    user.uid,
                    user.email || '',
                    user.displayName || 'مستخدم Google'
                );
                console.log('AuthContext: Company created for Google user');

                // Create trial subscription for new Google users (7 days)
                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(startDate.getDate() + 7); // 7 days trial

                const trialSubscription: Subscription = {
                    planName: 'تجريبي مجاني',
                    price: '0',
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    status: 'active',
                    code: `ARK-TRIAL-${Math.floor(Math.random() * 100000)}`
                };

                await setDoc(doc(db, 'subscriptions', user.uid), trialSubscription);
                setSubscription(trialSubscription);
            }
        } catch (error) {
            console.error("Google Sign-in error:", error);
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        console.log("AuthContext: Attempting registration for", email);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("AuthContext: User created", userCredential.user.uid);

            await updateProfile(userCredential.user, { displayName: name });
            console.log("AuthContext: Profile updated");

            // Send email verification
            await sendEmailVerification(userCredential.user, {
                url: window.location.origin + '/login',
                handleCodeInApp: false
            });
            console.log("AuthContext: Verification email sent");

            // Create initial user doc
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                name,
                email,
                emailVerified: false,
                createdAt: new Date().toISOString()
            }, { merge: true });
            console.log("AuthContext: Firestore doc created");

            // Create company for new user
            await FirestoreCompanyService.createCompany(
                userCredential.user.uid,
                email,
                name
            );
            console.log("AuthContext: Company created for new user");

            // Create 40-minute trial subscription
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMinutes(startDate.getMinutes() + 40); // 40 minutes trial

            const trialSubscription: Subscription = {
                planName: 'تجريبي مجاني',
                price: '0',
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                status: 'active',
                code: `ARK-TRIAL-${Math.floor(Math.random() * 100000)}`
            };

            await setDoc(doc(db, 'subscriptions', userCredential.user.uid), trialSubscription);
            setSubscription(trialSubscription);
            console.log("AuthContext: Trial subscription created");
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

    // Resend email verification
    const resendVerificationEmail = async () => {
        if (user && !user.emailVerified) {
            await sendEmailVerification(user, {
                url: window.location.origin + '/login',
                handleCodeInApp: false
            });
        }
    };

    // Check if email is verified
    const isEmailVerified = user?.emailVerified || user?.email === 'admin@arkan.sa' || false;

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

    // Super Admin context switching
    const switchToCompany = (companyId: string) => {
        if (tenantUser && isSuperAdmin) {
            CompanyContextService.switchContext(tenantUser.id, companyId);
        }
    };

    const exitCompanyView = () => {
        if (tenantUser && isSuperAdmin) {
            CompanyContextService.exitContextSwitch(tenantUser.id);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            subscription,
            currentEmployee,
            isSuperAdmin,
            tenantUser,
            login,
            loginWithGoogle,
            register,
            logout,
            subscribe,
            setEmployeeSession,
            hasEmployeePermission,
            employeeLogout,
            resendVerificationEmail,
            isEmailVerified,
            switchToCompany,
            exitCompanyView
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
