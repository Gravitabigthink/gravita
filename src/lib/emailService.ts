/**
 * Email Service using Resend
 * 
 * For sending quotes, notifications, and other emails
 */

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export function isEmailConfigured(): boolean {
    return !!process.env.RESEND_API_KEY;
}

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
    }>;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        if (!resend) {
            console.log('Resend not configured');
            return { success: false, error: 'Email service not configured' };
        }

        console.log('Sending email to:', options.to);
        console.log('Subject:', options.subject);

        const { data, error } = await resend.emails.send({
            from: 'GRAVITA Marketing <onboarding@resend.dev>', // Use your verified domain
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
            attachments: options.attachments,
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, error: error.message };
        }

        console.log('Email sent successfully:', data?.id);
        return { success: true, id: data?.id };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: String(error) };
    }
}

interface QuoteEmailOptions {
    to: string;
    leadName: string;
    quote: {
        id: string;
        services: Array<{ name: string; price: number; quantity?: number }>;
        total: number;
        validUntil: Date | string;
        notes?: string;
    };
    pdfBuffer?: Buffer;
}

export async function sendQuoteEmail(options: QuoteEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    const { to, leadName, quote, pdfBuffer } = options;
    const firstName = leadName.split(' ')[0];

    const validUntil = new Date(quote.validUntil).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const servicesHtml = quote.services
        .map(s => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${s.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">$${(s.price * (s.quantity || 1)).toLocaleString()} MXN</td>
            </tr>
        `)
        .join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #18181b; margin: 0; padding: 0; background-color: #fafafa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">GRAVITA Marketing</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Tu propuesta personalizada</p>
            </div>
            
            <!-- Content -->
            <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <p style="font-size: 18px; margin-top: 0;">¡Hola ${firstName}! 👋</p>
                
                <p style="color: #52525b;">
                    Te compartimos tu cotización personalizada. Hemos diseñado esta propuesta 
                    pensando específicamente en las necesidades de tu negocio.
                </p>
                
                <!-- Services Table -->
                <div style="margin: 24px 0;">
                    <table style="width: 100%; border-collapse: collapse; background: #fafafa; border-radius: 8px; overflow: hidden;">
                        <thead>
                            <tr style="background: #f4f4f5;">
                                <th style="padding: 12px; text-align: left; font-weight: 600; color: #18181b;">Servicio</th>
                                <th style="padding: 12px; text-align: right; font-weight: 600; color: #18181b;">Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${servicesHtml}
                        </tbody>
                    </table>
                </div>
                
                <!-- Total -->
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                    <p style="color: rgba(255,255,255,0.9); margin: 0 0 4px; font-size: 14px;">TOTAL MENSUAL</p>
                    <p style="color: white; margin: 0; font-size: 32px; font-weight: 700;">$${quote.total.toLocaleString()} MXN</p>
                </div>
                
                <!-- Validity -->
                <p style="text-align: center; color: #71717a; font-size: 14px;">
                    ⏰ Cotización válida hasta: <strong>${validUntil}</strong>
                </p>
                
                ${quote.notes ? `
                <div style="background: #fef9c3; border-left: 4px solid #eab308; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #854d0e;"><strong>Nota:</strong> ${quote.notes}</p>
                </div>
                ` : ''}
                
                <!-- CTA -->
                <div style="text-align: center; margin: 32px 0;">
                    <a href="mailto:hola@gravita.mx?subject=Acepto%20cotización%20${quote.id}" 
                       style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        ✅ Aceptar Cotización
                    </a>
                </div>
                
                <p style="color: #52525b; text-align: center;">
                    ¿Tienes preguntas? Responde a este correo o escríbenos por WhatsApp.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 24px; color: #a1a1aa; font-size: 12px;">
                <p>GRAVITA Marketing · www.gravita.mx</p>
                <p>Este correo fue enviado desde el CRM de GRAVITA.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const attachments = pdfBuffer ? [{
        filename: `cotizacion-${quote.id.slice(0, 8)}.pdf`,
        content: pdfBuffer,
    }] : undefined;

    return sendEmail({
        to,
        subject: `📋 Tu Cotización de GRAVITA Marketing - $${quote.total.toLocaleString()} MXN`,
        html,
        text: `Hola ${firstName}! Te compartimos tu cotización. Total: $${quote.total.toLocaleString()} MXN. Válida hasta: ${validUntil}`,
        attachments,
    });
}
