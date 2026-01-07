// Report Intelligence Types for Arkan PMS
// These types support the backend intelligence layer without UI changes

// ========================
// REPORT PERIOD TYPES
// ========================

export type ReportPeriod = 'monthly' | 'quarterly' | 'yearly';
export type ReportStatus = 'healthy' | 'attention' | 'risk';
export type MaintenanceCategory = 'plumbing' | 'electrical' | 'hvac' | 'structural' | 'general';

// ========================
// ANOMALY DETECTION
// ========================

export interface IncomeAnomaly {
    type: 'sudden_drop' | 'unusual_pattern' | 'missed_payments';
    propertyId: string;
    propertyName: string;
    currentAmount: number;
    previousAmount: number;
    percentChange: number;
    detectedAt: string;
    severity: 'low' | 'medium' | 'high';
}

export interface MaintenanceAnomaly {
    type: 'cost_spike' | 'frequency_increase' | 'repeated_issue';
    propertyId: string;
    propertyName: string;
    unitId?: string;
    unitNo?: string;
    currentCost: number;
    averageCost: number;
    percentChange: number;
    issueCategory?: MaintenanceCategory;
    occurrenceCount?: number;
    detectedAt: string;
    severity: 'low' | 'medium' | 'high';
}

// ========================
// PERIOD COMPARISON
// ========================

export interface PeriodComparison {
    currentPeriod: {
        start: string;
        end: string;
        label: string;
    };
    previousPeriod: {
        start: string;
        end: string;
        label: string;
    };
    metrics: {
        income: { current: number; previous: number; change: number; changePercent: number };
        expenses: { current: number; previous: number; change: number; changePercent: number };
        netProfit: { current: number; previous: number; change: number; changePercent: number };
        occupancy: { current: number; previous: number; change: number; changePercent: number };
        maintenanceCount: { current: number; previous: number; change: number; changePercent: number };
    };
}

// ========================
// OWNER REPORT SUMMARY
// ========================

export interface OwnerReportSummary {
    id: string;
    generatedAt: string;
    period: ReportPeriod;
    periodLabel: string;
    startDate: string;
    endDate: string;
    propertyId?: string; // undefined = all properties
    propertyName?: string;

    // Financial Summary
    financials: {
        totalIncome: number;
        collectedIncome: number;
        outstandingAmount: number;
        overdueAmount: number;
        maintenanceCosts: number;
        netProfit: number;
        profitMargin: number; // percentage
    };

    // Occupancy
    occupancy: {
        totalUnits: number;
        rentedUnits: number;
        vacantUnits: number;
        maintenanceUnits: number;
        occupancyRate: number; // percentage
    };

    // Contracts
    contracts: {
        totalActive: number;
        expiringSoon: number; // within 30 days
        expired: number;
        newThisPeriod: number;
    };

    // Status & Flags
    status: ReportStatus;
    statusReasons: string[];

    // Anomalies
    incomeAnomalies: IncomeAnomaly[];
    maintenanceAnomalies: MaintenanceAnomaly[];

    // Period Comparison
    comparison?: PeriodComparison;

    // PDF Export Ready Data
    exportData: {
        title: string;
        subtitle: string;
        generatedBy: string;
        sections: ReportSection[];
    };
}

export interface ReportSection {
    title: string;
    type: 'summary' | 'table' | 'chart' | 'alert';
    data: any;
}

// ========================
// MAINTENANCE ENHANCED
// ========================

export interface MaintenanceEnhancement {
    category: MaintenanceCategory;
    categoryArabic: string;
    isUrgent: boolean;
    calculatedPriority: number; // 0-100
    slaResponseDeadline: string;
    slaResolutionDeadline: string;
    responseTime?: number; // hours (filled when responded)
    resolutionTime?: number; // hours (filled when resolved)
    escalationLevel: 0 | 1 | 2 | 3;
    isRepeatedIssue: boolean;
    repeatCount?: number;
    respondedAt?: string;
    resolvedAt?: string;
}

export interface SLAConfig {
    priority: 'urgent' | 'high' | 'medium' | 'low';
    responseHours: number;
    resolutionHours: number;
}

export const SLA_CONFIGURATIONS: SLAConfig[] = [
    { priority: 'urgent', responseHours: 2, resolutionHours: 24 },
    { priority: 'high', responseHours: 8, resolutionHours: 48 },
    { priority: 'medium', responseHours: 24, resolutionHours: 168 }, // 7 days
    { priority: 'low', responseHours: 48, resolutionHours: 336 }, // 14 days
];

// ========================
// COST HISTORY
// ========================

export interface MaintenanceCostHistory {
    unitId?: string;
    unitNo?: string;
    propertyId: string;
    propertyName: string;
    totalCost: number;
    requestCount: number;
    averageCost: number;
    byCategory: Record<MaintenanceCategory, { count: number; cost: number }>;
    byMonth: { month: string; cost: number; count: number }[];
    trend: 'increasing' | 'stable' | 'decreasing';
}

export interface RepeatedIssue {
    unitId: string;
    unitNo: string;
    propertyId: string;
    propertyName: string;
    category: MaintenanceCategory;
    occurrences: number;
    totalCost: number;
    firstOccurrence: string;
    lastOccurrence: string;
    description: string;
}
