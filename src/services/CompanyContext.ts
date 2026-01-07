// Company Context Service for Arkan PMS
// Context resolution, switching, and company_id injection
// NO UI CHANGES - Backend only

import type {
    Company,
    CompanyContext,
    UserRole,
    TenantUser,
    UserSession,
    ContextSwitchLog,
    CompanySettings,
    DEFAULT_COMPANY_SETTINGS,
    ROLE_PERMISSIONS,
    isSuperAdmin,
    getSuperAdminContext,
    getDefaultCompanyContext
} from '../types/multiTenantTypes';
import { SystemLogger } from './SystemLogger';

// ========================
// STORAGE
// ========================

class CompanyContextStorage {
    private companies: Map<string, Company> = new Map();
    private users: Map<string, TenantUser> = new Map();
    private sessions: Map<string, UserSession> = new Map();
    private contextSwitchLogs: ContextSwitchLog[] = [];
    private currentContext: CompanyContext | null = null;
    private currentUserId: string | null = null;

    // Company Management
    setCompany(company: Company): void {
        this.companies.set(company.id, company);
    }

    getCompany(companyId: string): Company | undefined {
        return this.companies.get(companyId);
    }

    getAllCompanies(): Company[] {
        return Array.from(this.companies.values());
    }

    getActiveCompanies(): Company[] {
        return this.getAllCompanies().filter(c => c.status === 'active');
    }

    // User Management
    setUser(user: TenantUser): void {
        this.users.set(user.id, user);
    }

    getUser(userId: string): TenantUser | undefined {
        return this.users.get(userId);
    }

    getUserByFirebaseUid(firebaseUid: string): TenantUser | undefined {
        return Array.from(this.users.values()).find(u => u.firebaseUid === firebaseUid);
    }

    getUsersByCompany(companyId: string): TenantUser[] {
        return Array.from(this.users.values()).filter(u => u.companyId === companyId);
    }

    // Session Management
    setSession(session: UserSession): void {
        this.sessions.set(session.userId, session);
        this.currentUserId = session.userId;
    }

    getSession(userId: string): UserSession | undefined {
        return this.sessions.get(userId);
    }

    getCurrentSession(): UserSession | null {
        if (!this.currentUserId) return null;
        return this.sessions.get(this.currentUserId) || null;
    }

    clearSession(userId: string): void {
        this.sessions.delete(userId);
        if (this.currentUserId === userId) {
            this.currentUserId = null;
            this.currentContext = null;
        }
    }

    // Context Management
    setCurrentContext(context: CompanyContext): void {
        this.currentContext = context;
    }

    getCurrentContext(): CompanyContext | null {
        return this.currentContext;
    }

    // Context Switch Logging
    addContextSwitchLog(log: ContextSwitchLog): void {
        this.contextSwitchLogs.unshift(log);
        if (this.contextSwitchLogs.length > 500) {
            this.contextSwitchLogs = this.contextSwitchLogs.slice(0, 500);
        }
    }

    getContextSwitchLogs(superAdminId?: string): ContextSwitchLog[] {
        if (superAdminId) {
            return this.contextSwitchLogs.filter(l => l.superAdminId === superAdminId);
        }
        return this.contextSwitchLogs;
    }
}

const storage = new CompanyContextStorage();

// ========================
// UTILITY FUNCTIONS
// ========================

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ========================
// COMPANY MANAGEMENT
// ========================

export function registerCompany(
    name: string,
    nameAr: string,
    email: string,
    createdBy: string,
    options?: Partial<Company>
): Company {
    const company: Company = {
        id: `company-${generateId()}`,
        name,
        nameAr,
        email,
        phone: options?.phone,
        address: options?.address,
        city: options?.city,
        country: options?.country || 'SA',
        status: 'trial',
        subscriptionPlan: 'free',
        maxUsers: 5,
        maxProperties: 10,
        settings: { ...DEFAULT_COMPANY_SETTINGS },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy
    };

    storage.setCompany(company);

    SystemLogger.logInfo(
        'system',
        'company_created',
        `Company "${name}" created`,
        `تم إنشاء الشركة "${nameAr}"`,
        { companyId: company.id, createdBy }
    );

    return company;
}

export function updateCompany(companyId: string, updates: Partial<Company>): Company | null {
    const company = storage.getCompany(companyId);
    if (!company) return null;

    const updated: Company = {
        ...company,
        ...updates,
        id: company.id, // Prevent ID change
        createdAt: company.createdAt, // Prevent creation date change
        updatedAt: new Date().toISOString()
    };

    storage.setCompany(updated);
    return updated;
}

