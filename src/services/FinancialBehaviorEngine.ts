// Financial Behavior Engine for Arkan PMS
// Enhanced financial logic, payment tracking, grace periods, and cash flow
// NO UI CHANGES - Backend only

import type { Payment, Contract, Property, Unit } from '../types/database';
import { SystemLogger } from './SystemLogger';

// ========================
// TYPES
// ========================

export interface PaymentAnalysis {
    paymentId: string;
    status: 'on_time' | 'grace_period' | 'overdue' | 'severely_overdue';
    daysOverdue: number;
    gracePeriodEnd: Date | null;
    isWithinGrace: boolean;
    escalationLevel: 0 | 1 | 2 | 3;
    riskScore: number; // 0-100
}

export interface TenantPaymentHistory {
    tenantId: string;
    tenantName: string;
    totalPayments: number;
    onTimePayments: number;
    latePayments: number;
    missedPayments: number;
    averageDaysLate: number;
    totalAmountPaid: number;
    totalAmountOutstanding: number;
    paymentScore: number; // 0-100, higher is better
    riskLevel: 'low' | 'medium' | 'high';
    isRepeatOffender: boolean;
}

export interface PropertyCashFlow {
    propertyId: string;
    propertyName: string;
    period: { start: Date; end: Date };
    income: {
        expected: number;
        collected: number;
        outstanding: number;
        collectionRate: number;
    };
    expenses: {
        maintenance: number;
        other: number;
        total: number;
    };
    netCashFlow: number;
    profitMargin: number;
    status: 'positive' | 'neutral' | 'negative';
    trend: 'improving' | 'stable' | 'declining';
}

export interface FinancialHealth {
    overallScore: number; // 0-100
    status: 'healthy' | 'attention' | 'risk';
    collectionRate: number;
    overduePercentage: number;
    averageDaysToPayment: number;
    riskFactors: string[];
    recommendations: { en: string; ar: string }[];
}

export interface CashFlowForecast {
    labels: string[];
    expected: number[];
    projected: number[]; // Adjusted for historical collection rate
    expenses: number[];
}

export interface GracePeriodConfig {
    standardDays: number;
    warningThreshold: number; // days before grace ends
    escalationThresholds: number[]; // days after due for each level
}

// ========================
// DEFAULT CONFIGURATION
// ========================

const DEFAULT_GRACE_CONFIG: GracePeriodConfig = {
    standardDays: 7,
    warningThreshold: 2,
    escalationThresholds: [7, 14, 30, 60] // Level 0, 1, 2, 3
};

// ========================
// PAYMENT ANALYSIS
// ========================

export function analyzePayment(
    payment: Payment,
    config: GracePeriodConfig = DEFAULT_GRACE_CONFIG
): PaymentAnalysis {
    const now = new Date();
    const dueDate = new Date(payment.dueDate);
    const gracePeriodEnd = new Date(dueDate);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + config.standardDays);

    // Calculate days overdue
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysOverdue = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / msPerDay));

    // Determine status
    let status: PaymentAnalysis['status'];
    if (payment.status === 'paid') {
        status = 'on_time';
    } else if (now <= dueDate) {
        status = 'on_time';
    } else if (now <= gracePeriodEnd) {
        status = 'grace_period';
    } else if (daysOverdue <= config.escalationThresholds[2]) {
        status = 'overdue';
    } else {
        status = 'severely_overdue';
    }

    // Calculate escalation level
    let escalationLevel: 0 | 1 | 2 | 3 = 0;
    if (daysOverdue > config.escalationThresholds[2]) escalationLevel = 3;
    else if (daysOverdue > config.escalationThresholds[1]) escalationLevel = 2;
    else if (daysOverdue > config.escalationThresholds[0]) escalationLevel = 1;

    // Calculate risk score
    let riskScore = 0;
    if (status === 'grace_period') riskScore = 20;
    else if (status === 'overdue') riskScore = 50 + (daysOverdue - config.standardDays);
    else if (status === 'severely_overdue') riskScore = Math.min(100, 80 + (daysOverdue - 30));

    return {
        paymentId: payment.id,
        status,
        daysOverdue,
        gracePeriodEnd: payment.status !== 'paid' ? gracePeriodEnd : null,
        isWithinGrace: status === 'grace_period',
        escalationLevel,
        riskScore: Math.min(100, riskScore)
    };
}

