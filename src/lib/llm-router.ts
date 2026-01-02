/**
 * LLM Router - Sistema de enrutamiento inteligente de modelos MULTI-PROVEEDOR
 * 
 * Soporta:
 * - Google Gemini (simple, standard)
 * - DeepSeek (advanced - pensante y económico)
 * - OpenAI/ChatLLM (futuro)
 * 
 * Optimiza el uso de tokens seleccionando el modelo apropiado
 * para cada tipo de tarea. Incluye control de reintentos.
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// ============================================
// TIPOS Y CONFIGURACIÓN
// ============================================

export type ModelTier = 'simple' | 'standard' | 'advanced';
export type Provider = 'gemini' | 'deepseek' | 'openai';

export interface ModelConfig {
    name: string;
    tier: ModelTier;
    provider: Provider;
    costPerMillionTokens: number;
    maxOutputTokens: number;
    description: string;
}

// ============================================
// CONFIGURACIÓN DE MODELOS POR TIER
// ============================================

export const AVAILABLE_MODELS: Record<ModelTier, ModelConfig> = {
    simple: {
        name: process.env.LLM_MODEL_SIMPLE || 'gemini-2.0-flash-lite',
        tier: 'simple',
        provider: 'gemini',
        costPerMillionTokens: 0.075,
        maxOutputTokens: 2048,
        description: 'Tareas automáticas, validaciones, clasificación rápida'
    },
    standard: {
        name: process.env.LLM_MODEL_STANDARD || 'gemini-2.0-flash',
        tier: 'standard',
        provider: 'gemini',
        costPerMillionTokens: 0.15,
        maxOutputTokens: 8192,
        description: 'Chat general, análisis de leads, generación de emails'
    },
    advanced: {
        name: process.env.LLM_MODEL_ADVANCED || 'deepseek-chat',
        tier: 'advanced',
        provider: 'deepseek',
        costPerMillionTokens: 0.14,
        maxOutputTokens: 8192,
        description: 'Propuestas complejas, análisis profundo, razonamiento avanzado (DeepSeek V3)'
    }

};

// ============================================
// MAPEO DE TAREAS A NIVELES
// ============================================

export type TaskType =
    // Simple tasks
    | 'lead-scoring'
    | 'email-validation'
    | 'basic-classification'
    | 'quick-response'
    // Standard tasks
    | 'chat-assistant'
    | 'lead-analysis'
    | 'email-draft'
    | 'quote-edit'
    | 'followup-message'
    // Advanced tasks
    | 'quote-generation'
    | 'proposal-writing'
    | 'deep-analysis'
    | 'transcript-analysis'
    | 'psych-profiling';

export const TASK_TO_TIER: Record<TaskType, ModelTier> = {
    // Simple - Tareas automáticas y rápidas (Gemini Flash Lite)
    'lead-scoring': 'simple',
    'email-validation': 'simple',
    'basic-classification': 'simple',
    'quick-response': 'simple',

    // Standard - Chat y análisis moderado (Gemini Flash)
    'chat-assistant': 'standard',
    'lead-analysis': 'standard',
    'email-draft': 'standard',
    'quote-edit': 'standard',
    'followup-message': 'standard',

    // Advanced - Tareas que requieren razonamiento profundo (DeepSeek)
    'quote-generation': 'advanced',
    'proposal-writing': 'advanced',
    'deep-analysis': 'advanced',
    'transcript-analysis': 'advanced',
    'psych-profiling': 'advanced'
};

// ============================================
// CONTROL DE REINTENTOS
// ============================================

export interface RetryConfig {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: parseInt(process.env.LLM_MAX_RETRIES || '5'),
    baseDelayMs: parseInt(process.env.LLM_RETRY_DELAY_MS || '1000'),
    maxDelayMs: 16000
};

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateBackoff(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelayMs * Math.pow(2, attempt - 1);
    return Math.min(delay, config.maxDelayMs);
}

// ============================================
// TRACKING DE USO
// ============================================

export interface UsageStats {
    taskType: TaskType;
    modelUsed: string;
    provider: Provider;
    tier: ModelTier;
    attempts: number;
    success: boolean;
    errorMessage?: string;
    timestamp: Date;
}

const usageHistory: UsageStats[] = [];

export function getUsageStats(): UsageStats[] {
    return [...usageHistory];
}

export function getUsageSummary() {
    const summary = {
        total: usageHistory.length,
        successful: usageHistory.filter(u => u.success).length,
        failed: usageHistory.filter(u => !u.success).length,
        byTier: {
            simple: usageHistory.filter(u => u.tier === 'simple').length,
            standard: usageHistory.filter(u => u.tier === 'standard').length,
            advanced: usageHistory.filter(u => u.tier === 'advanced').length
        },
        byProvider: {
            gemini: usageHistory.filter(u => u.provider === 'gemini').length,
            deepseek: usageHistory.filter(u => u.provider === 'deepseek').length,
            openai: usageHistory.filter(u => u.provider === 'openai').length
        },
        averageAttempts: usageHistory.length > 0
            ? usageHistory.reduce((sum, u) => sum + u.attempts, 0) / usageHistory.length
            : 0
    };
    return summary;
}

// ============================================
// PROVEEDORES - GEMINI
// ============================================

let genAI: GoogleGenerativeAI | null = null;
const geminiModelCache: Map<string, GenerativeModel> = new Map();

function getGeminiAI(): GoogleGenerativeAI {
    if (!genAI) {
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GOOGLE_GEMINI_API_KEY no está configurada');
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
}

async function callGemini(prompt: string, modelName: string, maxTokens: number): Promise<string> {
    if (!geminiModelCache.has(modelName)) {
        const ai = getGeminiAI();
        const model = ai.getGenerativeModel({
            model: modelName,
            generationConfig: { maxOutputTokens: maxTokens }
        });
        geminiModelCache.set(modelName, model);
    }

    const model = geminiModelCache.get(modelName)!;
    const result = await model.generateContent(prompt);
    return result.response.text();
}

// ============================================
// PROVEEDORES - DEEPSEEK
// ============================================

async function callDeepSeek(prompt: string, modelName: string, maxTokens: number): Promise<string> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        throw new Error('DEEPSEEK_API_KEY no está configurada');
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelName,
            messages: [
                { role: 'user', content: prompt }
            ],
            max_tokens: maxTokens,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// ============================================
// PROVEEDORES - OPENAI (para ChatLLM/futuro)
// ============================================

async function callOpenAI(prompt: string, modelName: string, maxTokens: number, baseUrl?: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY || process.env.CHATLLM_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY o CHATLLM_API_KEY no está configurada');
    }

    const url = baseUrl || 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelName,
            messages: [
                { role: 'user', content: prompt }
            ],
            max_tokens: maxTokens,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// ============================================
// ROUTER PRINCIPAL
// ============================================

export interface RouterOptions {
    taskType: TaskType;
    overrideTier?: ModelTier;
    overrideProvider?: Provider;
    retryConfig?: Partial<RetryConfig>;
}

export interface RouterResult {
    content: string;
    modelUsed: string;
    provider: Provider;
    tier: ModelTier;
    attempts: number;
}

/**
 * Ejecuta una solicitud a la IA con routing automático y control de reintentos
 */
