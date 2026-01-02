/**
 * Proactive Orchestrator
 * 
 * Motor central que analiza el estado de cada lead y genera
 * sugerencias de acciones proactivas para el closer.
 */

import { Lead, LeadStatus } from '@/types/lead';
import { MESSAGE_TEMPLATES, generateCloserGuidance } from './setter-agent';
import { generateQuote } from './quote-agent';

// Tipos de sugerencias
export type SuggestionType = 'message' | 'call' | 'email' | 'quote' | 'reminder' | 'follow_up';
export type SuggestionPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface ProactiveSuggestion {
    id: string;
    type: SuggestionType;
    priority: SuggestionPriority;
    title: string;
    description: string;
    suggestedContent?: string;
    dueIn?: string;
    icon: string;
    action?: {
        label: string;
        callback: string; // Identifier for the action to execute
    };
}

// Tiempo desde última actividad en minutos
function getMinutesSinceLastActivity(lead: Lead): number {
    if (!lead.lastContactAt) return Infinity;
    return Math.floor((Date.now() - new Date(lead.lastContactAt).getTime()) / 60000);
}

// Tiempo hasta la próxima cita en minutos
function getMinutesToNextMeeting(lead: Lead): number | null {
    if (!lead.nextMeeting?.scheduledAt) return null;
    return Math.floor((new Date(lead.nextMeeting.scheduledAt).getTime() - Date.now()) / 60000);
}

