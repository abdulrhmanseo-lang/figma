// Maintenance Intelligence Engine for Arkan PMS
// Auto-classification, priority calculation, SLA tracking, escalation, and cost history
// NO UI CHANGES - Backend logic only

import type { MaintenanceRequest, MaintenancePriority } from '../types/database';
import type {
    MaintenanceCategory,
    MaintenanceEnhancement,
    MaintenanceCostHistory,
    RepeatedIssue,
} from '../types/reportTypes';

// ========================
// KEYWORD CLASSIFICATIONS
// ========================

const CATEGORY_KEYWORDS: Record<MaintenanceCategory, string[]> = {
    plumbing: ['تسرب', 'مياه', 'صرف', 'حنفية', 'سيفون', 'أنبوب', 'مجاري', 'خزان', 'سخان', 'صنبور', 'حمام', 'مطبخ تسرب'],
    electrical: ['كهرباء', 'مفتاح', 'لمبة', 'تيار', 'قاطع', 'سلك', 'فيش', 'بريز', 'إضاءة', 'كهربائي', 'تماس', 'شرارة'],
    hvac: ['تكييف', 'مكيف', 'تدفئة', 'تبريد', 'هواء', 'تهوية', 'مروحة', 'فلتر', 'كمبريسور', 'فريون'],
    structural: ['جدار', 'سقف', 'باب', 'نافذة', 'شرخ', 'تشقق', 'رطوبة', 'عازل', 'دهان', 'بلاط', 'أرضية', 'سلم'],
    general: [], // Default category
};

const URGENT_KEYWORDS = ['عاجل', 'طوارئ', 'خطر', 'فوري', 'حريق', 'تسرب غاز', 'انفجار', 'غرق', 'صدمة كهربائية', 'سقوط'];

const CATEGORY_ARABIC: Record<MaintenanceCategory, string> = {
    plumbing: 'سباكة',
    electrical: 'كهرباء',
    hvac: 'تكييف',
    structural: 'هيكلي',
    general: 'عام',
};

// ========================
// SLA CONFIGURATION
// ========================

interface SLAConfig {
    priority: MaintenancePriority;
    responseHours: number;
    resolutionHours: number;
}

const SLA_CONFIG: SLAConfig[] = [
    { priority: 'urgent', responseHours: 2, resolutionHours: 24 },
    { priority: 'high', responseHours: 8, resolutionHours: 48 },
    { priority: 'medium', responseHours: 24, resolutionHours: 168 }, // 7 days
    { priority: 'low', responseHours: 48, resolutionHours: 336 }, // 14 days
];

// ========================
// CLASSIFICATION FUNCTIONS
// ========================

export function classifyCategory(title: string, description: string): MaintenanceCategory {
    const text = `${title} ${description}`.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (category === 'general') continue;
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                return category as MaintenanceCategory;
            }
        }
    }

    return 'general';
}

export function detectUrgency(title: string, description: string): boolean {
    const text = `${title} ${description}`.toLowerCase();
    return URGENT_KEYWORDS.some(keyword => text.includes(keyword));
}

// ========================
// PRIORITY CALCULATION
// ========================

interface PriorityFactors {
    basePriority: MaintenancePriority;
    isUrgentKeyword: boolean;
    propertyType?: string;
    tenantComplaintCount?: number;
    isRepeatedIssue?: boolean;
    daysSinceCreation?: number;
}

export function calculatePriorityScore(factors: PriorityFactors): number {
    // Base score from priority
    const baseScores: Record<MaintenancePriority, number> = {
        urgent: 90,
        high: 70,
        medium: 50,
        low: 30,
    };

    let score = baseScores[factors.basePriority];

    // Adjust for urgent keywords
    if (factors.isUrgentKeyword) {
        score = Math.min(100, score + 20);
    }

    // Adjust for property type (commercial properties get higher priority)
    if (factors.propertyType === 'complex' || factors.propertyType === 'building') {
        score = Math.min(100, score + 5);
    }

    // Adjust for tenant complaint history
    if (factors.tenantComplaintCount && factors.tenantComplaintCount > 3) {
        score = Math.min(100, score + 10);
    }

    // Adjust for repeated issues
    if (factors.isRepeatedIssue) {
        score = Math.min(100, score + 15);
    }

    // Adjust for aging tickets
    if (factors.daysSinceCreation && factors.daysSinceCreation > 7) {
        const agingBonus = Math.min(20, factors.daysSinceCreation - 7);
        score = Math.min(100, score + agingBonus);
    }

    return Math.round(score);
}

