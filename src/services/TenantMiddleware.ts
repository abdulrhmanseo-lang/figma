// Tenant Middleware for Arkan PMS
// Query scoping, cross-tenant blocking, and company_id enforcement
// NO UI CHANGES - Backend only

import { CompanyContextService } from './CompanyContext';
import { SystemLogger } from './SystemLogger';
import type { TenantFilter } from '../types/multiTenantTypes';

// ========================
// TYPES
// ========================

export interface ScopedEntity {
    company_id?: string;
    companyId?: string;
    [key: string]: any;
}

export interface QueryOptions {
    bypassTenantFilter?: boolean;
    superAdminOverride?: boolean;
    includeInactive?: boolean;
}

export interface OperationResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    blocked?: boolean;
    reason?: string;
}

// ========================
// MIDDLEWARE STATE
// ========================

let enforcementEnabled = true;
let strictMode = true; // Block operations without company_id

export function setEnforcementEnabled(enabled: boolean): void {
    enforcementEnabled = enabled;
    SystemLogger.logInfo(
        'system',
        'tenant_enforcement_changed',
        `Tenant enforcement ${enabled ? 'enabled' : 'disabled'}`,
        `تم ${enabled ? 'تفعيل' : 'إلغاء'} فرض المستأجر`,
        { enabled }
    );
}

export function setStrictMode(strict: boolean): void {
    strictMode = strict;
}

// ========================
// TENANT FILTER RESOLUTION
// ========================

export function getTenantFilter(options?: QueryOptions): TenantFilter {
    if (!enforcementEnabled) {
        return { companyId: '', enforced: false };
    }

    const context = CompanyContextService.getCurrentContext();

    if (!context) {
        // No context - require authentication
        return { companyId: '', enforced: true };
    }

    // Super Admin in system view - no filter (if allowed)
    if (context.isSuperAdmin && !context.isContextSwitch) {
        if (options?.superAdminOverride) {
            return { companyId: '', enforced: false };
        }
    }

    // Return company filter
    return {
        companyId: context.companyId,
        enforced: true
    };
}

// ========================
// QUERY SCOPING
// ========================

export function scopeQuery<T extends ScopedEntity>(
    data: T[],
    options?: QueryOptions
): T[] {
    const filter = getTenantFilter(options);

    if (!filter.enforced || !filter.companyId) {
        return data;
    }

    return data.filter(item => {
        const itemCompanyId = item.company_id || item.companyId;
        return itemCompanyId === filter.companyId;
    });
}

export function scopeSingleEntity<T extends ScopedEntity>(
    entity: T | null | undefined,
    options?: QueryOptions
): T | null {
    if (!entity) return null;

    const filter = getTenantFilter(options);

    if (!filter.enforced || !filter.companyId) {
        return entity;
    }

    const entityCompanyId = entity.company_id || entity.companyId;

    if (entityCompanyId !== filter.companyId) {
        // Log blocked access attempt
        SystemLogger.logWarning(
            'security',
            'cross_tenant_access_blocked',
            'Cross-tenant entity access blocked',
            'تم حظر الوصول عبر المستأجر',
            {
                requestedCompanyId: entityCompanyId,
                userCompanyId: filter.companyId
            }
        );
        return null;
    }

    return entity;
}

// ========================
// WRITE OPERATIONS - COMPANY_ID INJECTION
// ========================

export function injectCompanyId<T extends Partial<ScopedEntity>>(
    entity: T
): OperationResult<T & { company_id: string }> {
    const context = CompanyContextService.getCurrentContext();

    if (!context) {
        return {
            success: false,
            error: 'No active context - authentication required',
            blocked: true,
            reason: 'unauthenticated'
        };
    }

    // Super Admin in system view cannot create without context switch
    if (context.isSuperAdmin && !context.isContextSwitch) {
        return {
            success: false,
            error: 'Super Admin must switch context to create records',
            blocked: true,
            reason: 'super_admin_no_context'
        };
    }

    if (!context.companyId) {
        return {
            success: false,
            error: 'No company context available',
            blocked: true,
            reason: 'no_company'
        };
    }

    const enrichedEntity = {
        ...entity,
        company_id: context.companyId
    } as T & { company_id: string };

    return {
        success: true,
        data: enrichedEntity
    };
}

