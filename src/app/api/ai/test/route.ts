/**
 * API Route: Test LLM Router - Multi-Provider
 * 
 * GET /api/ai/test - Prueba conexión con todos los proveedores
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    routeToLLM,
    getUsageSummary,
    AVAILABLE_MODELS,
    getConfiguredProviders,
    ModelTier
} from '@/lib/llm-router';

export async function GET(request: NextRequest) {
    const results: {
        status: 'success' | 'error' | 'skipped';
        tier: string;
        provider: string;
        model: string;
        response?: string;
        error?: string;
        attempts?: number;
    }[] = [];

    // Check configured providers
    const providers = getConfiguredProviders();

    // Test each tier
    const tiers: ModelTier[] = ['simple', 'standard', 'advanced'];

    for (const tier of tiers) {
        const modelConfig = AVAILABLE_MODELS[tier];
        const providerConfig = providers.find(p => p.provider === modelConfig.provider);

        if (!providerConfig?.configured) {
            results.push({
                status: 'skipped',
                tier,
                provider: modelConfig.provider,
                model: modelConfig.name,
                error: `${modelConfig.provider.toUpperCase()} API key not configured`
            });
            continue;
        }

        try {
            const testPrompts: Record<ModelTier, string> = {
                simple: 'Responde solo con "OK"',
                standard: 'Di hola en español en una frase corta',
                advanced: 'Explica en una línea qué es un CRM'
            };

            const taskTypes: Record<ModelTier, 'lead-scoring' | 'chat-assistant' | 'deep-analysis'> = {
                simple: 'lead-scoring',
                standard: 'chat-assistant',
                advanced: 'deep-analysis'
            };

            const result = await routeToLLM(testPrompts[tier], {
                taskType: taskTypes[tier],
                overrideTier: tier
            });

            results.push({
                status: 'success',
                tier,
                provider: result.provider,
                model: result.modelUsed,
                response: result.content.substring(0, 200),
                attempts: result.attempts
            });
        } catch (error) {
            results.push({
                status: 'error',
                tier,
                provider: modelConfig.provider,
                model: modelConfig.name,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    const allSuccess = results.every(r => r.status === 'success');
    const allConfigured = results.every(r => r.status !== 'skipped');

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        overallStatus: allSuccess ? '✅ All models working!' : allConfigured ? '⚠️ Some models failed' : '⚙️ Some providers not configured',
        configuredProviders: providers,
        results,
        usageStats: getUsageSummary(),
        availableModels: AVAILABLE_MODELS
    }, {
        status: allSuccess ? 200 : 500
    });
}

// Quick test with specific provider
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, tier = 'standard', provider } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const taskTypes: Record<string, 'quick-response' | 'chat-assistant' | 'deep-analysis'> = {
            simple: 'quick-response',
            standard: 'chat-assistant',
            advanced: 'deep-analysis'
        };

        const result = await routeToLLM(message, {
            taskType: taskTypes[tier] || 'chat-assistant',
            overrideTier: tier,
            overrideProvider: provider
        });

        return NextResponse.json({
            response: result.content,
            model: result.modelUsed,
            provider: result.provider,
            tier: result.tier,
            attempts: result.attempts
        });
    } catch (error) {
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