export function suggestPriority(score: number): MaintenancePriority {
    if (score >= 85) return 'urgent';
    if (score >= 65) return 'high';
    if (score >= 45) return 'medium';
    return 'low';
}

// ========================
// SLA FUNCTIONS
// ========================

export function calculateSLADeadlines(
    priority: MaintenancePriority,
    createdAt: string
): { responseDeadline: string; resolutionDeadline: string } {
    const sla = SLA_CONFIG.find(s => s.priority === priority) || SLA_CONFIG[2]; // Default to medium
    const created = new Date(createdAt);

    const responseDeadline = new Date(created.getTime() + sla.responseHours * 60 * 60 * 1000);
    const resolutionDeadline = new Date(created.getTime() + sla.resolutionHours * 60 * 60 * 1000);

    return {
        responseDeadline: responseDeadline.toISOString(),
        resolutionDeadline: resolutionDeadline.toISOString(),
    };
}

export function calculateResponseTime(createdAt: string, respondedAt: string): number {
    const created = new Date(createdAt);
    const responded = new Date(respondedAt);
    return Math.round((responded.getTime() - created.getTime()) / (1000 * 60 * 60)); // hours
}

export function calculateResolutionTime(createdAt: string, resolvedAt: string): number {
    const created = new Date(createdAt);
    const resolved = new Date(resolvedAt);
    return Math.round((resolved.getTime() - created.getTime()) / (1000 * 60 * 60)); // hours
}

export interface SLAStatus {
    isResponseOverdue: boolean;
    isResolutionOverdue: boolean;
    responseRemainingHours: number;
    resolutionRemainingHours: number;
    status: 'on_track' | 'at_risk' | 'breached';
}

export function checkSLAStatus(
    request: MaintenanceRequest,
    enhancement: MaintenanceEnhancement
): SLAStatus {
    const now = new Date();
    const responseDeadline = new Date(enhancement.slaResponseDeadline);
    const resolutionDeadline = new Date(enhancement.slaResolutionDeadline);

    const isResponseOverdue = !enhancement.respondedAt && now > responseDeadline;
    const isResolutionOverdue = request.status !== 'done' && now > resolutionDeadline;

    const responseRemainingHours = Math.round((responseDeadline.getTime() - now.getTime()) / (1000 * 60 * 60));
    const resolutionRemainingHours = Math.round((resolutionDeadline.getTime() - now.getTime()) / (1000 * 60 * 60));

    let status: 'on_track' | 'at_risk' | 'breached' = 'on_track';
    if (isResponseOverdue || isResolutionOverdue) {
        status = 'breached';
    } else if (resolutionRemainingHours < 24 || responseRemainingHours < 2) {
        status = 'at_risk';
    }

    return {
        isResponseOverdue,
        isResolutionOverdue,
        responseRemainingHours,
        resolutionRemainingHours,
        status,
    };
}

// ========================
// ESCALATION LOGIC
// ========================

export function calculateEscalationLevel(
    request: MaintenanceRequest,
    enhancement: MaintenanceEnhancement
): 0 | 1 | 2 | 3 {
    const now = new Date();
    const created = new Date(request.createdAt);
    const hoursSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    // If done, no escalation needed
    if (request.status === 'done' || request.status === 'canceled') {
        return 0;
    }

    const sla = SLA_CONFIG.find(s => s.priority === request.priority) || SLA_CONFIG[2];

    // Level 1: Approaching response deadline
    if (hoursSinceCreation > sla.responseHours * 0.8 && !enhancement.respondedAt) {
        return 1;
    }

    // Level 2: Response deadline breached
    if (hoursSinceCreation > sla.responseHours && !enhancement.respondedAt) {
        return 2;
    }

    // Level 3: Resolution deadline breached
    if (hoursSinceCreation > sla.resolutionHours) {
        return 3;
    }

    // Level 1: Approaching resolution deadline
    if (hoursSinceCreation > sla.resolutionHours * 0.8) {
        return 1;
    }

    return 0;
}

