/**
 * Marketing Strategy API - Execute Step
 * 
 * POST: Execute the next step or a specific step in the strategy chain
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    executeStep,
    executeNextStep,
    getProgress
} from '@/ai/agents/marketing-orchestrator';
import { strategyCache } from '../generate/route';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { StrategyContext } from '@/types/marketing';

/**
 * POST - Execute step(s)
 * Body: { contextId: string, stepId?: number, executeAll?: boolean }
 */
export async function POST(request: NextRequest) {
    try {
        const { contextId, stepId, executeAll } = await request.json();

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

        let updatedContext: StrategyContext;

        if (executeAll) {
            // Execute all remaining steps
            console.log(`⚡ Ejecutando todos los pasos restantes...`);
            let currentContext = context;

            while (currentContext.status !== 'completed' && currentContext.status !== 'error') {
                currentContext = await executeNextStep(currentContext);

                // Update cache and save progress
                strategyCache.set(contextId, currentContext);
                await saveToFirestore(contextId, currentContext);
            }

            updatedContext = currentContext;

        } else if (stepId) {
            // Execute specific step
            console.log(`▶️ Ejecutando paso ${stepId}...`);
            updatedContext = await executeStep(context, stepId);

        } else {
            // Execute next step
            console.log(`▶️ Ejecutando siguiente paso...`);
            updatedContext = await executeNextStep(context);
        }

        // Update cache
        strategyCache.set(contextId, updatedContext);

        // Save to Firestore
        await saveToFirestore(contextId, updatedContext);

        const progress = getProgress(updatedContext);
        const currentStep = updatedContext.steps.find(s =>
            s.id === (stepId || updatedContext.currentStep)
        );

        return NextResponse.json({
            success: true,
            contextId,
            stepExecuted: currentStep?.id,
            stepName: currentStep?.name,
            stepStatus: currentStep?.status,
            stepOutput: currentStep?.output?.substring(0, 500) + '...', // Preview
            progress,
            overallStatus: updatedContext.status
        });

    } catch (error) {
        console.error('Error executing step:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}

async function saveToFirestore(contextId: string, context: StrategyContext) {
    if (db) {
        try {
            await setDoc(doc(db, 'marketing_strategies', contextId), {
                ...context,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (firebaseError) {
            console.warn('Could not save to Firestore:', firebaseError);
        }
    }
}
