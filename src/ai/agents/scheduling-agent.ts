/**
 * Scheduling Agent
 * 
 * Agente IA especializado en confirmaciones de citas:
 * - Enviar confirmación después de agendar
 * - Procesar respuestas (confirma/reagenda/cancela)
 * - Actualizar score del lead
 * - Manejar pre-calls de calentamiento
 */

import { routeToLLM, LLMRequest } from '@/lib/llmRouter';
import { sendWhatsAppMessage, isWhatsAppConfigured } from '@/lib/whatsappService';
import { createGoogleCalendarEvent, isGoogleCalendarConnected } from '@/lib/googleCalendarService';

// Lead scoring values
const SCORE_CHANGES = {
    CONFIRMED: +15,       // Cliente confirma cita
    RESCHEDULED: +5,      // Cliente reagenda (sigue interesado)
    ASKED_QUESTIONS: +10, // Cliente hace preguntas (engagement)
    NO_RESPONSE_24H: -5,  // No respondió en 24h
    CANCELLED: -20,       // Cliente cancela
    SHOWED_UP: +30,       // Asistió a la cita
    NO_SHOW: -25,         // No asistió
    ACCEPTED_QUOTE: +50,  // Aceptó cotización
    REJECTED_QUOTE: -10,  // Rechazó cotización
};

export interface AppointmentContext {
    leadId: string;
    leadName: string;
    leadPhone: string;
    appointmentDate: Date;
    appointmentTime: string;
    appointmentType: 'videollamada' | 'llamada' | 'presencial';
    meetLink?: string;
    currentScore: number;
}

/**
 * Send initial confirmation message after booking
 */
