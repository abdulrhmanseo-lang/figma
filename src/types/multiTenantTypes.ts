// Multi-Tenant Types for Arkan PMS
// Company, role, and tenant isolation types
// NO UI CHANGES - Backend only

// ========================
// COMPANY TYPES
// ========================

export type CompanyStatus = 'active' | 'inactive' | 'suspended' | 'trial';

export interface Company {
    id: string;
    name: string;
    nameAr: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country: string;
    status: CompanyStatus;
    subscriptionPlan: 'free' | 'basic' | 'pro' | 'enterprise';
    subscriptionEndDate?: string;
    maxUsers: number;
    maxProperties: number;
    logo?: string;
    settings?: CompanySettings;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
}

export interface CompanySettings {
    timezone: string;
    currency: string;
    language: 'ar' | 'en';
    dateFormat: string;
    fiscalYearStart: number; // Month 1-12
    gracePeriodDays: number;
    autoReminders: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
    timezone: 'Asia/Riyadh',
    currency: 'SAR',
    language: 'ar',
    dateFormat: 'DD/MM/YYYY',
    fiscalYearStart: 1,
    gracePeriodDays: 7,
    autoReminders: true,
    emailNotifications: true,
    smsNotifications: false
};

// ========================
// USER ROLE TYPES
// ========================

export type SystemRole = 'SUPER_ADMIN';

export type CompanyRole =
    | 'company_admin'
    | 'manager'
    | 'staff'
    | 'accountant'
    | 'maintenance';

export type UserRole = SystemRole | CompanyRole;

export interface RolePermissions {
    properties: ('view' | 'create' | 'edit' | 'delete')[];
    units: ('view' | 'create' | 'edit' | 'delete')[];
    tenants: ('view' | 'create' | 'edit' | 'delete')[];
    contracts: ('view' | 'create' | 'edit' | 'delete')[];
    payments: ('view' | 'create' | 'edit' | 'delete')[];
    maintenance: ('view' | 'create' | 'edit' | 'delete')[];
    reports: ('view')[];
    employees: ('view' | 'create' | 'edit' | 'delete')[];
    settings: ('view' | 'edit')[];
}

export const ROLE_PERMISSIONS: Record<CompanyRole, RolePermissions> = {
    company_admin: {
        properties: ['view', 'create', 'edit', 'delete'],
        units: ['view', 'create', 'edit', 'delete'],
        tenants: ['view', 'create', 'edit', 'delete'],
        contracts: ['view', 'create', 'edit', 'delete'],
        payments: ['view', 'create', 'edit', 'delete'],
        maintenance: ['view', 'create', 'edit', 'delete'],
        reports: ['view'],
        employees: ['view', 'create', 'edit', 'delete'],
        settings: ['view', 'edit']
    },
    manager: {
        properties: ['view', 'create', 'edit'],
        units: ['view', 'create', 'edit'],
        tenants: ['view', 'create', 'edit'],
        contracts: ['view', 'create', 'edit'],
        payments: ['view', 'create', 'edit'],
        maintenance: ['view', 'create', 'edit', 'delete'],
        reports: ['view'],
        employees: ['view'],
        settings: ['view']
    },
    staff: {
        properties: ['view'],
        units: ['view'],
        tenants: ['view', 'create', 'edit'],
        contracts: ['view'],
        payments: ['view'],
        maintenance: ['view', 'create'],
        reports: [],
        employees: [],
        settings: []
    },
    accountant: {
        properties: ['view'],
        units: ['view'],
        tenants: ['view'],
        contracts: ['view'],
        payments: ['view', 'create', 'edit'],
        maintenance: ['view'],
        reports: ['view'],
        employees: [],
        settings: []
    },
    maintenance: {
        properties: ['view'],
        units: ['view'],
        tenants: [],
        contracts: [],
        payments: [],
        maintenance: ['view', 'create', 'edit'],
        reports: [],
        employees: [],
        settings: []
    }
};

// ========================
// TENANT USER TYPES
// ========================

