/**
 * Marketing Strategy API - Generate Strategy
 * 
 * POST: Starts a new marketing strategy generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketingClientInput } from '@/types/marketing';
import {
    createStrategyContext,
    executeStep,
    getProgress
} from '@/ai/agents/marketing-orchestrator';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Store strategy contexts in memory for quick access (also persisted to Firestore)
const strategyCache = new Map<string, ReturnType<typeof createStrategyContext>>();

/**
 * POST - Start new strategy generation
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const clientInput: MarketingClientInput = body.clientInput;

        // Validate required fields
        if (!clientInput.nombre_empresa || !clientInput.nombre_contacto) {
            return NextResponse.json({
                success: false,
                error: 'nombre_empresa y nombre_contacto son requeridos'
            }, { status: 400 });
        }

        // Create strategy context
        const context = createStrategyContext(clientInput, body.clientId);

        console.log(`🚀 Nueva estrategia iniciada: ${context.id} para ${clientInput.nombre_empresa}`);

        // Save to cache
        strategyCache.set(context.id, context);

        // Save to Firestore
        if (db) {
            try {
                await setDoc(doc(db, 'marketing_strategies', context.id), {
                    ...context,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            } catch (firebaseError) {
                console.warn('Could not save to Firestore:', firebaseError);
            }
        }

        // Return context ID for tracking
        return NextResponse.json({
            success: true,
            contextId: context.id,
            clientId: context.clientId,
            progress: getProgress(context),
            message: `Estrategia iniciada para ${clientInput.nombre_empresa}`
        });

    } catch (error) {
        console.error('Error starting strategy:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}

/**
 * GET - Get strategy by ID
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

        // Check cache first
        let context = strategyCache.get(contextId);

        // If not in cache, try Firestore
        if (!context && db) {
            try {
                const docRef = doc(db, 'marketing_strategies', contextId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    context = docSnap.data() as ReturnType<typeof createStrategyContext>;
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

        return NextResponse.json({
            success: true,
            context,
            progress: getProgress(context)
        });

    } catch (error) {
        console.error('Error getting strategy:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}

// Export cache for use by other routes
export { strategyCache };