export async function routeToLLM(
    prompt: string,
    options: RouterOptions
): Promise<RouterResult> {
    const tier = options.overrideTier || TASK_TO_TIER[options.taskType];
    const modelConfig = AVAILABLE_MODELS[tier];
    const provider = options.overrideProvider || modelConfig.provider;
    const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...options.retryConfig };

    let lastError: Error | null = null;
    let attempts = 0;

    console.log(`[LLM Router] Task: ${options.taskType}, Tier: ${tier}, Provider: ${provider}, Model: ${modelConfig.name}`);

    while (attempts < retryConfig.maxRetries) {
        attempts++;

        try {
            let content: string;

            // Seleccionar proveedor
            switch (provider) {
                case 'gemini':
                    content = await callGemini(prompt, modelConfig.name, modelConfig.maxOutputTokens);
                    break;
                case 'deepseek':
                    content = await callDeepSeek(prompt, modelConfig.name, modelConfig.maxOutputTokens);
                    break;
                case 'openai':
                    content = await callOpenAI(prompt, modelConfig.name, modelConfig.maxOutputTokens);
                    break;
                default:
                    throw new Error(`Proveedor no soportado: ${provider}`);
            }

            // Log éxito
            const stats: UsageStats = {
                taskType: options.taskType,
                modelUsed: modelConfig.name,
                provider,
                tier,
                attempts,
                success: true,
                timestamp: new Date()
            };
            usageHistory.push(stats);

            console.log(`[LLM Router] ✅ Success on attempt ${attempts} via ${provider}`);

            return {
                content,
                modelUsed: modelConfig.name,
                provider,
                tier,
                attempts
            };

        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            console.warn(`[LLM Router] ⚠️ Attempt ${attempts}/${retryConfig.maxRetries} failed:`, lastError.message);

            if (attempts < retryConfig.maxRetries) {
                const delay = calculateBackoff(attempts, retryConfig);
                console.log(`[LLM Router] Waiting ${delay}ms before retry...`);
                await sleep(delay);
            }
        }
    }

    // Log fallo
    const stats: UsageStats = {
        taskType: options.taskType,
        modelUsed: modelConfig.name,
        provider,
        tier,
        attempts,
        success: false,
        errorMessage: lastError?.message,
        timestamp: new Date()
    };
    usageHistory.push(stats);

    console.error(`[LLM Router] ❌ All ${retryConfig.maxRetries} attempts failed`);

    throw new Error(
        `Error después de ${retryConfig.maxRetries} intentos: ${lastError?.message || 'Error desconocido'}. ` +
        `Por favor intenta de nuevo más tarde.`
    );
}

/**
 * Versión simplificada que retorna solo el contenido o un mensaje de error
 */
export async function routeToLLMSafe(
    prompt: string,
    options: RouterOptions
): Promise<string> {
    try {
        const result = await routeToLLM(prompt, options);
        return result.content;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al procesar la solicitud';
        return `⚠️ ${message}`;
    }
}

/**
 * Obtiene información del modelo para un tier
 */
export function getModelInfo(tier: ModelTier): ModelConfig {
    return AVAILABLE_MODELS[tier];
}

/**
 * Lista todos los proveedores configurados
 */
export function getConfiguredProviders(): { provider: Provider; configured: boolean }[] {
    return [
        { provider: 'gemini', configured: !!process.env.GOOGLE_GEMINI_API_KEY },
        { provider: 'deepseek', configured: !!process.env.DEEPSEEK_API_KEY },
        { provider: 'openai', configured: !!(process.env.OPENAI_API_KEY || process.env.CHATLLM_API_KEY) }
    ];
}
