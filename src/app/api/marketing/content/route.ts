/**
 * Marketing Strategy API - Content Generation
 * 
 * POST: Generate content calendar for a strategy
 */

import { NextRequest, NextResponse } from 'next/server';
import { strategyCache } from '../generate/route';
import { generateContentCalendar, exportContentToCSV } from '@/ai/agents/content-generator';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { StrategyContext } from '@/types/marketing';

/**
 * POST - Generate content calendar
 * Body: { contextId: string }
 */
export async function POST(request: NextRequest) {
    try {
        const { contextId } = await request.json();

        if (!contextId) {
            return NextResponse.json({
                success: false,
                error: 'contextId es requerido'
            }, { status: 400 });
        }

        // Get context from cache or Firestore
        let context = strategyCache.get(contextId);

        if (!context && db) {
            try {
                const docRef = doc(db, 'marketing_strategies', contextId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    context = docSnap.data() as StrategyContext;
                    strategyCache.set(contextId, context);
                }
            } catch (firebaseError) {
                console.warn('Could not fetch from Firestore:', firebaseError);
            }
        }

        if (!context) {
            return NextResponse.json({
                success: false,
                error: 'Estrategia no encontrada'
            }, { status: 404 });
        }

        // Check if strategy has completed enough steps
        const completedSteps = context.steps.filter(s => s.status === 'completed').length;
        if (completedSteps < 5) {
            return NextResponse.json({
                success: false,
                error: 'Se requieren al menos 5 pasos completados para generar contenido'
            }, { status: 400 });
        }

        console.log(`📝 Generando contenido para: ${context.clientInput.nombre_empresa}`);

        // Generate content calendar
        const calendar = await generateContentCalendar(context);

        // Export to CSV
        const csvContent = exportContentToCSV(calendar);

        // Save to context
        context.contentCsv = csvContent;
        strategyCache.set(contextId, context);

        // Save to Firestore
        if (db) {
            try {
                await setDoc(doc(db, 'marketing_strategies', contextId), {
                    ...context,
                    contentCsv: csvContent,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            } catch (firebaseError) {
                console.warn('Could not save to Firestore:', firebaseError);
            }
        }

        return NextResponse.json({
            success: true,
            contextId,
            clientName: context.clientInput.nombre_empresa,
            calendar: {
                month: calendar.month,
                year: calendar.year,
                totalPieces: calendar.pieces.length,
                posts: calendar.pieces.filter(p => p.formato === 'Post').length,
                carousels: calendar.pieces.filter(p => p.formato === 'Carrusel').length,
                reels: calendar.pieces.filter(p => p.formato === 'Reel').length
            },
            csvPreview: csvContent.substring(0, 500) + '...'
        });

    } catch (error) {
        console.error('Error generating content:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}

/**
 * GET - Download content CSV
 * Query: ?id=contextId
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const contextId = searchParams.get('id');

        if (!contextId) {
            return NextResponse.json({
                success: false,
                error: 'Se requiere el parámetro id'
            }, { status: 400 });
        }

        // Get context
        let context = strategyCache.get(contextId);

        if (!context && db) {
            try {
                const docRef = doc(db, 'marketing_strategies', contextId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    context = docSnap.data() as StrategyContext;
                }
            } catch (firebaseError) {
                console.warn('Could not fetch from Firestore:', firebaseError);
            }
        }

        if (!context) {
            return NextResponse.json({
                success: false,
                error: 'Estrategia no encontrada'
            }, { status: 404 });
        }

        if (!context.contentCsv) {
            return NextResponse.json({
                success: false,
                error: 'Contenido no generado aún. Usa POST para generarlo.'
            }, { status: 400 });
        }

        const filename = `contenido_${context.clientInput.nombre_empresa.replace(/\s+/g, '_')}.csv`;

        return new NextResponse(context.contentCsv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('Error downloading content:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}
