/**
 * API Route: Test WhatsApp
 * 
 * GET /api/test-whatsapp?to=524921243272
 * Sends a test message to verify WhatsApp Cloud API is working
 */

import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v22.0';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const to = searchParams.get('to') || '524921243272';

    const token = process.env.META_WHATSAPP_TOKEN;
    const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
        return NextResponse.json({
            success: false,
            error: 'WhatsApp Cloud API not configured',
        }, { status: 500 });
    }

    try {
        // Use template message (required for test numbers)
        const response = await fetch(
            `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: to,
                    type: 'template',
                    template: {
                        name: 'hello_world',
                        language: { code: 'en_US' }
                    }
                }),
            }
        );

        const data = await response.json();

        if (response.ok && data.messages?.[0]?.id) {
            return NextResponse.json({
                success: true,
                message: 'Mensaje de plantilla enviado correctamente',
                messageId: data.messages[0].id,
                to,
            });
        } else {
            return NextResponse.json({
                success: false,
                error: data.error?.message || JSON.stringify(data),
                to,
            }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: String(error),
        }, { status: 500 });
    }
}
