// API Route for Form Submissions from Embedded Forms
import { NextRequest, NextResponse } from 'next/server';
import { saveFormSubmission } from '@/lib/firestoreService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { formId, formName, data, score } = body;

        if (!formId || !data) {
            return NextResponse.json(
                { error: 'formId and data are required' },
                { status: 400 }
            );
        }

        // Save to Firestore and create lead
        const submissionId = await saveFormSubmission({
            formId,
            formName: formName || 'Formulario Web',
            data,
            score: score || 0,
            submittedAt: new Date(),
            convertedToLead: false,
        });

        if (submissionId) {
            return NextResponse.json({
                success: true,
                submissionId,
                message: 'Form submission saved and lead created',
            });
        } else {
            return NextResponse.json(
                { error: 'Failed to save submission' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Form submission error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Handle CORS for embedded forms
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
