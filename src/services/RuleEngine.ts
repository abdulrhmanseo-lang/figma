// Rule Engine for Arkan PMS
// Configurable automation rules that execute silently
// NO UI CHANGES - Backend only

import { SystemLogger } from './SystemLogger';

// ========================
// TYPES
// ========================

export type RuleTrigger =
    | 'payment.created'
    | 'payment.overdue'
    | 'payment.paid'
    | 'contract.created'
    | 'contract.expiring'
    | 'contract.expired'
    | 'maintenance.created'
    | 'maintenance.escalated'
    | 'maintenance.resolved'
    | 'daily_check'
    | 'weekly_check'
    | 'monthly_check';

export type RuleAction =
    | 'LOG_INFO'
    | 'LOG_WARNING'
    | 'LOG_CRITICAL'
    | 'FLAG_ENTITY'
    | 'ESCALATE'
    | 'NOTIFY_INTERNAL'
    | 'UPDATE_STATUS'
    | 'TRIGGER_RULE';

export type Severity = 'info' | 'attention' | 'risk' | 'critical';

export interface RuleCondition {
    field: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'contains' | 'in';
    value: any;
}

export interface Rule {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    trigger: RuleTrigger;
    conditions: RuleCondition[];
    conditionLogic: 'AND' | 'OR';
    action: RuleAction;
    actionParams?: Record<string, any>;
    severity: Severity;
    enabled: boolean;
    priority: number; // Lower number = higher priority
    cooldownMinutes?: number; // Prevent multiple triggers
    lastTriggered?: string;
    createdAt: string;
}

export interface RuleExecutionResult {
    ruleId: string;
    ruleName: string;
    triggered: boolean;
    action: RuleAction;
    timestamp: string;
    context: Record<string, any>;
    result?: any;
}

export interface RuleEngineStats {
    totalRules: number;
    enabledRules: number;
    executionsToday: number;
    executionsThisWeek: number;
    topTriggeredRules: { ruleId: string; count: number }[];
}

// ========================
// PREDEFINED RULES
// ========================

