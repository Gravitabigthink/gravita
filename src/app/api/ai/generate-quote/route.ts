/**
 * Generate Quote Endpoint
 * 
 * Genera cotizaciones personalizadas con IA
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateQuote, modifyQuoteWithPrompt } from '@/ai/agents/quote-agent';
import { Lead, Quote } from '@/types/lead';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, lead, currentQuote, prompt } = body;

        if (action === 'generate') {
            if (!lead) {
                return NextResponse.json(
                    { error: 'Se requiere información del lead' },
                    { status: 400 }
                );
            }

            // Generar cotización
            const result = generateQuote(lead as Lead);

            return NextResponse.json({
                success: true,
                quote: result.quote,
                reasoning: result.reasoning,
                alternatives: result.alternatives,
            });
        }

        if (action === 'modify') {
            if (!currentQuote || !prompt) {
                return NextResponse.json(
                    { error: 'Se requiere cotización actual y prompt' },
                    { status: 400 }
                );
            }

            // Modificar cotización con prompt
            const modifiedQuote = modifyQuoteWithPrompt(currentQuote as Quote, prompt);

            return NextResponse.json({
                success: true,
                quote: modifiedQuote,
            });
        }

        return NextResponse.json(
            { error: 'Acción no válida. Use "generate" o "modify"' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error generating quote:', error);
        return NextResponse.json(
            { error: 'Error al generar la cotización' },
            { status: 500 }
        );
    }
}
