// API Route to Seed Demo Leads to Firestore
import { NextResponse } from 'next/server';
import { addLeadToFirestore, getLeadsFromFirestore } from '@/lib/firestoreService';

const demoLeads = [
    {
        name: 'Carlos Mendoza',
        email: 'carlos@empresa.mx',
        phone: '+52 55 1234 5678',
        company: 'Tech Solutions MX',
        source: 'meta_ads',
        status: 'nuevo',
        stage: 'lead_entrante',
        score: 85,
        tags: ['B2B', 'Tecnología'],
        notes: [],
    },
    {
        name: 'María González',
        email: 'maria@retail.mx',
        phone: '+52 33 9876 5432',
        company: 'Retail Express',
        source: 'google_ads',
        status: 'agendado',
        stage: 'calificacion',
        score: 72,
        tags: ['Retail'],
        notes: [],
    },
    {
        name: 'Roberto Silva',
        email: 'roberto@consultoria.mx',
        phone: '+52 81 5555 1234',
        company: 'Consultoría Integral',
        source: 'referido',
        status: 'show',
        stage: 'reunion_realizada',
        score: 91,
        tags: ['Consultoría', 'B2B'],
        notes: ['Interesado en campañas de Meta Ads'],
    },
    {
        name: 'Ana Torres',
        email: 'ana@clinica.mx',
        phone: '+52 55 7777 8888',
        company: 'Clínica Dental Premium',
        source: 'landing',
        status: 'propuesta_enviada',
        stage: 'propuesta',
        score: 68,
        tags: ['Salud'],
        notes: [],
    },
    {
        name: 'Fernando Ramírez',
        email: 'fernando@inmobiliaria.mx',
        phone: '+52 999 123 4567',
        company: 'Inmobiliaria Costa',
        source: 'meta_ads',
        status: 'ganado',
        stage: 'ganado',
        score: 95,
        tags: ['Inmobiliaria'],
        notes: ['Cliente cerrado exitosamente'],
    },
];

export async function POST() {
    try {
        // Check if leads already exist
        const existingLeads = await getLeadsFromFirestore();

        if (existingLeads.length > 0) {
            return NextResponse.json({
                success: false,
                message: 'Leads already exist in Firestore',
                count: existingLeads.length,
            });
        }

        // Seed demo leads
        const results = [];
        for (const lead of demoLeads) {
            const leadId = await addLeadToFirestore(lead);
            results.push({ name: lead.name, id: leadId, success: !!leadId });
        }

        const successCount = results.filter(r => r.success).length;

        return NextResponse.json({
            success: true,
            message: `Seeded ${successCount} demo leads to Firestore`,
            results,
        }, { status: 201 });
    } catch (error) {
        console.error('Error seeding leads:', error);
        return NextResponse.json(
            { error: 'Failed to seed leads' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Use POST to seed demo leads to Firestore',
        demoLeads: demoLeads.map(l => ({ name: l.name, status: l.status })),
    });
}