const PREDEFINED_RULES: Rule[] = [
    // Payment Rules
    {
        id: 'PAYMENT_GRACE_WARNING',
        name: 'Payment Grace Period Warning',
        nameAr: 'تحذير فترة السماح للدفع',
        description: 'Log warning when payment enters grace period',
        descriptionAr: 'تسجيل تحذير عند دخول الدفعة فترة السماح',
        trigger: 'daily_check',
        conditions: [
            { field: 'daysOverdue', operator: '>', value: 0 },
            { field: 'daysOverdue', operator: '<=', value: 7 }
        ],
        conditionLogic: 'AND',
        action: 'LOG_WARNING',
        severity: 'attention',
        enabled: true,
        priority: 2,
        createdAt: new Date().toISOString()
    },
    {
        id: 'PAYMENT_OVERDUE_ALERT',
        name: 'Payment Overdue Alert',
        nameAr: 'تنبيه تأخر الدفع',
        description: 'Alert when payment exceeds grace period',
        descriptionAr: 'تنبيه عند تجاوز الدفعة فترة السماح',
        trigger: 'daily_check',
        conditions: [
            { field: 'daysOverdue', operator: '>', value: 7 },
            { field: 'daysOverdue', operator: '<=', value: 14 }
        ],
        conditionLogic: 'AND',
        action: 'LOG_WARNING',
        actionParams: { escalationLevel: 1 },
        severity: 'attention',
        enabled: true,
        priority: 1,
        createdAt: new Date().toISOString()
    },
    {
        id: 'PAYMENT_SEVERE_OVERDUE',
        name: 'Severe Payment Overdue',
        nameAr: 'تأخر شديد في الدفع',
        description: 'Critical alert for severely overdue payments',
        descriptionAr: 'تنبيه حرج للدفعات المتأخرة بشكل شديد',
        trigger: 'daily_check',
        conditions: [
            { field: 'daysOverdue', operator: '>', value: 30 }
        ],
        conditionLogic: 'AND',
        action: 'LOG_CRITICAL',
        actionParams: { escalationLevel: 3 },
        severity: 'critical',
        enabled: true,
        priority: 0,
        createdAt: new Date().toISOString()
    },
    {
        id: 'REPEAT_LATE_PAYER',
        name: 'Repeat Late Payer Detection',
        nameAr: 'كشف المتأخر المتكرر',
        description: 'Flag tenant with 3+ late payments',
        descriptionAr: 'تمييز المستأجر بـ 3+ دفعات متأخرة',
        trigger: 'payment.paid',
        conditions: [
            { field: 'latePaymentCount', operator: '>=', value: 3 }
        ],
        conditionLogic: 'AND',
        action: 'FLAG_ENTITY',
        actionParams: { flagType: 'repeat_offender' },
        severity: 'risk',
        enabled: true,
        priority: 1,
        createdAt: new Date().toISOString()
    },

    // Contract Rules
    {
        id: 'CONTRACT_EXPIRING_30',
        name: 'Contract Expiring in 30 Days',
        nameAr: 'انتهاء العقد خلال 30 يوم',
        description: 'Alert when contract expires within 30 days',
        descriptionAr: 'تنبيه عند انتهاء العقد خلال 30 يوم',
        trigger: 'daily_check',
        conditions: [
            { field: 'daysToExpiry', operator: '<=', value: 30 },
            { field: 'daysToExpiry', operator: '>', value: 7 }
        ],
        conditionLogic: 'AND',
        action: 'LOG_INFO',
        severity: 'attention',
        enabled: true,
        priority: 2,
        createdAt: new Date().toISOString()
    },
    {
        id: 'CONTRACT_EXPIRING_7',
        name: 'Contract Expiring in 7 Days',
        nameAr: 'انتهاء العقد خلال 7 أيام',
        description: 'Urgent alert when contract expires within 7 days',
        descriptionAr: 'تنبيه عاجل عند انتهاء العقد خلال 7 أيام',
        trigger: 'daily_check',
        conditions: [
            { field: 'daysToExpiry', operator: '<=', value: 7 },
            { field: 'daysToExpiry', operator: '>', value: 0 }
        ],
        conditionLogic: 'AND',
        action: 'LOG_WARNING',
        severity: 'risk',
        enabled: true,
        priority: 1,
        createdAt: new Date().toISOString()
    },

    // Maintenance Rules
    {
        id: 'MAINTENANCE_SLA_WARNING',
        name: 'Maintenance SLA Warning',
        nameAr: 'تحذير SLA الصيانة',
        description: 'Warn when maintenance approaches SLA deadline',
        descriptionAr: 'تحذير عند اقتراب الصيانة من موعد SLA',
        trigger: 'daily_check',
        conditions: [
            { field: 'slaRemainingHours', operator: '<=', value: 24 },
            { field: 'slaRemainingHours', operator: '>', value: 0 }
        ],
        conditionLogic: 'AND',
        action: 'LOG_WARNING',
        severity: 'attention',
        enabled: true,
        priority: 1,
        createdAt: new Date().toISOString()
    },
    {
        id: 'MAINTENANCE_SLA_BREACH',
        name: 'Maintenance SLA Breach',
        nameAr: 'خرق SLA الصيانة',
        description: 'Critical alert when maintenance breaches SLA',
        descriptionAr: 'تنبيه حرج عند خرق SLA الصيانة',
        trigger: 'daily_check',
        conditions: [
            { field: 'slaBreached', operator: '==', value: true }
        ],
        conditionLogic: 'AND',
        action: 'ESCALATE',
        actionParams: { escalationLevel: 2 },
        severity: 'critical',
        enabled: true,
        priority: 0,
        createdAt: new Date().toISOString()
    },
    {
        id: 'MAINTENANCE_COST_THRESHOLD',
        name: 'Maintenance Cost Threshold',
        nameAr: 'عتبة تكلفة الصيانة',
        description: 'Flag when maintenance cost exceeds 50% of rent',
        descriptionAr: 'تمييز عندما تتجاوز تكلفة الصيانة 50% من الإيجار',
        trigger: 'maintenance.resolved',
        conditions: [
            { field: 'costPercentOfRent', operator: '>', value: 50 }
        ],
        conditionLogic: 'AND',
        action: 'FLAG_ENTITY',
        actionParams: { flagType: 'high_maintenance_cost' },
        severity: 'risk',
        enabled: true,
        priority: 1,
        createdAt: new Date().toISOString()
    },
    {
        id: 'REPEATED_MAINTENANCE',
        name: 'Repeated Maintenance Issue',
        nameAr: 'مشكلة صيانة متكررة',
        description: 'Alert for recurring maintenance issues',
        descriptionAr: 'تنبيه لمشاكل الصيانة المتكررة',
        trigger: 'maintenance.created',
        conditions: [
            { field: 'issueCount', operator: '>=', value: 3 }
        ],
        conditionLogic: 'AND',
        action: 'LOG_WARNING',
        severity: 'attention',
        enabled: true,
        priority: 2,
        createdAt: new Date().toISOString()
    }
];

