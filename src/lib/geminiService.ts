// Gemini AI Service for CRM - Refactored with LLM Router
import {
    routeToLLM,
    routeToLLMSafe,
    TaskType,
    ModelTier,
    getUsageSummary
} from './llm-router';

// System prompts for different CRM contexts
const CRM_SYSTEM_PROMPTS = {
    assistant: `Eres GRAVITA Brain, el asistente de IA del CRM Sniper de GRAVITA Marketing Agency.
Tu rol es ayudar al equipo de ventas a:
- Analizar leads y sugerir estrategias de seguimiento
- Generar cotizaciones y propuestas personalizadas
- Responder preguntas sobre el pipeline de ventas
- Dar insights sobre el rendimiento del equipo
Responde siempre en español, de manera profesional pero amigable. Sé conciso y práctico.`,

    quoteEditor: `Eres un experto en edición de propuestas comerciales. 
Tu trabajo es modificar cotizaciones basándote en las instrucciones del usuario.
Puedes: agregar/quitar servicios, aplicar descuentos, cambiar precios, modificar descripciones.
Responde en JSON con el formato: { action: 'update', changes: [...], message: 'descripción del cambio' }`,

    leadAnalysis: `Eres un experto en análisis de leads y calificación de prospectos.
Analiza la información del lead y proporciona:
- Score recomendado (1-100)
- Probabilidad de cierre
- Siguiente mejor acción
- Objeciones posibles
Responde en español, de manera estructurada.`,

    emailDraft: `Eres un experto en copywriting de emails comerciales.
Genera emails persuasivos pero no agresivos para seguimiento de leads.
El tono debe ser profesional, personalizado y orientado a dar valor.
Incluye: asunto, cuerpo del email, y call-to-action claro.`,
};

// Mapeo de contextos a tipos de tarea para el router
const CONTEXT_TO_TASK: Record<keyof typeof CRM_SYSTEM_PROMPTS, TaskType> = {
    assistant: 'chat-assistant',
    quoteEditor: 'quote-edit',
    leadAnalysis: 'lead-analysis',
    emailDraft: 'email-draft',
};

// Main chat function - Now using LLM Router
export async function chatWithGemini(
    message: string,
    context: keyof typeof CRM_SYSTEM_PROMPTS = 'assistant',
    additionalContext?: string
): Promise<string> {
    const systemPrompt = CRM_SYSTEM_PROMPTS[context];
    const fullPrompt = additionalContext
        ? `${systemPrompt}\n\nContexto adicional:\n${additionalContext}\n\nUsuario: ${message}`
        : `${systemPrompt}\n\nUsuario: ${message}`;

    const taskType = CONTEXT_TO_TASK[context];

    console.log(`[GeminiService] Chat request - Context: ${context}, Task: ${taskType}`);

    return routeToLLMSafe(fullPrompt, { taskType });
}

// Analyze a lead and get recommendations - Uses STANDARD tier
export async function analyzeLeadWithAI(leadData: {
    name: string;
    company?: string;
    source: string;
    score: number;
    notes?: string[];
    lastActivity?: Date;
}): Promise<{
    recommendation: string;
    nextAction: string;
    estimatedCloseRate: number;
    suggestedScore: number;
}> {
    const prompt = `Analiza este lead y dame recomendaciones:
Nombre: ${leadData.name}
Empresa: ${leadData.company || 'No especificada'}
Fuente: ${leadData.source}
Score actual: ${leadData.score}
Notas: ${leadData.notes?.join(', ') || 'Sin notas'}
Última actividad: ${leadData.lastActivity?.toLocaleDateString() || 'Sin registro'}

Responde en JSON con este formato exacto:
{
  "recommendation": "tu recomendación",
  "nextAction": "siguiente acción sugerida", 
  "estimatedCloseRate": 0.0,
  "suggestedScore": 0
}`;

    try {
        const result = await routeToLLM(prompt, { taskType: 'lead-analysis' });
        const text = result.content;

        // Try to parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return {
            recommendation: text,
            nextAction: 'Revisar manualmente',
            estimatedCloseRate: 50,
            suggestedScore: leadData.score,
        };
    } catch (error) {
        console.error('Lead analysis error:', error);
        return {
            recommendation: 'No se pudo analizar el lead (máximo de intentos alcanzado)',
            nextAction: 'Revisar manualmente',
            estimatedCloseRate: 50,
            suggestedScore: leadData.score,
        };
    }
}