export function validateWrite<T extends ScopedEntity>(
    entity: T
): OperationResult<boolean> {
    if (!enforcementEnabled) {
        return { success: true, data: true };
    }

    const context = CompanyContextService.getCurrentContext();

    if (!context) {
        return {
            success: false,
            error: 'No active context',
            blocked: true,
            reason: 'unauthenticated'
        };
    }

    const entityCompanyId = entity.company_id || entity.companyId;

    // Check if entity has company_id
    if (strictMode && !entityCompanyId) {
        return {
            success: false,
            error: 'Entity must have company_id',
            blocked: true,
            reason: 'missing_company_id'
        };
    }

    // Super Admin can write to any company when in context
    if (context.isSuperAdmin) {
        if (context.isContextSwitch) {
            // Verify writing to the switched context
            if (entityCompanyId && entityCompanyId !== context.companyId) {
                SystemLogger.logWarning(
                    'security',
                    'cross_tenant_write_blocked',
                    'Super Admin cross-tenant write blocked',
                    'تم حظر كتابة المدير العام عبر المستأجر',
                    {
                        targetCompanyId: entityCompanyId,
                        activeContextId: context.companyId
                    }
                );
                return {
                    success: false,
                    error: 'Write to different company than active context',
                    blocked: true,
                    reason: 'context_mismatch'
                };
            }
        }
        return { success: true, data: true };
    }

    // Regular user - must match company
    if (entityCompanyId && entityCompanyId !== context.companyId) {
        SystemLogger.logCritical(
            'security',
            'cross_tenant_write_attempt',
            'User attempted cross-tenant write',
            'حاول المستخدم الكتابة عبر المستأجر',
            {
                userId: context.companyId,
                targetCompanyId: entityCompanyId
            }
        );
        return {
            success: false,
            error: 'Cannot write to another company',
            blocked: true,
            reason: 'cross_tenant'
        };
    }

    return { success: true, data: true };
}

// ========================
// UPDATE OPERATIONS
// ========================

export function validateUpdate<T extends ScopedEntity>(
    existingEntity: T,
    updates: Partial<T>
): OperationResult<Partial<T>> {
    // First validate the existing entity access
    const accessCheck = validateEntityAccess(existingEntity);
    if (!accessCheck.success) {
        return accessCheck as unknown as OperationResult<Partial<T>>;
    }

    // Prevent company_id change
    if (updates.company_id || updates.companyId) {
        const existingCompanyId = existingEntity.company_id || existingEntity.companyId;
        const newCompanyId = updates.company_id || updates.companyId;

        if (newCompanyId !== existingCompanyId) {
            SystemLogger.logCritical(
                'security',
                'company_id_change_blocked',
                'Attempt to change entity company_id blocked',
                'تم حظر محاولة تغيير معرف شركة الكيان',
                { existingCompanyId, newCompanyId }
            );
            return {
                success: false,
                error: 'Cannot change entity company_id',
                blocked: true,
                reason: 'company_id_immutable'
            };
        }
    }

    // Create safe updates (ensure company_id is preserved)
    const safeUpdates = {
        ...updates,
        company_id: existingEntity.company_id,
        companyId: existingEntity.companyId
    };

    return { success: true, data: safeUpdates };
}

// ========================
// DELETE OPERATIONS
// ========================

export function validateDelete<T extends ScopedEntity>(
    entity: T
): OperationResult<boolean> {
    return validateEntityAccess(entity);
}

// ========================
// ENTITY ACCESS VALIDATION
// ========================