// ========================
// TENANT PAYMENT HISTORY
// ========================

export function analyzeTenantPaymentHistory(
    tenantId: string,
    tenantName: string,
    payments: Payment[]
): TenantPaymentHistory {
    const tenantPayments = payments.filter(p => {
        // Find payments for this tenant (via contract relationship)
        return p.tenantName === tenantName;
    });

    if (tenantPayments.length === 0) {
        return {
            tenantId,
            tenantName,
            totalPayments: 0,
            onTimePayments: 0,
            latePayments: 0,
            missedPayments: 0,
            averageDaysLate: 0,
            totalAmountPaid: 0,
            totalAmountOutstanding: 0,
            paymentScore: 100,
            riskLevel: 'low',
            isRepeatOffender: false
        };
    }

    let onTimePayments = 0;
    let latePayments = 0;
    let missedPayments = 0;
    let totalDaysLate = 0;
    let totalAmountPaid = 0;
    let totalAmountOutstanding = 0;

    tenantPayments.forEach(payment => {
        const analysis = analyzePayment(payment);

        if (payment.status === 'paid') {
            totalAmountPaid += payment.amount;

            // Check if it was paid on time (using paidAt vs dueDate)
            if (payment.paidAt) {
                const paidDate = new Date(payment.paidAt);
                const dueDate = new Date(payment.dueDate);
                const gracePeriod = new Date(dueDate);
                gracePeriod.setDate(gracePeriod.getDate() + DEFAULT_GRACE_CONFIG.standardDays);

                if (paidDate <= gracePeriod) {
                    onTimePayments++;
                } else {
                    latePayments++;
                    const msPerDay = 24 * 60 * 60 * 1000;
                    totalDaysLate += Math.floor((paidDate.getTime() - dueDate.getTime()) / msPerDay);
                }
            } else {
                onTimePayments++; // Assume on time if no paidAt date
            }
        } else if (analysis.status === 'overdue' || analysis.status === 'severely_overdue') {
            missedPayments++;
            totalAmountOutstanding += payment.amount;
            totalDaysLate += analysis.daysOverdue;
        } else {
            totalAmountOutstanding += payment.amount;
        }
    });

    const totalPayments = tenantPayments.length;
    const averageDaysLate = (latePayments + missedPayments) > 0
        ? totalDaysLate / (latePayments + missedPayments)
        : 0;

    // Calculate payment score (0-100, higher is better)
    const onTimeRate = totalPayments > 0 ? (onTimePayments / totalPayments) * 100 : 100;
    const latePenalty = Math.min(30, averageDaysLate);
    const missedPenalty = missedPayments * 10;
    const paymentScore = Math.max(0, Math.round(onTimeRate - latePenalty - missedPenalty));

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (paymentScore < 50 || missedPayments >= 3) riskLevel = 'high';
    else if (paymentScore < 70 || missedPayments >= 1) riskLevel = 'medium';

    // Check if repeat offender (3+ late payments)
    const isRepeatOffender = (latePayments + missedPayments) >= 3;

    // Log if repeat offender detected
    if (isRepeatOffender) {
        SystemLogger.logWarning(
            'payment',
            'repeat_offender_detected',
            `Tenant ${tenantName} identified as repeat late payer`,
            `تم تحديد المستأجر ${tenantName} كمتأخر متكرر في السداد`,
            { tenantId, latePayments, missedPayments }
        );
    }

    return {
        tenantId,
        tenantName,
        totalPayments,
        onTimePayments,
        latePayments,
        missedPayments,
        averageDaysLate: Math.round(averageDaysLate),
        totalAmountPaid,
        totalAmountOutstanding,
        paymentScore,
        riskLevel,
        isRepeatOffender
    };
}

// ========================
// PROPERTY CASH FLOW
// ========================

