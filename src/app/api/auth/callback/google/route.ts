/**
 * Google OAuth Callback
 * 
 * Handles the OAuth callback from Google after user authorizes
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleGoogleCallback } from '@/lib/googleCalendarService';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        console.error('Google OAuth error:', error);
        return NextResponse.redirect(new URL('/crm/calendario?error=google_auth_failed', request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/crm/calendario?error=no_code', request.url));
    }

    try {
        const success = await handleGoogleCallback(code);

        if (success) {
            return NextResponse.redirect(new URL('/crm/calendario?google=connected', request.url));
        } else {
            return NextResponse.redirect(new URL('/crm/calendario?error=token_exchange_failed', request.url));
        }
    } catch (err) {
        console.error('Google callback error:', err);
        return NextResponse.redirect(new URL('/crm/calendario?error=callback_failed', request.url));
    }
}
