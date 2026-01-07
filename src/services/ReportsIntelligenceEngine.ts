// Reports Intelligence Engine for Arkan PMS
// Generates intelligent owner reports with analytics, anomaly detection, and status flags
// NO UI CHANGES - Backend logic only

import type { Property, Unit, Contract, Payment, MaintenanceRequest } from '../types/database';
import type {
    ReportPeriod,
    ReportStatus,
    OwnerReportSummary,
    PeriodComparison,
    IncomeAnomaly,
    MaintenanceAnomaly,
    ReportSection,
} from '../types/reportTypes';

// ========================
// UTILITY FUNCTIONS
// ========================

function getDateRange(period: ReportPeriod, referenceDate: Date = new Date()): { start: Date; end: Date; label: string } {
    const end = new Date(referenceDate);
    let start = new Date(referenceDate);
    let label = '';

    switch (period) {
        case 'monthly':
            start = new Date(end.getFullYear(), end.getMonth(), 1);
            end.setMonth(end.getMonth() + 1, 0); // Last day of month
            label = start.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
            break;
        case 'quarterly':
            const quarter = Math.floor(end.getMonth() / 3);
            start = new Date(end.getFullYear(), quarter * 3, 1);
            end.setMonth(quarter * 3 + 3, 0);
            label = `الربع ${quarter + 1} - ${end.getFullYear()}`;
            break;
        case 'yearly':
            start = new Date(end.getFullYear(), 0, 1);
            end.setFullYear(end.getFullYear(), 11, 31);
            label = `${end.getFullYear()}`;
            break;
    }

    return { start, end, label };
}

function getPreviousPeriodRange(period: ReportPeriod, currentStart: Date): { start: Date; end: Date; label: string } {
    const prevRef = new Date(currentStart);

    switch (period) {
        case 'monthly':
            prevRef.setMonth(prevRef.getMonth() - 1);
            break;
        case 'quarterly':
            prevRef.setMonth(prevRef.getMonth() - 3);
            break;
        case 'yearly':
            prevRef.setFullYear(prevRef.getFullYear() - 1);
            break;
    }

    return getDateRange(period, prevRef);
}

function isInDateRange(dateStr: string, start: Date, end: Date): boolean {
    const date = new Date(dateStr);
    return date >= start && date <= end;
}

function calculatePercentChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

// ========================
// FINANCIAL CALCULATIONS
// ========================

export function calculateFinancials(
    payments: Payment[],
    maintenanceRequests: MaintenanceRequest[],
    startDate: Date,
    endDate: Date
): {
    totalIncome: number;
    collectedIncome: number;
    outstandingAmount: number;
    overdueAmount: number;
    maintenanceCosts: number;
    netProfit: number;
    profitMargin: number;
} {
    // Filter payments in date range
    const periodPayments = payments.filter(p => isInDateRange(p.dueDate, startDate, endDate));

    const totalIncome = periodPayments.reduce((sum, p) => sum + p.amount, 0);
    const collectedIncome = periodPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
    const outstandingAmount = periodPayments
        .filter(p => p.status === 'due')
        .reduce((sum, p) => sum + p.amount, 0);
    const overdueAmount = periodPayments
        .filter(p => p.status === 'overdue')
        .reduce((sum, p) => sum + p.amount, 0);

    // Calculate maintenance costs in period
    const periodMaintenance = maintenanceRequests.filter(m =>
        isInDateRange(m.createdAt, startDate, endDate)
    );
    const maintenanceCosts = periodMaintenance.reduce((sum, m) => sum + m.cost, 0);

    const netProfit = collectedIncome - maintenanceCosts;
    const profitMargin = collectedIncome > 0 ? Math.round((netProfit / collectedIncome) * 100) : 0;

    return {
        totalIncome,
        collectedIncome,
        outstandingAmount,
        overdueAmount,
        maintenanceCosts,
        netProfit,
        profitMargin,
    };
}

// ========================
// OCCUPANCY CALCULATIONS
// ========================

export function calculateOccupancy(
    units: Unit[],
    propertyId?: string
): {
    totalUnits: number;
    rentedUnits: number;
    vacantUnits: number;
    maintenanceUnits: number;
    occupancyRate: number;
} {
    const filteredUnits = propertyId
        ? units.filter(u => u.propertyId === propertyId)
        : units;

    const totalUnits = filteredUnits.length;
    const rentedUnits = filteredUnits.filter(u => u.status === 'rented').length;
    const vacantUnits = filteredUnits.filter(u => u.status === 'vacant').length;
    const maintenanceUnits = filteredUnits.filter(u => u.status === 'maintenance').length;
    const occupancyRate = totalUnits > 0 ? Math.round((rentedUnits / totalUnits) * 100) : 0;

    return { totalUnits, rentedUnits, vacantUnits, maintenanceUnits, occupancyRate };
}

