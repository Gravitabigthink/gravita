import { NextRequest, NextResponse } from 'next/server';

// Test WhatsApp API credentials
export async function GET(request: NextRequest) {
    const token = process.env.META_WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;
    const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

    console.log('=== WhatsApp API Test ===');
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length || 0);
    console.log('Token first 20 chars:', token?.substring(0, 20));
    console.log('Phone Number ID:', phoneNumberId);

    if (!token || !phoneNumberId) {
        return NextResponse.json({
            configured: false,
            error: 'Missing credentials',
            hasToken: !!token,
            hasPhoneId: !!phoneNumberId
        });
    }

    // Test the API with a simple request to check if credentials are valid
    try {
        const testUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}`;
        console.log('Testing URL:', testUrl);

        const response = await fetch(testUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        const data = await response.json();
        console.log('API Response:', JSON.stringify(data));

        if (response.ok) {
            return NextResponse.json({
                configured: true,
                valid: true,
                phoneNumberId,
                data
            });
        } else {
            return NextResponse.json({
                configured: true,
                valid: false,
                error: data.error,
                phoneNumberId
            });
        }
    } catch (error) {
        console.error('Test error:', error);
        return NextResponse.json({
            configured: true,
            valid: false,
            error: String(error)
        });
    }
}

// Send a test message
export async function POST(request: NextRequest) {
    try {
        const { testPhone } = await request.json();

        const token = process.env.META_WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;
        const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

        if (!token || !phoneNumberId) {
            return NextResponse.json({ error: 'Not configured' }, { status: 500 });
        }

        // Clean phone
        const cleanPhone = testPhone.replace(/[\s\-\(\)\+]/g, '');

        console.log('=== Sending Test Message ===');
        console.log('To phone:', cleanPhone);
        console.log('Using phone ID:', phoneNumberId);

        const response = await fetch(
            `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
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
                        body: '🧪 Mensaje de prueba desde GRAVITA CRM - ' + new Date().toLocaleTimeString(),
                    },
                }),
            }
        );

        const data = await response.json();
        console.log('Send Response:', JSON.stringify(data));

        return NextResponse.json({
            success: response.ok,
            status: response.status,
            data
        });
    } catch (error) {
        console.error('Send test error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
