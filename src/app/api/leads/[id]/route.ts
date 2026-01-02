/**
 * API Route: Update/Delete individual Lead
 * 
 * PATCH /api/leads/[id] - Update lead fields
 * DELETE /api/leads/[id] - Delete a lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateLeadInFirestore, deleteLeadFromFirestore } from '@/lib/firestoreService';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();

        const success = await updateLeadInFirestore(id, data);

        if (success) {
            return NextResponse.json({ success: true, message: 'Lead actualizado' });
        } else {
            return NextResponse.json(
                { error: 'No se pudo actualizar el lead' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error updating lead:', error);
        return NextResponse.json(
            { error: 'Error al actualizar lead' },
            { status: 500 }
        );
    }
}

// PUT is an alias for PATCH
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    return PATCH(request, context);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const success = await deleteLeadFromFirestore(id);

        if (success) {
            return NextResponse.json({ success: true, message: 'Lead eliminado' });
        } else {
            return NextResponse.json(
                { error: 'No se pudo eliminar el lead' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error deleting lead:', error);
        return NextResponse.json(
            { error: 'Error al eliminar lead' },
            { status: 500 }
        );
    }
}
