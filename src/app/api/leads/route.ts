// API Route for Leads - Firestore CRUD
import { NextRequest, NextResponse } from 'next/server';
import { getLeadsFromFirestore, addLeadToFirestore, updateLeadInFirestore, deleteLeadFromFirestore } from '@/lib/firestoreService';

// GET - Retrieve all leads
export async function GET() {
    try {
        const leads = await getLeadsFromFirestore();
        return NextResponse.json({ success: true, leads });
    } catch (error) {
        console.error('Error fetching leads:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leads' },
            { status: 500 }
        );
    }
}

// POST - Create new lead
export async function POST(request: NextRequest) {
    try {
        const leadData = await request.json();

        const leadId = await addLeadToFirestore({
            name: `${leadData.nombre} ${leadData.apellido || ''}`.trim(),
            email: leadData.email,
            phone: leadData.telefono,
            company: leadData.empresa,
            source: leadData.source || 'manual',
            status: leadData.status || 'nuevo',
            stage: 'lead_entrante',
            score: leadData.leadScore || 50,
            tags: leadData.tags || [],
            notes: [],
            createdAt: new Date(),
            lastActivity: new Date(),
        });

        if (leadId) {
            return NextResponse.json({ success: true, leadId }, { status: 201 });
        } else {
            return NextResponse.json(
                { error: 'Failed to create lead' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error creating lead:', error);
        return NextResponse.json(
            { error: 'Failed to create lead' },
            { status: 500 }
        );
    }
}

// PUT - Update lead
export async function PUT(request: NextRequest) {
    try {
        const { id, ...data } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'Lead ID required' },
                { status: 400 }
            );
        }

        const success = await updateLeadInFirestore(id, data);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: 'Failed to update lead' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error updating lead:', error);
        return NextResponse.json(
            { error: 'Failed to update lead' },
            { status: 500 }
        );
    }
}

// DELETE - Delete lead
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Lead ID required' },
                { status: 400 }
            );
        }

        const success = await deleteLeadFromFirestore(id);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: 'Failed to delete lead' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error deleting lead:', error);
        return NextResponse.json(
            { error: 'Failed to delete lead' },
            { status: 500 }
        );
    }
}