export interface EscalationInfo {
    level: 0 | 1 | 2 | 3;
    levelArabic: string;
    reason: string;
    recommendedAction: string;
}

export function getEscalationInfo(level: 0 | 1 | 2 | 3): EscalationInfo {
    const levels: EscalationInfo[] = [
        { level: 0, levelArabic: 'طبيعي', reason: 'الطلب ضمن الجدول الزمني', recommendedAction: 'متابعة العمل العادي' },
        { level: 1, levelArabic: 'تنبيه', reason: 'اقتراب الموعد النهائي', recommendedAction: 'تسريع العمل على الطلب' },
        { level: 2, levelArabic: 'تصعيد', reason: 'تجاوز وقت الاستجابة', recommendedAction: 'إبلاغ المشرف فوراً' },
        { level: 3, levelArabic: 'حرج', reason: 'تجاوز وقت الحل', recommendedAction: 'تصعيد للإدارة العليا' },
    ];

    return levels[level];
}

// ========================
// COST HISTORY TRACKING
// ========================

export function calculateCostHistory(
    maintenanceRequests: MaintenanceRequest[],
    propertyId?: string,
    unitId?: string
): MaintenanceCostHistory {
    // Filter requests
    let requests = maintenanceRequests;
    if (unitId) {
        requests = requests.filter(m => m.unitId === unitId);
    } else if (propertyId) {
        requests = requests.filter(m => m.propertyId === propertyId);
    }

    if (requests.length === 0) {
        return {
            propertyId: propertyId || '',
            propertyName: '',
            totalCost: 0,
            requestCount: 0,
            averageCost: 0,
            byCategory: {
                plumbing: { count: 0, cost: 0 },
                electrical: { count: 0, cost: 0 },
                hvac: { count: 0, cost: 0 },
                structural: { count: 0, cost: 0 },
                general: { count: 0, cost: 0 },
            },
            byMonth: [],
            trend: 'stable',
        };
    }

    const totalCost = requests.reduce((sum, m) => sum + m.cost, 0);
    const requestCount = requests.length;
    const averageCost = totalCost / requestCount;

    // Group by category
    const byCategory: MaintenanceCostHistory['byCategory'] = {
        plumbing: { count: 0, cost: 0 },
        electrical: { count: 0, cost: 0 },
        hvac: { count: 0, cost: 0 },
        structural: { count: 0, cost: 0 },
        general: { count: 0, cost: 0 },
    };

    requests.forEach(req => {
        const category = classifyCategory(req.title, req.description);
        byCategory[category].count++;
        byCategory[category].cost += req.cost;
    });

    // Group by month
    const monthlyData: Record<string, { cost: number; count: number }> = {};
    requests.forEach(req => {
        const date = new Date(req.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[key]) monthlyData[key] = { cost: 0, count: 0 };
        monthlyData[key].cost += req.cost;
        monthlyData[key].count++;
    });

    const byMonth = Object.entries(monthlyData)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate trend
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (byMonth.length >= 3) {
        const recent = byMonth.slice(-3);
        const firstHalf = recent.slice(0, Math.ceil(recent.length / 2)).reduce((s, m) => s + m.cost, 0);
        const secondHalf = recent.slice(Math.ceil(recent.length / 2)).reduce((s, m) => s + m.cost, 0);

        if (secondHalf > firstHalf * 1.2) trend = 'increasing';
        else if (secondHalf < firstHalf * 0.8) trend = 'decreasing';
    }

    return {
        unitId,
        unitNo: requests[0]?.unitNo,
        propertyId: requests[0]?.propertyId || propertyId || '',
        propertyName: requests[0]?.propertyName || '',
        totalCost,
        requestCount,
        averageCost,
        byCategory,
        byMonth,
        trend,
    };
}

// ========================
// REPEATED ISSUE DETECTION
// ========================

