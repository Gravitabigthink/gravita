/**
 * Token Usage Tracker Service
 * 
 * Rastrea el uso de tokens y costos de todos los proveedores de IA
 * Persiste en localStorage y proporciona alertas de presupuesto
 */

import { Provider, ModelTier } from './llm-router';

// ============================================
// TIPOS
// ============================================

export interface TokenUsageRecord {
    id: string;
    timestamp: Date;
    provider: Provider;
    model: string;
    tier: ModelTier;
    taskType: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUSD: number;
}

export interface UsageSummary {
    totalTokens: number;
    totalCostUSD: number;
    byProvider: Record<Provider, { tokens: number; costUSD: number }>;
    byTier: Record<ModelTier, { tokens: number; costUSD: number }>;
    byDay: { date: string; tokens: number; costUSD: number }[];
    recordCount: number;
}

export interface BudgetConfig {
    monthlyLimitUSD: number;
    warningThresholdPercent: number; // Ej: 80 = alertar al 80%
    criticalThresholdPercent: number; // Ej: 95 = alertar al 95%
}

export interface BudgetStatus {
    currentSpendUSD: number;
    limitUSD: number;
    percentUsed: number;
    status: 'ok' | 'warning' | 'critical' | 'exceeded';
    remainingUSD: number;
    estimatedDaysLeft: number;
}

// ============================================
// COSTOS POR MODELO (por millón de tokens)
// ============================================

const MODEL_COSTS: Record<string, { input: number; output: number }> = {
    // Gemini
    'gemini-2.0-flash-lite': { input: 0.075, output: 0.30 },
    'gemini-2.0-flash': { input: 0.15, output: 0.60 },
    'gemini-2.0-flash-exp': { input: 0.15, output: 0.60 },
    // DeepSeek
    'deepseek-chat': { input: 0.14, output: 0.28 },
    'deepseek-reasoner': { input: 0.55, output: 2.19 },
    // OpenAI (si se agrega en futuro)
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4o': { input: 2.50, output: 10.00 },
};

// ============================================
// STORAGE KEY
// ============================================

const STORAGE_KEY = 'gravita_token_usage';
const BUDGET_KEY = 'gravita_budget_config';

// ============================================
// FUNCIONES DE PERSISTENCIA
// ============================================

function getStoredRecords(): TokenUsageRecord[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        const records = JSON.parse(data);
        return records.map((r: TokenUsageRecord) => ({
            ...r,
            timestamp: new Date(r.timestamp)
        }));
    } catch {
        return [];
    }
}

function saveRecords(records: TokenUsageRecord[]): void {
    if (typeof window === 'undefined') return;
    try {
        // Keep only last 30 days of records to avoid localStorage overflow
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRecords = records.filter(r => new Date(r.timestamp) > thirtyDaysAgo);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentRecords));
    } catch (e) {
        console.error('Error saving token records:', e);
    }
}

export function getBudgetConfig(): BudgetConfig {
    if (typeof window === 'undefined') {
        return { monthlyLimitUSD: 25, warningThresholdPercent: 80, criticalThresholdPercent: 95 };
    }
    try {
        const data = localStorage.getItem(BUDGET_KEY);
        if (data) return JSON.parse(data);
    } catch { }
    // Default: 500 MXN ≈ $25 USD
    return { monthlyLimitUSD: 25, warningThresholdPercent: 80, criticalThresholdPercent: 95 };
}

export function saveBudgetConfig(config: BudgetConfig): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(BUDGET_KEY, JSON.stringify(config));
}

// ============================================
// FUNCIONES DE TRACKING
// ============================================

/**
 * Calcula el costo estimado de una llamada
 */
export function calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
): number {
    const costs = MODEL_COSTS[model] || { input: 0.20, output: 0.60 };
    const inputCost = (inputTokens / 1_000_000) * costs.input;
    const outputCost = (outputTokens / 1_000_000) * costs.output;
    return inputCost + outputCost;
}

/**
 * Estima tokens basándose en la longitud del texto
 * Aproximación: 1 token ≈ 4 caracteres
 */
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

/**
 * Registra el uso de tokens
 */
export function trackTokenUsage(params: {
    provider: Provider;
    model: string;
    tier: ModelTier;
    taskType: string;
    inputText: string;
    outputText: string;
    actualInputTokens?: number;
    actualOutputTokens?: number;
}): TokenUsageRecord {
    const inputTokens = params.actualInputTokens || estimateTokens(params.inputText);
    const outputTokens = params.actualOutputTokens || estimateTokens(params.outputText);
    const totalTokens = inputTokens + outputTokens;
    const estimatedCostUSD = calculateCost(params.model, inputTokens, outputTokens);

    const record: TokenUsageRecord = {
        id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        provider: params.provider,
        model: params.model,
        tier: params.tier,
        taskType: params.taskType,
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCostUSD
    };

    const records = getStoredRecords();
    records.push(record);
    saveRecords(records);

    return record;
}

