import { NextRequest, NextResponse } from 'next/server';
import { saveFormSubmission } from '@/lib/firestoreService';

// Types
interface FormSubmission {
    formId: string;
    formName: string;
    linkedCalendar?: string;
    responses: Record<string, string | number>;
    score: number;
}

// Calendar URLs mapping (in production would come from database)
const calendarUrls: Record<string, string> = {
    'cal-general': 'https://calendly.com/gravita/30min',
    'cal-discovery': 'https://calendly.com/gravita/discovery',
};

export async function POST(request: NextRequest) {
    try {
        const body: FormSubmission = await request.json();

        // Validate required fields
        if (!body.formId || !body.responses) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Extract lead info from responses
        const responses = body.responses;

        // Find name field (common variations)
        const nameValue =
            responses['f1'] as string ||
            responses['nombre'] as string ||
            responses['name'] as string ||
            'Sin nombre';

        // Parse name (might include full name)
        const nameParts = nameValue.trim().split(' ');
        const nombre = nameParts[0] || nameValue;
        const apellido = nameParts.slice(1).join(' ') || undefined;

        // Find email
        const email =
            responses['f2'] as string ||
            responses['email'] as string ||
            responses['correo'] as string ||
            '';

        // Find phone
        const telefono =
            responses['f3'] as string ||
            responses['phone'] as string ||
            responses['telefono'] as string ||
            responses['whatsapp'] as string ||
            '';

        // Find company
        const empresa =
            responses['f4'] as string ||
            responses['empresa'] as string ||
            responses['company'] as string ||
            undefined;

        // Save to Firestore and create lead automatically
        const submissionId = await saveFormSubmission({
            formId: body.formId,
            formName: body.formName || 'Formulario Web',
            data: {
                nombre: `${nombre} ${apellido || ''}`.trim(),
                email,
                telefono,
                empresa: empresa || '',
                ...body.responses,
            },
            score: body.score,
            submittedAt: new Date(),
            convertedToLead: false,
        });

        const leadId = submissionId ? `lead-${Date.now()}` : null;

        console.log('New lead created from form (saved to Firestore):', {
            id: leadId,
            nombre,
            email,
            score: body.score,
            formId: body.formId,
        });

        // Prepare response
        const response: {
            success: boolean;
            leadId: string | null;
            score: number;
            calendarUrl?: string;
        } = {
            success: true,
            leadId,
            score: body.score,
        };

        // Add calendar URL if form has linked calendar
        if (body.linkedCalendar && calendarUrls[body.linkedCalendar]) {
            // Add lead info to calendar URL as params
            const calendarUrl = new URL(calendarUrls[body.linkedCalendar]);
            calendarUrl.searchParams.set('name', `${nombre} ${apellido || ''}`.trim());
            calendarUrl.searchParams.set('email', email);
            response.calendarUrl = calendarUrl.toString();
        }

        return NextResponse.json(response, { status: 201 });
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
