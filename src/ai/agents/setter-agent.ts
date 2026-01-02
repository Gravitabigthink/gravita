/**
 * Agent Setter - The Sales Assistant
 * 
 * Agente IA que actúa como setter/closer profesional:
 * - Mensajes de bienvenida personalizados
 * - Seguimiento automático
 * - Calificación de leads
 * - Guía al closer humano
 * - Puede cerrar si detecta alta intención
 */

import { Lead, LeadStatus, PsychType } from '@/types/lead';

// Mensajes por etapa del pipeline
export interface MessageTemplate {
    trigger: LeadStatus;
    delay?: number; // minutos
    condition?: (lead: Lead) => boolean;
    getMessage: (lead: Lead) => string;
}

// Plantillas de mensajes profesionales
export const MESSAGE_TEMPLATES: MessageTemplate[] = [
    // Bienvenida a nuevo lead
    {
        trigger: 'nuevo',
        getMessage: (lead) =>
            `¡Hola ${lead.nombre}! Soy el asistente de Gravita. Vi que te interesa potenciar tu negocio con marketing digital. ¿Tienes 2 minutos para contarme sobre tu proyecto? Así podemos prepararte una propuesta personalizada.`,
    },

    // Seguimiento si no responde (24h)
    {
        trigger: 'nuevo',
        delay: 1440,
        condition: (lead) => {
            const lastInteraction = lead.interactions[lead.interactions.length - 1];
            if (!lastInteraction) return true;
            const hoursSince =
                (Date.now() - new Date(lastInteraction.timestamp).getTime()) / 3600000;
            return lastInteraction.direction === 'saliente' && hoursSince > 24;
        },
        getMessage: (lead) =>
            `¡Hola ${lead.nombre}! ¿Pudiste revisar mi mensaje anterior? Me encantaría conocer más sobre tu negocio y cómo podemos ayudarte a crecer. ¿Tienes 5 minutos hoy?`,
    },

    // Pre-agenda
    {
        trigger: 'contactado',
        getMessage: (lead) =>
            `Perfecto, ${lead.nombre}. Para darte una propuesta personalizada, nuestro especialista puede agendar una videollamada de 30 min. ¿Te funciona mejor mañana a las 10am o 3pm?`,
    },

    // Confirmación de cita
    {
        trigger: 'agendado',
        getMessage: (lead) => {
            if (!lead.nextMeeting) return '';
            const date = new Date(lead.nextMeeting.scheduledAt).toLocaleDateString('es-MX', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
            });
            return `¡Listo, ${lead.nombre}! Tu cita está confirmada para el ${date}. Te llegará el link de Google Meet al correo. ¿Alguna duda antes de la llamada?`;
        },
    },

    // Recordatorio 1 hora antes
    {
        trigger: 'agendado',
        delay: -60, // 60 minutos antes de la cita
        condition: (lead) => {
            if (!lead.nextMeeting) return false;
            const meetingTime = new Date(lead.nextMeeting.scheduledAt).getTime();
            const now = Date.now();
            const diffMinutes = (meetingTime - now) / 60000;
            return diffMinutes > 0 && diffMinutes <= 60;
        },
        getMessage: (lead) =>
            `¡${lead.nombre}! En 1 hora es tu cita con nuestro especialista. Aquí tu link: ${lead.nextMeeting?.meetLink || '[Link]'}. ¿Todo bien para conectarnos?`,
    },

    // Recordatorio 15 minutos antes
    {
        trigger: 'agendado',
        delay: -15,
        condition: (lead) => {
            if (!lead.nextMeeting) return false;
            const meetingTime = new Date(lead.nextMeeting.scheduledAt).getTime();
            const now = Date.now();
            const diffMinutes = (meetingTime - now) / 60000;
            return diffMinutes > 0 && diffMinutes <= 15;
        },
        getMessage: (lead) =>
            `¡Arrancamos en 15 min, ${lead.nombre}! ${lead.nextMeeting?.meetLink || ''}`,
    },

    // No-show recovery (30 min después)
    {
        trigger: 'no_show',
        delay: 30,
        getMessage: (lead) =>
            `¡${lead.nombre}! No pudimos conectar en la llamada. ¿Todo bien? Entendemos que surgen imprevistos. ¿Te gustaría reagendar para cuando te funcione mejor?`,
    },

    // Post-llamada exitosa
    {
        trigger: 'show',
        getMessage: (lead) =>
            `¡${lead.nombre}! Fue un gusto platicar. Nuestro equipo ya está preparando tu propuesta personalizada. Te la enviaremos en las próximas horas. ¿Alguna duda mientras tanto?`,
    },

    // Propuesta enviada
    {
        trigger: 'propuesta_enviada',
        getMessage: (lead) => {
            const name = lead.nombre;
            const psychMessage = getPsychBasedMessage(lead.psychProfile?.dominantType);
            return `${name}, te adjunto tu propuesta personalizada. ${psychMessage} ¿Cuándo podemos revisar dudas juntos?`;
        },
    },

    // Seguimiento propuesta (48h)
    {
        trigger: 'propuesta_enviada',
        delay: 2880,
        condition: (lead) => {
            const lastInteraction = lead.interactions[lead.interactions.length - 1];
            if (!lastInteraction) return true;
            const hoursSince =
                (Date.now() - new Date(lastInteraction.timestamp).getTime()) / 3600000;
            return lastInteraction.direction === 'saliente' && hoursSince > 48;
        },
        getMessage: (lead) =>
            `¡Hola ${lead.nombre}! ¿Pudiste revisar la propuesta? Estoy aquí para resolver cualquier duda. ¿Te parece si agendamos 10 minutos para revisarla juntos?`,
    },

    // Negociación
    {
        trigger: 'negociacion',
        getMessage: (lead) => {
            const psychType = lead.psychProfile?.dominantType || 'asertivo';
            return getNegotiationMessage(lead.nombre, psychType);
        },
    },
];

