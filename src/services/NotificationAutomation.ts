import { Payment, Contract, Tenant } from '../types/database';
import { FinancialBehaviorEngine } from './FinancialBehaviorEngine';
import { SystemLogger } from './SystemLogger';
import { InternalEmailEngine } from './InternalEmailEngine';

export interface AutomatedMessage {
    type: 'whatsapp' | 'email' | 'in_app';
    target: string; // phone or email
    messageEn: string;
    messageAr: string;
    trigger: string;
}

export class NotificationAutomation {
    /**
     * Checks all pending items and generates necessary notifications
     */
    static async processAutomationQueue(
        payments: Payment[],
        contracts: Contract[],
        tenants: Tenant[]
    ): Promise<AutomatedMessage[]> {
        const queue: AutomatedMessage[] = [];
        const issues = FinancialBehaviorEngine.detectPaymentIssues(payments);

        // 1. Payment Reminders (Grace Period)
        issues.withinGrace.forEach(payment => {
            const tenant = tenants.find(t => t.fullName === payment.tenantName);
            if (tenant) {
                queue.push({
                    type: 'whatsapp',
                    target: tenant.phone,
                    messageEn: `Friendly reminder: Your payment of ${payment.amount} SAR for unit ${payment.unitNo} is within the grace period. Please pay by ${payment.dueDate} to avoid late fees.`,
                    messageAr: `تذكير لطيف: دفعتك بقيمة ${payment.amount} ر.س للوحدة ${payment.unitNo} لا تزال ضمن فترة السماح. يرجى السداد بحلول ${payment.dueDate} لتجنب غرامات التأخير.`,
                    trigger: 'payment_grace_period'
                });

                if (tenant.email) {
                    queue.push({
                        type: 'email',
                        target: tenant.email,
                        messageEn: `Payment reminder for unit ${payment.unitNo}. Due date: ${payment.dueDate}.`,
                        messageAr: `تذكير بسداد قيمة إيجار الوحدة ${payment.unitNo}. تاريخ الاستحقاق: ${payment.dueDate}.`,
                        trigger: 'payment_grace_period'
                    });
                }
            }
        });

        // 2. Overdue Escalations
        issues.needsEscalation.forEach(({ payment, level }) => {
            const tenant = tenants.find(t => t.fullName === payment.tenantName);
            if (tenant && level >= 2) {
                queue.push({
                    type: 'whatsapp',
                    target: tenant.phone,
                    messageEn: `IMPORTANT: Your payment for unit ${payment.unitNo} is severely overdue. Level ${level} escalation initiated.`,
                    messageAr: `هام: دفعتك للوحدة ${payment.unitNo} متأخرة بشكل حاد. تم بدء إجراءات التصعيد من المستوى ${level}.`,
                    trigger: 'payment_escalation'
                });
            }
        });

        // 3. Contract Expiry
        const now = new Date();
        const thirtyDaysFromNow = new Date(now);
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        contracts.forEach(contract => {
            if (contract.status === 'active') {
                const expiry = new Date(contract.endDate);
                if (expiry <= thirtyDaysFromNow && expiry > now) {
                    const tenant = tenants.find(t => t.id === contract.tenantId);
                    if (tenant) {
                        queue.push({
                            type: 'whatsapp',
                            target: tenant.phone,
                            messageEn: `Your contract for ${contract.propertyName} (Unit ${contract.unitNo}) expires on ${contract.endDate}. Contact us to renew.`,
                            messageAr: `عقدك في ${contract.propertyName} (وحدة ${contract.unitNo}) ينتهي في ${contract.endDate}. تواصل معنا للتجديد.`,
                            trigger: 'contract_expiry_soon'
                        });
                    }
                }
            }
        });

        // Log the results
        if (queue.length > 0) {
            SystemLogger.logInfo(
                'automation',
                'queue_processed',
                `Automation engine generated ${queue.length} notifications.`,
                `قام محرك الأتمتة بإنشاء ${queue.length} تنبيهات.`,
                { count: queue.length }
            );
        }

        return queue;
    }

    /**
     * Simulates sending the messages
     */
    static async sendMessages(messages: AutomatedMessage[]): Promise<void> {
        for (const msg of messages) {
            if (msg.type === 'email') {
                const html = InternalEmailEngine.generateTemplate(
                    msg.trigger === 'payment_escalation' ? 'إنذار تأخير سداد' : 'تنبيه من نظام أركان',
                    msg.messageAr
                );
                await InternalEmailEngine.sendEmail({
                    to: msg.target,
                    message: {
                        subject: msg.trigger === 'payment_escalation' ? 'إنذار هام: تأخير سداد' : 'تذكير بموعد استحقاق - أركان',
                        html
                    }
                });
            }

            // Log everything
            SystemLogger.logInfo(
                'automation',
                `send_${msg.type}`,
                `Sent ${msg.type} message to ${msg.target}: ${msg.messageEn}`,
                `تم إرسال رسالة ${msg.type} إلى ${msg.target}: ${msg.messageAr}`,
                { trigger: msg.trigger }
            );
        }
    }
}

export default NotificationAutomation;