export async function sendBookingConfirmation(
    context: AppointmentContext
): Promise<{ success: boolean; message?: string; newScore: number }> {
    const firstName = context.leadName.split(' ')[0];
    const dateStr = new Intl.DateTimeFormat('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(context.appointmentDate);

    const message = `¡Hola ${firstName}! 🎉

¡Qué gusto tenerte agendado! 🚀

Confirmando tu cita:
📅 ${dateStr}
⏰ ${context.appointmentTime}
📹 Videollamada

En esta sesión vamos a analizar tu negocio y mostrarte cómo podemos ayudarte a conseguir más clientes.

¿Todo bien con la fecha y hora? Responde:
✅ *SÍ* - Confirmado
📅 *CAMBIAR* - Si necesitas otra fecha
❓ *DUDAS* - Si tienes preguntas antes

¡Te esperamos! 💪`;

    if (!isWhatsAppConfigured()) {
        return {
            success: false,
            message: 'WhatsApp no configurado',
            newScore: context.currentScore,
        };
    }

    const result = await sendWhatsAppMessage(context.leadPhone, message);

    if (result.success) {
        // Increase score for successful contact
        const newScore = Math.min(100, context.currentScore + 5);
        return {
            success: true,
            message: 'Confirmación enviada',
            newScore,
        };
    }

    return {
        success: false,
        message: result.error,
        newScore: context.currentScore,
    };
}

/**
 * Process client response about appointment
 */
export async function processSchedulingResponse(
    context: AppointmentContext,
    clientMessage: string
): Promise<{
    action: 'confirmed' | 'reschedule' | 'questions' | 'cancelled' | 'unknown';
    response: string;
    scoreChange: number;
    shouldUpdatePipeline: boolean;
    newStage?: string;
}> {
    const lowerMessage = clientMessage.toLowerCase().trim();

    // Quick detection of common responses
    if (
        lowerMessage.includes('sí') ||
        lowerMessage.includes('si') ||
        lowerMessage.includes('confirmado') ||
        lowerMessage.includes('perfecto') ||
        lowerMessage.includes('ok') ||
        lowerMessage === '✅'
    ) {
        return {
            action: 'confirmed',
            response: `¡Excelente ${context.leadName.split(' ')[0]}! 🎉

Tu cita está confirmada:
📅 ${context.appointmentTime}
${context.meetLink ? `📹 Link: ${context.meetLink}` : ''}

Te enviaré un recordatorio antes de la sesión.

¡Nos vemos pronto! 🚀`,
            scoreChange: SCORE_CHANGES.CONFIRMED,
            shouldUpdatePipeline: true,
            newStage: 'agendado',
        };
    }

    if (
        lowerMessage.includes('cambiar') ||
        lowerMessage.includes('reagendar') ||
        lowerMessage.includes('otra fecha') ||
        lowerMessage.includes('no puedo')
    ) {
        return {
            action: 'reschedule',
            response: `Sin problema ${context.leadName.split(' ')[0]} 👍

¿Qué día y hora te funcionan mejor?

Tenemos disponibilidad:
🗓️ Lunes a Viernes
⏰ 9am - 6pm (hora CDMX)

Solo dime qué te acomoda y lo agendamos.`,
            scoreChange: SCORE_CHANGES.RESCHEDULED,
            shouldUpdatePipeline: false,
        };
    }

    if (
        lowerMessage.includes('duda') ||
        lowerMessage.includes('pregunta') ||
        lowerMessage.includes('cómo') ||
        lowerMessage.includes('qué') ||
        lowerMessage.includes('cuánto') ||
        lowerMessage.includes('precio') ||
        lowerMessage === '❓'
    ) {
        // Use AI to answer questions
        const aiResponse = await generatePreCallResponse(context, clientMessage);
        return {
            action: 'questions',
            response: aiResponse,
            scoreChange: SCORE_CHANGES.ASKED_QUESTIONS,
            shouldUpdatePipeline: false,
        };
    }

    if (
        lowerMessage.includes('cancelar') ||
        lowerMessage.includes('no me interesa') ||
        lowerMessage.includes('ya no')
    ) {
        return {
            action: 'cancelled',
            response: `Entendido ${context.leadName.split(' ')[0]}.

Si en el futuro necesitas ayuda con tu marketing digital, aquí estaremos. 🙌

¡Mucho éxito! 🚀`,
            scoreChange: SCORE_CHANGES.CANCELLED,
            shouldUpdatePipeline: true,
            newStage: 'descartado',
        };
    }

    // Unknown - use AI to interpret
    const aiResponse = await generatePreCallResponse(context, clientMessage);
    return {
        action: 'unknown',
        response: aiResponse,
        scoreChange: 0,
        shouldUpdatePipeline: false,
    };
}

/**
 * Generate AI response for pre-call questions
 */
async function generatePreCallResponse(
    context: AppointmentContext,
    question: string
): Promise<string> {
    const systemPrompt = `Eres el asistente de Gravita, agencia de marketing digital.
    
El cliente ${context.leadName} tiene una cita agendada para ${context.appointmentTime}.

Responde su pregunta de forma breve y amigable. Si preguntan precios específicos, di que en la videollamada se personaliza según sus necesidades.

REGLAS:
- Máximo 3-4 oraciones
- Mantén el enfoque en que asista a la videollamada
- Sé amigable pero profesional
- No inventes servicios ni precios`;

    const request: LLMRequest = {
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question },
        ],
        system: systemPrompt,
        temperature: 0.7,
        maxTokens: 200,
    };

    const result = await routeToLLM(request);

    if (result.success && result.content) {
        return result.content;
    }

    return `¡Buena pregunta! 😊

Todo eso lo veremos en detalle durante la videollamada. Ahí podremos personalizar la estrategia según tu negocio.

¿Confirmamos la cita? ✅`;
}

/**
 * Send reminder before appointment
 */
export async function sendReminder(
    context: AppointmentContext,
    reminderType: '1day' | '3hours' | '15min'
): Promise<{ success: boolean }> {
    const firstName = context.leadName.split(' ')[0];

    let message = '';

    switch (reminderType) {
        case '1day':
            message = `¡Hola ${firstName}! 👋

Te recuerdo que mañana tenemos nuestra videollamada:
⏰ ${context.appointmentTime}

¿Todo listo? 🚀`;
            break;

        case '3hours':
            message = `¡${firstName}! 📢

En 3 horas nos conectamos para tu sesión de diagnóstico.

${context.meetLink ? `📹 Link: ${context.meetLink}` : ''}

¡Prepárate para descubrir cómo aumentar tus ventas!`;
            break;

        case '15min':
            message = `¡${firstName}, empezamos en 15 minutos! ⏰

${context.meetLink ? `👉 Entra aquí: ${context.meetLink}` : ''}

¡Te esperamos! 🎉`;
            break;
    }

    if (!isWhatsAppConfigured()) {
        return { success: false };
    }

    const result = await sendWhatsAppMessage(context.leadPhone, message);
    return { success: result.success };
}

export { SCORE_CHANGES };
