/**
 * WhatsApp Cloud API Service
 * 
 * Official Meta WhatsApp Business Platform integration
 * 
 * Pricing:
 * - First 1,000 conversations/month: FREE
 * - After: ~$0.05-0.08 per conversation
 * 
 * Setup required:
 * 1. Meta Business Account
 * 2. WhatsApp Business App in Meta Developer Portal
 * 3. Verified phone number
 * 4. Webhook configuration
 */

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Environment variables required:
// META_WHATSAPP_TOKEN - Permanent access token
// META_PHONE_NUMBER_ID - Your registered phone number ID
// META_WHATSAPP_BUSINESS_ID - Your WhatsApp Business Account ID

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

interface WhatsAppConfig {
    token: string;
    phoneNumberId: string;
}

function getConfig(): WhatsAppConfig {
    const token = process.env.META_WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;
    const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
        throw new Error('WhatsApp Cloud API not configured. Set META_WHATSAPP_TOKEN and META_PHONE_NUMBER_ID');
    }

    return { token, phoneNumberId };
}

export function isWhatsAppConfigured(): boolean {
    const token = process.env.META_WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;
    const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
    return !!(token && phoneNumberId);
}

// =============================================================================
// SEND MESSAGES
// =============================================================================

/**
 * Send a text message via WhatsApp
 */
