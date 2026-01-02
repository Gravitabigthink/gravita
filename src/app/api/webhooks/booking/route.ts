/**
 * API Route: Booking Webhook
 * 
 * Se dispara cuando un lead agenda una cita.
 * Envía confirmación por WhatsApp y actualiza score.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    sendBookingConfirmation,
    AppointmentContext
} from '@/ai/agents/scheduling-agent';
import {
    updateLeadInFirestore,
    getLeadFromFirestore
} from '@/lib/firestoreService';
import { createGoogleCalendarEvent, isGoogleCalendarConnected } from '@/lib/googleCalendarService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            leadId,
            leadName,
            leadPhone,
            leadEmail,
            date,
            time,
            type = 'videollamada',
            title,
            notes
        } = body;

        // Validate required fields
        if (!leadId || !leadName || !leadPhone || !date || !time) {
            return NextResponse.json(
                { error: 'Missing required fields: leadId, leadName, leadPhone, date, time' },
                { status: 400 }
            );
        }

        // Get current lead score
        const lead = await getLeadFromFirestore(leadId);
        const currentScore = lead?.score || 30;

        // Parse date and time
        const appointmentDate = new Date(date);
        const [hours, minutes] = time.split(':');
        appointmentDate.setHours(parseInt(hours), parseInt(minutes || '0'));

        // Create Google Calendar event if connected
        let meetLink: string | undefined;
        let googleEventId: string | undefined;

        if (isGoogleCalendarConnected()) {
            const endDate = new Date(appointmentDate);
            endDate.setHours(endDate.getHours() + 1);

            const calResult = await createGoogleCalendarEvent({
                title: title || `Videollamada - ${leadName}`,
                description: `Cita con ${leadName}\nTeléfono: ${leadPhone}\n${notes || ''}`,
                start: appointmentDate,
                end: endDate,
                attendees: leadEmail ? [leadEmail] : undefined,
                meetLink: 'auto', // Auto-create Google Meet
            });

            if (calResult.success) {
                googleEventId = calResult.eventId;
                // Extract Meet link from calendar response
                meetLink = calResult.htmlLink; // This is the calendar link, Meet link would be in the event
                console.log('✅ Google Calendar event created:', googleEventId);
            }
        }

        // Prepare context for scheduling agent
        const context: AppointmentContext = {
            leadId,
            leadName,
            leadPhone: leadPhone.replace(/\D/g, ''), // Clean phone number
            appointmentDate,
            appointmentTime: `${appointmentDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })} a las ${time}`,
            appointmentType: type,
            meetLink,
            currentScore,
        };

        // Send WhatsApp confirmation
        const confirmResult = await sendBookingConfirmation(context);

        // Update lead in Firestore
        await updateLeadInFirestore(leadId, {
            status: 'agendado',
            score: confirmResult.newScore,
            lastActivity: new Date(),
            appointmentDate: appointmentDate.toISOString(),
            googleEventId,
        });

        return NextResponse.json({
            success: true,
            message: 'Booking processed',
            whatsappSent: confirmResult.success,
            googleCalendarCreated: !!googleEventId,
            newScore: confirmResult.newScore,
        });

    } catch (error) {
        console.error('Booking webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