// ========================
// ANOMALY DETECTION
// ========================

export function detectIncomeAnomalies(
    payments: Payment[],
    properties: Property[],
    threshold: number = 20 // 20% change triggers anomaly
): IncomeAnomaly[] {
    const anomalies: IncomeAnomaly[] = [];
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const endPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Group payments by property (through contracts)
    properties.forEach(property => {
        const propPaymentsCurrent = payments.filter(p =>
            isInDateRange(p.dueDate, currentMonth, endCurrentMonth)
        );
        const propPaymentsPrevious = payments.filter(p =>
            isInDateRange(p.dueDate, previousMonth, endPreviousMonth)
        );

        const currentAmount = propPaymentsCurrent
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + p.amount, 0);
        const previousAmount = propPaymentsPrevious
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + p.amount, 0);

        const percentChange = calculatePercentChange(currentAmount, previousAmount);

        // Detect sudden drop
        if (percentChange < -threshold && previousAmount > 0) {
            anomalies.push({
                type: 'sudden_drop',
                propertyId: property.id,
                propertyName: property.name,
                currentAmount,
                previousAmount,
                percentChange,
                detectedAt: now.toISOString(),
                severity: percentChange < -50 ? 'high' : percentChange < -30 ? 'medium' : 'low',
            });
        }

        // Detect missed payments (high overdue count)
        const overdueCount = payments.filter(p => p.status === 'overdue').length;
        if (overdueCount >= 3) {
            anomalies.push({
                type: 'missed_payments',
                propertyId: property.id,
                propertyName: property.name,
                currentAmount: overdueCount,
                previousAmount: 0,
                percentChange: 0,
                detectedAt: now.toISOString(),
                severity: overdueCount >= 5 ? 'high' : overdueCount >= 4 ? 'medium' : 'low',
            });
        }
    });

    return anomalies;
}

export function detectMaintenanceAnomalies(
    maintenanceRequests: MaintenanceRequest[],
    threshold: number = 50 // 50% increase triggers anomaly
): MaintenanceAnomaly[] {
    const anomalies: MaintenanceAnomaly[] = [];
    const now = new Date();

    // Group by property
    const byProperty: Record<string, MaintenanceRequest[]> = {};
    maintenanceRequests.forEach(m => {
        if (!byProperty[m.propertyId]) byProperty[m.propertyId] = [];
        byProperty[m.propertyId].push(m);
    });

    Object.entries(byProperty).forEach(([propertyId, requests]) => {
        if (requests.length === 0) return;

        const propertyName = requests[0].propertyName;
        const totalCost = requests.reduce((sum, m) => sum + m.cost, 0);
        const averageCost = totalCost / requests.length;

        // Check for cost spike (any single request > 2x average)
        requests.forEach(req => {
            if (req.cost > averageCost * 2 && averageCost > 0) {
                anomalies.push({
                    type: 'cost_spike',
                    propertyId,
                    propertyName,
                    unitId: req.unitId,
                    unitNo: req.unitNo,
                    currentCost: req.cost,
                    averageCost,
                    percentChange: calculatePercentChange(req.cost, averageCost),
                    detectedAt: now.toISOString(),
                    severity: req.cost > averageCost * 3 ? 'high' : 'medium',
                });
            }
        });

        // Check for frequency increase (more than 5 requests in last 30 days)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const recentRequests = requests.filter(r => new Date(r.createdAt) >= thirtyDaysAgo);
        if (recentRequests.length >= 5) {
            anomalies.push({
                type: 'frequency_increase',
                propertyId,
                propertyName,
                currentCost: recentRequests.length,
                averageCost: 0,
                percentChange: 0,
                occurrenceCount: recentRequests.length,
                detectedAt: now.toISOString(),
                severity: recentRequests.length >= 8 ? 'high' : recentRequests.length >= 6 ? 'medium' : 'low',
            });
        }
    });

    return anomalies;
}

// ========================
// STATUS CALCULATION
// ========================

