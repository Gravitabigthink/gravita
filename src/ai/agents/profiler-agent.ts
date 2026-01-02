/**
 * Agent Profiler - The Analyst
 * 
 * Analiza transcripciones de Google Meet para:
 * - Perfil psicológico del cliente
 * - Necesidades detectadas
 * - Extracción de requerimientos para cotización
 * - Scoring basado en indicadores de compra
 */

import { Lead, PsychProfile, PsychType } from '@/types/lead';

// Configuración del análisis
const SCORING_RULES = {
    // Indicadores positivos
    RESULTS_FOCUSED: { pattern: /resultado|crecimiento|roi|objetivo|meta/gi, score: 20 },
    URGENCY: { pattern: /urgente|pronto|rápido|inmediato|ahora/gi, score: 15 },
    BUDGET_READY: { pattern: /presupuesto listo|tengo para invertir|cuánto cuesta/gi, score: 10 },
    DECISION_MAKER: { pattern: /yo decido|tomo las decisiones|soy el dueño/gi, score: 15 },

    // Indicadores negativos
    PRICE_FIRST: { pattern: /precio|costo|barato|descuento/gi, score: -10 },
    HESITATION: { pattern: /no sé|tengo que pensar|consultar|después/gi, score: -15 },
    COMPARISON: { pattern: /otra agencia|cotizando|comparando/gi, score: -5 },
};

// Patrones de personalidad
const PERSONALITY_PATTERNS: Record<PsychType, RegExp[]> = {
    analitico: [
        /datos|métricas|estadísticas|números|reportes|medible/gi,
        /cómo funciona|proceso|metodología|estrategia/gi,
        /garantía|contrato|términos/gi,
    ],
    emocional: [
        /siento|me encanta|increíble|wow|emocionante/gi,
        /historia|experiencia|confianza|relación/gi,
        /testimonios|recomendaciones|referencias/gi,
    ],
    asertivo: [
        /quiero|necesito|vamos|hagámoslo|empecemos/gi,
        /rápido|eficiente|directamente|sin rodeos/gi,
        /cuánto|cuándo|ahora|listo/gi,
    ],
    indeciso: [
        /no sé|quizás|tal vez|a lo mejor/gi,
        /tengo que pensar|consultar|ver opciones/gi,
        /después|más adelante|podría ser/gi,
    ],
};

// Extracción de necesidades
const NEED_PATTERNS = [
    { pattern: /necesit\w+ (más )?(leads?|clientes?|ventas?)/gi, need: 'Generación de leads' },
    { pattern: /redes sociales|facebook|instagram|tiktok/gi, need: 'Redes sociales' },
    { pattern: /sitio web|página web|landing/gi, need: 'Desarrollo web' },
    { pattern: /seo|posicionamiento|google/gi, need: 'SEO/Posicionamiento' },
    { pattern: /publicidad|ads|anuncios/gi, need: 'Publicidad digital' },
    { pattern: /branding|marca|identidad/gi, need: 'Branding' },
    { pattern: /contenido|blog|artículos/gi, need: 'Marketing de contenidos' },
    { pattern: /email|correo|newsletter/gi, need: 'Email marketing' },
    { pattern: /video|youtube|reels/gi, need: 'Video marketing' },
    { pattern: /automatización|crm|seguimiento/gi, need: 'Automatización' },
];

// Extracción de objeciones
const OBJECTION_PATTERNS = [
    { pattern: /muy caro|fuera de presupuesto|no tengo/gi, objection: 'Precio elevado' },
    { pattern: /no funciona|no creo|no estoy seguro/gi, objection: 'Escepticismo' },
    { pattern: /mala experiencia|antes no|otra agencia/gi, objection: 'Experiencia previa negativa' },
    { pattern: /no tengo tiempo|muy ocupado/gi, objection: 'Falta de tiempo' },
    { pattern: /mi socio|consultar con|pareja/gi, objection: 'Necesita aprobación' },
];

export interface TranscriptAnalysis {
    psychProfile: PsychProfile;
    detectedNeeds: string[];
    objections: string[];
    scoreAdjustment: number;
    quoteRequirements: string[];
    summary: string;
    closingRecommendation: string;
}

