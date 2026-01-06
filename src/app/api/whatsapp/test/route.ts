import { NextRequest, NextResponse } from 'next/server';

// Test WhatsApp API credentials
export async function GET(request: NextRequest) {
    // Check ALL possible token variable names
    const token1 = process.env.META_WHATSAPP_TOKEN;
    const token2 = process.env.WHATSAPP_ACCESS_TOKEN;
    const token3 = process.env.META_ACCESS_TOKEN;

    const token = token1 || token2 || token3;
    const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

    console.log('=== WhatsApp API Test ===');
    console.log('META_WHATSAPP_TOKEN exists:', !!token1);
    console.log('WHATSAPP_ACCESS_TOKEN exists:', !!token2);
    console.log('META_ACCESS_TOKEN exists:', !!token3);
    console.log('Using token from:', token1 ? 'META_WHATSAPP_TOKEN' : token2 ? 'WHATSAPP_ACCESS_TOKEN' : token3 ? 'META_ACCESS_TOKEN' : 'NONE');
    console.log('Token length:', token?.length || 0);
    console.log('Token first 30 chars:', token?.substring(0, 30));
    console.log('Token last 20 chars:', token?.slice(-20));
    console.log('Phone Number ID:', phoneNumberId);

    if (!token || !phoneNumberId) {
        return NextResponse.json({
            configured: false,
            error: 'Missing credentials',
            hasToken1: !!token1,
            hasToken2: !!token2,
            hasToken3: !!token3,
            hasPhoneId: !!phoneNumberId,
            phoneNumberId
        });
    }

    // Test the API with a simple request to check if credentials are valid
    try {
        const testUrl = `https://graph.facebook.com/v24.0/${phoneNumberId}`;
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
                tokenSource: token1 ? 'META_WHATSAPP_TOKEN' : token2 ? 'WHATSAPP_ACCESS_TOKEN' : 'META_ACCESS_TOKEN',
                tokenPrefix: token.substring(0, 20),
                data
            });
        } else {
            return NextResponse.json({
                configured: true,
                valid: false,
                error: data.error,
                phoneNumberId,
                tokenSource: token1 ? 'META_WHATSAPP_TOKEN' : token2 ? 'WHATSAPP_ACCESS_TOKEN' : 'META_ACCESS_TOKEN',
                tokenPrefix: token.substring(0, 20)
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
        const body = await request.json();
        const testPhone = body.testPhone || '524921243272'; // Default to user's number

        // Use the same token logic as GET
        const token1 = process.env.META_WHATSAPP_TOKEN;
        const token2 = process.env.WHATSAPP_ACCESS_TOKEN;
        const token3 = process.env.META_ACCESS_TOKEN;
        const token = token1 || token2 || token3;

        const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

        if (!token || !phoneNumberId) {
            return NextResponse.json({
                error: 'Not configured',
                hasToken1: !!token1,
                hasToken2: !!token2,
                hasToken3: !!token3,
                hasPhoneId: !!phoneNumberId
            }, { status: 500 });
        }

        // Clean phone - remove all non-numeric characters
        const cleanPhone = testPhone.replace(/[^0-9]/g, '');

        console.log('=== Sending Test Message ===');
        console.log('Original phone:', testPhone);
        console.log('Clean phone:', cleanPhone);
        console.log('Using phone ID:', phoneNumberId);
        console.log('Token source:', token1 ? 'META_WHATSAPP_TOKEN' : token2 ? 'WHATSAPP_ACCESS_TOKEN' : 'META_ACCESS_TOKEN');
        console.log('Token prefix:', token.substring(0, 30));

        const apiUrl = `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`;
        console.log('API URL:', apiUrl);

        const requestBody = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanPhone,
            type: 'text',
            text: {
                preview_url: false,
                body: '🧪 Test desde GRAVITA CRM - ' + new Date().toLocaleTimeString(),
            },
        };
        console.log('Request body:', JSON.stringify(requestBody));

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log('Send Response status:', response.status);
        console.log('Send Response data:', JSON.stringify(data));

        return NextResponse.json({
            success: response.ok,
            status: response.status,
            phoneSentTo: cleanPhone,
            tokenUsed: token.substring(0, 20) + '...',
            data
        });
    } catch (error) {
        console.error('Send test error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