export function calculateReportStatus(
    financials: ReturnType<typeof calculateFinancials>,
    occupancy: ReturnType<typeof calculateOccupancy>,
    incomeAnomalies: IncomeAnomaly[],
    maintenanceAnomalies: MaintenanceAnomaly[]
): { status: ReportStatus; reasons: string[] } {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check occupancy
    if (occupancy.occupancyRate < 50) {
        riskScore += 30;
        reasons.push(`نسبة الإشغال منخفضة (${occupancy.occupancyRate}%)`);
    } else if (occupancy.occupancyRate < 70) {
        riskScore += 15;
        reasons.push(`نسبة الإشغال تحتاج تحسين (${occupancy.occupancyRate}%)`);
    }

    // Check profit margin
    if (financials.profitMargin < 0) {
        riskScore += 40;
        reasons.push('صافي الربح سلبي');
    } else if (financials.profitMargin < 30) {
        riskScore += 20;
        reasons.push(`هامش الربح منخفض (${financials.profitMargin}%)`);
    }

    // Check overdue payments
    const overdueRatio = financials.totalIncome > 0
        ? (financials.overdueAmount / financials.totalIncome) * 100
        : 0;
    if (overdueRatio > 20) {
        riskScore += 25;
        reasons.push(`نسبة المتأخرات مرتفعة (${Math.round(overdueRatio)}%)`);
    } else if (overdueRatio > 10) {
        riskScore += 10;
        reasons.push(`يوجد متأخرات (${Math.round(overdueRatio)}%)`);
    }

    // Check anomalies
    const highSeverityAnomalies = [
        ...incomeAnomalies.filter(a => a.severity === 'high'),
        ...maintenanceAnomalies.filter(a => a.severity === 'high'),
    ];
    if (highSeverityAnomalies.length > 0) {
        riskScore += 20 * highSeverityAnomalies.length;
        reasons.push(`${highSeverityAnomalies.length} تنبيهات عالية الخطورة`);
    }

    // Determine status
    let status: ReportStatus = 'healthy';
    if (riskScore >= 50) {
        status = 'risk';
    } else if (riskScore >= 25) {
        status = 'attention';
    }

    if (reasons.length === 0) {
        reasons.push('جميع المؤشرات طبيعية');
    }

    return { status, reasons };
}

// ========================
// PERIOD COMPARISON
// ========================

export function comparePeriods(
    payments: Payment[],
    maintenanceRequests: MaintenanceRequest[],
    units: Unit[],
    period: ReportPeriod,
    propertyId?: string
): PeriodComparison {
    const current = getDateRange(period);
    const previous = getPreviousPeriodRange(period, current.start);

    const currentFinancials = calculateFinancials(payments, maintenanceRequests, current.start, current.end);
    const previousFinancials = calculateFinancials(payments, maintenanceRequests, previous.start, previous.end);

    const currentOccupancy = calculateOccupancy(units, propertyId);
    // Note: Occupancy is current state, not historical (would need snapshots for historical)

    const currentMaintenanceCount = maintenanceRequests.filter(m =>
        isInDateRange(m.createdAt, current.start, current.end)
    ).length;
    const previousMaintenanceCount = maintenanceRequests.filter(m =>
        isInDateRange(m.createdAt, previous.start, previous.end)
    ).length;

    return {
        currentPeriod: {
            start: current.start.toISOString(),
            end: current.end.toISOString(),
            label: current.label,
        },
        previousPeriod: {
            start: previous.start.toISOString(),
            end: previous.end.toISOString(),
            label: previous.label,
        },
        metrics: {
            income: {
                current: currentFinancials.collectedIncome,
                previous: previousFinancials.collectedIncome,
                change: currentFinancials.collectedIncome - previousFinancials.collectedIncome,
                changePercent: calculatePercentChange(currentFinancials.collectedIncome, previousFinancials.collectedIncome),
            },
            expenses: {
                current: currentFinancials.maintenanceCosts,
                previous: previousFinancials.maintenanceCosts,
                change: currentFinancials.maintenanceCosts - previousFinancials.maintenanceCosts,
                changePercent: calculatePercentChange(currentFinancials.maintenanceCosts, previousFinancials.maintenanceCosts),
            },
            netProfit: {
                current: currentFinancials.netProfit,
                previous: previousFinancials.netProfit,
                change: currentFinancials.netProfit - previousFinancials.netProfit,
                changePercent: calculatePercentChange(currentFinancials.netProfit, previousFinancials.netProfit),
            },
            occupancy: {
                current: currentOccupancy.occupancyRate,
                previous: currentOccupancy.occupancyRate, // Same (no historical data)
                change: 0,
                changePercent: 0,
            },
            maintenanceCount: {
                current: currentMaintenanceCount,
                previous: previousMaintenanceCount,
                change: currentMaintenanceCount - previousMaintenanceCount,
                changePercent: calculatePercentChange(currentMaintenanceCount, previousMaintenanceCount),
            },
        },
    };
}

// ========================
// PDF EXPORT DATA PREPARATION
// ========================

