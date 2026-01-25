import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { SystemLogger } from './SystemLogger';

export interface EmailPayload {
    to: string | string[];
    message: {
        subject: string;
        text?: string;
        html?: string;
    };
    metadata?: Record<string, any>;
}

export class InternalEmailEngine {
    private static MAIL_COLLECTION = 'mail';

    /**
     * Queues an email to be sent by the server/extension
     */
    static async sendEmail(payload: EmailPayload): Promise<string | null> {
        try {
            const docRef = await addDoc(collection(db, this.MAIL_COLLECTION), {
                ...payload,
                delivery: {
                    state: 'pending',
                    attempts: 0,
                    startTime: Timestamp.now()
                },
                createdAt: Timestamp.now()
            });

            SystemLogger.logInfo(
                'system',
                'email_queued',
                `Email queued for ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}`,
                `تم إدراج البريد الإلكتروني في قائمة الانتظار لـ ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}`,
                { subject: payload.message.subject, emailId: docRef.id }
            );

            return docRef.id;
        } catch (error) {
            SystemLogger.logError(
                'system',
                'email_queue_failed',
                `Failed to queue email: ${error instanceof Error ? error.message : 'Unknown error'}`,
                `فشل إدراج البريد الإلكتروني في قائمة الانتظار`,
                { error }
            );
            return null;
        }
    }

    /**
     * Generates a professional HTML template for the email
     */
    static generateTemplate(title: string, body: string, footer: string = 'نظام أركان لإدارة العقارات'): string {
        return `
            <div dir="rtl" style="font-family: 'Cairo', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #0A2A43; padding: 24px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px;">أركان - ARKAN</h1>
                </div>
                <div style="padding: 32px; background-color: white;">
                    <h2 style="color: #1a202c; border-bottom: 2px solid #edf2f7; padding-bottom: 16px;">${title}</h2>
                    <p style="color: #4a5568; line-height: 1.8; font-size: 16px;">${body}</p>
                    <div style="margin-top: 32px; padding: 16px; background-color: #f7fafc; border-radius: 8px; font-size: 14px; color: #718096;">
                        ${footer}
                    </div>
                </div>
                <div style="background-color: #edf2f7; padding: 16px; text-align: center; font-size: 12px; color: #a0aec0;">
                    هذا البريد مرسل آلياً، يرجى عدم الرد عليه.
                </div>
            </div>
        `;
    }
}

export default InternalEmailEngine;