// Generar ID único
function generateId(): string {
    return `sug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Analiza un lead y genera sugerencias proactivas
 */
export function getProactiveSuggestions(lead: Lead): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];
    const minutesSinceActivity = getMinutesSinceLastActivity(lead);
    const minutesToMeeting = getMinutesToNextMeeting(lead);

    // ========== NUEVO LEAD ==========
    if (lead.status === 'nuevo') {
        // Scoring inicial
        if (lead.leadScore === 0) {
            suggestions.push({
                id: generateId(),
                type: 'follow_up',
                priority: 'high',
                title: 'Calcular Score Inicial',
                description: `Analizar y calificar a ${lead.nombre} basándose en su fuente y datos.`,
                icon: 'sparkles',
                action: {
                    label: 'Calcular Score',
                    callback: 'CALCULATE_SCORE',
                },
            });
        }

        // Mensaje de bienvenida
        const welcomeTemplate = MESSAGE_TEMPLATES.find(t => t.trigger === 'nuevo' && !t.delay);
        if (welcomeTemplate) {
            suggestions.push({
                id: generateId(),
                type: 'message',
                priority: 'urgent',
                title: 'Enviar Mensaje de Bienvenida',
                description: 'Primer contacto con el prospecto via WhatsApp.',
                suggestedContent: welcomeTemplate.getMessage(lead),
                dueIn: 'Ahora',
                icon: 'message-circle',
                action: {
                    label: 'Enviar WhatsApp',
                    callback: 'SEND_WHATSAPP',
                },
            });
        }
    }

    // ========== SIN RESPUESTA (24+ horas) ==========
    if (lead.status === 'nuevo' && minutesSinceActivity > 1440) {
        const followUpTemplate = MESSAGE_TEMPLATES.find(
            t => t.trigger === 'nuevo' && t.delay === 1440
        );
        if (followUpTemplate) {
            suggestions.push({
                id: generateId(),
                type: 'follow_up',
                priority: 'high',
                title: 'Seguimiento: Sin Respuesta',
                description: `${lead.nombre} no ha respondido en más de 24 horas.`,
                suggestedContent: followUpTemplate.getMessage(lead),
                dueIn: 'Urgente',
                icon: 'clock',
                action: {
                    label: 'Enviar Seguimiento',
                    callback: 'SEND_FOLLOWUP',
                },
            });
        }
    }

    // ========== CITA AGENDADA ==========
    if (lead.status === 'agendado' && minutesToMeeting !== null) {
        // Confirmación de cita
        const confirmTemplate = MESSAGE_TEMPLATES.find(
            t => t.trigger === 'agendado' && !t.delay
        );
        if (confirmTemplate && minutesToMeeting > 60) {
            suggestions.push({
                id: generateId(),
                type: 'message',
                priority: 'medium',
                title: 'Confirmar Cita',
                description: `Enviar confirmación de la videollamada a ${lead.nombre}.`,
                suggestedContent: confirmTemplate.getMessage(lead),
                icon: 'calendar-check',
                action: {
                    label: 'Enviar Confirmación',
                    callback: 'SEND_CONFIRMATION',
                },
            });
        }

        // Recordatorio 1 hora antes
        if (minutesToMeeting <= 60 && minutesToMeeting > 15) {
            suggestions.push({
                id: generateId(),
                type: 'reminder',
                priority: 'urgent',
                title: 'Recordatorio de Cita',
                description: `La videollamada con ${lead.nombre} es en ${minutesToMeeting} minutos.`,
                suggestedContent: `¡Hola ${lead.nombre}! 👋 Te recuerdo que nuestra videollamada es en 1 hora. ¿Todo listo? 📹`,
                dueIn: `En ${minutesToMeeting} min`,
                icon: 'bell',
                action: {
                    label: 'Enviar Recordatorio',
                    callback: 'SEND_REMINDER',
                },
            });
        }

        // Recordatorio 15 minutos antes
        if (minutesToMeeting <= 15 && minutesToMeeting > 0) {
            suggestions.push({
                id: generateId(),
                type: 'reminder',
                priority: 'urgent',
                title: '¡Cita en 15 minutos!',
                description: `Preparar para la videollamada con ${lead.nombre}.`,
                dueIn: 'Ahora',
                icon: 'video',
                action: {
                    label: 'Unirse a Meet',
                    callback: 'JOIN_MEETING',
                },
            });
        }
    }

    // ========== NO-SHOW ==========
    if (lead.status === 'no_show') {
        const noShowTemplate = MESSAGE_TEMPLATES.find(t => t.trigger === 'no_show');
        if (noShowTemplate) {
            suggestions.push({
                id: generateId(),
                type: 'message',
                priority: 'high',
                title: 'Recuperar No-Show',
                description: `${lead.nombre} no asistió a la cita. Intentar reagendar.`,
                suggestedContent: noShowTemplate.getMessage(lead),
                dueIn: 'Urgente',
                icon: 'refresh-cw',
                action: {
                    label: 'Enviar Mensaje',
                    callback: 'SEND_NOSHOW_RECOVERY',
                },
            });
        }
    }

    // ========== SHOW COMPLETADO ==========
    if (lead.status === 'show') {
        // Generar propuesta
        suggestions.push({
            id: generateId(),
            type: 'quote',
            priority: 'urgent',
            title: 'Generar Propuesta',
            description: `La llamada con ${lead.nombre} fue exitosa. Es momento de enviar propuesta.`,
            dueIn: 'Hoy',
            icon: 'file-text',
            action: {
                label: 'Crear Cotización',
                callback: 'GENERATE_QUOTE',
            },
        });

        // Mensaje post-llamada
        const postCallTemplate = MESSAGE_TEMPLATES.find(t => t.trigger === 'show');
        if (postCallTemplate) {
            suggestions.push({
                id: generateId(),
                type: 'message',
                priority: 'high',
                title: 'Mensaje Post-Llamada',
                description: 'Enviar agradecimiento y próximos pasos.',
                suggestedContent: postCallTemplate.getMessage(lead),
                icon: 'check-circle',
                action: {
                    label: 'Enviar Mensaje',
                    callback: 'SEND_POST_CALL',
                },
            });
        }
    }

    // ========== PROPUESTA ENVIADA ==========
    if (lead.status === 'propuesta_enviada') {
        // Seguimiento 48 horas
        if (minutesSinceActivity > 2880) {
            suggestions.push({
                id: generateId(),
                type: 'follow_up',
                priority: 'high',
                title: 'Seguimiento de Propuesta',
                description: `Han pasado más de 48h desde que enviaste la propuesta a ${lead.nombre}.`,
                suggestedContent: `Hola ${lead.nombre}, ¿tuviste oportunidad de revisar la propuesta? Estoy para resolver cualquier duda. 📋`,
                dueIn: 'Urgente',
                icon: 'mail',
                action: {
                    label: 'Enviar Seguimiento',
                    callback: 'SEND_PROPOSAL_FOLLOWUP',
                },
            });
        } else {
            suggestions.push({
                id: generateId(),
                type: 'call',
                priority: 'medium',
                title: 'Llamar para Cerrar',
                description: 'Contactar por teléfono para resolver dudas y acelerar decisión.',
                icon: 'phone',
                action: {
                    label: 'Marcar Número',
                    callback: 'CALL_LEAD',
                },
            });
        }
    }

    // ========== NEGOCIACIÓN ==========
    if (lead.status === 'negociacion') {
        const guidance = generateCloserGuidance(lead);

        suggestions.push({
            id: generateId(),
            type: 'call',
            priority: 'urgent',
            title: 'Cerrar la Venta',
            description: guidance.closeAttempt,
            icon: 'target',
            action: {
                label: 'Ver Guía de Cierre',
                callback: 'VIEW_CLOSING_GUIDE',
            },
        });

        // Guía de objeciones
        if (Object.keys(guidance.objectionHandlers).length > 0) {
            suggestions.push({
                id: generateId(),
                type: 'follow_up',
                priority: 'high',
                title: 'Manejar Objeciones',
                description: `Hay ${Object.keys(guidance.objectionHandlers).length} objeciones detectadas.`,
                icon: 'shield',
                action: {
                    label: 'Ver Objeciones',
                    callback: 'VIEW_OBJECTIONS',
                },
            });
        }
    }

    // Ordenar por prioridad
    const priorityOrder: Record<SuggestionPriority, number> = {
        urgent: 0,
        high: 1,
        medium: 2,
        low: 3,
    };

    return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

/**
 * Calcula el score inicial de un lead basándose en su fuente y datos
 */
export function calculateInitialScore(lead: Lead): number {
    let score = 30; // Base score

    // Score por fuente
    const sourceScores: Record<string, number> = {
        'meta_ads': 15,
        'google_ads': 20,
        'referido': 25,
        'landing': 10,
        'organico': 15,
        'whatsapp': 12,
        'manual': 5,
    };
    score += sourceScores[lead.source] || 0;

    // Bonus por datos completos
    if (lead.email) score += 5;
    if (lead.telefono) score += 5;
    if (lead.empresa) score += 10;
    if (lead.cargo) score += 5;

    // Bonus por potential value
    if (lead.potentialValue) {
        if (lead.potentialValue >= 50000) score += 15;
        else if (lead.potentialValue >= 25000) score += 10;
        else if (lead.potentialValue >= 10000) score += 5;
    }

    return Math.min(score, 100);
}

/**
 * Obtiene todas las sugerencias para múltiples leads
 */
export function getAllSuggestions(leads: Lead[]): Map<string, ProactiveSuggestion[]> {
    const allSuggestions = new Map<string, ProactiveSuggestion[]>();

    for (const lead of leads) {
        const suggestions = getProactiveSuggestions(lead);
        if (suggestions.length > 0) {
            allSuggestions.set(lead.id, suggestions);
        }
    }

    return allSuggestions;
}

/**
 * Cuenta el total de sugerencias urgentes/altas
 */
export function countUrgentSuggestions(leads: Lead[]): number {
    return leads.reduce((count, lead) => {
        const suggestions = getProactiveSuggestions(lead);
        return count + suggestions.filter(s => s.priority === 'urgent' || s.priority === 'high').length;
    }, 0);
}
