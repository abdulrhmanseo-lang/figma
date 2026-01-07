// System Intelligence Core for Arkan PMS
// Central hub for event observation, state evaluation, and cross-module correlation
// NO UI CHANGES - Backend only

import type { Property, Unit, Contract, Payment, MaintenanceRequest } from '../types/database';
import { SystemLogger } from './SystemLogger';
import { FinancialBehaviorEngine, type FinancialHealth, type PropertyCashFlow } from './FinancialBehaviorEngine';
import { RuleEngine } from './RuleEngine';
import { MaintenanceIntelligenceEngine } from './MaintenanceIntelligenceEngine';
import { ReportsIntelligenceEngine } from './ReportsIntelligenceEngine';

// ========================
// TYPES
// ========================

export type SystemState = 'healthy' | 'attention' | 'risk';

export interface EntityState {
    entityType: 'property' | 'unit' | 'contract' | 'tenant';
    entityId: string;
    entityName: string;
    state: SystemState;
    score: number; // 0-100
    issues: SystemIssue[];
    lastEvaluated: string;
}

export interface SystemIssue {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    messageAr: string;
    entityType: string;
    entityId: string;
    detectedAt: string;
    resolved: boolean;
    resolvedAt?: string;
}

export interface SystemHealthSummary {
    overallState: SystemState;
    overallScore: number;
    financialHealth: FinancialHealth;
    propertyStates: EntityState[];
    activeIssues: SystemIssue[];
    issuesByPriority: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    trends: {
        paymentCollection: 'improving' | 'stable' | 'declining';
        maintenanceLoad: 'decreasing' | 'stable' | 'increasing';
        occupancy: 'improving' | 'stable' | 'declining';
    };
    lastFullEvaluation: string;
}

export interface CorrelationInsight {
    type: string;
    entities: { type: string; id: string; name: string }[];
    insight: string;
    insightAr: string;
    severity: 'info' | 'warning' | 'critical';
    recommendedAction?: string;
    recommendedActionAr?: string;
}

// ========================
// STATE STORAGE
// ========================

class IntelligenceState {
    private entityStates: Map<string, EntityState> = new Map();
    private issues: SystemIssue[] = [];
    private correlationInsights: CorrelationInsight[] = [];
    private lastFullEvaluation: string | null = null;

    setEntityState(key: string, state: EntityState): void {
        this.entityStates.set(key, state);
    }

    getEntityState(key: string): EntityState | undefined {
        return this.entityStates.get(key);
    }

    getAllEntityStates(): EntityState[] {
        return Array.from(this.entityStates.values());
    }

    addIssue(issue: SystemIssue): void {
        this.issues.unshift(issue);
        // Keep max 500 issues
        if (this.issues.length > 500) {
            this.issues = this.issues.slice(0, 500);
        }
    }

    getActiveIssues(): SystemIssue[] {
        return this.issues.filter(i => !i.resolved);
    }

    resolveIssue(issueId: string): boolean {
        const issue = this.issues.find(i => i.id === issueId);
        if (issue) {
            issue.resolved = true;
            issue.resolvedAt = new Date().toISOString();
            return true;
        }
        return false;
    }

    addInsight(insight: CorrelationInsight): void {
        this.correlationInsights.unshift(insight);
        if (this.correlationInsights.length > 100) {
            this.correlationInsights = this.correlationInsights.slice(0, 100);
        }
    }

    getInsights(): CorrelationInsight[] {
        return this.correlationInsights;
    }

    setLastEvaluation(timestamp: string): void {
        this.lastFullEvaluation = timestamp;
    }

    getLastEvaluation(): string | null {
        return this.lastFullEvaluation;
    }
}

const intelligenceState = new IntelligenceState();

// ========================
// UTILITY FUNCTIONS
// ========================

