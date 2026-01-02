/**
 * Google Calendar Service
 * 
 * Integración con Google Calendar API para sincronizar
 * eventos del CRM con el calendario del usuario.
 */

import { google, calendar_v3 } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google'
);

// Store tokens in memory (in production, use database)
let userTokens: { access_token?: string; refresh_token?: string } | null = null;

/**
 * Get the Google OAuth authorization URL
 */
export function getGoogleAuthUrl(): string {
    const scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
    });
}

/**
 * Handle OAuth callback and store tokens
 */
export async function handleGoogleCallback(code: string): Promise<boolean> {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        userTokens = tokens;
        return true;
    } catch (error) {
        console.error('Error getting Google tokens:', error);
        return false;
    }
}

/**
 * Check if Google Calendar is connected
 */
export function isGoogleCalendarConnected(): boolean {
    return userTokens !== null && !!userTokens.access_token;
}

/**
 * Set stored tokens (call on app start if tokens were persisted)
 */
export function setGoogleTokens(tokens: { access_token?: string; refresh_token?: string }): void {
    userTokens = tokens;
    oauth2Client.setCredentials(tokens);
}

/**
 * Get Google Calendar client
 */
function getCalendarClient(): calendar_v3.Calendar | null {
    if (!userTokens) return null;
    oauth2Client.setCredentials(userTokens);
    return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Create event in Google Calendar
 */
export async function createGoogleCalendarEvent(event: {
    title: string;
    description?: string;
    start: Date;
    end: Date;
    attendees?: string[];
    meetLink?: string;
}): Promise<{ success: boolean; eventId?: string; htmlLink?: string; error?: string }> {
    const calendar = getCalendarClient();

    if (!calendar) {
        return { success: false, error: 'Google Calendar no conectado' };
    }

    try {
        const calendarEvent: calendar_v3.Schema$Event = {
            summary: event.title,
            description: event.description || '',
            start: {
                dateTime: event.start.toISOString(),
                timeZone: 'America/Mexico_City',
            },
            end: {
                dateTime: event.end.toISOString(),
                timeZone: 'America/Mexico_City',
            },
            attendees: event.attendees?.map(email => ({ email })),
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 1 day before
                    { method: 'popup', minutes: 30 }, // 30 min before
                ],
            },
        };

        // Add Google Meet if requested
        if (event.meetLink === 'auto') {
            calendarEvent.conferenceData = {
                createRequest: {
                    requestId: `meet-${Date.now()}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' },
                },
            };
        }

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: calendarEvent,
            conferenceDataVersion: event.meetLink === 'auto' ? 1 : 0,
        });

        return {
            success: true,
            eventId: response.data.id || undefined,
            htmlLink: response.data.htmlLink || undefined,
        };
    } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Get upcoming events from Google Calendar
 */
export async function getGoogleCalendarEvents(
    maxResults: number = 10
): Promise<{ success: boolean; events?: calendar_v3.Schema$Event[]; error?: string }> {
    const calendar = getCalendarClient();

    if (!calendar) {
        return { success: false, error: 'Google Calendar no conectado' };
    }

    try {
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults,
            singleEvents: true,
            orderBy: 'startTime',
        });

        return {
            success: true,
            events: response.data.items || [],
        };
    } catch (error) {
        console.error('Error fetching Google Calendar events:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Delete event from Google Calendar
 */
export async function deleteGoogleCalendarEvent(
    eventId: string
): Promise<{ success: boolean; error?: string }> {
    const calendar = getCalendarClient();

    if (!calendar) {
        return { success: false, error: 'Google Calendar no conectado' };
    }

    try {
        await calendar.events.delete({
            calendarId: 'primary',
            eventId,
        });
        return { success: true };
    } catch (error) {
        console.error('Error deleting Google Calendar event:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Update event in Google Calendar
 */
export async function updateGoogleCalendarEvent(
    eventId: string,
    updates: Partial<{
        title: string;
        description: string;
        start: Date;
        end: Date;
    }>
): Promise<{ success: boolean; error?: string }> {
    const calendar = getCalendarClient();

    if (!calendar) {
        return { success: false, error: 'Google Calendar no conectado' };
    }

    try {
        const updateData: calendar_v3.Schema$Event = {};

        if (updates.title) updateData.summary = updates.title;
        if (updates.description) updateData.description = updates.description;
        if (updates.start) {
            updateData.start = {
                dateTime: updates.start.toISOString(),
                timeZone: 'America/Mexico_City',
            };
        }
        if (updates.end) {
            updateData.end = {
                dateTime: updates.end.toISOString(),
                timeZone: 'America/Mexico_City',
            };
        }

        await calendar.events.patch({
            calendarId: 'primary',
            eventId,
            requestBody: updateData,
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating Google Calendar event:', error);
        return { success: false, error: String(error) };
    }
}