export function detectRepeatedIssues(
    maintenanceRequests: MaintenanceRequest[],
    threshold: number = 2 // Minimum occurrences to flag as repeated
): RepeatedIssue[] {
    const issues: RepeatedIssue[] = [];

    // Group by unit and category
    const groupedByUnitAndCategory: Record<string, MaintenanceRequest[]> = {};

    maintenanceRequests.forEach(req => {
        if (!req.unitId) return;
        const category = classifyCategory(req.title, req.description);
        const key = `${req.unitId}-${category}`;
        if (!groupedByUnitAndCategory[key]) groupedByUnitAndCategory[key] = [];
        groupedByUnitAndCategory[key].push(req);
    });

    // Find repeated issues
    Object.entries(groupedByUnitAndCategory).forEach(([key, requests]) => {
        if (requests.length >= threshold) {
            const [unitId, category] = key.split('-');
            const sortedByDate = requests.sort((a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            issues.push({
                unitId,
                unitNo: requests[0].unitNo || '',
                propertyId: requests[0].propertyId,
                propertyName: requests[0].propertyName,
                category: category as MaintenanceCategory,
                occurrences: requests.length,
                totalCost: requests.reduce((sum, r) => sum + r.cost, 0),
                firstOccurrence: sortedByDate[0].createdAt,
                lastOccurrence: sortedByDate[sortedByDate.length - 1].createdAt,
                description: `${CATEGORY_ARABIC[category as MaintenanceCategory]} - ${requests.length} مرات`,
            });
        }
    });

    return issues.sort((a, b) => b.occurrences - a.occurrences);
}

// ========================
// ENHANCE MAINTENANCE REQUEST
// ========================

export function enhanceMaintenanceRequest(
    request: MaintenanceRequest,
    allRequests: MaintenanceRequest[] = []
): MaintenanceEnhancement {
    const category = classifyCategory(request.title, request.description);
    const isUrgent = detectUrgency(request.title, request.description);

    // Check if this is a repeated issue
    const sameUnitRequests = allRequests.filter(r =>
        r.unitId === request.unitId &&
        r.id !== request.id &&
        classifyCategory(r.title, r.description) === category
    );
    const isRepeatedIssue = sameUnitRequests.length > 0;

    // Calculate priority score
    const priorityScore = calculatePriorityScore({
        basePriority: request.priority,
        isUrgentKeyword: isUrgent,
        isRepeatedIssue,
    });

    // Calculate SLA deadlines
    const slaDeadlines = calculateSLADeadlines(request.priority, request.createdAt);

    return {
        category,
        categoryArabic: CATEGORY_ARABIC[category],
        isUrgent,
        calculatedPriority: priorityScore,
        slaResponseDeadline: slaDeadlines.responseDeadline,
        slaResolutionDeadline: slaDeadlines.resolutionDeadline,
        escalationLevel: 0,
        isRepeatedIssue,
        repeatCount: isRepeatedIssue ? sameUnitRequests.length + 1 : undefined,
    };
}

// ========================
// LINK TO OWNER REPORTS
// ========================

export function getMaintenanceCostForReport(
    maintenanceRequests: MaintenanceRequest[],
    propertyId: string,
    startDate: Date,
    endDate: Date
): { totalCost: number; count: number; byCategory: Record<MaintenanceCategory, number> } {
    const requests = maintenanceRequests.filter(m => {
        const created = new Date(m.createdAt);
        return m.propertyId === propertyId && created >= startDate && created <= endDate;
    });

    const byCategory: Record<MaintenanceCategory, number> = {
        plumbing: 0,
        electrical: 0,
        hvac: 0,
        structural: 0,
        general: 0,
    };

    requests.forEach(req => {
        const category = classifyCategory(req.title, req.description);
        byCategory[category] += req.cost;
    });

    return {
        totalCost: requests.reduce((sum, r) => sum + r.cost, 0),
        count: requests.length,
        byCategory,
    };
}

// ========================
// EXPORTS
// ========================

export const MaintenanceIntelligenceEngine = {
    classifyCategory,
    detectUrgency,
    calculatePriorityScore,
    suggestPriority,
    calculateSLADeadlines,
    calculateResponseTime,
    calculateResolutionTime,
    checkSLAStatus,
    calculateEscalationLevel,
    getEscalationInfo,
    calculateCostHistory,
    detectRepeatedIssues,
    enhanceMaintenanceRequest,
    getMaintenanceCostForReport,
    CATEGORY_KEYWORDS,
    URGENT_KEYWORDS,
    CATEGORY_ARABIC,
    SLA_CONFIG,
};

export default MaintenanceIntelligenceEngine;