export function calculatePropertyCashFlow(
    property: Property,
    units: Unit[],
    contracts: Contract[],
    payments: Payment[],
    maintenanceCosts: number,
    periodStart: Date,
    periodEnd: Date
): PropertyCashFlow {
    const propertyUnits = units.filter(u => u.propertyId === property.id);
    const propertyContracts = contracts.filter(c =>
        c.propertyId === property.id &&
        c.status === 'active'
    );

    // Calculate expected income (sum of all active contract rents for the period)
    let expectedIncome = 0;
    propertyContracts.forEach(contract => {
        // Calculate months in period
        const monthsInPeriod = Math.ceil(
            (periodEnd.getTime() - periodStart.getTime()) / (30 * 24 * 60 * 60 * 1000)
        );
        expectedIncome += contract.rentAmount * monthsInPeriod;
    });

    // Calculate collected income
    const periodPayments = payments.filter(p => {
        const dueDate = new Date(p.dueDate);
        return propertyUnits.some(u => u.unitNo === p.unitNo) &&
            dueDate >= periodStart &&
            dueDate <= periodEnd;
    });

    const collectedIncome = periodPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

    const outstandingIncome = periodPayments
        .filter(p => p.status !== 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

    const collectionRate = expectedIncome > 0
        ? (collectedIncome / expectedIncome) * 100
        : 100;

    // Calculate expenses
    const totalExpenses = maintenanceCosts;

    // Calculate net cash flow
    const netCashFlow = collectedIncome - totalExpenses; const profitMargin = collectedIncome > 0
        ? ((collectedIncome - totalExpenses) / collectedIncome) * 100
        : 0;

    // Determine status
    let status: 'positive' | 'neutral' | 'negative' = 'positive';
    if (netCashFlow < 0) status = 'negative';
    else if (profitMargin < 20) status = 'neutral';

    return {
        propertyId: property.id,
        propertyName: property.name,
        period: { start: periodStart, end: periodEnd },
        income: {
            expected: expectedIncome,
            collected: collectedIncome,
            outstanding: outstandingIncome,
            collectionRate
        },
        expenses: {
            maintenance: maintenanceCosts,
            other: 0,
            total: totalExpenses
        },
        netCashFlow,
        profitMargin,
        status,
        trend: 'stable' // Would need historical data to calculate
    };
}

// ========================
// FINANCIAL HEALTH
// ========================

export function assessFinancialHealth(
    payments: Payment[],
    contracts: Contract[]
): FinancialHealth {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Recent payments analysis
    const recentPayments = payments.filter(p => {
        const dueDate = new Date(p.dueDate);
        return dueDate >= thirtyDaysAgo && dueDate <= now;
    });

    // Calculate collection rate
    const totalExpected = recentPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalCollected = recentPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 100;

    // Calculate overdue percentage
    const overduePayments = payments.filter(p => {
        if (p.status === 'paid') return false;
        const analysis = analyzePayment(p);
        return analysis.status === 'overdue' || analysis.status === 'severely_overdue';
    });
    const overduePercentage = payments.length > 0
        ? (overduePayments.length / payments.length) * 100
        : 0;

    // Calculate average days to payment
    const paidPayments = payments.filter(p => p.status === 'paid' && p.paidAt);
    let totalDaysToPayment = 0;
    paidPayments.forEach(p => {
        const dueDate = new Date(p.dueDate);
        const paidDate = new Date(p.paidAt!);
        const msPerDay = 24 * 60 * 60 * 1000;
        const days = Math.floor((paidDate.getTime() - dueDate.getTime()) / msPerDay);
        totalDaysToPayment += Math.max(0, days);
    });
    const averageDaysToPayment = paidPayments.length > 0
        ? totalDaysToPayment / paidPayments.length
        : 0;

    // Identify risk factors
    const riskFactors: string[] = [];
    if (collectionRate < 80) riskFactors.push('Low collection rate');
    if (overduePercentage > 20) riskFactors.push('High overdue percentage');
    if (averageDaysToPayment > 14) riskFactors.push('Slow payment velocity');
    if (overduePayments.length > 5) riskFactors.push('Multiple overdue payments');

    // Calculate overall score
    let overallScore = 100;
    overallScore -= Math.max(0, (100 - collectionRate) * 0.5);
    overallScore -= overduePercentage * 0.3;
    overallScore -= Math.min(20, averageDaysToPayment);
    overallScore = Math.max(0, Math.round(overallScore));

    // Determine status
    let status: 'healthy' | 'attention' | 'risk' = 'healthy';
    if (overallScore < 50 || riskFactors.length >= 3) status = 'risk';
    else if (overallScore < 70 || riskFactors.length >= 1) status = 'attention';

    // Generate recommendations
    const recommendations: { en: string; ar: string }[] = [];
    if (collectionRate < 80) {
        recommendations.push({
            en: 'Improve collection process with automated reminders',
            ar: 'تحسين عملية التحصيل بواسطة التذكيرات الآلية'
        });
    }
    if (overduePercentage > 20) {
        recommendations.push({
            en: 'Review tenant screening criteria',
            ar: 'مراجعة معايير فحص المستأجرين'
        });
    }
    if (averageDaysToPayment > 14) {
        recommendations.push({
            en: 'Consider early payment incentives',
            ar: 'النظر في حوافز الدفع المبكر'
        });
    }

    return {
        overallScore,
        status,
        collectionRate,
        overduePercentage,
        averageDaysToPayment: Math.round(averageDaysToPayment),
        riskFactors,
        recommendations
    };
}

// ========================
// AUTOMATED ACTIONS
// ========================

export function detectPaymentIssues(
    payments: Payment[],
    config: GracePeriodConfig = DEFAULT_GRACE_CONFIG
): {
    withinGrace: Payment[];
    overdue: Payment[];
    severelyOverdue: Payment[];
    needsEscalation: { payment: Payment; level: number }[];
} {
    const withinGrace: Payment[] = [];
    const overdue: Payment[] = [];
    const severelyOverdue: Payment[] = [];
    const needsEscalation: { payment: Payment; level: number }[] = [];

    payments.forEach(payment => {
        if (payment.status === 'paid') return;

        const analysis = analyzePayment(payment, config);

        if (analysis.status === 'grace_period') {
            withinGrace.push(payment);
        } else if (analysis.status === 'overdue') {
            overdue.push(payment);
            if (analysis.escalationLevel > 0) {
                needsEscalation.push({ payment, level: analysis.escalationLevel });
            }
        } else if (analysis.status === 'severely_overdue') {
            severelyOverdue.push(payment);
            needsEscalation.push({ payment, level: analysis.escalationLevel });

            // Log critical issue
            SystemLogger.logCritical(
                'payment',
                'severe_overdue',
                `Severely overdue payment: ${payment.amount} SAR`,
                `دفعة متأخرة بشكل حاد: ${payment.amount} ر.س`,
                { paymentId: payment.id, daysOverdue: analysis.daysOverdue }
            );
        }
    });

    return { withinGrace, overdue, severelyOverdue, needsEscalation };
}

// ========================
// CASH FLOW FORECASTING
// ========================

export function calculateCashFlowForecast(
    contracts: Contract[],
    payments: Payment[]
): CashFlowForecast {
    // Calculate real historical collection rate
    const recentPayments = payments.slice(-50); // Look at last 50 payments
    const collected = recentPayments.filter(p => p.status === 'paid').length;
    const historicalCollectionRate = recentPayments.length > 0 ? collected / recentPayments.length : 0.95;

    const labels: string[] = [];
    const expected: number[] = [];
    const projected: number[] = [];
    const expenses: number[] = [];

    const now = new Date();

    for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const monthAr = d.toLocaleDateString('ar-SA', { month: 'long' });
        labels.push(monthAr);

        // Sum up all contract rents active in this month
        let monthExpected = 0;
        contracts.forEach(c => {
            const start = new Date(c.startDate);
            const end = new Date(c.endDate);
            if (d >= start && d <= end && c.status === 'active') {
                monthExpected += c.rentAmount;
            }
        });

        expected.push(monthExpected);
        projected.push(Math.round(monthExpected * historicalCollectionRate));
        expenses.push(Math.round(monthExpected * 0.15)); // Estimate 15% expenses
    }

    return { labels, expected, projected, expenses };
}

// ========================
// EXPORT
// ========================

export const FinancialBehaviorEngine = {
    // Configuration
    DEFAULT_GRACE_CONFIG,

    // Analysis
    analyzePayment,
    analyzeTenantPaymentHistory,
    calculatePropertyCashFlow,
    assessFinancialHealth,
    calculateCashFlowForecast,

    // Detection
    detectPaymentIssues
};

export default FinancialBehaviorEngine;