export function validateEntityAccess<T extends ScopedEntity>(
    entity: T
): OperationResult<boolean> {
    if (!enforcementEnabled) {
        return { success: true, data: true };
    }

    const context = CompanyContextService.getCurrentContext();

    if (!context) {
        return {
            success: false,
            error: 'No active context',
            blocked: true,
            reason: 'unauthenticated'
        };
    }

    const entityCompanyId = entity.company_id || entity.companyId;

    // Super Admin always has access
    if (context.isSuperAdmin) {
        // In context switch, only access that company
        if (context.isContextSwitch && entityCompanyId !== context.companyId) {
            return {
                success: false,
                error: 'Entity not in active context',
                blocked: true,
                reason: 'context_mismatch'
            };
        }
        return { success: true, data: true };
    }

    // Regular user
    if (!entityCompanyId) {
        return {
            success: false,
            error: 'Entity has no company_id',
            blocked: true,
            reason: 'no_company_id'
        };
    }

    if (entityCompanyId !== context.companyId) {
        SystemLogger.logWarning(
            'security',
            'unauthorized_entity_access',
            'User tried to access entity from different company',
            'حاول المستخدم الوصول إلى كيان من شركة مختلفة',
            {
                userCompanyId: context.companyId,
                entityCompanyId
            }
        );
        return {
            success: false,
            error: 'Entity belongs to different company',
            blocked: true,
            reason: 'cross_tenant'
        };
    }

    return { success: true, data: true };
}

// ========================
// BATCH OPERATIONS
// ========================

export function scopeBatchWrite<T extends Partial<ScopedEntity>>(
    entities: T[]
): OperationResult<(T & { company_id: string })[]> {
    const results: (T & { company_id: string })[] = [];

    for (const entity of entities) {
        const result = injectCompanyId(entity);
        if (!result.success || !result.data) {
            return {
                success: false,
                error: result.error,
                blocked: true,
                reason: result.reason
            };
        }
        results.push(result.data);
    }

    return { success: true, data: results };
}

export function validateBatchDelete<T extends ScopedEntity>(
    entities: T[]
): OperationResult<boolean> {
    for (const entity of entities) {
        const result = validateDelete(entity);
        if (!result.success) {
            return result;
        }
    }
    return { success: true, data: true };
}

// ========================
// AUDIT HELPERS
// ========================

export function logTenantOperation(
    operation: 'create' | 'read' | 'update' | 'delete',
    entityType: string,
    entityId: string,
    success: boolean,
    details?: Record<string, any>
): void {
    const context = CompanyContextService.getCurrentContext();

    SystemLogger.createAuditEntry(
        context?.companyId || 'system',
        `${operation}_${entityType}`,
        entityType,
        entityId,
        undefined,
        undefined
    );
}

// ========================
// VALIDATION DECORATORS (for use with existing functions)
// ========================

export function withTenantValidation<T extends ScopedEntity, R>(
    operation: (entity: T) => R
): (entity: T) => OperationResult<R> {
    return (entity: T): OperationResult<R> => {
        const validation = validateEntityAccess(entity);
        if (!validation.success) {
            return validation as OperationResult<R>;
        }
        const result = operation(entity);
        return { success: true, data: result };
    };
}

export function withCompanyInjection<T extends Partial<ScopedEntity>, R>(
    operation: (entity: T & { company_id: string }) => R
): (entity: T) => OperationResult<R> {
    return (entity: T): OperationResult<R> => {
        const injection = injectCompanyId(entity);
        if (!injection.success || !injection.data) {
            return injection as OperationResult<R>;
        }
        const result = operation(injection.data);
        return { success: true, data: result };
    };
}

// ========================
// EXPORT
// ========================

export const TenantMiddleware = {
    // Configuration
    setEnforcementEnabled,
    setStrictMode,

    // Query Scoping
    getTenantFilter,
    scopeQuery,
    scopeSingleEntity,

    // Write Operations
    injectCompanyId,
    validateWrite,

    // Update Operations
    validateUpdate,

    // Delete Operations
    validateDelete,

    // Access Validation
    validateEntityAccess,

    // Batch Operations
    scopeBatchWrite,
    validateBatchDelete,

    // Audit
    logTenantOperation,

    // Decorators
    withTenantValidation,
    withCompanyInjection
};

export default TenantMiddleware;
