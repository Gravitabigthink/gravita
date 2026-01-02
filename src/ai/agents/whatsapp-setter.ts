/**
 * WhatsApp AI Setter Agent
 * 
 * Agente inteligente que responde automáticamente por WhatsApp
 * con el objetivo de cerrar ventas sin intervención humana.
 * 
 * Características:
 * - Solo ofrece servicios de Gravita
 * - Califica leads automáticamente
 * - Agenda citas de videollamada
 * - Mantiene contexto de conversación
 * - No ofrece cosas fuera del catálogo
 */

import { routeToLLM, LLMRequest } from '@/lib/llmRouter';

// Servicios que ofrece Gravita (solo estos, nada más)
const GRAVITA_SERVICES = {
    name: 'Gravita - Marketing Neuronal',
    tagline: 'Agencia de marketing digital especializada en generación de leads y ventas',
    services: [
        {
            name: 'Gestión de Meta Ads',
            description: 'Campañas de Facebook e Instagram optimizadas para generar leads calificados',
            priceRange: 'Desde $5,000 MXN/mes + inversión publicitaria',
        },
        {
            name: 'Gestión de Google Ads',
            description: 'Campañas de búsqueda y display para captar clientes con intención de compra',
            priceRange: 'Desde $5,000 MXN/mes + inversión publicitaria',
        },
        {
            name: 'Landing Pages',
            description: 'Páginas de aterrizaje optimizadas para conversión',
            priceRange: 'Desde $8,000 MXN',
        },
        {
            name: 'Automatización de Marketing',
            description: 'Flujos automatizados de email, WhatsApp y CRM',
            priceRange: 'Desde $10,000 MXN',
        },
        {
            name: 'Consultoría de Marketing',
            description: 'Estrategia y asesoría personalizada para tu negocio',
            priceRange: 'Desde $3,000 MXN/sesión',
        },
    ],
    targetAudience: 'Empresas, emprendedores y profesionales que quieren más clientes y ventas',
    closingGoal: 'Agendar videollamada de diagnóstico gratuita',
};

export interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface LeadContext {
    id: string;
    name: string;
    phone: string;
    email?: string;
    company?: string;
    source?: string;
    score?: number;
    status?: string;
    notes?: string[];
    conversationHistory?: ConversationMessage[];
}

/**
 * Genera respuesta del Setter Agent
 */
export async function generateSetterResponse(
    leadContext: LeadContext,
    incomingMessage: string
): Promise<{
    response: string;
    suggestedAction?: 'schedule_call' | 'send_quote' | 'transfer_human' | 'continue';
    schedulingLink?: string;
}> {
    // Build conversation history for context
    const historyText = (leadContext.conversationHistory || [])
        .slice(-10) // Last 10 messages for context
        .map(m => `${m.role === 'user' ? 'Cliente' : 'Setter'}: ${m.content}`)
        .join('\n');

    const systemPrompt = `Eres el Setter de Gravita, una agencia de marketing digital. Tu objetivo es CERRAR una cita de videollamada sin intervención humana.

## INFORMACIÓN DE LA EMPRESA
${JSON.stringify(GRAVITA_SERVICES, null, 2)}

## REGLAS ESTRICTAS (NUNCA LAS ROMPAS)
1. SOLO ofrece los servicios listados arriba. Si preguntan por algo que no ofrecemos, di amablemente que no es nuestra especialidad.
2. NO inventes precios diferentes a los listados.
3. NO hagas promesas de resultados específicos (ej: "te conseguimos 100 leads").
4. SIEMPRE intenta llevar la conversación hacia agendar una videollamada.
5. Sé amable pero conciso. Respuestas cortas (máximo 3 oraciones).
6. Usa emojis moderadamente para ser amigable.
7. Si el cliente menciona su negocio o problema, conecta cómo podemos ayudarle.
8. Si el cliente pregunta precios, da rangos y di que en la videollamada personalizamos.
9. Si el cliente parece listo, ofrece agendar directamente.
10. NUNCA menciones que eres una IA o bot.

## OBJETIVO PRINCIPAL
Agendar una videollamada de diagnóstico gratuita. Cuando el cliente acepte, responde que le enviarás un link para agendar.

## CONTEXTO DEL LEAD
Nombre: ${leadContext.name}
Empresa: ${leadContext.company || 'No especificada'}
Fuente: ${leadContext.source || 'WhatsApp directo'}
Score: ${leadContext.score || 'Sin calificar'}
Notas: ${leadContext.notes?.join(', ') || 'Sin notas previas'}

## HISTORIAL DE CONVERSACIÓN
${historyText || 'Esta es la primera interacción'}

## MENSAJE ACTUAL DEL CLIENTE
${incomingMessage}

Responde de forma natural, amigable y enfocada en agendar la videollamada. Si ya aceptó agendar, confirma y di que le envías el link.`;

    const request: LLMRequest = {
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: incomingMessage },
        ],
        system: systemPrompt,
        temperature: 0.7,
        maxTokens: 300,
    };

    const llmResponse = await routeToLLM(request);

    if (!llmResponse.success || !llmResponse.content) {
        return {
            response: '¡Hola! Gracias por escribirnos. En un momento te atendemos. 🙌',
            suggestedAction: 'continue',
        };
    }

    const response = llmResponse.content;

    // Detect if ready to schedule
    const lowerResponse = response.toLowerCase();
    const lowerMessage = incomingMessage.toLowerCase();

    let suggestedAction: 'schedule_call' | 'send_quote' | 'transfer_human' | 'continue' = 'continue';

    if (
        lowerMessage.includes('sí') ||
        lowerMessage.includes('si ') ||
        lowerMessage.includes('claro') ||
        lowerMessage.includes('dale') ||
        lowerMessage.includes('ok') ||
        lowerMessage.includes('perfecto') ||
        lowerMessage.includes('cuando') ||
        lowerMessage.includes('agendar') ||
        lowerMessage.includes('videollamada')
    ) {
        if (lowerResponse.includes('agenda') || lowerResponse.includes('link') || lowerResponse.includes('cita')) {
            suggestedAction = 'schedule_call';
        }
    }

    // Detect if needs human
    if (
        lowerMessage.includes('humano') ||
        lowerMessage.includes('persona real') ||
        lowerMessage.includes('hablar con alguien') ||
        lowerMessage.includes('no me entiend')
    ) {
        suggestedAction = 'transfer_human';
    }

    return {
        response,
        suggestedAction,
    };
}

/**
 * Generate scheduling message with link
 */
export function generateSchedulingMessage(leadName: string, calendlyLink?: string): string {
    const link = calendlyLink || 'https://calendly.com/gravita/videollamada';
    const firstName = leadName.split(' ')[0];

    return `¡Excelente ${firstName}! 🎉

Agenda tu videollamada de diagnóstico gratuita aquí:
👉 ${link}

Solo elige el día y hora que mejor te funcione. ¡Te esperamos! 🚀`;
}

/**
 * Generate initial greeting when lead first contacts
 */
export function generateInitialGreeting(leadName?: string): string {
    const firstName = leadName?.split(' ')[0] || '';
    const greeting = firstName ? `¡Hola ${firstName}! 👋` : '¡Hola! 👋';

    return `${greeting}

Gracias por contactar a Gravita. Somos expertos en generar clientes y ventas para negocios como el tuyo.

¿Me cuentas un poco sobre tu negocio y qué buscas lograr? 🎯`;
}
