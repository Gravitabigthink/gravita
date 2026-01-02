/**
 * API Route: Token Usage Statistics
 * 
 * GET /api/ai/usage - Obtiene estadísticas de uso de tokens
 * POST /api/ai/usage - Registra uso de tokens (llamado internamente)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUsageSummary, getConfiguredProviders, AVAILABLE_MODELS } from '@/lib/llm-router';

export async function GET(request: NextRequest) {
    try {
        const summary = getUsageSummary();
        const providers = getConfiguredProviders();

        // Calculate estimated costs based on usage
        const estimatedCosts = {
            gemini: summary.byProvider.gemini * 0.0002, // Approximation
            deepseek: summary.byProvider.deepseek * 0.0003,
            openai: summary.byProvider.openai * 0.001,
            total: 0
        };
        estimatedCosts.total = estimatedCosts.gemini + estimatedCosts.deepseek + estimatedCosts.openai;

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            summary,
            estimatedCosts,
            providers,
            models: AVAILABLE_MODELS,
            tips: [
                'Las tareas simples usan Gemini Flash Lite (muy económico)',
                'Las tareas avanzadas usan DeepSeek V3 (pensante + barato)',
                'El sistema limita a 5 reintentos para evitar gastos excesivos'
            ]
        });
    } catch (error) {
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
        }, { status: 500 });
    }
}
