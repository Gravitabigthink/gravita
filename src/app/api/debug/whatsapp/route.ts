/**
 * WhatsApp Debug Endpoint
 * 
 * Diagnóstico completo del sistema de WhatsApp
 */

import { NextResponse } from 'next/server';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

export async function GET() {
    const token = process.env.META_WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;
    const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
    const geminiKey = process.env.GEMINI_API_KEY;

    const results: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        environment: {
            hasWhatsAppToken: !!token,
            tokenPreview: token ? `${token.substring(0, 20)}...${token.substring(token.length - 10)}` : 'NOT SET',
            phoneNumberId: phoneNumberId || 'NOT SET',
            hasGeminiKey: !!geminiKey,
        },
        tests: {} as Record<string, unknown>,
    };

    // Test 1: Verify token with Meta API
    if (token && phoneNumberId) {
        try {
            const response = await fetch(
                `${WHATSAPP_API_URL}/${phoneNumberId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();

            results.tests = {
                ...results.tests as Record<string, unknown>,
                tokenValidation: {
                    success: response.ok,
                    status: response.status,
                    response: response.ok ? {
                        phoneNumber: data.display_phone_number,
                        verifiedName: data.verified_name,
                        qualityRating: data.quality_rating,
                    } : data.error,
                },
            };
        } catch (error) {
            results.tests = {
                ...results.tests as Record<string, unknown>,
                tokenValidation: {
                    success: false,
                    error: String(error),
                },
            };
        }
    } else {
        results.tests = {
            ...results.tests as Record<string, unknown>,
            tokenValidation: {
                success: false,
                error: 'Missing token or phoneNumberId',
            },
        };
    }

    // Test 2: Check if can send test message (dry run info)
    results.tests = {
        ...results.tests as Record<string, unknown>,
        sendMessageEndpoint: {
            url: phoneNumberId ? `${WHATSAPP_API_URL}/${phoneNumberId}/messages` : 'NOT CONFIGURED',
            method: 'POST',
            requiredHeaders: ['Authorization: Bearer <token>', 'Content-Type: application/json'],
        },
    };

    return NextResponse.json(results, { status: 200 });
}

// Test sending a message
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { to, message } = body;

        if (!to || !message) {
            return NextResponse.json({ error: 'Missing "to" or "message" in request body' }, { status: 400 });
        }

        const token = process.env.META_WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;
        const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

        if (!token || !phoneNumberId) {
            return NextResponse.json({
                error: 'WhatsApp not configured',
                hasToken: !!token,
                hasPhoneId: !!phoneNumberId,
            }, { status: 500 });
        }

        // Clean phone number
        const cleanPhone = to.replace(/[\s\-\(\)\+]/g, '');

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
                    recipient_type: 'individual',
                    to: cleanPhone,
                    type: 'text',
                    text: {
                        preview_url: false,
                        body: message,
                    },
                }),
            }
        );

        const data = await response.json();

        return NextResponse.json({
            success: response.ok,
            status: response.status,
            response: data,
            debug: {
                phoneNumberIdUsed: phoneNumberId,
                recipientCleaned: cleanPhone,
            },
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: String(error),
        }, { status: 500 });
    }
}
