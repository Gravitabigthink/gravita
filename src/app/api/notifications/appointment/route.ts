/**
 * API Route: Send Appointment Notifications
 * 
 * POST /api/notifications/appointment
 * 
 * FREE integrations:
 * - Email: Resend (3,000/month free)
 * - WhatsApp: wa.me links (100% free)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    sendAppointmentNotifications,
    generateWhatsAppLink,
    generateAppointmentWhatsAppMessage,
    AppointmentDetails,
    NotificationSettings
} from '@/lib/notificationService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { appointment, settings } = body as {
            appointment: AppointmentDetails;
            settings: NotificationSettings;
        };

        if (!appointment) {
            return NextResponse.json(
                { error: 'Datos de cita requeridos' },
                { status: 400 }
            );
        }

        // Convert date strings back to Date objects
        const appointmentWithDates: AppointmentDetails = {
            ...appointment,
            start: new Date(appointment.start),
            end: new Date(appointment.end),
        };

        const result = await sendAppointmentNotifications(appointmentWithDates, settings);

        return NextResponse.json({
            success: true,
            emailSent: result.emailSent,
            whatsAppLink: result.whatsAppLink,
            message: result.message,
        });
    } catch (error) {
        console.error('Notification error:', error);
        return NextResponse.json(
            { error: 'Error al enviar notificaciones' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/notifications/appointment?phone=xxx&appointmentId=xxx
 * 
 * Returns WhatsApp link for a specific appointment
 * Useful for generating links on the fly
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const leadName = searchParams.get('leadName') || 'Cliente';
    const title = searchParams.get('title') || 'Cita';
    const start = searchParams.get('start');
    const meetLink = searchParams.get('meetLink');

    if (!phone) {
        return NextResponse.json(
            { error: 'Teléfono requerido' },
            { status: 400 }
        );
    }

    const appointment: AppointmentDetails = {
        id: 'temp',
        title,
        leadName,
        leadPhone: phone,
        start: start ? new Date(start) : new Date(),
        end: new Date(Date.now() + 30 * 60 * 1000), // 30 min default
        type: 'videollamada',
        meetLink: meetLink || undefined,
    };

    const message = generateAppointmentWhatsAppMessage(appointment);
    const whatsAppLink = generateWhatsAppLink(phone, message);

    return NextResponse.json({
        success: true,
        whatsAppLink,
        message,
    });
}