// Mensajes personalizados por tipo psicológico
function getPsychBasedMessage(psychType?: PsychType): string {
    if (!psychType) return 'Revisé cada detalle pensando en tu negocio.';

    const messages: Record<PsychType, string> = {
        analitico:
            'Incluí proyecciones de ROI y métricas clave para que puedas evaluar objetivamente cada servicio.',
        emocional:
            'Armé algo especial pensando en la transformación que van a lograr. ¡Estoy emocionado por el potencial!',
        asertivo:
            'Va directo al grano con 3 opciones claras. Solo elige la que mejor se ajuste y arrancamos.',
        indeciso:
            'No hay presión. Tómate tu tiempo para revisar y cualquier duda la resolvemos juntos.',
    };

    return messages[psychType];
}

// Mensajes de negociación por tipo
function getNegotiationMessage(nombre: string, psychType: PsychType): string {
    const messages: Record<PsychType, string> = {
        analitico: `${nombre}, analizando los números, empezar este mes te daría ventaja para los resultados del Q1. ¿Tiene sentido para ti?`,
        emocional: `${nombre}, imagina cómo se verá tu negocio en 3 meses con todo esto funcionando. ¿Listo para empezar esa transformación?`,
        asertivo: `${nombre}, hagámoslo. ¿Qué opción eliges para arrancar esta semana?`,
        indeciso: `${nombre}, ¿qué te parece si empezamos con un proyecto pequeño para que veas resultados sin tanto compromiso inicial?`,
    };

    return messages[psychType];
}

// Guía para el closer humano
export interface CloserGuidance {
    currentPhase: string;
    suggestedActions: string[];
    talkingPoints: string[];
    objectionHandlers: Record<string, string>;
    closeAttempt: string;
}

export function generateCloserGuidance(lead: Lead): CloserGuidance {
    const psychType = lead.psychProfile?.dominantType || 'asertivo';

    const phaseGuidance: Record<LeadStatus, string> = {
        nuevo: 'Calificación inicial',
        contactado: 'Descubrimiento de necesidades',
        agendado: 'Preparación para llamada',
        show: 'Presentación y diagnóstico',
        no_show: 'Recuperación',
        propuesta_enviada: 'Seguimiento de propuesta',
        negociacion: 'Cierre',
        ganado: 'Onboarding',
        perdido: 'Análisis de pérdida',
    };

    const suggestedActions = getSuggestedActions(lead.status, psychType);
    const talkingPoints = getTalkingPoints(lead);
    const objectionHandlers = getObjectionHandlers(lead);
    const closeAttempt = getCloseAttempt(psychType);

    return {
        currentPhase: phaseGuidance[lead.status],
        suggestedActions,
        talkingPoints,
        objectionHandlers,
        closeAttempt,
    };
}

