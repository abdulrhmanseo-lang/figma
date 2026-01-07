// Super Admin Service for Arkan PMS
// Company metrics, aggregation, and system-wide management
// NO UI CHANGES - Backend only

import { CompanyContextService, getAllCompanies } from './CompanyContext';
import { TenantMiddleware } from './TenantMiddleware';
import { SystemLogger } from './SystemLogger';
import type {
    Company,
    CompanyMetrics,
    SystemMetrics,
    TenantUser,
    CompanyStatus
} from '../types/multiTenantTypes';
import type { Property, Unit, Contract, Payment, MaintenanceRequest } from '../types/database';

// ========================
// TYPES
// ========================

export interface CompanyDetailedView {
    company: Company;
    metrics: CompanyMetrics;
    users: number;
    properties: number;
    units: number;
    contracts: number;
    payments: number;
    maintenance: number;
    recentActivity: ActivityEntry[];
}

export interface ActivityEntry {
    id: string;
    type: string;
    description: string;
    descriptionAr: string;
    timestamp: string;
    userId?: string;
    entityType?: string;
    entityId?: string;
}

export interface CompanyComparison {
    topByProperties: CompanyMetrics[];
    topByRevenue: CompanyMetrics[];
    topByOccupancy: CompanyMetrics[];
    needsAttention: CompanyMetrics[];
}

// ========================
// IN-MEMORY DATA SIMULATION
// ========================

// This would normally come from database - simulated for frontend
class SuperAdminDataStore {
    private companyData: Map<string, {
        properties: Property[];
        units: Unit[];
        contracts: Contract[];
        payments: Payment[];
        maintenance: MaintenanceRequest[];
        users: TenantUser[];
    }> = new Map();

    setCompanyData(companyId: string, data: {
        properties: Property[];
        units: Unit[];
        contracts: Contract[];
        payments: Payment[];
        maintenance: MaintenanceRequest[];
        users: TenantUser[];
    }): void {
        this.companyData.set(companyId, data);
    }

    getCompanyData(companyId: string): {
        properties: Property[];
        units: Unit[];
        contracts: Contract[];
        payments: Payment[];
        maintenance: MaintenanceRequest[];
        users: TenantUser[];
    } | undefined {
        return this.companyData.get(companyId);
    }

    getAllCompanyData(): Map<string, {
        properties: Property[];
        units: Unit[];
        contracts: Contract[];
        payments: Payment[];
        maintenance: MaintenanceRequest[];
        users: TenantUser[];
    }> {
        return this.companyData;
    }
}

const dataStore = new SuperAdminDataStore();

// ========================
// ACCESS CONTROL
// ========================

function requireSuperAdmin(): void {
    const context = CompanyContextService.getCurrentContext();

    if (!context || !context.isSuperAdmin) {
        SystemLogger.logWarning(
            'security',
            'super_admin_access_denied',
            'Non-super-admin tried to access super admin features',
            'غير المدير العام حاول الوصول إلى ميزات المدير العام',
            { context }
        );
        throw new Error('This operation requires SUPER_ADMIN role');
    }
}

// ========================
// COMPANY METRICS CALCULATION
// ========================

export function calculateCompanyMetrics(
    company: Company,
    properties: Property[],
    units: Unit[],
    contracts: Contract[],
    payments: Payment[],
    maintenance: MaintenanceRequest[],
    users: TenantUser[]
): CompanyMetrics {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Filter by company
    const companyProperties = properties.filter(p => p.company_id === company.id);
    const companyUnits = units.filter(u =>
        companyProperties.some(p => p.id === u.propertyId)
    );
    const companyContracts = contracts.filter(c => c.company_id === company.id);
    const companyPayments = payments.filter(p => p.company_id === company.id);
    const companyMaintenance = maintenance.filter(m => m.company_id === company.id);
    const companyUsers = users.filter(u => u.companyId === company.id);

    // Calculate metrics
    const occupiedUnits = companyUnits.filter(u => u.status === 'occupied').length;
    const occupancyRate = companyUnits.length > 0
        ? (occupiedUnits / companyUnits.length) * 100
        : 0;

    const activeContracts = companyContracts.filter(c => c.status === 'active').length;

    const pendingPayments = companyPayments.filter(p => p.status === 'pending').length;
    const overduePayments = companyPayments.filter(p => {
        if (p.status === 'paid') return false;
        const dueDate = new Date(p.dueDate);
        return dueDate < now;
    }).length;

    const pendingMaintenance = companyMaintenance.filter(m =>
        m.status !== 'done' && m.status !== 'canceled'
    ).length;

    // Monthly revenue (paid payments in last 30 days)
    const monthlyRevenue = companyPayments
        .filter(p => {
            if (p.status !== 'paid' || !p.paidAt) return false;
            const paidDate = new Date(p.paidAt);
            return paidDate >= thirtyDaysAgo;
        })
        .reduce((sum, p) => sum + p.amount, 0);

    // Last activity
    const allDates = [
        ...companyPayments.map(p => p.createdAt),
        ...companyMaintenance.map(m => m.createdAt),
        ...companyContracts.map(c => c.createdAt)
    ].filter(Boolean).sort().reverse();

    return {
        companyId: company.id,
        companyName: company.name,
        status: company.status,
        userCount: companyUsers.length,
        propertyCount: companyProperties.length,
        unitCount: companyUnits.length,
        occupiedUnits,
        occupancyRate: Math.round(occupancyRate),
        activeContracts,
        pendingPayments,
        overduePayments,
        pendingMaintenance,
        monthlyRevenue,
        lastActivity: allDates[0] || company.createdAt
    };
}