export async function sendWhatsAppMessage(
    to: string,
    message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const config = getConfig();

        // Clean phone number (remove +, spaces, etc.)
        const cleanPhone = to.replace(/[\s\-\(\)\+]/g, '');

        const response = await fetch(
            `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: cleanPhone,
                    type: 'text',
                    text: {
                        preview_url: true,
                        body: message,
                    },
                }),
            }
        );

        const data = await response.json();

        if (response.ok && data.messages?.[0]?.id) {
            return { success: true, messageId: data.messages[0].id };
        } else {
            console.error('WhatsApp API error:', data);
            return { success: false, error: data.error?.message || 'Unknown error' };
        }
    } catch (error) {
        console.error('WhatsApp send error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Send a document via WhatsApp (PDF, etc)
 */
export async function sendWhatsAppDocument(
    to: string,
    documentUrl: string,
    filename: string,
    caption?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const config = getConfig();
        const cleanPhone = to.replace(/[\s\-\(\)\+]/g, '');

        console.log('Sending WhatsApp document to:', cleanPhone);
        console.log('Document URL:', documentUrl);
        console.log('Filename:', filename);

        const response = await fetch(
            `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: cleanPhone,
                    type: 'document',
                    document: {
                        link: documentUrl,
                        filename: filename,
                        caption: caption || '',
                    },
                }),
            }
        );

        const data = await response.json();
        console.log('Document send response:', JSON.stringify(data));

        if (response.ok && data.messages?.[0]?.id) {
            return { success: true, messageId: data.messages[0].id };
        } else {
            console.error('WhatsApp document API error:', data);
            return { success: false, error: data.error?.message || 'Unknown error' };
        }
    } catch (error) {
        console.error('WhatsApp document send error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Send a message with interactive buttons
 */
export async function sendWhatsAppButtons(
    to: string,
    bodyText: string,
    buttons: { id: string; title: string }[]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const config = getConfig();
        const cleanPhone = to.replace(/[\s\-\(\)\+]/g, '');

        const response = await fetch(
            `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: cleanPhone,
                    type: 'interactive',
                    interactive: {
                        type: 'button',
                        body: { text: bodyText },
                        action: {
                            buttons: buttons.slice(0, 3).map(btn => ({
                                type: 'reply',
                                reply: {
                                    id: btn.id,
                                    title: btn.title.substring(0, 20), // Max 20 chars
                                },
                            })),
                        },
                    },
                }),
            }
        );

        const data = await response.json();

        if (response.ok && data.messages?.[0]?.id) {
            return { success: true, messageId: data.messages[0].id };
        } else {
            return { success: false, error: data.error?.message || 'Unknown error' };
        }
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

// =============================================================================
// MESSAGE TEMPLATES (for notifications outside 24h window)
// =============================================================================

/**
 * Send appointment confirmation using template
 * Note: You need to create and approve this template in Meta Business
 */
export async function sendAppointmentConfirmation(
    to: string,
    leadName: string,
    appointmentDate: Date,
    meetLink?: string
): Promise<{ success: boolean; error?: string }> {
    const dateStr = format(appointmentDate, "EEEE d 'de' MMMM", { locale: es });
    const timeStr = format(appointmentDate, 'HH:mm');

    // First try with template (works outside 24h window)
    // If template not set up, fall back to regular message
    const message = `✅ *Cita Confirmada*

Hola ${leadName.split(' ')[0]}! 👋

Tu cita ha sido agendada:

📅 *Fecha:* ${dateStr}
⏰ *Hora:* ${timeStr}
${meetLink ? `\n🔗 *Link de reunión:*\n${meetLink}` : ''}

¡Te esperamos! ✨

_Responde a este mensaje si necesitas reagendar._`;

    return sendWhatsAppMessage(to, message);
}

/**
 * Send appointment reminder
 */
export async function sendAppointmentReminder(
    to: string,
    leadName: string,
    appointmentDate: Date,
    reminderType: '1day' | '3hours' | '15min',
    meetLink?: string
): Promise<{ success: boolean; error?: string }> {
    const timeStr = format(appointmentDate, 'HH:mm');

    const reminderText = {
        '1day': 'mañana',
        '3hours': 'en 3 horas',
        '15min': 'en 15 minutos',
    };

    const urgency = {
        '1day': '📆',
        '3hours': '⏰',
        '15min': '🚨',
    };

    const message = `${urgency[reminderType]} *Recordatorio de Cita*

Hola ${leadName.split(' ')[0]}!

Te recordamos que tienes una cita *${reminderText[reminderType]}* a las *${timeStr}*.
${meetLink ? `\n🔗 ${meetLink}` : ''}

¡Te esperamos! 🙌`;

    return sendWhatsAppMessage(to, message);
}

/**
 * Send project update notification
 */
export async function sendProjectUpdate(
    to: string,
    leadName: string,
    projectName: string,
    update: string
): Promise<{ success: boolean; error?: string }> {
    const message = `📊 *Actualización de Proyecto*

Hola ${leadName.split(' ')[0]}! 👋

Tenemos novedades sobre *${projectName}*:

${update}

_Responde si tienes alguna pregunta._`;

    return sendWhatsAppMessage(to, message);
}

/**
 * Send quote notification
 */
export async function sendQuoteNotification(
    to: string,
    leadName: string,
    quoteTotal: number,
    quoteLink?: string
): Promise<{ success: boolean; error?: string }> {
    const formattedTotal = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(quoteTotal);

    const message = `📋 *Nueva Cotización*

Hola ${leadName.split(' ')[0]}! 👋

Te hemos preparado una cotización por *${formattedTotal}*.
${quoteLink ? `\n🔗 Ver cotización: ${quoteLink}` : ''}

_Responde "APROBAR" para aceptar o escríbenos si tienes dudas._`;

    return sendWhatsAppMessage(to, message);
}

// =============================================================================
// WEBHOOK HANDLING (for receiving messages)
// =============================================================================

export interface WhatsAppWebhookMessage {
    from: string;
    timestamp: string;
    type: 'text' | 'button' | 'interactive' | 'image' | 'audio' | 'document';
    text?: { body: string };
    button?: { text: string; payload: string };
    interactive?: {
        type: 'button_reply' | 'list_reply';
        button_reply?: { id: string; title: string };
        list_reply?: { id: string; title: string; description: string };
    };
    audio?: { id: string; mime_type: string };
}

export interface WhatsAppWebhookPayload {
    object: string;
    entry: Array<{
        id: string;
        changes: Array<{
            value: {
                messaging_product: string;
                metadata: {
                    display_phone_number: string;
                    phone_number_id: string;
                };
                contacts?: Array<{
                    profile: { name: string };
                    wa_id: string;
                }>;
                messages?: WhatsAppWebhookMessage[];
                statuses?: Array<{
                    id: string;
                    status: 'sent' | 'delivered' | 'read' | 'failed';
                    timestamp: string;
                    recipient_id: string;
                }>;
            };
            field: string;
        }>;
    }>;
}

/**
 * Parse incoming webhook and extract messages
 */
export function parseWhatsAppWebhook(payload: WhatsAppWebhookPayload): {
    messages: Array<{
        from: string;
        fromName: string;
        text: string;
        timestamp: Date;
        type: string;
        buttonId?: string;
        audioId?: string;
    }>;
    statuses: Array<{
        messageId: string;
        status: string;
        recipientId: string;
    }>;
} {
    const result = {
        messages: [] as Array<{
            from: string;
            fromName: string;
            text: string;
            timestamp: Date;
            type: string;
            buttonId?: string;
            audioId?: string;
        }>,
        statuses: [] as Array<{
            messageId: string;
            status: string;
            recipientId: string;
        }>,
    };

    for (const entry of payload.entry || []) {
        for (const change of entry.changes || []) {
            const value = change.value;

            // Extract messages
            if (value.messages) {
                for (const msg of value.messages) {
                    const contact = value.contacts?.find(c => c.wa_id === msg.from);

                    let text = '';
                    let buttonId: string | undefined;
                    let audioId: string | undefined;

                    if (msg.type === 'text' && msg.text) {
                        text = msg.text.body;
                    } else if (msg.type === 'button' && msg.button) {
                        text = msg.button.text;
                        buttonId = msg.button.payload;
                    } else if (msg.type === 'interactive' && msg.interactive) {
                        if (msg.interactive.button_reply) {
                            text = msg.interactive.button_reply.title;
                            buttonId = msg.interactive.button_reply.id;
                        } else if (msg.interactive.list_reply) {
                            text = msg.interactive.list_reply.title;
                            buttonId = msg.interactive.list_reply.id;
                        }
                    } else if (msg.type === 'audio' && msg.audio) {
                        // Audio message - needs transcription
                        audioId = msg.audio.id;
                        text = '[Audio message - pending transcription]';
                    }

                    result.messages.push({
                        from: msg.from,
                        fromName: contact?.profile?.name || 'Unknown',
                        text,
                        timestamp: new Date(parseInt(msg.timestamp) * 1000),
                        type: msg.type,
                        buttonId,
                        audioId,
                    });
                }
            }

            // Extract message statuses
            if (value.statuses) {
                for (const status of value.statuses) {
                    result.statuses.push({
                        messageId: status.id,
                        status: status.status,
                        recipientId: status.recipient_id,
                    });
                }
            }
        }
    }

    return result;
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<boolean> {
    try {
        const config = getConfig();

        const response = await fetch(
            `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    status: 'read',
                    message_id: messageId,
                }),
            }
        );

        return response.ok;
    } catch {
        return false;
    }
}