// ========================
// RULE ENGINE STATE
// ========================

class RuleEngineState {
    private rules: Rule[] = [...PREDEFINED_RULES];
    private executionLog: RuleExecutionResult[] = [];
    private maxLogEntries = 1000;

    getRules(): Rule[] {
        return this.rules.filter(r => r.enabled).sort((a, b) => a.priority - b.priority);
    }

    getAllRules(): Rule[] {
        return this.rules;
    }

    addRule(rule: Rule): void {
        this.rules.push(rule);
    }

    updateRule(ruleId: string, updates: Partial<Rule>): boolean {
        const index = this.rules.findIndex(r => r.id === ruleId);
        if (index === -1) return false;
        this.rules[index] = { ...this.rules[index], ...updates };
        return true;
    }

    enableRule(ruleId: string, enabled: boolean): boolean {
        return this.updateRule(ruleId, { enabled });
    }

    logExecution(result: RuleExecutionResult): void {
        this.executionLog.unshift(result);
        if (this.executionLog.length > this.maxLogEntries) {
            this.executionLog = this.executionLog.slice(0, this.maxLogEntries);
        }
    }

    getExecutionLog(limit?: number): RuleExecutionResult[] {
        return limit ? this.executionLog.slice(0, limit) : this.executionLog;
    }