// ========================
// SYSTEM METRICS
// ========================

export function getSystemMetrics(
    companies: Company[],
    allData: Map<string, {
        properties: Property[];
        units: Unit[];
        contracts: Contract[];
        payments: Payment[];
        maintenance: MaintenanceRequest[];
        users: TenantUser[];
    }>
): SystemMetrics {
    requireSuperAdmin();

    const companyMetrics: CompanyMetrics[] = [];

    let totalUsers = 0;
    let totalProperties = 0;
    let totalUnits = 0;
    let totalContracts = 0;

    companies.forEach(company => {
        const data = allData.get(company.id);
        if (data) {
            const metrics = calculateCompanyMetrics(
                company,
                data.properties,
                data.units,
                data.contracts,
                data.payments,
                data.maintenance,
                data.users
            );
            companyMetrics.push(metrics);

            totalUsers += data.users.length;
            totalProperties += data.properties.length;
            totalUnits += data.units.length;
            totalContracts += data.contracts.length;
        }
    });

    // Count companies by status
    const statusCounts: Record<CompanyStatus, number> = {
        active: 0,
        inactive: 0,
        suspended: 0,
        trial: 0
    };

    companies.forEach(c => {
        statusCounts[c.status]++;
    });

    // Determine system health
    const problematicCompanies = companyMetrics.filter(m =>
        m.overduePayments > 5 || m.occupancyRate < 50
    ).length;

    let systemHealth: 'healthy' | 'attention' | 'risk' = 'healthy';
    if (problematicCompanies > companies.length * 0.3) systemHealth = 'risk';
    else if (problematicCompanies > companies.length * 0.1) systemHealth = 'attention';

    SystemLogger.logInfo(
        'system',
        'system_metrics_calculated',
        `System metrics calculated: ${companies.length} companies`,
        `تم حساب مقاييس النظام: ${companies.length} شركة`,
        { totalCompanies: companies.length, systemHealth }
    );

    return {
        totalCompanies: companies.length,
        activeCompanies: statusCounts.active,
        inactiveCompanies: statusCounts.inactive,
        trialCompanies: statusCounts.trial,
        suspendedCompanies: statusCounts.suspended,
        totalUsers,
        totalProperties,
        totalUnits,
        totalContracts,
        systemHealth,
        companies: companyMetrics
    };
}

// ========================
// COMPANY LISTING
// ========================

export function listAllCompanies(): CompanyMetrics[] {
    requireSuperAdmin();

    const companies = getAllCompanies();
    const allData = dataStore.getAllCompanyData();

    return companies.map(company => {
        const data = allData.get(company.id);
        if (!data) {
            return {
                companyId: company.id,
                companyName: company.name,
                status: company.status,
                userCount: 0,
                propertyCount: 0,
                unitCount: 0,
                occupiedUnits: 0,
                occupancyRate: 0,
                activeContracts: 0,
                pendingPayments: 0,
                overduePayments: 0,
                pendingMaintenance: 0,
                monthlyRevenue: 0,
                lastActivity: company.createdAt
            };
        }

        return calculateCompanyMetrics(
            company,
            data.properties,
            data.units,
            data.contracts,
            data.payments,
            data.maintenance,
            data.users
        );
    });
}

