/**
 * Notification Service
 * 
 * Free/Low-cost integrations:
 * - Email: Resend (3,000 emails/month FREE)
 * - WhatsApp: Direct wa.me links (100% FREE)
 */

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface NotificationSettings {
    sendEmail: boolean;
    sendWhatsApp: boolean;
    remindOneDayBefore: boolean;
    remindHoursBefore: boolean;
    remindMinutesBefore: boolean;
}

export interface AppointmentDetails {
    id: string;
    title: string;
    leadName: string;
    leadEmail?: string;
    leadPhone?: string;
    start: Date;
    end: Date;
    type: 'videollamada' | 'seguimiento' | 'propuesta';
    meetLink?: string;
    notes?: string;
}

// ============================================================
// WHATSAPP - 100% FREE via wa.me links
// ============================================================

/**
 * Generate a WhatsApp message link (wa.me)
 * This opens WhatsApp on the user's device with a pre-filled message
 * The user just needs to hit "Send" - completely free!
 */
export function generateWhatsAppLink(phone: string, message: string): string {
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Add country code if not present (default to Mexico +52)
    const phoneWithCode = cleanPhone.startsWith('+')
        ? cleanPhone.replace('+', '')
        : cleanPhone.startsWith('52')
            ? cleanPhone
            : `52${cleanPhone}`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${phoneWithCode}?text=${encodedMessage}`;
}

/**
 * Generate appointment confirmation message for WhatsApp
 */
export function generateAppointmentWhatsAppMessage(appointment: AppointmentDetails): string {
    const dateStr = format(new Date(appointment.start), "EEEE d 'de' MMMM", { locale: es });
    const timeStr = format(new Date(appointment.start), 'HH:mm');
    const endTimeStr = format(new Date(appointment.end), 'HH:mm');

    const typeEmoji = {
        videollamada: '📹',
        seguimiento: '📞',
        propuesta: '📋',
    };

    let message = `${typeEmoji[appointment.type]} *${appointment.title}*\n\n`;
    message += `Hola ${appointment.leadName.split(' ')[0]}! 👋\n\n`;
    message += `Tu cita ha sido confirmada:\n\n`;
    message += `📅 *Fecha:* ${dateStr}\n`;
    message += `⏰ *Hora:* ${timeStr} - ${endTimeStr}\n`;

    if (appointment.meetLink) {
        message += `\n🔗 *Link de la reunión:*\n${appointment.meetLink}\n`;
    }

    if (appointment.notes) {
        message += `\n📝 *Notas:* ${appointment.notes}\n`;
    }

    message += `\n¡Te esperamos! ✨`;

    return message;
}

/**
 * Generate reminder message for WhatsApp
 */
export function generateReminderWhatsAppMessage(
    appointment: AppointmentDetails,
    reminderType: '1day' | '3hours' | '15min'
): string {
    const reminderText = {
        '1day': 'mañana',
        '3hours': 'en 3 horas',
        '15min': 'en 15 minutos',
    };

    const timeStr = format(new Date(appointment.start), 'HH:mm');

    let message = `⏰ *Recordatorio de cita*\n\n`;
    message += `Hola ${appointment.leadName.split(' ')[0]}!\n\n`;
    message += `Te recordamos que tienes una cita ${reminderText[reminderType]} a las ${timeStr}.\n\n`;
    message += `📋 *${appointment.title}*\n`;

    if (appointment.meetLink) {
        message += `\n🔗 ${appointment.meetLink}\n`;
    }

    message += `\n¡Nos vemos pronto! 🙌`;

    return message;
}

// ============================================================
// EMAIL - Resend (3,000 emails/month FREE)
// ============================================================

/**
 * Check if Resend API key is configured
 */
export function isEmailConfigured(): boolean {
    return !!process.env.RESEND_API_KEY;
}

/**
 * Send email via Resend API
 * FREE tier: 3,000 emails/month
 * 
 * To get API key:
 * 1. Go to https://resend.com/signup
 * 2. Verify your domain or use their test domain
 * 3. Get API key from dashboard
 * 4. Add to .env.local: RESEND_API_KEY=re_xxxx
 */
export async function sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    from?: string;
}): Promise<{ success: boolean; error?: string }> {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.warn('⚠️ RESEND_API_KEY not configured. Email not sent.');
        return { success: false, error: 'Email not configured' };
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: params.from || 'Gravita CRM <onboarding@resend.dev>',
                to: params.to,
                subject: params.subject,
                html: params.html,
            }),
        });

        if (response.ok) {
            return { success: true };
        } else {
            const error = await response.text();
            console.error('Resend API error:', error);
            return { success: false, error };
        }
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Generate HTML email for appointment confirmation
 */
export function generateAppointmentEmailHTML(appointment: AppointmentDetails): string {
    const dateStr = format(new Date(appointment.start), "EEEE d 'de' MMMM yyyy", { locale: es });
    const timeStr = format(new Date(appointment.start), 'HH:mm');
    const endTimeStr = format(new Date(appointment.end), 'HH:mm');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fff; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #8B5CF6, #6366F1); padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .detail { display: flex; margin-bottom: 15px; }
        .icon { width: 40px; font-size: 20px; }
        .info { flex: 1; }
        .label { color: #888; font-size: 12px; text-transform: uppercase; }
        .value { font-size: 16px; font-weight: 500; }
        .meet-btn { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #333; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Cita Confirmada</h1>
        </div>
        <div class="content">
            <p>Hola ${appointment.leadName.split(' ')[0]},</p>
            <p>Tu cita ha sido confirmada. Aquí están los detalles:</p>
            
            <div class="detail">
                <div class="icon">📋</div>
                <div class="info">
                    <div class="label">Evento</div>
                    <div class="value">${appointment.title}</div>
                </div>
            </div>
            
            <div class="detail">
                <div class="icon">📅</div>
                <div class="info">
                    <div class="label">Fecha</div>
                    <div class="value">${dateStr}</div>
                </div>
            </div>
            
            <div class="detail">
                <div class="icon">⏰</div>
                <div class="info">
                    <div class="label">Hora</div>
                    <div class="value">${timeStr} - ${endTimeStr}</div>
                </div>
            </div>
            
            ${appointment.meetLink ? `
            <div style="text-align: center; margin-top: 30px;">
                <a href="${appointment.meetLink}" class="meet-btn">🎥 Unirse a la Videollamada</a>
            </div>
            ` : ''}
            
            ${appointment.notes ? `
            <div style="margin-top: 20px; padding: 15px; background: #222; border-radius: 8px;">
                <div style="color: #888; font-size: 12px; margin-bottom: 5px;">NOTAS</div>
                <div>${appointment.notes}</div>
            </div>
            ` : ''}
        </div>
        <div class="footer">
            Gravita CRM - Marketing Neuronal
        </div>
    </div>
</body>
</html>`;
}