// Generate email draft for lead follow-up - Uses STANDARD tier
export async function generateFollowUpEmail(leadData: {
    name: string;
    company?: string;
    lastInteraction?: string;
    purpose: 'initial' | 'followup' | 'proposal' | 'closing';
}): Promise<{
    subject: string;
    body: string;
    callToAction: string;
}> {
    const purposeDescriptions = {
        initial: 'primer contacto después de que mostró interés',
        followup: 'seguimiento después de una conversación inicial',
        proposal: 'envío de propuesta comercial',
        closing: 'cierre de venta después de enviar propuesta',
    };

    const prompt = `Genera un email de ${purposeDescriptions[leadData.purpose]} para:
Nombre: ${leadData.name}
Empresa: ${leadData.company || 'No especificada'}
Última interacción: ${leadData.lastInteraction || 'Primera vez'}

Responde en JSON con este formato exacto:
{
  "subject": "asunto del email",
  "body": "cuerpo del email (puede incluir \\n para saltos de línea)",
  "callToAction": "el CTA específico"
}`;

    try {
        const result = await routeToLLM(prompt, { taskType: 'email-draft' });
        const text = result.content;

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return {
            subject: 'Seguimiento de tu interés',
            body: text,
            callToAction: 'Agendar llamada',
        };
    } catch (error) {
        console.error('Email generation error:', error);
        return {
            subject: 'Seguimiento',
            body: 'No se pudo generar el email (máximo de intentos alcanzado).',
            callToAction: 'Contactar',
        };
    }
}

// Edit quote based on natural language instructions - Uses STANDARD tier
export async function editQuoteWithAI(
    currentQuote: {
        services: { name: string; price: number; quantity: number }[];
        subtotal: number;
        discount: number;
        total: number;
    },
    instruction: string
): Promise<{
    action: string;
    updatedServices?: { name: string; price: number; quantity: number }[];
    updatedDiscount?: number;
    message: string;
}> {
    const prompt = `Cotización actual:
Servicios: ${JSON.stringify(currentQuote.services)}
Subtotal: $${currentQuote.subtotal}
Descuento: $${currentQuote.discount}
Total: $${currentQuote.total}

Instrucción del usuario: "${instruction}"

Interpreta la instrucción y responde en JSON:
{
  "action": "update" | "add_service" | "remove_service" | "apply_discount",
  "updatedServices": [...] // si aplica
  "updatedDiscount": 0, // si aplica
  "message": "descripción de lo que hiciste"
}`;

    try {
        const result = await routeToLLM(prompt, { taskType: 'quote-edit' });
        const text = result.content;

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return {
            action: 'none',
            message: 'No pude interpretar la instrucción. Por favor sé más específico.',
        };
    } catch (error) {
        console.error('Quote edit error:', error);
        return {
            action: 'error',
            message: 'Error al procesar la instrucción (máximo de intentos alcanzado).',
        };
    }
}

// Quick lead scoring - Uses SIMPLE tier for efficiency
export async function quickLeadScore(leadInfo: {
    source: string;
    hasEmail: boolean;
    hasPhone: boolean;
    hasCompany: boolean;
}): Promise<number> {
    const prompt = `Califica este lead del 0 al 100 basándote en:
- Fuente: ${leadInfo.source}
- Tiene email: ${leadInfo.hasEmail ? 'Sí' : 'No'}
- Tiene teléfono: ${leadInfo.hasPhone ? 'Sí' : 'No'}
- Tiene empresa: ${leadInfo.hasCompany ? 'Sí' : 'No'}

Responde SOLO con un número del 0 al 100.`;

    try {
        const result = await routeToLLM(prompt, { taskType: 'lead-scoring' });
        const score = parseInt(result.content.trim());
        return isNaN(score) ? 50 : Math.max(0, Math.min(100, score));
    } catch {
        // Fallback a scoring local si falla
        let score = 30;
        if (leadInfo.hasEmail) score += 15;
        if (leadInfo.hasPhone) score += 15;
        if (leadInfo.hasCompany) score += 20;
        if (leadInfo.source === 'referido') score += 20;
        return Math.min(score, 100);
    }
}

// Export usage stats for monitoring
export { getUsageSummary };