export function getCompany(companyId: string): Company | undefined {
    return storage.getCompany(companyId);
}

export function getAllCompanies(): Company[] {
    return storage.getAllCompanies();
}

// ========================
// USER MANAGEMENT
// ========================

export function registerUser(
    firebaseUid: string,
    email: string,
    displayName: string,
    companyId: string | null,
    role: UserRole
): TenantUser {
    const user: TenantUser = {
        id: `user-${generateId()}`,
        firebaseUid,
        email,
        displayName,
        companyId,
        role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    storage.setUser(user);

    SystemLogger.logInfo(
        'system',
        'user_registered',
        `User "${displayName}" registered with role "${role}"`,
        `تم تسجيل المستخدم "${displayName}" بدور "${role}"`,
        { userId: user.id, companyId, role }
    );

    return user;
}

export function assignUserToCompany(userId: string, companyId: string, role: UserRole): boolean {
    const user = storage.getUser(userId);
    if (!user) return false;

    const updated: TenantUser = {
        ...user,
        companyId,
        role,
        updatedAt: new Date().toISOString()
    };

    storage.setUser(updated);

    SystemLogger.logInfo(
        'system',
        'user_assigned_company',
        `User assigned to company`,
        `تم تعيين المستخدم للشركة`,
        { userId, companyId, role }
    );

    return true;
}

export function getUser(userId: string): TenantUser | undefined {
    return storage.getUser(userId);
}

export function getUserByFirebaseUid(firebaseUid: string): TenantUser | undefined {
    return storage.getUserByFirebaseUid(firebaseUid);
}

// ========================
// SESSION MANAGEMENT
// ========================

export function createSession(user: TenantUser): UserSession {
    const session: UserSession = {
        userId: user.id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        companyId: user.companyId,
        activeCompanyId: user.companyId, // Initially same as companyId
        permissions: user.role !== 'SUPER_ADMIN' ? ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] : null,
        sessionStarted: new Date().toISOString(),
        lastActivity: new Date().toISOString()
    };

    storage.setSession(session);

    // Set initial context
    const context = resolveContext(session);
    storage.setCurrentContext(context);

    // Log login
    if (user.role === 'SUPER_ADMIN') {
        SystemLogger.logSecurityEvent('login', user.id, {
            role: 'SUPER_ADMIN',
            email: user.email
        });
    }

    return session;
}

export function updateSessionActivity(userId: string): void {
    const session = storage.getSession(userId);
    if (session) {
        session.lastActivity = new Date().toISOString();
        storage.setSession(session);
    }
}

export function endSession(userId: string): void {
    const session = storage.getSession(userId);
    if (session) {
        SystemLogger.logSecurityEvent('logout', userId, {
            sessionDuration: Date.now() - new Date(session.sessionStarted).getTime()
        });
    }
    storage.clearSession(userId);
}

export function getCurrentSession(): UserSession | null {
    return storage.getCurrentSession();
}

// ========================
// CONTEXT RESOLUTION
// ========================

export function resolveContext(session: UserSession): CompanyContext {
    if (session.role === 'SUPER_ADMIN') {
        // Super Admin - check if viewing a specific company
        if (session.activeCompanyId) {
            const company = storage.getCompany(session.activeCompanyId);
            return {
                companyId: session.activeCompanyId,
                companyName: company?.name || 'Unknown',
                role: 'SUPER_ADMIN',
                permissions: null as any, // Super Admin has full access
                isSuperAdmin: true,
                isContextSwitch: true,
                originalCompanyId: undefined
            };
        }

        // Super Admin viewing system-wide
        return {
            companyId: '',
            companyName: 'System View',
            role: 'SUPER_ADMIN',
            permissions: null as any,
            isSuperAdmin: true,
            isContextSwitch: false
        };
    }

    // Regular company user
    if (!session.companyId) {
        throw new Error('User must belong to a company');
    }

    const company = storage.getCompany(session.companyId);

    return {
        companyId: session.companyId,
        companyName: company?.name || 'Unknown',
        role: session.role,
        permissions: session.permissions!,
        isSuperAdmin: false,
        isContextSwitch: false
    };
}

export function getCurrentContext(): CompanyContext | null {
    return storage.getCurrentContext();
}

export function getActiveCompanyId(): string | null {
    const context = storage.getCurrentContext();
    return context?.companyId || null;
}

// ========================
// SUPER ADMIN CONTEXT SWITCHING
// ========================

