/**
 * Meta Webhook
 * 
 * Recibe leads de Meta Ads (Facebook/Instagram) 
 * via Lead Ads o Conversions API
 */

import { NextRequest, NextResponse } from 'next/server';

// Meta verification token (configurar en env)
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'gravita_sniper_crm';

export interface MetaLeadPayload {
    entry: Array<{
        id: string;
        time: number;
        changes: Array<{
            field: string;
            value: {
                form_id: string;
                leadgen_id: string;
                created_time: number;
                page_id: string;
                ad_id?: string;
                adgroup_id?: string;
                field_data?: Array<{
                    name: string;
                    values: string[];
                }>;
            };
        }>;
    }>;
    object: string;
}

// Verificación de webhook (GET)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Meta webhook verified');
        return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// Recibir leads (POST)
export async function POST(request: NextRequest) {
    try {
        const payload: MetaLeadPayload = await request.json();

        if (payload.object !== 'page') {
            return NextResponse.json({ error: 'Invalid object type' }, { status: 400 });
        }

        // Procesar cada entrada
        for (const entry of payload.entry) {
            for (const change of entry.changes) {
                if (change.field === 'leadgen') {
                    const leadData = change.value;

                    // Extraer datos del lead
                    const fieldData = leadData.field_data || [];
                    const leadInfo: Record<string, string> = {};

                    for (const field of fieldData) {
                        leadInfo[field.name] = field.values[0] || '';
                    }

                    // Crear lead en el sistema
                    const newLead = {
                        id: `meta-${leadData.leadgen_id}`,
                        nombre: leadInfo['full_name'] || leadInfo['first_name'] || 'Lead Meta',
                        email: leadInfo['email'] || '',
                        telefono: leadInfo['phone_number'] || leadInfo['phone'] || '',
                        status: 'nuevo',
                        source: 'meta_ads',
                        metaLeadId: leadData.leadgen_id,
                        leadScore: 50,
                        currency: 'MXN',
                        createdAt: new Date(leadData.created_time * 1000).toISOString(),
                        updatedAt: new Date().toISOString(),
                    };

                    // TODO: Guardar en Firestore
                    console.log('Meta Lead received:', newLead);

                    // TODO: Disparar Agent Setter
                    console.log('Triggering Agent Setter for Meta lead');
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing Meta webhook:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