// ============================================================
// MAIN NOTIFICATION FUNCTION
// ============================================================

import {
    sendAppointmentConfirmation as sendWhatsAppConfirmation,
    isWhatsAppConfigured
} from './whatsappService';

/**
 * Send appointment notifications
 * - Email: Resend (automatic)
 * - WhatsApp: Cloud API (automatic) or wa.me link (manual fallback)
 */
export async function sendAppointmentNotifications(
    appointment: AppointmentDetails,
    settings: NotificationSettings
): Promise<{
    emailSent: boolean;
    whatsAppSent: boolean;
    whatsAppLink: string | null;
    message: string;
}> {
    const result = {
        emailSent: false,
        whatsAppSent: false,
        whatsAppLink: null as string | null,
        message: '',
    };

    // Send Email if enabled and lead has email
    if (settings.sendEmail && appointment.leadEmail) {
        const emailResult = await sendEmail({
            to: appointment.leadEmail,
            subject: `✅ Cita Confirmada: ${appointment.title}`,
            html: generateAppointmentEmailHTML(appointment),
        });
        result.emailSent = emailResult.success;
    }

    // Send WhatsApp if enabled and lead has phone
    if (settings.sendWhatsApp && appointment.leadPhone) {
        // Try Cloud API first (automatic sending)
        if (isWhatsAppConfigured()) {
            const whatsappResult = await sendWhatsAppConfirmation(
                appointment.leadPhone,
                appointment.leadName,
                new Date(appointment.start),
                appointment.meetLink
            );
            result.whatsAppSent = whatsappResult.success;

            if (!whatsappResult.success) {
                // Fallback to wa.me link if API fails
                const message = generateAppointmentWhatsAppMessage(appointment);
                result.whatsAppLink = generateWhatsAppLink(appointment.leadPhone, message);
            }
        } else {
            // No API configured, use wa.me link (manual)
            const message = generateAppointmentWhatsAppMessage(appointment);
            result.whatsAppLink = generateWhatsAppLink(appointment.leadPhone, message);
        }
    }

    // Build result message
    const parts = [];
    if (settings.sendEmail) {
        parts.push(result.emailSent ? '📧 Email enviado' : '📧 Email pendiente');
    }
    if (settings.sendWhatsApp) {
        if (result.whatsAppSent) {
            parts.push('💬 WhatsApp enviado automáticamente');
        } else if (result.whatsAppLink) {
            parts.push('💬 WhatsApp listo (click para enviar)');
        }
    }
    result.message = parts.join(' | ');

    return result;
}