export function prepareForPDFExport(report: OwnerReportSummary): OwnerReportSummary['exportData'] {
    const sections: ReportSection[] = [];

    // Summary section
    sections.push({
        title: 'ملخص مالي',
        type: 'summary',
        data: {
            items: [
                { label: 'إجمالي الدخل', value: report.financials.totalIncome },
                { label: 'المحصل', value: report.financials.collectedIncome },
                { label: 'المتأخرات', value: report.financials.overdueAmount },
                { label: 'صافي الربح', value: report.financials.netProfit },
            ],
        },
    });

    // Occupancy section
    sections.push({
        title: 'نسبة الإشغال',
        type: 'summary',
        data: {
            rate: report.occupancy.occupancyRate,
            total: report.occupancy.totalUnits,
            rented: report.occupancy.rentedUnits,
            vacant: report.occupancy.vacantUnits,
        },
    });

    // Alerts section
    if (report.incomeAnomalies.length > 0 || report.maintenanceAnomalies.length > 0) {
        sections.push({
            title: 'تنبيهات',
            type: 'alert',
            data: {
                income: report.incomeAnomalies,
                maintenance: report.maintenanceAnomalies,
            },
        });
    }

    // Status section
    sections.push({
        title: 'الحالة العامة',
        type: 'summary',
        data: {
            status: report.status,
            statusArabic: report.status === 'healthy' ? 'صحي' : report.status === 'attention' ? 'يحتاج انتباه' : 'خطر',
            reasons: report.statusReasons,
        },
    });

    return {
        title: `تقرير المالك - ${report.periodLabel}`,
        subtitle: report.propertyName || 'جميع العقارات',
        generatedBy: 'نظام أركان',
        sections,
    };
}

// ========================
// MAIN REPORT GENERATOR
// ========================

export function generateOwnerReport(
    properties: Property[],
    units: Unit[],
    contracts: Contract[],
    payments: Payment[],
    maintenanceRequests: MaintenanceRequest[],
    period: ReportPeriod = 'monthly',
    propertyId?: string
): OwnerReportSummary {
    const dateRange = getDateRange(period);
    const property = propertyId ? properties.find(p => p.id === propertyId) : undefined;

    // Filter data by property if specified
    const filteredUnits = propertyId ? units.filter(u => u.propertyId === propertyId) : units;
    const filteredContracts = propertyId ? contracts.filter(c => c.propertyId === propertyId) : contracts;
    const filteredMaintenance = propertyId ? maintenanceRequests.filter(m => m.propertyId === propertyId) : maintenanceRequests;

    // Calculate all metrics
    const financials = calculateFinancials(payments, filteredMaintenance, dateRange.start, dateRange.end);
    const occupancy = calculateOccupancy(filteredUnits, propertyId);

    // Contracts analysis
    const activeContracts = filteredContracts.filter(c => c.status === 'active');
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringSoon = activeContracts.filter(c => new Date(c.endDate) <= thirtyDaysFromNow).length;
    const expiredContracts = filteredContracts.filter(c => c.status === 'ended').length;
    const newContracts = filteredContracts.filter(c =>
        isInDateRange(c.createdAt, dateRange.start, dateRange.end)
    ).length;

    // Detect anomalies
    const incomeAnomalies = detectIncomeAnomalies(payments, properties);
    const maintenanceAnomalies = detectMaintenanceAnomalies(filteredMaintenance);

    // Calculate status
    const { status, reasons } = calculateReportStatus(financials, occupancy, incomeAnomalies, maintenanceAnomalies);

    // Period comparison
    const comparison = comparePeriods(payments, filteredMaintenance, filteredUnits, period, propertyId);

    // Build report
    const report: OwnerReportSummary = {
        id: `report-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        period,
        periodLabel: dateRange.label,
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        propertyId,
        propertyName: property?.name,
        financials,
        occupancy,
        contracts: {
            totalActive: activeContracts.length,
            expiringSoon,
            expired: expiredContracts,
            newThisPeriod: newContracts,
        },
        status,
        statusReasons: reasons,
        incomeAnomalies,
        maintenanceAnomalies,
        comparison,
        exportData: { title: '', subtitle: '', generatedBy: '', sections: [] }, // Placeholder
    };

    // Prepare export data
    report.exportData = prepareForPDFExport(report);

    return report;
}

// ========================
// EXPORTS
// ========================

export const ReportsIntelligenceEngine = {
    generateOwnerReport,
    calculateFinancials,
    calculateOccupancy,
    detectIncomeAnomalies,
    detectMaintenanceAnomalies,
    calculateReportStatus,
    comparePeriods,
    prepareForPDFExport,
};

export default ReportsIntelligenceEngine;