function getSuggestedActions(status: LeadStatus, psychType: PsychType): string[] {
    const baseActions: Record<LeadStatus, string[]> = {
        nuevo: ['Enviar mensaje de bienvenida', 'Calificar el lead', 'Obtener info de negocio'],
        contactado: ['Identificar necesidades principales', 'Proponer agendar llamada'],
        agendado: ['Enviar recordatorio', 'Preparar preguntas de descubrimiento'],
        show: ['Hacer diagnóstico completo', 'Identificar presupuesto', 'Generar urgencia'],
        no_show: ['Enviar mensaje de recuperación', 'Ofrecer reagendar', 'Llamar en 24h'],
        propuesta_enviada: ['Hacer seguimiento', 'Resolver objeciones', 'Cerrar'],
        negociacion: ['Negociar términos', 'Ofrecer incentivo', 'Cerrar hoy'],
        ganado: ['Iniciar onboarding', 'Solicitar referidos'],
        perdido: ['Analizar razones', 'Programar seguimiento futuro'],
    };

    return baseActions[status] || [];
}

function getTalkingPoints(lead: Lead): string[] {
    const points: string[] = [];

    if (lead.detectedNeeds.length > 0) {
        points.push(`Necesidades: ${lead.detectedNeeds.join(', ')}`);
    }

    if (lead.psychProfile?.painPoints && lead.psychProfile.painPoints.length > 0) {
        points.push(`Pain points: ${lead.psychProfile.painPoints.join(', ')}`);
    }

    if (lead.potentialValue) {
        points.push(`Valor potencial: $${lead.potentialValue.toLocaleString('es-MX')} MXN`);
    }

    if (lead.psychProfile?.recommendedStrategy) {
        points.push(`Estrategia: ${lead.psychProfile.recommendedStrategy}`);
    }

    return points;
}

function getObjectionHandlers(lead: Lead): Record<string, string> {
    return {
        'Muy caro':
            'Entiendo la inversión. Veamos el ROI: si generamos X leads que se conviertan en clientes a $Y, ¿tiene sentido la inversión?',
        'Tengo que pensarlo':
            'Claro, tómate tu tiempo. ¿Qué información adicional te ayudaría a tomar la decisión?',
        'Ya trabajo con otra agencia':
            '¿Qué resultados están obteniendo? Podemos mostrarte cómo mejorar esos números.',
        'No tengo tiempo':
            'Precisamente nos encargamos de todo para que tú te enfoques en tu negocio. ¿Cuántas horas a la semana dedicas al marketing actualmente?',
        'Necesito consultarlo':
            'Perfecto. ¿Podemos agendar una llamada con tu socio/equipo para resolver dudas juntos?',
    };
}

function getCloseAttempt(psychType: PsychType): string {
    const closes: Record<PsychType, string> = {
        analitico:
            'Basándote en los datos que vimos, ¿qué opción te hace más sentido financieramente?',
        emocional:
            '¿Estás listo para empezar esta transformación en tu negocio?',
        asertivo:
            'Perfecto, ¿arrancamos con el paquete completo o el básico?',
        indeciso:
            '¿Qué te parece si empezamos con un mes de prueba sin compromiso a largo plazo?',
    };

    return closes[psychType];
}

// Evaluar si la IA puede cerrar sola
export function canAIClose(lead: Lead): { canClose: boolean; reason: string } {
    // Condiciones para auto-cierre
    const hasHighScore = lead.leadScore >= 85;
    const isAsertivo = lead.psychProfile?.dominantType === 'asertivo';
    const hasClearedObjections =
        !lead.psychProfile?.objections || lead.psychProfile.objections.length === 0;
    const hasProposalSent = lead.status === 'propuesta_enviada' || lead.status === 'negociacion';

    if (hasHighScore && isAsertivo && hasClearedObjections && hasProposalSent) {
        return {
            canClose: true,
            reason: 'Lead con alta intención, perfil asertivo y sin objeciones. Intentar cierre directo.',
        };
    }

    if (hasHighScore && hasClearedObjections) {
        return {
            canClose: false,
            reason: 'Alta intención pero recomendar que closer humano haga el cierre para mejor conversión.',
        };
    }

    return {
        canClose: false,
        reason: 'Requiere más nurturing o resolución de objeciones antes del cierre.',
    };
}