export function getCompanyDetails(companyId: string): CompanyDetailedView | null {
    requireSuperAdmin();

    const company = CompanyContextService.getCompany(companyId);
    if (!company) return null;

    const data = dataStore.getCompanyData(companyId);

    const metrics = data
        ? calculateCompanyMetrics(
            company,
            data.properties,
            data.units,
            data.contracts,
            data.payments,
            data.maintenance,
            data.users
        )
        : {
            companyId: company.id,
            companyName: company.name,
            status: company.status,
            userCount: 0,
            propertyCount: 0,
            unitCount: 0,
            occupiedUnits: 0,
            occupancyRate: 0,
            activeContracts: 0,
            pendingPayments: 0,
            overduePayments: 0,
            pendingMaintenance: 0,
            monthlyRevenue: 0,
            lastActivity: company.createdAt
        };

    // Get recent activity from logs
    const recentActivity: ActivityEntry[] = [];

    return {
        company,
        metrics,
        users: data?.users?.length || 0,
        properties: data?.properties?.length || 0,
        units: data?.units?.length || 0,
        contracts: data?.contracts?.length || 0,
        payments: data?.payments?.length || 0,
        maintenance: data?.maintenance?.length || 0,
        recentActivity
    };
}

// ========================
// COMPANY COMPARISON
// ========================

export function compareCompanies(): CompanyComparison {
    requireSuperAdmin();

    const allMetrics = listAllCompanies();

    // Sort by different criteria
    const topByProperties = [...allMetrics]
        .sort((a, b) => b.propertyCount - a.propertyCount)
        .slice(0, 5);

    const topByRevenue = [...allMetrics]
        .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
        .slice(0, 5);

    const topByOccupancy = [...allMetrics]
        .filter(m => m.unitCount > 0)
        .sort((a, b) => b.occupancyRate - a.occupancyRate)
        .slice(0, 5);

    // Companies needing attention
    const needsAttention = allMetrics.filter(m =>
        m.overduePayments > 3 ||
        m.occupancyRate < 60 ||
        m.pendingMaintenance > 10
    );

    return {
        topByProperties,
        topByRevenue,
        topByOccupancy,
        needsAttention
    };
}

// ========================
// COMPANY MANAGEMENT
// ========================

export function suspendCompany(companyId: string, reason?: string): boolean {
    requireSuperAdmin();

    const company = CompanyContextService.getCompany(companyId);
    if (!company) return false;

    CompanyContextService.updateCompany(companyId, { status: 'suspended' });

    SystemLogger.logCritical(
        'system',
        'company_suspended',
        `Company "${company.name}" suspended`,
        `تم إيقاف الشركة "${company.nameAr}"`,
        { companyId, reason }
    );

    return true;
}

export function activateCompany(companyId: string): boolean {
    requireSuperAdmin();

    const company = CompanyContextService.getCompany(companyId);
    if (!company) return false;

    CompanyContextService.updateCompany(companyId, { status: 'active' });

    SystemLogger.logInfo(
        'system',
        'company_activated',
        `Company "${company.name}" activated`,
        `تم تفعيل الشركة "${company.nameAr}"`,
        { companyId }
    );

    return true;
}

// ========================
// DATA STORE ACCESS
// ========================

export function registerCompanyData(
    companyId: string,
    data: {
        properties: Property[];
        units: Unit[];
        contracts: Contract[];
        payments: Payment[];
        maintenance: MaintenanceRequest[];
        users: TenantUser[];
    }
): void {
    dataStore.setCompanyData(companyId, data);
}

// ========================
// SUPER ADMIN DASHBOARD DATA
// ========================

export function getSuperAdminDashboard(): {
    systemMetrics: SystemMetrics;
    comparison: CompanyComparison;
    recentSwitches: any[];
} {
    requireSuperAdmin();

    const companies = getAllCompanies();
    const allData = dataStore.getAllCompanyData();

    const systemMetrics = getSystemMetrics(companies, allData);
    const comparison = compareCompanies();
    const recentSwitches = CompanyContextService.getContextSwitchHistory().slice(0, 10);

    return {
        systemMetrics,
        comparison,
        recentSwitches
    };
}

// ========================
// EXPORT
// ========================

export const SuperAdminService = {
    // Access Control
    requireSuperAdmin,

    // Metrics
    calculateCompanyMetrics,
    getSystemMetrics,

    // Company Listing
    listAllCompanies,
    getCompanyDetails,
    compareCompanies,

    // Company Management
    suspendCompany,
    activateCompany,

    // Data Store
    registerCompanyData,

    // Dashboard
    getSuperAdminDashboard
};

export default SuperAdminService;