export interface TenantUser {
    id: string;
    firebaseUid: string;
    email: string;
    displayName: string;
    phone?: string;
    companyId: string | null; // null for SUPER_ADMIN
    role: UserRole;
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserSession {
    userId: string;
    firebaseUid: string;
    email: string;
    displayName: string;
    role: UserRole;
    companyId: string | null;
    activeCompanyId: string | null; // For SUPER_ADMIN context switching
    permissions: RolePermissions | null;
    sessionStarted: string;
    lastActivity: string;
}

// ========================
// COMPANY CONTEXT TYPES
// ========================

export interface CompanyContext {
    companyId: string;
    companyName: string;
    role: UserRole;
    permissions: RolePermissions;
    isSuperAdmin: boolean;
    isContextSwitch: boolean; // true if SUPER_ADMIN viewing another company
    originalCompanyId?: string; // SUPER_ADMIN's default view
}

export interface ContextSwitchLog {
    id: string;
    superAdminId: string;
    superAdminEmail: string;
    fromCompanyId: string | null;
    toCompanyId: string;
    toCompanyName: string;
    action: 'switch_in' | 'switch_out';
    timestamp: string;
    reason?: string;
}

// ========================
// SUPER ADMIN TYPES
// ========================

export interface CompanyMetrics {
    companyId: string;
    companyName: string;
    status: CompanyStatus;
    userCount: number;
    propertyCount: number;
    unitCount: number;
    occupiedUnits: number;
    occupancyRate: number;
    activeContracts: number;
    pendingPayments: number;
    overduePayments: number;
    pendingMaintenance: number;
    monthlyRevenue: number;
    lastActivity: string;
}

export interface SystemMetrics {
    totalCompanies: number;
    activeCompanies: number;
    inactiveCompanies: number;
    trialCompanies: number;
    suspendedCompanies: number;
    totalUsers: number;
    totalProperties: number;
    totalUnits: number;
    totalContracts: number;
    systemHealth: 'healthy' | 'attention' | 'risk';
    companies: CompanyMetrics[];
}

// ========================
// QUERY SCOPING TYPES
// ========================

export interface ScopedQuery<T> {
    data: T[];
    companyId: string;
    isSuperAdmin: boolean;
    totalCount: number;
}

export interface TenantFilter {
    companyId: string;
    enforced: boolean;
}

// ========================
// AUDIT TYPES
// ========================

export interface TenantAuditLog {
    id: string;
    companyId: string;
    userId: string;
    userEmail: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: Record<string, any>;
    ipAddress?: string;
    timestamp: string;
}

// ========================
// UTILITY FUNCTIONS
// ========================

export function isSuperAdmin(role: UserRole): role is SystemRole {
    return role === 'SUPER_ADMIN';
}

export function isCompanyRole(role: UserRole): role is CompanyRole {
    return !isSuperAdmin(role);
}

export function hasPermission(
    permissions: RolePermissions | null,
    module: keyof RolePermissions,
    action: string
): boolean {
    if (!permissions) return false;
    const modulePermissions = permissions[module];
    return modulePermissions.includes(action as any);
}

export function getDefaultCompanyContext(companyId: string, role: CompanyRole): CompanyContext {
    return {
        companyId,
        companyName: '',
        role,
        permissions: ROLE_PERMISSIONS[role],
        isSuperAdmin: false,
        isContextSwitch: false
    };
}

export function getSuperAdminContext(activeCompanyId?: string, companyName?: string): CompanyContext {
    return {
        companyId: activeCompanyId || '',
        companyName: companyName || 'System View',
        role: 'SUPER_ADMIN',
        permissions: null as any, // Super Admin has full access
        isSuperAdmin: true,
        isContextSwitch: !!activeCompanyId
    };
}

// ========================
// ROLE LABELS
// ========================

export const ROLE_LABELS: Record<UserRole, { en: string; ar: string }> = {
    SUPER_ADMIN: { en: 'Super Administrator', ar: 'المدير العام' },
    company_admin: { en: 'Company Admin', ar: 'مدير الشركة' },
    manager: { en: 'Manager', ar: 'مدير' },
    staff: { en: 'Staff', ar: 'موظف' },
    accountant: { en: 'Accountant', ar: 'محاسب' },
    maintenance: { en: 'Maintenance', ar: 'صيانة' }
};

export const STATUS_LABELS: Record<CompanyStatus, { en: string; ar: string }> = {
    active: { en: 'Active', ar: 'نشط' },
    inactive: { en: 'Inactive', ar: 'غير نشط' },
    suspended: { en: 'Suspended', ar: 'موقوف' },
    trial: { en: 'Trial', ar: 'تجريبي' }
};
