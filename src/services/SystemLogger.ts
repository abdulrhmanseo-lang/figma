// System Logger for Arkan PMS
// Comprehensive event logging and audit trail
// NO UI CHANGES - Backend only

// ========================
// LOG TYPES
// ========================

export type LogLevel = 'info' | 'warning' | 'error' | 'critical' | 'debug';
export type LogCategory =
    | 'payment'
    | 'contract'
    | 'maintenance'
    | 'property'
    | 'unit'
    | 'tenant'
    | 'system'
    | 'security'
    | 'rule_engine'
    | 'automation';

export interface LogEntry {
    id: string;
    timestamp: string;
    level: LogLevel;
    category: LogCategory;
    action: string;
    message: string;
    messageAr: string;
    details?: Record<string, any>;
    entityType?: string;
    entityId?: string;
    userId?: string;
    correlationId?: string;
    metadata?: Record<string, any>;
}

export interface AuditTrailEntry {
    id: string;
    timestamp: string;
    userId: string;
    userEmail?: string;
    action: string;
    entityType: string;
    entityId: string;
    changes?: {
        field: string;
        oldValue: any;
        newValue: any;
    }[];
    ipAddress?: string;
    userAgent?: string;
}

export interface PerformanceMetric {
    operation: string;
    startTime: number;
    endTime: number;
    duration: number;
    success: boolean;
    metadata?: Record<string, any>;
}

// ========================
// IN-MEMORY LOG STORAGE
// ========================

class LogStorage {
    private logs: LogEntry[] = [];
    private auditTrail: AuditTrailEntry[] = [];
    private performanceMetrics: PerformanceMetric[] = [];
    private maxLogs = 10000;
    private maxAuditEntries = 5000;
    private maxMetrics = 1000;

    addLog(entry: LogEntry): void {
        this.logs.unshift(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }
    }

    addAuditEntry(entry: AuditTrailEntry): void {
        this.auditTrail.unshift(entry);
        if (this.auditTrail.length > this.maxAuditEntries) {
            this.auditTrail = this.auditTrail.slice(0, this.maxAuditEntries);
        }
    }

    addMetric(metric: PerformanceMetric): void {
        this.performanceMetrics.unshift(metric);
        if (this.performanceMetrics.length > this.maxMetrics) {
            this.performanceMetrics = this.performanceMetrics.slice(0, this.maxMetrics);
        }
    }

    getLogs(filter?: Partial<{ level: LogLevel; category: LogCategory; limit: number }>): LogEntry[] {
        let result = this.logs;
        if (filter?.level) {
            result = result.filter(log => log.level === filter.level);
        }
        if (filter?.category) {
            result = result.filter(log => log.category === filter.category);
        }
        if (filter?.limit) {
            result = result.slice(0, filter.limit);
        }
        return result;
    }

    getAuditTrail(filter?: Partial<{ entityType: string; entityId: string; userId: string; limit: number }>): AuditTrailEntry[] {
        let result = this.auditTrail;
        if (filter?.entityType) {
            result = result.filter(entry => entry.entityType === filter.entityType);
        }
        if (filter?.entityId) {
            result = result.filter(entry => entry.entityId === filter.entityId);
        }
        if (filter?.userId) {
            result = result.filter(entry => entry.userId === filter.userId);
        }
        if (filter?.limit) {
            result = result.slice(0, filter.limit);
        }
        return result;
    }

    getMetrics(operation?: string): PerformanceMetric[] {
        if (operation) {
            return this.performanceMetrics.filter(m => m.operation === operation);
        }
        return this.performanceMetrics;
    }

    clearLogs(): void {
        this.logs = [];
    }

    getLogStats(): { total: number; byLevel: Record<LogLevel, number>; byCategory: Record<string, number> } {
        const byLevel: Record<LogLevel, number> = {
            info: 0,
            warning: 0,
            error: 0,
            critical: 0,
            debug: 0
        };
        const byCategory: Record<string, number> = {};

        this.logs.forEach(log => {
            byLevel[log.level]++;
            byCategory[log.category] = (byCategory[log.category] || 0) + 1;
        });

        return {
            total: this.logs.length,
            byLevel,
            byCategory
        };
    }
}

// Singleton storage instance
const storage = new LogStorage();

