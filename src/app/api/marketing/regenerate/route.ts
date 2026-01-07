/**
 * Marketing Strategy API - Regenerate Step
 * 
 * POST: Regenerate a specific step (resets dependent steps)
 */

import { NextRequest, NextResponse } from 'next/server';
import { regenerateStep, getProgress } from '@/ai/agents/marketing-orchestrator';
import { strategyCache } from '../generate/route';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { StrategyContext } from '@/types/marketing';

/**
 * POST - Regenerate a step
 * Body: { contextId: string, stepId: number }
 */
export async function POST(request: NextRequest) {
    try {
        const { contextId, stepId } = await request.json();

        if (!contextId || !stepId) {
            return NextResponse.json({
                success: false,
                error: 'contextId y stepId son requeridos'
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

        console.log(`🔄 Regenerando paso ${stepId}...`);

        // Regenerate step
        const updatedContext = await regenerateStep(context, stepId);

        // Update cache
        strategyCache.set(contextId, updatedContext);

        // Save to Firestore
        if (db) {
            try {
                await setDoc(doc(db, 'marketing_strategies', contextId), {
                    ...updatedContext,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            } catch (firebaseError) {
                console.warn('Could not save to Firestore:', firebaseError);
            }
        }

        const step = updatedContext.steps.find(s => s.id === stepId);

        return NextResponse.json({
            success: true,
            contextId,
            stepId,
            stepName: step?.name,
            stepStatus: step?.status,
            stepOutput: step?.output?.substring(0, 500) + '...',
            progress: getProgress(updatedContext)
        });

    } catch (error) {
        console.error('Error regenerating step:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}