// ============================================
// FUNCIONES DE RESUMEN
// ============================================

/**
 * Obtiene el resumen de uso del mes actual
 */
export function getCurrentMonthUsage(): UsageSummary {
    const records = getStoredRecords();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthRecords = records.filter(r => new Date(r.timestamp) >= startOfMonth);

    return calculateSummary(monthRecords);
}

/**
 * Obtiene el resumen de uso de los últimos N días
 */
export function getRecentUsage(days: number = 7): UsageSummary {
    const records = getStoredRecords();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const recentRecords = records.filter(r => new Date(r.timestamp) >= cutoff);

    return calculateSummary(recentRecords);
}

function calculateSummary(records: TokenUsageRecord[]): UsageSummary {
    const byProvider: Record<Provider, { tokens: number; costUSD: number }> = {
        gemini: { tokens: 0, costUSD: 0 },
        deepseek: { tokens: 0, costUSD: 0 },
        openai: { tokens: 0, costUSD: 0 }
    };

    const byTier: Record<ModelTier, { tokens: number; costUSD: number }> = {
        simple: { tokens: 0, costUSD: 0 },
        standard: { tokens: 0, costUSD: 0 },
        advanced: { tokens: 0, costUSD: 0 }
    };

    const byDayMap = new Map<string, { tokens: number; costUSD: number }>();

    let totalTokens = 0;
    let totalCostUSD = 0;

    for (const record of records) {
        totalTokens += record.totalTokens;
        totalCostUSD += record.estimatedCostUSD;

        byProvider[record.provider].tokens += record.totalTokens;
        byProvider[record.provider].costUSD += record.estimatedCostUSD;

        byTier[record.tier].tokens += record.totalTokens;
        byTier[record.tier].costUSD += record.estimatedCostUSD;

        const dateKey = new Date(record.timestamp).toISOString().split('T')[0];
        const dayData = byDayMap.get(dateKey) || { tokens: 0, costUSD: 0 };
        dayData.tokens += record.totalTokens;
        dayData.costUSD += record.estimatedCostUSD;
        byDayMap.set(dateKey, dayData);
    }

    const byDay = Array.from(byDayMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
        totalTokens,
        totalCostUSD,
        byProvider,
        byTier,
        byDay,
        recordCount: records.length
    };
}

// ============================================
// FUNCIONES DE PRESUPUESTO
// ============================================

/**
 * Obtiene el estado actual del presupuesto
 */
export function getBudgetStatus(): BudgetStatus {
    const config = getBudgetConfig();
    const usage = getCurrentMonthUsage();

    const currentSpendUSD = usage.totalCostUSD;
    const percentUsed = (currentSpendUSD / config.monthlyLimitUSD) * 100;
    const remainingUSD = Math.max(0, config.monthlyLimitUSD - currentSpendUSD);

    // Estimar días restantes basado en promedio diario
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dayOfMonth = new Date().getDate();
    const avgDailySpend = currentSpendUSD / dayOfMonth;
    const estimatedDaysLeft = avgDailySpend > 0 ? Math.floor(remainingUSD / avgDailySpend) : 999;

    let status: BudgetStatus['status'] = 'ok';
    if (percentUsed >= 100) {
        status = 'exceeded';
    } else if (percentUsed >= config.criticalThresholdPercent) {
        status = 'critical';
    } else if (percentUsed >= config.warningThresholdPercent) {
        status = 'warning';
    }

    return {
        currentSpendUSD,
        limitUSD: config.monthlyLimitUSD,
        percentUsed,
        status,
        remainingUSD,
        estimatedDaysLeft
    };
}

/**
 * Verifica si se debería bloquear nuevas solicitudes
 */
export function shouldBlockRequests(): boolean {
    const status = getBudgetStatus();
    return status.status === 'exceeded';
}

/**
 * Formatea el costo para mostrar
 */
export function formatCost(usd: number): string {
    if (usd < 0.01) return '< $0.01';
    return `$${usd.toFixed(2)}`;
}

/**
 * Formatea tokens para mostrar
 */
export function formatTokens(tokens: number): string {
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(2)}M`;
    if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
    return tokens.toString();
}

/**
 * Convierte USD a MXN (aproximado)
 */
export function usdToMxn(usd: number): number {
    return usd * 20; // Tasa aproximada
}

export function formatCostMXN(usd: number): string {
    const mxn = usdToMxn(usd);
    if (mxn < 1) return '< $1 MXN';
    return `$${mxn.toFixed(0)} MXN`;
}
