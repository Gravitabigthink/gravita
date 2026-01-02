import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage, isWhatsAppConfigured } from '@/lib/whatsappService';

// Send quote via WhatsApp Cloud API
export async function POST(request: NextRequest) {
    try {
        const { phone, leadName, quote, email } = await request.json();

        // Clean phone number - remove +, spaces, dashes, etc
        const cleanPhone = phone ? phone.replace(/[\s\-\(\)\+]/g, '') : null;

        console.log('=== Quote Send Request ===');
        console.log('Original Phone:', phone);
        console.log('Cleaned Phone:', cleanPhone);
        console.log('Lead Name:', leadName);
        console.log('WhatsApp Configured:', isWhatsAppConfigured());
        console.log('Email:', email);

        if (!phone) {
            return NextResponse.json(
                { success: false, error: 'Phone number is required' },
                { status: 400 }
            );
        }

        if (!isWhatsAppConfigured()) {
            console.log('WhatsApp NOT configured - returning fallback');
            return NextResponse.json(
                { success: false, error: 'WhatsApp Cloud API not configured', fallback: true },
                { status: 503 }
            );
        }

        console.log('WhatsApp IS configured, proceeding with send...');

        // Format quote message
        const formattedTotal = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
        }).format(quote.total);

        const servicesText = quote.services
            .map((s: { name: string; price: number }) =>
                `• ${s.name}: $${s.price.toLocaleString()} MXN`
            )
            .join('\n');

        const validUntil = new Date(quote.validUntil).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const message = `📋 *Cotización GRAVITA Marketing*

¡Hola ${leadName.split(' ')[0]}! 👋

Te compartimos tu propuesta personalizada:

*Servicios incluidos:*
${servicesText}

💰 *Total: ${formattedTotal}*
📅 *Válida hasta:* ${validUntil}

${quote.notes ? `📝 *Notas:* ${quote.notes}\n` : ''}
¿Tienes alguna pregunta? Responde a este mensaje y con gusto te ayudamos. 🚀

_Para aceptar, responde "ACEPTO" o agenda una llamada para resolver dudas._`;

        console.log('Sending WhatsApp message...');
        console.log('Message length:', message.length);

        const result = await sendWhatsAppMessage(cleanPhone, message);

        console.log('WhatsApp send result:', JSON.stringify(result));

        if (result.success) {
            console.log('SUCCESS! Message ID:', result.messageId);
            return NextResponse.json({
                success: true,
                messageId: result.messageId,
                message: 'Cotización enviada por WhatsApp'
            });
        } else {
            console.log('FAILED! Error:', result.error);
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error sending quote:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send quote' },
            { status: 500 }
        );
    }
}