export function analyzeTranscript(transcript: string): TranscriptAnalysis {
    // Calcular score
    let scoreAdjustment = 0;
    for (const [, rule] of Object.entries(SCORING_RULES)) {
        const matches = transcript.match(rule.pattern) || [];
        scoreAdjustment += matches.length * rule.score;
    }
    // Cap adjustment
    scoreAdjustment = Math.max(-40, Math.min(40, scoreAdjustment));

    // Detectar tipo de personalidad
    const personalityScores: Record<PsychType, number> = {
        analitico: 0,
        emocional: 0,
        asertivo: 0,
        indeciso: 0,
    };

    for (const [type, patterns] of Object.entries(PERSONALITY_PATTERNS)) {
        for (const pattern of patterns) {
            const matches = transcript.match(pattern) || [];
            personalityScores[type as PsychType] += matches.length;
        }
    }

    const dominantType = Object.entries(personalityScores).sort(
        ([, a], [, b]) => b - a
    )[0][0] as PsychType;

    // Detectar necesidades
    const detectedNeeds: string[] = [];
    for (const { pattern, need } of NEED_PATTERNS) {
        if (pattern.test(transcript)) {
            if (!detectedNeeds.includes(need)) {
                detectedNeeds.push(need);
            }
        }
    }

    // Detectar objeciones
    const objections: string[] = [];
    for (const { pattern, objection } of OBJECTION_PATTERNS) {
        if (pattern.test(transcript)) {
            if (!objections.includes(objection)) {
                objections.push(objection);
            }
        }
    }

    // Generar estrategia de cierre
    const closingStrategies: Record<PsychType, string> = {
        analitico:
            'Presenta datos concretos, ROI esperado y casos de éxito con métricas. Ofrece un período de prueba o garantía.',
        emocional:
            'Comparte historias de éxito, testimonios y enfatiza la relación a largo plazo. Conecta emocionalmente con sus metas.',
        asertivo:
            'Ve directo al grano, presenta opciones claras y cierra rápido. No pierdas tiempo en detalles innecesarios.',
        indeciso:
            'Ofrece acompañamiento paso a paso, minimiza el riesgo percibido y sugiere empezar con un proyecto pequeño.',
    };

    // Generar tips de cierre
    const closingTips: Record<PsychType, string[]> = {
        analitico: [
            'Muestra el dashboard de reportes',
            'Presenta proyecciones de ROI',
            'Ofrece contrato con KPIs claros',
        ],
        emocional: [
            'Comparte testimonios en video',
            'Habla de la transformación que lograrán',
            'Menciona el soporte personalizado',
        ],
        asertivo: [
            'Presenta máximo 2-3 opciones',
            'Ofrece descuento por decisión rápida',
            'Propón iniciar esta semana',
        ],
        indeciso: [
            'Ofrece garantía de satisfacción',
            'Sugiere proyecto piloto pequeño',
            'Agenda siguiente llamada de seguimiento',
        ],
    };

    const psychProfile: PsychProfile = {
        dominantType,
        traits: getPsychTraits(dominantType),
        painPoints: objections,
        motivators: detectedNeeds,
        objections,
        recommendedStrategy: closingStrategies[dominantType],
        closingTips: closingTips[dominantType],
        confidence: Math.min(95, 50 + personalityScores[dominantType] * 10),
    };

    // Generar resumen
    const summary = generateSummary(dominantType, detectedNeeds, objections, scoreAdjustment);

    return {
        psychProfile,
        detectedNeeds,
        objections,
        scoreAdjustment,
        quoteRequirements: detectedNeeds,
        summary,
        closingRecommendation: closingStrategies[dominantType],
    };
}

function getPsychTraits(type: PsychType): string[] {
    const traits: Record<PsychType, string[]> = {
        analitico: ['Detallista', 'Metódico', 'Basado en datos', 'Cauteloso'],
        emocional: ['Entusiasta', 'Relacional', 'Storytelling', 'Confianza personal'],
        asertivo: ['Directo', 'Decisivo', 'Orientado a resultados', 'Impaciente'],
        indeciso: ['Reflexivo', 'Busca consenso', 'Averso al riesgo', 'Necesita tiempo'],
    };
    return traits[type];
}

function generateSummary(
    type: PsychType,
    needs: string[],
    objections: string[],
    scoreAdj: number
): string {
    const typeLabels: Record<PsychType, string> = {
        analitico: 'analítico',
        emocional: 'emocional',
        asertivo: 'asertivo',
        indeciso: 'indeciso',
    };

    let summary = `Cliente de perfil ${typeLabels[type]}. `;

    if (needs.length > 0) {
        summary += `Interesado en: ${needs.slice(0, 3).join(', ')}. `;
    }

    if (objections.length > 0) {
        summary += `Objeciones detectadas: ${objections.join(', ')}. `;
    }

    if (scoreAdj > 10) {
        summary += 'Alta intención de compra. Priorizar cierre.';
    } else if (scoreAdj < -10) {
        summary += 'Requiere más nurturing antes de propuesta.';
    } else {
        summary += 'Continuar con proceso estándar.';
    }

    return summary;
}

// Función para actualizar lead con análisis
export function applyAnalysisToLead(
    lead: Lead,
    analysis: TranscriptAnalysis
): Lead {
    return {
        ...lead,
        psychProfile: analysis.psychProfile,
        detectedNeeds: [...new Set([...lead.detectedNeeds, ...analysis.detectedNeeds])],
        leadScore: Math.max(0, Math.min(100, lead.leadScore + analysis.scoreAdjustment)),
        scoreHistory: [
            ...lead.scoreHistory,
            {
                score: lead.leadScore + analysis.scoreAdjustment,
                reason: `Análisis de transcripción: ${analysis.scoreAdjustment > 0 ? '+' : ''}${analysis.scoreAdjustment}`,
                timestamp: new Date(),
            },
        ],
        updatedAt: new Date(),
    };
}