function generateId(): string {
    return `issue-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

function calculateOverallState(score: number): SystemState {
    if (score >= 70) return 'healthy';
    if (score >= 50) return 'attention';
    return 'risk';
}

// ========================
// PROPERTY EVALUATION
// ========================

export function evaluateProperty(
    property: Property,
    units: Unit[],
    contracts: Contract[],
    payments: Payment[],
    maintenanceRequests: MaintenanceRequest[]
): EntityState {
    const propertyUnits = units.filter(u => u.propertyId === property.id);
    const propertyContracts = contracts.filter(c => c.propertyId === property.id);
    const propertyPayments = payments.filter(p =>
        propertyUnits.some(u => u.unitNo === p.unitNo)
    );
    const propertyMaintenance = maintenanceRequests.filter(m => m.propertyId === property.id);

    const issues: SystemIssue[] = [];
    let score = 100;

    // 1. Occupancy Check
    const occupiedUnits = propertyUnits.filter(u => u.status === 'occupied').length;
    const occupancyRate = propertyUnits.length > 0
        ? (occupiedUnits / propertyUnits.length) * 100
        : 0;

    if (occupancyRate < 50) {
        score -= 20;
        issues.push({
            id: generateId(),
            type: 'low_occupancy',
            severity: 'high',
            message: `Low occupancy rate: ${occupancyRate.toFixed(0)}%`,
            messageAr: `نسبة إشغال منخفضة: ${occupancyRate.toFixed(0)}%`,
            entityType: 'property',
            entityId: property.id,
            detectedAt: new Date().toISOString(),
            resolved: false
        });
    } else if (occupancyRate < 70) {
        score -= 10;
        issues.push({
            id: generateId(),
            type: 'below_average_occupancy',
            severity: 'medium',
            message: `Below average occupancy: ${occupancyRate.toFixed(0)}%`,
            messageAr: `إشغال أقل من المتوسط: ${occupancyRate.toFixed(0)}%`,
            entityType: 'property',
            entityId: property.id,
            detectedAt: new Date().toISOString(),
            resolved: false
        });
    }

    // 2. Payment Issues Check
    const overduePayments = propertyPayments.filter(p => {
        if (p.status === 'paid') return false;
        const analysis = FinancialBehaviorEngine.analyzePayment(p);
        return analysis.status === 'overdue' || analysis.status === 'severely_overdue';
    });

    if (overduePayments.length > 3) {
        score -= 25;
        issues.push({
            id: generateId(),
            type: 'multiple_overdue_payments',
            severity: 'critical',
            message: `${overduePayments.length} overdue payments`,
            messageAr: `${overduePayments.length} دفعات متأخرة`,
            entityType: 'property',
            entityId: property.id,
            detectedAt: new Date().toISOString(),
            resolved: false
        });
    } else if (overduePayments.length > 0) {
        score -= overduePayments.length * 5;
        issues.push({
            id: generateId(),
            type: 'overdue_payments',
            severity: 'medium',
            message: `${overduePayments.length} overdue payment(s)`,
            messageAr: `${overduePayments.length} دفعة متأخرة`,
            entityType: 'property',
            entityId: property.id,
            detectedAt: new Date().toISOString(),
            resolved: false
        });
    }

    // 3. Maintenance Issues Check
    const pendingMaintenance = propertyMaintenance.filter(m =>
        m.status !== 'done' && m.status !== 'canceled'
    );
    const urgentMaintenance = pendingMaintenance.filter(m => m.priority === 'urgent');

    if (urgentMaintenance.length > 0) {
        score -= 15;
        issues.push({
            id: generateId(),
            type: 'urgent_maintenance',
            severity: 'high',
            message: `${urgentMaintenance.length} urgent maintenance request(s)`,
            messageAr: `${urgentMaintenance.length} طلب صيانة عاجل`,
            entityType: 'property',
            entityId: property.id,
            detectedAt: new Date().toISOString(),
            resolved: false
        });
    }

    if (pendingMaintenance.length > 5) {
        score -= 10;
        issues.push({
            id: generateId(),
            type: 'maintenance_backlog',
            severity: 'medium',
            message: `${pendingMaintenance.length} pending maintenance requests`,
            messageAr: `${pendingMaintenance.length} طلب صيانة معلق`,
            entityType: 'property',
            entityId: property.id,
            detectedAt: new Date().toISOString(),
            resolved: false
        });
    }

    // 4. Contract Issues Check
    const now = new Date();
    const expiringContracts = propertyContracts.filter(c => {
        if (c.status !== 'active') return false;
        const endDate = new Date(c.endDate);
        const daysToExpiry = Math.floor((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        return daysToExpiry <= 30 && daysToExpiry > 0;
    });

    if (expiringContracts.length > 0) {
        score -= 5;
        issues.push({
            id: generateId(),
            type: 'expiring_contracts',
            severity: 'low',
            message: `${expiringContracts.length} contract(s) expiring soon`,
            messageAr: `${expiringContracts.length} عقد على وشك الانتهاء`,
            entityType: 'property',
            entityId: property.id,
            detectedAt: new Date().toISOString(),
            resolved: false
        });
    }

    // Normalize score
    score = Math.max(0, Math.min(100, score));

    const entityState: EntityState = {
        entityType: 'property',
        entityId: property.id,
        entityName: property.name,
        state: calculateOverallState(score),
        score,
        issues,
        lastEvaluated: new Date().toISOString()
    };

    // Store state
    intelligenceState.setEntityState(`property-${property.id}`, entityState);

    // Add issues to global tracker
    issues.forEach(issue => intelligenceState.addIssue(issue));

    return entityState;
}

// ========================
// CROSS-MODULE CORRELATION
// ========================

export function correlateData(
    properties: Property[],
    units: Unit[],
    contracts: Contract[],
    payments: Payment[],
    maintenanceRequests: MaintenanceRequest[]
): CorrelationInsight[] {
    const insights: CorrelationInsight[] = [];

    // 1. High Maintenance + Low Collection = Problem Property
    properties.forEach(property => {
        const propertyUnits = units.filter(u => u.propertyId === property.id);
        const propertyPayments = payments.filter(p =>
            propertyUnits.some(u => u.unitNo === p.unitNo)
        );
        const propertyMaintenance = maintenanceRequests.filter(m => m.propertyId === property.id);

        // Calculate maintenance cost to rent ratio
        const totalMaintenanceCost = propertyMaintenance.reduce((sum, m) => sum + m.cost, 0);
        const totalExpectedRent = propertyPayments.reduce((sum, p) => sum + p.amount, 0);

        if (totalExpectedRent > 0) {
            const maintenanceToRentRatio = (totalMaintenanceCost / totalExpectedRent) * 100;

            if (maintenanceToRentRatio > 30) {
                const insight: CorrelationInsight = {
                    type: 'high_maintenance_cost_ratio',
                    entities: [{ type: 'property', id: property.id, name: property.name }],
                    insight: `Property has high maintenance cost (${maintenanceToRentRatio.toFixed(0)}% of rent)`,
                    insightAr: `العقار لديه تكلفة صيانة عالية (${maintenanceToRentRatio.toFixed(0)}% من الإيجار)`,
                    severity: maintenanceToRentRatio > 50 ? 'critical' : 'warning',
                    recommendedAction: 'Review maintenance contracts and unit condition',
                    recommendedActionAr: 'مراجعة عقود الصيانة وحالة الوحدات'
                };
                insights.push(insight);
                intelligenceState.addInsight(insight);
            }
        }
    });

    // 2. Tenant with multiple late payments and maintenance issues
    const tenantIssues = new Map<string, { late: number; maintenance: number }>();

    payments.forEach(p => {
        const analysis = FinancialBehaviorEngine.analyzePayment(p);
        if (analysis.status === 'overdue' || analysis.status === 'severely_overdue') {
            const current = tenantIssues.get(p.tenantName) || { late: 0, maintenance: 0 };
            current.late++;
            tenantIssues.set(p.tenantName, current);
        }
    });

    maintenanceRequests.forEach(m => {
        // Find tenant for this unit
        const contract = contracts.find(c => c.unitId === m.unitId && c.status === 'active');
        if (contract) {
            const current = tenantIssues.get(contract.tenantName) || { late: 0, maintenance: 0 };
            current.maintenance++;
            tenantIssues.set(contract.tenantName, current);
        }
    });

    tenantIssues.forEach((issues, tenantName) => {
        if (issues.late >= 2 && issues.maintenance >= 3) {
            const insight: CorrelationInsight = {
                type: 'problematic_tenant',
                entities: [{ type: 'tenant', id: tenantName, name: tenantName }],
                insight: `Tenant has both payment issues (${issues.late}) and frequent maintenance requests (${issues.maintenance})`,
                insightAr: `المستأجر لديه مشاكل دفع (${issues.late}) وطلبات صيانة متكررة (${issues.maintenance})`,
                severity: 'warning',
                recommendedAction: 'Review tenant situation during contract renewal',
                recommendedActionAr: 'مراجعة وضع المستأجر عند تجديد العقد'
            };
            insights.push(insight);
            intelligenceState.addInsight(insight);
        }
    });

    // 3. Units with repeated same-category maintenance
    const repeatedIssues = MaintenanceIntelligenceEngine.detectRepeatedIssues(maintenanceRequests, 3);
    repeatedIssues.forEach(issue => {
        const insight: CorrelationInsight = {
            type: 'repeated_maintenance_issue',
            entities: [
                { type: 'unit', id: issue.unitId, name: issue.unitNo },
                { type: 'property', id: issue.propertyId, name: issue.propertyName }
            ],
            insight: `Unit has ${issue.occurrences} repeated ${issue.category} issues`,
            insightAr: `الوحدة لديها ${issue.occurrences} مشاكل ${issue.category} متكررة`,
            severity: issue.occurrences >= 5 ? 'critical' : 'warning',
            recommendedAction: 'Consider comprehensive unit inspection',
            recommendedActionAr: 'النظر في فحص شامل للوحدة'
        };
        insights.push(insight);
        intelligenceState.addInsight(insight);
    });

    return insights;
}

// ========================
// FULL SYSTEM EVALUATION
// ========================

export function evaluateSystemHealth(
    properties: Property[],
    units: Unit[],
    contracts: Contract[],
    payments: Payment[],
    maintenanceRequests: MaintenanceRequest[]
): SystemHealthSummary {
    // Log start of evaluation
    const tracker = SystemLogger.trackPerformance('full_system_evaluation');

    // Evaluate each property
    const propertyStates: EntityState[] = [];
    properties.forEach(property => {
        const state = evaluateProperty(property, units, contracts, payments, maintenanceRequests);
        propertyStates.push(state);
    });

    // Get financial health
    const financialHealth = FinancialBehaviorEngine.assessFinancialHealth(payments, contracts);

    // Run correlation analysis
    correlateData(properties, units, contracts, payments, maintenanceRequests);

    // Get active issues
    const activeIssues = intelligenceState.getActiveIssues();

    // Count issues by priority
    const issuesByPriority = {
        critical: activeIssues.filter(i => i.severity === 'critical').length,
        high: activeIssues.filter(i => i.severity === 'high').length,
        medium: activeIssues.filter(i => i.severity === 'medium').length,
        low: activeIssues.filter(i => i.severity === 'low').length
    };

    // Calculate overall score
    const avgPropertyScore = propertyStates.length > 0
        ? propertyStates.reduce((sum, p) => sum + p.score, 0) / propertyStates.length
        : 100;

    let overallScore = (avgPropertyScore + financialHealth.overallScore) / 2;

    // Deduct for critical issues
    overallScore -= issuesByPriority.critical * 5;
    overallScore -= issuesByPriority.high * 2;
    overallScore = Math.max(0, Math.min(100, overallScore));

    const overallState = calculateOverallState(overallScore);

    // Update last evaluation timestamp
    const evaluationTime = new Date().toISOString();
    intelligenceState.setLastEvaluation(evaluationTime);

    // End performance tracking
    tracker(true);

    // Log completion
    SystemLogger.logInfo(
        'system',
        'health_evaluation_complete',
        `System health evaluation complete: ${overallState} (${overallScore.toFixed(0)}%)`,
        `اكتمل تقييم صحة النظام: ${overallState} (${overallScore.toFixed(0)}%)`,
        {
            overallScore,
            overallState,
            propertiesEvaluated: properties.length,
            activeIssues: activeIssues.length
        }
    );

    return {
        overallState,
        overallScore: Math.round(overallScore),
        financialHealth,
        propertyStates,
        activeIssues,
        issuesByPriority,
        trends: {
            paymentCollection: 'stable', // Would need historical data
            maintenanceLoad: 'stable',
            occupancy: 'stable'
        },
        lastFullEvaluation: evaluationTime
    };
}

// ========================
// SCHEDULED CHECKS
// ========================

export function runDailyIntelligenceCheck(
    properties: Property[],
    units: Unit[],
    contracts: Contract[],
    payments: Payment[],
    maintenanceRequests: MaintenanceRequest[]
): {
    healthSummary: SystemHealthSummary;
    ruleResults: ReturnType<typeof RuleEngine.runDailyCheck>;
} {
    SystemLogger.logInfo(
        'system',
        'daily_check_started',
        'Daily intelligence check started',
        'بدء الفحص الذكي اليومي'
    );

    // 1. Run full system evaluation
    const healthSummary = evaluateSystemHealth(
        properties, units, contracts, payments, maintenanceRequests
    );

    // 2. Prepare rule contexts
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;

    const paymentContexts = payments
        .filter(p => p.status !== 'paid')
        .map(p => {
            const dueDate = new Date(p.dueDate);
            const daysOverdue = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / msPerDay));
            const history = FinancialBehaviorEngine.analyzeTenantPaymentHistory(
                '', p.tenantName, payments
            );
            return {
                paymentId: p.id,
                amount: p.amount,
                daysOverdue,
                tenantName: p.tenantName,
                latePaymentCount: history.latePayments + history.missedPayments
            };
        });

    const contractContexts = contracts
        .filter(c => c.status === 'active')
        .map(c => {
            const endDate = new Date(c.endDate);
            const daysToExpiry = Math.floor((endDate.getTime() - now.getTime()) / msPerDay);
            return {
                contractId: c.id,
                daysToExpiry,
                tenantName: c.tenantName,
                propertyName: c.propertyName
            };
        });

    const maintenanceContexts = maintenanceRequests
        .filter(m => m.status !== 'done' && m.status !== 'canceled')
        .map(m => {
            const enhancement = MaintenanceIntelligenceEngine.enhanceMaintenanceRequest(m, maintenanceRequests);
            const slaDeadline = new Date(enhancement.slaResolutionDeadline);
            const slaRemainingHours = Math.floor((slaDeadline.getTime() - now.getTime()) / (60 * 60 * 1000));
            return {
                requestId: m.id,
                slaRemainingHours: Math.max(0, slaRemainingHours),
                slaBreached: slaRemainingHours < 0,
                priority: m.priority,
                issueCount: enhancement.repeatCount || 1
            };
        });

    // 3. Run rules
    const ruleResults = RuleEngine.runDailyCheck({
        payments: paymentContexts,
        contracts: contractContexts,
        maintenance: maintenanceContexts
    });

    SystemLogger.logInfo(
        'system',
        'daily_check_complete',
        'Daily intelligence check completed successfully',
        'اكتمل الفحص الذكي اليومي بنجاح',
        {
            healthScore: healthSummary.overallScore,
            activeIssues: healthSummary.activeIssues.length,
            rulesTriggered: [
                ...ruleResults.paymentResults,
                ...ruleResults.contractResults,
                ...ruleResults.maintenanceResults
            ].filter(r => r.triggered).length
        }
    );

    return { healthSummary, ruleResults };
}

// ========================
// PUBLIC API
// ========================

export function getSystemState(): SystemState {
    const states = intelligenceState.getAllEntityStates();
    if (states.length === 0) return 'healthy';

    const avgScore = states.reduce((sum, s) => sum + s.score, 0) / states.length;
    return calculateOverallState(avgScore);
}

export function getEntityState(entityType: string, entityId: string): EntityState | undefined {
    return intelligenceState.getEntityState(`${entityType}-${entityId}`);
}

export function getAllEntityStates(): EntityState[] {
    return intelligenceState.getAllEntityStates();
}

export function getActiveIssues(): SystemIssue[] {
    return intelligenceState.getActiveIssues();
}

export function resolveIssue(issueId: string): boolean {
    return intelligenceState.resolveIssue(issueId);
}

export function getCorrelationInsights(): CorrelationInsight[] {
    return intelligenceState.getInsights();
}

// ========================
// EXPORT
// ========================

export const SystemIntelligenceCore = {
    // Evaluation
    evaluateProperty,
    evaluateSystemHealth,
    correlateData,

    // Scheduled
    runDailyIntelligenceCheck,

    // State Access
    getSystemState,
    getEntityState,
    getAllEntityStates,
    getActiveIssues,
    resolveIssue,
    getCorrelationInsights
};

export default SystemIntelligenceCore;
