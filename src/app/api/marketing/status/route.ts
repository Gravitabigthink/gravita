/**
 * Marketing Strategy API - List and Status
 * 
 * GET: List all strategies or get detailed status of one
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProgress } from '@/ai/agents/marketing-orchestrator';
import { strategyCache } from '../generate/route';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { StrategyContext } from '@/types/marketing';

/**
 * GET - List strategies or get status
 * Query: ?id=contextId (optional, for specific status)
 *        ?limit=10 (optional, for list)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const contextId = searchParams.get('id');
        const limitParam = parseInt(searchParams.get('limit') || '20');

        // If specific ID requested, return detailed status
        if (contextId) {
            const context = strategyCache.get(contextId);

            if (!context) {
                return NextResponse.json({
                    success: false,
                    error: 'Estrategia no encontrada'
                }, { status: 404 });
            }

            const progress = getProgress(context);

            return NextResponse.json({
                success: true,
                strategy: {
                    id: context.id,
                    clientId: context.clientId,
                    clientName: context.clientInput.nombre_empresa,
                    status: context.status,
                    currentStep: context.currentStep,
                    progress,
                    steps: context.steps.map(s => ({
                        id: s.id,
                        name: s.name,
                        status: s.status,
                        hasOutput: !!s.output,
                        error: s.error,
                        startedAt: s.startedAt,
                        completedAt: s.completedAt
                    })),
                    hasBrief: !!context.briefHtml,
                    hasStrategy: !!context.strategyHtml,
                    hasContent: !!context.contentCsv,
                    createdAt: context.createdAt,
                    updatedAt: context.updatedAt,
                    completedAt: context.completedAt
                }
            });
        }

        // List all strategies
        const strategies: Array<{
            id: string;
            clientName: string;
            status: string;
            progress: ReturnType<typeof getProgress>;
            createdAt: Date;
        }> = [];

        // From cache
        for (const [id, context] of strategyCache.entries()) {
            strategies.push({
                id,
                clientName: context.clientInput.nombre_empresa,
                status: context.status,
                progress: getProgress(context),
                createdAt: context.createdAt
            });
        }

        // From Firestore if available
        if (db && strategies.length === 0) {
            try {
                const q = query(
                    collection(db, 'marketing_strategies'),
                    orderBy('createdAt', 'desc'),
                    limit(limitParam)
                );
                const querySnapshot = await getDocs(q);

                querySnapshot.forEach((doc) => {
                    const data = doc.data() as StrategyContext;
                    if (!strategyCache.has(doc.id)) {
                        strategies.push({
                            id: doc.id,
                            clientName: data.clientInput?.nombre_empresa || 'Sin nombre',
                            status: data.status,
                            progress: getProgress(data),
                            createdAt: data.createdAt
                        });
                    }
                });
            } catch (firebaseError) {
                console.warn('Could not fetch from Firestore:', firebaseError);
            }
        }

        // Sort by creation date
        strategies.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({
            success: true,
            count: strategies.length,
            strategies: strategies.slice(0, limitParam)
        });

    } catch (error) {
        console.error('Error listing strategies:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}
