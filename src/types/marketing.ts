/**
 * Marketing Strategy Engine - Type Definitions
 * 
 * Types for "The Factory" module that automates marketing strategy generation
 * using a 14-step Chain of Thought process.
 */

// =============================================================================
// CLIENT INPUT TYPES
// =============================================================================

export interface CompetitorData {
    nombre: string;
    website?: string;
    fortalezas?: string;
    debilidades?: string;
    notas?: string;
}

export type EtapaCrecimiento = 'startup' | 'crecimiento' | 'establecido' | 'enterprise';

export interface MarketingClientInput {
    // Información básica
    nombre_contacto: string;
    nombre_empresa: string;
    sitio_web?: string;
    redes_sociales?: string[];

    // Etapa del negocio
    etapa_crecimiento: EtapaCrecimiento;

    // Productos/Servicios
    descripcion_productos: string;
    producto_estrella_1: string;
    producto_2?: string;
    producto_3?: string;

    // Mercado
    mercado_general: string;
    nicho: string;
    cliente_ideal: string;
    dolores_cliente: string[];

    // Competencia
    competencia: CompetitorData[];

    // Objetivos
    objetivos_negocio: string[];
    restricciones?: string[];

    // Tono de marca (para generación de contenido)
    tono_marca?: 'formal' | 'casual' | 'inspiracional' | 'tecnico' | 'amigable';
}

// =============================================================================
// STRATEGY STEP TYPES
// =============================================================================

export type StepStatus = 'pending' | 'running' | 'completed' | 'error';

export interface StrategyStep {
    id: number;
    name: string;
    description: string;
    status: StepStatus;

    // Prompt y resultado
    prompt?: string;
    output?: string;

    // Para pasos con validación dual (Gemini + DeepSeek)
    dualAI: boolean;
    geminiOutput?: string;
    deepseekOutput?: string;
    judgeOutput?: string;  // Resultado fusionado por el "Judge"

    // Metadata
    startedAt?: Date;
    completedAt?: Date;
    error?: string;

    // Tokens usados
    tokensUsed?: number;
}

// =============================================================================
// STRATEGY CONTEXT (Estado acumulativo)
// =============================================================================

export interface StrategyContext {
    // Identificadores
    id: string;
    clientId: string;

    // Input original del cliente
    clientInput: MarketingClientInput;

    // Estado de la cadena
    steps: StrategyStep[];
    currentStep: number;
    status: 'not_started' | 'in_progress' | 'completed' | 'error' | 'paused';

    // Documentos generados
    briefHtml?: string;
    strategyHtml?: string;
    contentCsv?: string;

    // Memoria (para próximas iteraciones)
    previousStrategies?: string[];  // IDs de estrategias anteriores

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}

// =============================================================================
// CONTENT GENERATION TYPES
// =============================================================================

export type FormatoContenido = 'Post' | 'Carrusel' | 'Reel';
export type RedSocial = 'Instagram' | 'Facebook' | 'LinkedIn' | 'TikTok' | 'Twitter';

export interface ContentPiece {
    semana: number;
    cliente: string;
    numeroPost: number;
    responsable: string;
    formato: FormatoContenido;
    redSocial: RedSocial;
    textoIn: string;      // Guion (Reels) o contenido de slides (Carruseles)
    copy: string;          // Caption para la publicación
    hashtags?: string[];
    callToAction?: string;
}

export interface ContentCalendar {
    strategyId: string;
    clientName: string;
    month: string;
    year: number;
    pieces: ContentPiece[];
    generatedAt: Date;
}

// =============================================================================
// STEP DEFINITION TYPE (Para la configuración de pasos)
// =============================================================================

export interface StepDefinition {
    id: number;
    name: string;
    description: string;
    promptTemplate: string;  // Template con placeholders {variable}
    dualAI: boolean;
    requiredPreviousSteps: number[];  // IDs de pasos que deben estar completos
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface GenerateStrategyResponse {
    success: boolean;
    contextId?: string;
    message: string;
    error?: string;
}

export interface StepExecutionResponse {
    success: boolean;
    stepId: number;
    output?: string;
    error?: string;
    tokensUsed?: number;
}

export interface StrategyStatusResponse {
    context: StrategyContext;
    progress: {
        completed: number;
        total: number;
        percentage: number;
    };
    nextStep?: number;
}
