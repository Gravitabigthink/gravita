/**
 * AI Analyze Endpoint
 * 
 * Analiza transcripciones y genera insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeTranscript } from '@/ai/agents/profiler-agent';

export async function POST(request: NextRequest) {
    try {
        const { transcript, leadId } = await request.json();

        if (!transcript) {
            return NextResponse.json(
                { error: 'Se requiere la transcripción' },
                { status: 400 }
            );
        }

        // Analizar transcripción con Agent Profiler
        const analysis = analyzeTranscript(transcript);

        // TODO: Actualizar lead en Firestore con el análisis
        console.log('Updating lead:', leadId, 'with analysis');

        return NextResponse.json({
            success: true,
            analysis: {
                psychProfile: analysis.psychProfile,
                detectedNeeds: analysis.detectedNeeds,
                objections: analysis.objections,
                scoreAdjustment: analysis.scoreAdjustment,
                summary: analysis.summary,
                closingRecommendation: analysis.closingRecommendation,
            },
        });
    } catch (error) {
        console.error('Error analyzing transcript:', error);
        return NextResponse.json(
            { error: 'Error al analizar la transcripción' },
            { status: 500 }
        );
    }
}
