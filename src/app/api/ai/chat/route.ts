// API Route for AI Chat with Gemini
import { NextRequest, NextResponse } from 'next/server';
import { chatWithGemini, analyzeLeadWithAI, generateFollowUpEmail, editQuoteWithAI } from '@/lib/geminiService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, message, context, data } = body;

        switch (action) {
            case 'chat':
                const chatResponse = await chatWithGemini(
                    message,
                    context || 'assistant',
                    data?.additionalContext
                );
                return NextResponse.json({ success: true, response: chatResponse });

            case 'analyze_lead':
                const analysis = await analyzeLeadWithAI(data);
                return NextResponse.json({ success: true, analysis });

            case 'generate_email':
                const email = await generateFollowUpEmail(data);
                return NextResponse.json({ success: true, email });

            case 'edit_quote':
                const quoteEdit = await editQuoteWithAI(data.quote, data.instruction);
                return NextResponse.json({ success: true, edit: quoteEdit });

            default:
                // Default to general chat
                const defaultResponse = await chatWithGemini(message || body.prompt || '');
                return NextResponse.json({ success: true, response: defaultResponse });
        }
    } catch (error) {
        console.error('AI Chat error:', error);
        return NextResponse.json(
            { error: 'Error processing AI request' },
            { status: 500 }
        );
    }
}
