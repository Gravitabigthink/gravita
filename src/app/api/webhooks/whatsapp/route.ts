/**
 * WhatsApp Cloud API Webhook
 * 
 * Recibe mensajes de WhatsApp y responde automáticamente con IA
 * Enruta a diferentes agentes según el contexto del lead:
 * - Sin cita → Setter Agent (cierra ventas)
 * - Con cita → Scheduling Agent (confirma/reagenda)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    parseWhatsAppWebhook,
    WhatsAppWebhookPayload,
    sendWhatsAppMessage,
    markMessageAsRead
} from '@/lib/whatsappService';
import {
    generateSetterResponse,
    generateInitialGreeting,
    generateSchedulingMessage,
    ConversationMessage
} from '@/ai/agents/whatsapp-setter';
import {
    processSchedulingResponse,
    AppointmentContext,
    SCORE_CHANGES
} from '@/ai/agents/scheduling-agent';
import { addLeadToFirestore, getLeadsFromFirestore, updateLeadInFirestore } from '@/lib/firestoreService';
import { transcribeWhatsAppAudio } from '@/lib/audioTranscriber';

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'gravita_sniper_crm';

// In-memory conversation storage (in production, use Redis or Firestore)
const conversationStore = new Map<string, ConversationMessage[]>();

// =============================================================================
// WEBHOOK VERIFICATION (GET)
// =============================================================================

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ WhatsApp webhook verified');
        return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// =============================================================================
// INCOMING MESSAGES (POST)
// =============================================================================

export async function POST(request: NextRequest) {
    try {
        const payload: WhatsAppWebhookPayload = await request.json();

        if (payload.object !== 'whatsapp_business_account') {
            return NextResponse.json({ status: 'ignored' });
        }

        const { messages, statuses } = parseWhatsAppWebhook(payload);

        // Process each incoming message
        for (const msg of messages) {
            // Handle audio messages - transcribe first
            let messageText = msg.text;

            if (msg.type === 'audio' && msg.audioId) {
                console.log('🎤 Audio recibido de:', msg.fromName);

                const transcriptionResult = await transcribeWhatsAppAudio(msg.audioId);

                if (transcriptionResult.success && transcriptionResult.text) {
                    messageText = transcriptionResult.text;
                    console.log('✅ Audio transcrito:', messageText.substring(0, 100));
                } else {
                    console.error('❌ Error transcribiendo audio:', transcriptionResult.error);
                    // Send acknowledgment that we received audio but couldn't transcribe
                    await sendWhatsAppMessage(
                        msg.from,
                        '🎤 Recibí tu mensaje de voz. ¿Podrías escribirme para poder ayudarte mejor?'
                    );
                    continue; // Skip this message
                }
            }

            console.log('📱 WhatsApp:', msg.fromName, '-', messageText.substring(0, 50));

            // Mark as read immediately
            await markMessageAsRead(msg.from);

            // Get or create conversation history
            let history = conversationStore.get(msg.from) || [];

            // Add incoming message to history
            history.push({
                role: 'user',
                content: messageText,
                timestamp: new Date(),
            });

            // Find or create lead
            const leads = await getLeadsFromFirestore();
            let lead = leads.find(l =>
                l.phone?.replace(/\D/g, '').includes(msg.from.slice(-10)) ||
                msg.from.includes(l.phone?.replace(/\D/g, '').slice(-10) || 'NOMATCH')
            );

            if (!lead) {
                // Create new lead
                const newLead = {
                    name: msg.fromName || 'Lead WhatsApp',
                    email: '',
                    phone: msg.from,
                    status: 'nuevo',
                    source: 'whatsapp',
                    score: 40,
                    notes: [`WhatsApp: "${msg.text.substring(0, 100)}"`],
                    createdAt: new Date(),
                    lastActivity: new Date(),
                };

                const result = await addLeadToFirestore(newLead);
                if (result) {
                    lead = { id: result, ...newLead };
                    console.log('✅ Lead creado:', lead.name);
                }
            }

            // Determine which agent to use based on lead context
            let aiResponse: string;
            let suggestedAction: string = 'continue';
            let scoreChange: number = 0;
            let newStatus: string | undefined;

            // Check if lead has a pending appointment
            const hasAppointment = lead?.status === 'agendado' ||
                (lead as unknown as Record<string, unknown>)?.appointmentDate;

            if (hasAppointment && lead) {
                // Use Scheduling Agent for leads with appointments
                console.log('📅 Using Scheduling Agent for:', lead.name);

                const appointmentDate = (lead as unknown as Record<string, unknown>)?.appointmentDate
                    ? new Date((lead as unknown as Record<string, unknown>).appointmentDate as string)
                    : new Date();

                const context: AppointmentContext = {
                    leadId: lead.id || '',
                    leadName: lead.name,
                    leadPhone: msg.from,
                    appointmentDate,
                    appointmentTime: appointmentDate.toLocaleString('es-MX'),
                    appointmentType: 'videollamada',
                    currentScore: lead.score || 50,
                };

                const schedulingResult = await processSchedulingResponse(context, msg.text);
                aiResponse = schedulingResult.response;
                scoreChange = schedulingResult.scoreChange;

                if (schedulingResult.shouldUpdatePipeline && schedulingResult.newStage) {
                    newStatus = schedulingResult.newStage;
                }
            } else if (history.length === 1) {
                // First message - send greeting
                aiResponse = generateInitialGreeting(msg.fromName);
            } else {
                // Ongoing conversation - use AI setter
                const setterResult = await generateSetterResponse(
                    {
                        id: lead?.id || 'unknown',
                        name: lead?.name || msg.fromName || 'Cliente',
                        phone: msg.from,
                        email: lead?.email,
                        company: (lead as unknown as Record<string, unknown>)?.company as string | undefined,
                        source: lead?.source,
                        score: lead?.score,
                        notes: lead?.notes,
                        conversationHistory: history.slice(-10),
                    },
                    msg.text
                );

                aiResponse = setterResult.response;
                suggestedAction = setterResult.suggestedAction || 'continue';

                // If ready to schedule, add scheduling link
                if (suggestedAction === 'schedule_call') {
                    const schedulingMsg = generateSchedulingMessage(
                        msg.fromName || 'Cliente',
                        'https://calendly.com/gravita/videollamada' // Replace with your actual link
                    );
                    aiResponse = schedulingMsg;
                    scoreChange = 15; // Ready to schedule
                    newStatus = 'contactado';
                }
            }

            // Send response via WhatsApp
            const sendResult = await sendWhatsAppMessage(msg.from, aiResponse);

            if (sendResult.success) {
                console.log('✅ Respuesta enviada');

                // Add response to history
                history.push({
                    role: 'assistant',
                    content: aiResponse,
                    timestamp: new Date(),
                });

                // Update conversation store
                conversationStore.set(msg.from, history.slice(-20)); // Keep last 20 messages
            } else {
                console.error('❌ Error enviando respuesta:', sendResult.error);
            }

            // Update lead activity and score
            if (lead?.id) {
                const updates: Record<string, unknown> = {
                    lastActivity: new Date(),
                };

                // Update score if there's a change
                if (scoreChange !== 0 && lead.score) {
                    updates.score = Math.max(0, Math.min(100, lead.score + scoreChange));
                }

                // Update status if needed
                if (newStatus) {
                    updates.status = newStatus;
                }

                await updateLeadInFirestore(lead.id, updates);
            }
        }

        // Log message statuses
        for (const status of statuses) {
            console.log('📊 Status:', status.messageId.slice(-10), '-', status.status);
        }

        return NextResponse.json({ status: 'processed' });
    } catch (error) {
        console.error('❌ Webhook error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
