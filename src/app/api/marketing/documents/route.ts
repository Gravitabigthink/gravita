/**
 * Marketing Strategy API - Get Documents
 * 
 * GET: Get generated HTML documents (Brief and Strategy)
 */

import { NextRequest, NextResponse } from 'next/server';
import { strategyCache } from '../generate/route';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { StrategyContext } from '@/types/marketing';

/**
 * GET - Get documents
 * Query: ?id=contextId&type=brief|strategy|both
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const contextId = searchParams.get('id');
        const docType = searchParams.get('type') || 'both';

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

        const response: {
            success: boolean;
            contextId: string;
            clientName: string;
            briefHtml?: string;
            strategyHtml?: string;
            contentCsv?: string;
        } = {
            success: true,
            contextId,
            clientName: context.clientInput.nombre_empresa
        };

        if (docType === 'brief' || docType === 'both') {
            response.briefHtml = context.briefHtml;
        }

        if (docType === 'strategy' || docType === 'both') {
            response.strategyHtml = context.strategyHtml;
        }

        if (docType === 'content' || docType === 'both') {
            response.contentCsv = context.contentCsv;
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error getting documents:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}

/**
 * GET HTML document directly for viewing/download
 */
export async function POST(request: NextRequest) {
    try {
        const { contextId, type } = await request.json();

        if (!contextId || !type) {
            return NextResponse.json({
                success: false,
                error: 'contextId y type son requeridos'
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

        let content = '';
        let contentType = 'text/html';
        let filename = '';

        if (type === 'brief') {
            content = context.briefHtml || '<html><body><h1>Brief no generado aún</h1></body></html>';
            filename = `brief_${context.clientInput.nombre_empresa.replace(/\s+/g, '_')}.html`;
        } else if (type === 'strategy') {
            content = context.strategyHtml || '<html><body><h1>Estrategia no generada aún</h1></body></html>';
            filename = `estrategia_${context.clientInput.nombre_empresa.replace(/\s+/g, '_')}.html`;
        } else if (type === 'content') {
            content = context.contentCsv || 'Semana,Cliente,Post,Responsable,Formato,Red Social,Texto In,COPY\nNo hay contenido generado';
            contentType = 'text/csv';
            filename = `contenido_${context.clientInput.nombre_empresa.replace(/\s+/g, '_')}.csv`;
        }

        return new NextResponse(content, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('Error downloading document:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}