// ========================
// UTILITY FUNCTIONS
// ========================

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateCorrelationId(): string {
    return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

// ========================
// LOGGING FUNCTIONS
// ========================

export function logEvent(
    level: LogLevel,
    category: LogCategory,
    action: string,
    message: string,
    messageAr: string,
    details?: Record<string, any>,
    entityType?: string,
    entityId?: string
): LogEntry {
    const entry: LogEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        level,
        category,
        action,
        message,
        messageAr,
        details,
        entityType,
        entityId
    };

    storage.addLog(entry);

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
        const levelColors: Record<LogLevel, string> = {
            info: '\x1b[36m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            critical: '\x1b[35m',
            debug: '\x1b[90m'
        };
        console.log(`${levelColors[level]}[${level.toUpperCase()}]\x1b[0m [${category}] ${action}: ${message}`);
    }

    return entry;
}

// Convenience logging functions
export function logInfo(category: LogCategory, action: string, message: string, messageAr: string, details?: Record<string, any>): LogEntry {
    return logEvent('info', category, action, message, messageAr, details);
}

export function logWarning(category: LogCategory, action: string, message: string, messageAr: string, details?: Record<string, any>): LogEntry {
    return logEvent('warning', category, action, message, messageAr, details);
}

export function logError(category: LogCategory, action: string, message: string, messageAr: string, details?: Record<string, any>): LogEntry {
    return logEvent('error', category, action, message, messageAr, details);
}

export function logCritical(category: LogCategory, action: string, message: string, messageAr: string, details?: Record<string, any>): LogEntry {
    return logEvent('critical', category, action, message, messageAr, details);
}

// ========================
// SPECIFIC EVENT LOGGERS
// ========================

export function logPaymentEvent(
    action: 'created' | 'paid' | 'overdue' | 'cancelled' | 'reminder_sent',
    paymentId: string,
    details: {
        amount: number;
        tenantName?: string;
        unitNo?: string;
        daysOverdue?: number;
    }
): LogEntry {
    const messages: Record<string, { en: string; ar: string }> = {
        created: { en: 'Payment record created', ar: 'تم إنشاء سجل دفع' },
        paid: { en: 'Payment received', ar: 'تم استلام الدفعة' },
        overdue: { en: 'Payment is overdue', ar: 'الدفعة متأخرة' },
        cancelled: { en: 'Payment cancelled', ar: 'تم إلغاء الدفعة' },
        reminder_sent: { en: 'Payment reminder sent', ar: 'تم إرسال تذكير الدفع' }
    };

    const level: LogLevel = action === 'overdue' ? 'warning' : 'info';
    const msg = messages[action];

    return logEvent(level, 'payment', action, msg.en, msg.ar, details, 'payment', paymentId);
}

export function logContractEvent(
    action: 'created' | 'renewed' | 'expired' | 'terminated' | 'expiring_soon',
    contractId: string,
    details: {
        tenantName?: string;
        propertyName?: string;
        unitNo?: string;
        daysToExpiry?: number;
    }
): LogEntry {
    const messages: Record<string, { en: string; ar: string }> = {
        created: { en: 'Contract created', ar: 'تم إنشاء العقد' },
        renewed: { en: 'Contract renewed', ar: 'تم تجديد العقد' },
        expired: { en: 'Contract expired', ar: 'انتهى العقد' },
        terminated: { en: 'Contract terminated', ar: 'تم إنهاء العقد' },
        expiring_soon: { en: 'Contract expiring soon', ar: 'العقد على وشك الانتهاء' }
    };

    const level: LogLevel = ['expired', 'expiring_soon'].includes(action) ? 'warning' : 'info';
    const msg = messages[action];

    return logEvent(level, 'contract', action, msg.en, msg.ar, details, 'contract', contractId);
}

