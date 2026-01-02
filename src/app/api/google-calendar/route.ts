/**
 * Google Calendar API
 * 
 * Endpoints for managing Google Calendar connection and events
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    getGoogleAuthUrl,
    isGoogleCalendarConnected,
    createGoogleCalendarEvent,
    getGoogleCalendarEvents
} from '@/lib/googleCalendarService';

// GET: Check connection status or get auth URL
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'auth-url') {
        const authUrl = getGoogleAuthUrl();
        return NextResponse.json({ authUrl });
    }

    if (action === 'status') {
        return NextResponse.json({
            connected: isGoogleCalendarConnected()
        });
    }

    if (action === 'events') {
        const maxResults = parseInt(searchParams.get('max') || '10');
        const result = await getGoogleCalendarEvents(maxResults);
        return NextResponse.json(result);
    }

    return NextResponse.json({
        connected: isGoogleCalendarConnected(),
        message: 'Google Calendar API'
    });
}

// POST: Create event in Google Calendar
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, start, end, attendees, meetLink } = body;

        if (!title || !start || !end) {
            return NextResponse.json(
                { error: 'title, start, and end are required' },
                { status: 400 }
            );
        }

        const result = await createGoogleCalendarEvent({
            title,
            description,
            start: new Date(start),
            end: new Date(end),
            attendees,
            meetLink,
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                eventId: result.eventId,
                htmlLink: result.htmlLink,
            });
        } else {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Google Calendar POST error:', error);
        return NextResponse.json(
            { error: 'Error creating event' },
            { status: 500 }
        );
    }
}