export function switchContext(superAdminUserId: string, targetCompanyId: string): CompanyContext {
    const session = storage.getSession(superAdminUserId);

    if (!session) {
        throw new Error('No active session found');
    }

    if (session.role !== 'SUPER_ADMIN') {
        SystemLogger.logWarning(
            'security',
            'unauthorized_context_switch',
            'Non-super-admin attempted context switch',
            'محاولة تبديل سياق من غير مدير عام',
            { userId: superAdminUserId, targetCompanyId }
        );
        throw new Error('Only SUPER_ADMIN can switch context');
    }

    const company = storage.getCompany(targetCompanyId);
    if (!company) {
        throw new Error('Target company not found');
    }

    // Log the context switch
    const switchLog: ContextSwitchLog = {
        id: generateId(),
        superAdminId: superAdminUserId,
        superAdminEmail: session.email,
        fromCompanyId: session.activeCompanyId,
        toCompanyId: targetCompanyId,
        toCompanyName: company.name,
        action: 'switch_in',
        timestamp: new Date().toISOString()
    };

    storage.addContextSwitchLog(switchLog);

    SystemLogger.logInfo(
        'system',
        'context_switched',
        `Super Admin switched to company "${company.name}"`,
        `المدير العام انتقل إلى الشركة "${company.nameAr}"`,
        { superAdminId: superAdminUserId, targetCompanyId, companyName: company.name }
    );

    // Update session
    session.activeCompanyId = targetCompanyId;
    storage.setSession(session);

    // Resolve and set new context
    const context = resolveContext(session);
    storage.setCurrentContext(context);

    return context;
}

export function exitContextSwitch(superAdminUserId: string): CompanyContext {
    const session = storage.getSession(superAdminUserId);

    if (!session || session.role !== 'SUPER_ADMIN') {
        throw new Error('Invalid session');
    }

    const previousCompanyId = session.activeCompanyId;

    // Log the exit
    if (previousCompanyId) {
        const switchLog: ContextSwitchLog = {
            id: generateId(),
            superAdminId: superAdminUserId,
            superAdminEmail: session.email,
            fromCompanyId: previousCompanyId,
            toCompanyId: '',
            toCompanyName: 'System View',
            action: 'switch_out',
            timestamp: new Date().toISOString()
        };

        storage.addContextSwitchLog(switchLog);

        SystemLogger.logInfo(
            'system',
            'context_exited',
            'Super Admin returned to system view',
            'المدير العام عاد إلى عرض النظام',
            { superAdminId: superAdminUserId, previousCompanyId }
        );
    }

    // Clear active company
    session.activeCompanyId = null;
    storage.setSession(session);

    // Resolve and set new context
    const context = resolveContext(session);
    storage.setCurrentContext(context);

    return context;
}

export function getContextSwitchHistory(superAdminId?: string): ContextSwitchLog[] {
    return storage.getContextSwitchLogs(superAdminId);
}

// ========================
// QUERY SCOPING HELPERS
// ========================

export function getCompanyIdForQuery(): string {
    const context = storage.getCurrentContext();

    if (!context) {
        throw new Error('No active context - user must be authenticated');
    }

    if (context.isSuperAdmin && !context.isContextSwitch) {
        // Super Admin in system view - no company filter
        return '';
    }

    if (!context.companyId) {
        throw new Error('No company context available');
    }

    return context.companyId;
}

export function shouldApplyCompanyFilter(): boolean {
    const context = storage.getCurrentContext();

    if (!context) return true; // Default to filtered

    // Super Admin in system view can see all
    if (context.isSuperAdmin && !context.isContextSwitch) {
        return false;
    }

    return true;
}

export function validateCompanyAccess(targetCompanyId: string): boolean {
    const context = storage.getCurrentContext();

    if (!context) return false;

    // Super Admin can access any company
    if (context.isSuperAdmin) return true;

    // Regular users can only access their own company
    return context.companyId === targetCompanyId;
}

// ========================
// EXPORT
// ========================

export const CompanyContextService = {
    // Company
    registerCompany,
    updateCompany,
    getCompany,
    getAllCompanies,

    // User
    registerUser,
    assignUserToCompany,
    getUser,
    getUserByFirebaseUid,

    // Session
    createSession,
    updateSessionActivity,
    endSession,
    getCurrentSession,

    // Context
    resolveContext,
    getCurrentContext,
    getActiveCompanyId,

    // Super Admin
    switchContext,
    exitContextSwitch,
    getContextSwitchHistory,

    // Query Helpers
    getCompanyIdForQuery,
    shouldApplyCompanyFilter,
    validateCompanyAccess
};

export default CompanyContextService;
