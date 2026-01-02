import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage, isWhatsAppConfigured } from '@/lib/whatsappService';

// Generic WhatsApp message sending endpoint
export async function POST(request: NextRequest) {
    try {
        const { phone, message, leadName } = await request.json();

        if (!phone) {
            return NextResponse.json(
                { success: false, error: 'Phone number is required' },
                { status: 400 }
            );
        }

        if (!message) {
            return NextResponse.json(
                { success: false, error: 'Message is required' },
                { status: 400 }
            );
        }

        // Check if WhatsApp is configured
        if (!isWhatsAppConfigured()) {
            console.log('WhatsApp Cloud API not configured, returning fallback');
            return NextResponse.json({
                success: false,
                fallback: true,
                error: 'WhatsApp Cloud API not configured'
            });
        }

        // Clean phone number - remove +, spaces, dashes, etc
        const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');

        console.log('=== WhatsApp Send Request ===');
        console.log('Original phone:', phone);
        console.log('Cleaned phone:', cleanPhone);
        console.log('Message preview:', message.substring(0, 50) + '...');

        console.log(`Sending WhatsApp message to ${cleanPhone}`);
        const result = await sendWhatsAppMessage(cleanPhone, message);

        if (result.success) {
            console.log('WhatsApp message sent successfully:', result.messageId);
            return NextResponse.json({
                success: true,
                messageId: result.messageId,
                message: 'Mensaje enviado por WhatsApp'
            });
        } else {
            console.error('WhatsApp send failed:', result.error);
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in WhatsApp send endpoint:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send WhatsApp message' },
            { status: 500 }
        );
    }
}
