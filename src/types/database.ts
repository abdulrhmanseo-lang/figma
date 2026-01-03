// TypeScript types for Arkan Real Estate SaaS

// ========================
// ENUMS
// ========================

export type UnitStatus = 'vacant' | 'rented' | 'maintenance';
export type ContractStatus = 'active' | 'ended' | 'suspended';
export type PaymentStatus = 'paid' | 'due' | 'overdue';
export type PaymentMethod = 'cash' | 'bank' | 'online';
export type PaymentFrequency = 'monthly' | 'quarterly' | 'yearly';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'new' | 'in_progress' | 'done' | 'canceled';
export type PropertyType = 'building' | 'villa' | 'complex' | 'land';
export type UnitType = 'apartment' | 'studio' | 'office' | 'shop' | 'warehouse' | 'villa';
export type UserRole = 'admin' | 'manager' | 'accountant' | 'maintenance' | 'employee';
export type PlanType = 'basic' | 'pro' | 'enterprise';
export type CompanyStatus = 'active' | 'past_due' | 'canceled';

// ERP Types
export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EmployeeStatus = 'active' | 'inactive' | 'on_leave';
export type NotificationType = 'task' | 'task_assigned' | 'task_transferred' | 'payment' | 'contract' | 'contract_expiring' | 'maintenance' | 'system';

// Permission System Types
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';
export type PermissionModule =
    | 'properties'
    | 'units'
    | 'tenants'
    | 'contracts'
    | 'payments'
    | 'maintenance'
    | 'reports'
    | 'settings'
    | 'sales'
    | 'employees'
    | 'tasks';

export interface EmployeePermission {
    module: PermissionModule;
    actions: PermissionAction[];
}

// ========================
// CORE ENTITIES
// ========================

export interface Company {
    id: string;
    name: string;
    plan: PlanType;
    status: CompanyStatus;
    createdAt: string;
}

export interface Profile {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    createdAt: string;
}

export interface CompanyMember {
    id: string;
    companyId: string;
    userId: string;
    role: UserRole;
    createdAt: string;
}

// ========================
// REAL ESTATE ENTITIES
// ========================

export interface Property {
    id: string;
    companyId: string;
    name: string;
    city: string;
    address: string;
    type: PropertyType;
    description?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
    images: string[];
    createdAt: string;
}

export interface Unit {
    id: string;
    companyId: string;
    propertyId: string;
    propertyName: string;
    unitNo: string;
    type: UnitType;
    floor?: string;
    bedrooms?: number;
    bathrooms?: number;
    areaSqm?: number;
    description?: string;
    rentAmount: number;
    status: UnitStatus;
    images: string[];
    createdAt: string;
}

export interface Tenant {
    id: string;
    companyId: string;
    fullName: string;
    nationalId?: string;
    phone: string;
    email?: string;
    createdAt: string;
}

export interface Contract {
    id: string;
    companyId: string;
    propertyId: string;
    propertyName: string;
    unitId: string;
    unitNo: string;
    tenantId: string;
    tenantName: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
    paymentFrequency: PaymentFrequency;
    depositAmount: number;
    deposit?: number;
    notes?: string;
    status: ContractStatus;
    createdAt: string;
}

export interface Payment {
    id: string;
    companyId: string;
    contractId: string;
    tenantName: string;
    unitNo: string;
    dueDate: string;
    amount: number;
    status: PaymentStatus;
    paidAt?: string;
    method?: PaymentMethod;
    reference?: string;
    createdAt: string;
}

export interface MaintenanceRequest {
    id: string;
    companyId: string;
    propertyId: string;
    propertyName: string;
    unitId?: string;
    unitNo?: string;
    title: string;
    description: string;
    priority: MaintenancePriority;
    status: MaintenanceStatus;
    cost: number;
    requestedBy: 'tenant' | 'admin';
    assignedTo?: string;
    createdAt: string;
}

// ========================
// KPI / DASHBOARD TYPES
// ========================

export interface DashboardKPI {
    totalUnits: number;
    vacantUnits: number;
    rentedUnits: number;
    maintenanceUnits: number;
    occupancyRate: number;
    expectedMonthlyIncome: number;
    overdueAmount: number;
    overdueCount: number;
    contractsExpiringSoon: number;
}

export interface MonthlyIncome {
    month: string;
    amount: number;
}

// ========================
// PLAN LIMITS
// ========================

export const PLAN_LIMITS: Record<PlanType, { maxUnits: number; maxUsers: number }> = {
    basic: { maxUnits: 20, maxUsers: 3 },
    pro: { maxUnits: 100, maxUsers: 10 },
    enterprise: { maxUnits: Infinity, maxUsers: Infinity },
};

// ========================
// ERP ENTITIES
// ========================

export interface Employee {
    id: string;
    companyId: string;
    userId?: string;
    fullName: string;
    email: string;
    password: string;  // For employee login
    phone: string;
    role: UserRole;
    department: string;
    joinDate: string;
    status: EmployeeStatus;
    avatar?: string;
    permissions: EmployeePermission[];  // Feature permissions
    isActive: boolean;  // Can login or not
    createdAt: string;
}

export interface Task {
    id: string;
    companyId: string;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignedTo: string;
    assignedToName: string;
    createdBy: string;
    createdByName: string;
    dueDate: string;
    relatedTo?: {
        type: 'property' | 'unit' | 'tenant' | 'contract' | 'maintenance' | 'payment';
        id: string;
        name: string;
    };
    attachments?: string[];
    comments: TaskComment[];
    history: TaskHistoryItem[];
    createdAt: string;
    updatedAt: string;
}

export interface TaskComment {
    id: string;
    taskId: string;
    employeeId: string;
    employeeName: string;
    content: string;
    createdAt: string;
}

export interface TaskHistoryItem {
    id: string;
    action: 'created' | 'assigned' | 'status_changed' | 'comment_added' | 'transferred';
    fromEmployee?: string;
    fromEmployeeName?: string;
    toEmployee?: string;
    toEmployeeName?: string;
    fromStatus?: TaskStatus;
    toStatus?: TaskStatus;
    note?: string;
    createdBy: string;
    createdByName: string;
    createdAt: string;
}

export interface Notification {
    id: string;
    companyId: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    relatedId?: string;
    createdAt: string;
}