export function logMaintenanceEvent(
    action: 'created' | 'assigned' | 'in_progress' | 'resolved' | 'escalated' | 'sla_breach',
    requestId: string,
    details: {
        title?: string;
        priority?: string;
        escalationLevel?: number;
        cost?: number;
    }
): LogEntry {
    const messages: Record<string, { en: string; ar: string }> = {
        created: { en: 'Maintenance request created', ar: 'تم إنشاء طلب صيانة' },
        assigned: { en: 'Maintenance request assigned', ar: 'تم تعيين طلب الصيانة' },
        in_progress: { en: 'Maintenance in progress', ar: 'الصيانة قيد التنفيذ' },
        resolved: { en: 'Maintenance resolved', ar: 'تم حل طلب الصيانة' },
        escalated: { en: 'Maintenance request escalated', ar: 'تم تصعيد طلب الصيانة' },
        sla_breach: { en: 'SLA breach detected', ar: 'تم اكتشاف خرق SLA' }
    };

    const level: LogLevel = ['escalated', 'sla_breach'].includes(action) ? 'warning' : 'info';
    const msg = messages[action];

    return logEvent(level, 'maintenance', action, msg.en, msg.ar, details, 'maintenance', requestId);
}

export function logSystemEvent(
    action: string,
    message: string,
    messageAr: string,
    details?: Record<string, any>
): LogEntry {
    return logEvent('info', 'system', action, message, messageAr, details);
}

export function logSecurityEvent(
    action: 'login' | 'logout' | 'failed_login' | 'password_change' | 'permission_denied',
    userId: string,
    details?: Record<string, any>
): LogEntry {
    const messages: Record<string, { en: string; ar: string }> = {
        login: { en: 'User logged in', ar: 'تم تسجيل الدخول' },
        logout: { en: 'User logged out', ar: 'تم تسجيل الخروج' },
        failed_login: { en: 'Failed login attempt', ar: 'محاولة دخول فاشلة' },
        password_change: { en: 'Password changed', ar: 'تم تغيير كلمة المرور' },
        permission_denied: { en: 'Permission denied', ar: 'تم رفض الإذن' }
    };

    const level: LogLevel = ['failed_login', 'permission_denied'].includes(action) ? 'warning' : 'info';
    const msg = messages[action];

    return logEvent(level, 'security', action, msg.en, msg.ar, { ...details, userId }, 'user', userId);
}

// ========================
// AUDIT TRAIL
// ========================

export function createAuditEntry(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    changes?: { field: string; oldValue: any; newValue: any }[],
    userEmail?: string
): AuditTrailEntry {
    const entry: AuditTrailEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        userId,
        userEmail,
        action,
        entityType,
        entityId,
        changes
    };

    storage.addAuditEntry(entry);
    return entry;
}

// ========================
// PERFORMANCE TRACKING
// ========================

export function trackPerformance(operation: string): () => PerformanceMetric {
    const startTime = performance.now();

    return (success: boolean = true, metadata?: Record<string, any>) => {
        const endTime = performance.now();
        const metric: PerformanceMetric = {
            operation,
            startTime,
            endTime,
            duration: endTime - startTime,
            success,
            metadata
        };

        storage.addMetric(metric);
        return metric;
    };
}

// ========================
// CORRELATION TRACKING
// ========================

let currentCorrelationId: string | null = null;

export function startCorrelation(): string {
    currentCorrelationId = generateCorrelationId();
    return currentCorrelationId;
}

export function endCorrelation(): void {
    currentCorrelationId = null;
}

export function getCorrelationId(): string | null {
    return currentCorrelationId;
}

// ========================
// QUERY FUNCTIONS
// ========================

export function getLogs(filter?: Partial<{ level: LogLevel; category: LogCategory; limit: number }>): LogEntry[] {
    return storage.getLogs(filter);
}

export function getAuditTrail(filter?: Partial<{ entityType: string; entityId: string; userId: string; limit: number }>): AuditTrailEntry[] {
    return storage.getAuditTrail(filter);
}

export function getPerformanceMetrics(operation?: string): PerformanceMetric[] {
    return storage.getMetrics(operation);
}

export function getLogStats(): { total: number; byLevel: Record<LogLevel, number>; byCategory: Record<string, number> } {
    return storage.getLogStats();
}

// ========================
// EXPORT
// ========================

export const SystemLogger = {
    // Core logging
    logEvent,
    logInfo,
    logWarning,
    logError,
    logCritical,

    // Specific loggers
    logPaymentEvent,
    logContractEvent,
    logMaintenanceEvent,
    logSystemEvent,
    logSecurityEvent,

    // Audit
    createAuditEntry,
    getAuditTrail,

    // Performance
    trackPerformance,
    getPerformanceMetrics,

    // Correlation
    startCorrelation,
    endCorrelation,
    getCorrelationId,

    // Query
    getLogs,
    getLogStats
};

export default SystemLogger;