    getStats(): RuleEngineStats {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        const executionsToday = this.executionLog.filter(e =>
            new Date(e.timestamp) >= startOfDay
        ).length;

        const executionsThisWeek = this.executionLog.filter(e =>
            new Date(e.timestamp) >= startOfWeek
        ).length;

        // Count triggers per rule
        const triggerCounts: Record<string, number> = {};
        this.executionLog.forEach(e => {
            if (e.triggered) {
                triggerCounts[e.ruleId] = (triggerCounts[e.ruleId] || 0) + 1;
            }
        });

        const topTriggeredRules = Object.entries(triggerCounts)
            .map(([ruleId, count]) => ({ ruleId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            totalRules: this.rules.length,
            enabledRules: this.rules.filter(r => r.enabled).length,
            executionsToday,
            executionsThisWeek,
            topTriggeredRules
        };
    }
}

const engineState = new RuleEngineState();

// ========================
// CONDITION EVALUATION
// ========================

function evaluateCondition(condition: RuleCondition, context: Record<string, any>): boolean {
    const fieldValue = context[condition.field];
    const compareValue = condition.value;

    switch (condition.operator) {
        case '>': return fieldValue > compareValue;
        case '<': return fieldValue < compareValue;
        case '>=': return fieldValue >= compareValue;
        case '<=': return fieldValue <= compareValue;
        case '==': return fieldValue === compareValue;
        case '!=': return fieldValue !== compareValue;
        case 'contains':
            return typeof fieldValue === 'string' && fieldValue.includes(compareValue);
        case 'in':
            return Array.isArray(compareValue) && compareValue.includes(fieldValue);
        default:
            return false;
    }
}

function evaluateConditions(rule: Rule, context: Record<string, any>): boolean {
    if (rule.conditions.length === 0) return true;

    const results = rule.conditions.map(c => evaluateCondition(c, context));

    if (rule.conditionLogic === 'AND') {
        return results.every(r => r);
    } else {
        return results.some(r => r);
    }
}

// ========================
// ACTION EXECUTION
// ========================

function executeAction(rule: Rule, context: Record<string, any>): any {
    const params = rule.actionParams || {};

    switch (rule.action) {
        case 'LOG_INFO':
            return SystemLogger.logInfo(
                'rule_engine',
                `rule_triggered_${rule.id}`,
                `Rule "${rule.name}" triggered`,
                `تم تفعيل القاعدة "${rule.nameAr}"`,
                { ruleId: rule.id, context }
            );

        case 'LOG_WARNING':
            return SystemLogger.logWarning(
                'rule_engine',
                `rule_triggered_${rule.id}`,
                `Rule "${rule.name}" triggered`,
                `تم تفعيل القاعدة "${rule.nameAr}"`,
                { ruleId: rule.id, context, severity: rule.severity }
            );

        case 'LOG_CRITICAL':
            return SystemLogger.logCritical(
                'rule_engine',
                `rule_triggered_${rule.id}`,
                `Critical rule "${rule.name}" triggered`,
                `تم تفعيل القاعدة الحرجة "${rule.nameAr}"`,
                { ruleId: rule.id, context }
            );

        case 'FLAG_ENTITY':
            return {
                type: 'flag',
                entityType: context.entityType,
                entityId: context.entityId,
                flagType: params.flagType,
                timestamp: new Date().toISOString()
            };

        case 'ESCALATE':
            return {
                type: 'escalation',
                level: params.escalationLevel || 1,
                entityType: context.entityType,
                entityId: context.entityId,
                timestamp: new Date().toISOString()
            };

        case 'NOTIFY_INTERNAL':
            SystemLogger.logInfo(
                'automation',
                'internal_notification',
                `Internal notification: ${rule.name}`,
                `إشعار داخلي: ${rule.nameAr}`,
                { ruleId: rule.id, ...params }
            );
            return { type: 'notification', sent: true };

        case 'UPDATE_STATUS':
            return {
                type: 'status_update',
                newStatus: params.status,
                entityType: context.entityType,
                entityId: context.entityId
            };

        case 'TRIGGER_RULE':
            if (params.targetRuleId) {
                const targetRule = engineState.getAllRules().find(r => r.id === params.targetRuleId);
                if (targetRule) {
                    return executeRule(targetRule, context);
                }
            }
            return null;

        default:
            return null;
    }
}

// ========================
// RULE EXECUTION
// ========================

function executeRule(rule: Rule, context: Record<string, any>): RuleExecutionResult {
    const triggered = evaluateConditions(rule, context);
    let result: any = null;

    if (triggered) {
        // Check cooldown
        if (rule.cooldownMinutes && rule.lastTriggered) {
            const lastTriggeredDate = new Date(rule.lastTriggered);
            const cooldownMs = rule.cooldownMinutes * 60 * 1000;
            if (Date.now() - lastTriggeredDate.getTime() < cooldownMs) {
                // Still in cooldown
                return {
                    ruleId: rule.id,
                    ruleName: rule.name,
                    triggered: false,
                    action: rule.action,
                    timestamp: new Date().toISOString(),
                    context,
                    result: { skipped: true, reason: 'cooldown' }
                };
            }
        }

        result = executeAction(rule, context);
        engineState.updateRule(rule.id, { lastTriggered: new Date().toISOString() });
    }

    const executionResult: RuleExecutionResult = {
        ruleId: rule.id,
        ruleName: rule.name,
        triggered,
        action: rule.action,
        timestamp: new Date().toISOString(),
        context,
        result
    };

    engineState.logExecution(executionResult);
    return executionResult;
}

// ========================
// PUBLIC API
// ========================

export function runRulesForTrigger(
    trigger: RuleTrigger,
    context: Record<string, any>
): RuleExecutionResult[] {
    const applicableRules = engineState.getRules().filter(r => r.trigger === trigger);
    const results: RuleExecutionResult[] = [];

    applicableRules.forEach(rule => {
        const result = executeRule(rule, context);
        results.push(result);
    });

    return results;
}

export function runPaymentRules(context: {
    paymentId: string;
    amount: number;
    daysOverdue: number;
    tenantName: string;
    latePaymentCount: number;
    entityType?: string;
    entityId?: string;
}): RuleExecutionResult[] {
    return runRulesForTrigger('daily_check', {
        ...context,
        entityType: context.entityType || 'payment',
        entityId: context.entityId || context.paymentId
    });
}

export function runContractRules(context: {
    contractId: string;
    daysToExpiry: number;
    tenantName: string;
    propertyName: string;
    entityType?: string;
    entityId?: string;
}): RuleExecutionResult[] {
    return runRulesForTrigger('daily_check', {
        ...context,
        entityType: context.entityType || 'contract',
        entityId: context.entityId || context.contractId
    });
}

export function runMaintenanceRules(context: {
    requestId: string;
    slaRemainingHours: number;
    slaBreached: boolean;
    priority: string;
    costPercentOfRent?: number;
    issueCount?: number;
    entityType?: string;
    entityId?: string;
}): RuleExecutionResult[] {
    return runRulesForTrigger('daily_check', {
        ...context,
        entityType: context.entityType || 'maintenance',
        entityId: context.entityId || context.requestId
    });
}

export function runDailyCheck(allContexts: {
    payments: any[];
    contracts: any[];
    maintenance: any[];
}): {
    paymentResults: RuleExecutionResult[];
    contractResults: RuleExecutionResult[];
    maintenanceResults: RuleExecutionResult[];
} {
    const paymentResults: RuleExecutionResult[] = [];
    const contractResults: RuleExecutionResult[] = [];
    const maintenanceResults: RuleExecutionResult[] = [];

    allContexts.payments.forEach(ctx => {
        paymentResults.push(...runPaymentRules(ctx));
    });

    allContexts.contracts.forEach(ctx => {
        contractResults.push(...runContractRules(ctx));
    });

    allContexts.maintenance.forEach(ctx => {
        maintenanceResults.push(...runMaintenanceRules(ctx));
    });

    SystemLogger.logInfo(
        'rule_engine',
        'daily_check_complete',
        `Daily check completed: ${paymentResults.length + contractResults.length + maintenanceResults.length} rules evaluated`,
        `اكتمل الفحص اليومي: تم تقييم ${paymentResults.length + contractResults.length + maintenanceResults.length} قاعدة`,
        {
            paymentRules: paymentResults.length,
            contractRules: contractResults.length,
            maintenanceRules: maintenanceResults.length
        }
    );

    return { paymentResults, contractResults, maintenanceResults };
}

// ========================
// MANAGEMENT API
// ========================

export function getRules(): Rule[] {
    return engineState.getAllRules();
}

export function getEnabledRules(): Rule[] {
    return engineState.getRules();
}

export function enableRule(ruleId: string, enabled: boolean): boolean {
    return engineState.enableRule(ruleId, enabled);
}

export function addCustomRule(rule: Omit<Rule, 'id' | 'createdAt'>): Rule {
    const newRule: Rule = {
        ...rule,
        id: `CUSTOM_${Date.now()}`,
        createdAt: new Date().toISOString()
    };
    engineState.addRule(newRule);
    return newRule;
}

export function getExecutionLog(limit?: number): RuleExecutionResult[] {
    return engineState.getExecutionLog(limit);
}

export function getRuleStats(): RuleEngineStats {
    return engineState.getStats();
}

// ========================
// EXPORT
// ========================

export const RuleEngine = {
    // Execution
    runRulesForTrigger,
    runPaymentRules,
    runContractRules,
    runMaintenanceRules,
    runDailyCheck,

    // Management
    getRules,
    getEnabledRules,
    enableRule,
    addCustomRule,

    // Logging
    getExecutionLog,
    getRuleStats,

    // Predefined rules reference
    PREDEFINED_RULES
};

export default RuleEngine;
