// Format utilities for Saudi Real Estate SaaS

/**
 * Format number as Saudi Riyal (SAR)
 */
export function formatSAR(amount: number): string {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format number with Arabic numerals and thousands separator
 */
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('ar-SA').format(num);
}

/**
 * Format date in Arabic (full date)
 */
export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format date as short (day/month/year)
 */
export function formatDateShort(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

/**
 * Format relative time in Arabic (e.g., "منذ يومين")
 */
export function formatRelative(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
    if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} شهور`;
    return `منذ ${Math.floor(diffDays / 365)} سنوات`;
}

/**
 * Calculate days remaining until a date
 */
export function daysRemaining(date: string | Date): number {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is in the past
 */
export function isOverdue(date: string | Date): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d < new Date();
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
    return `${Math.round(value)}%`;
}
