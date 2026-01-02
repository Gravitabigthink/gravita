/**
 * Audio Transcriber Service
 * 
 * Descarga audios de WhatsApp Cloud API y los transcribe usando Gemini.
 * 
 * Flujo:
 * 1. Recibir media_id del webhook de WhatsApp
 * 2. Obtener URL del archivo desde Meta API
 * 3. Descargar el archivo de audio
 * 4. Enviar a Gemini para transcripción
 * 5. Retornar texto transcrito
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

interface TranscriptionResult {
    success: boolean;
    text?: string;
    error?: string;
}

/**
 * Get WhatsApp media URL from media ID
 */
async function getMediaUrl(mediaId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    const token = process.env.META_WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;

    if (!token) {
        return { success: false, error: 'WhatsApp token not configured' };
    }

    try {
        const response = await fetch(`${WHATSAPP_API_URL}/${mediaId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok && data.url) {
            return { success: true, url: data.url };
        } else {
            return { success: false, error: data.error?.message || 'Failed to get media URL' };
        }
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

/**
 * Download media file from WhatsApp
 */
async function downloadMedia(mediaUrl: string): Promise<{ success: boolean; buffer?: Buffer; mimeType?: string; error?: string }> {
    const token = process.env.META_WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;

    if (!token) {
        return { success: false, error: 'WhatsApp token not configured' };
    }

    try {
        const response = await fetch(mediaUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return { success: false, error: `Failed to download: ${response.status}` };
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = response.headers.get('content-type') || 'audio/ogg';

        return { success: true, buffer, mimeType };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

/**
 * Transcribe audio using Gemini
 */
async function transcribeWithGemini(audioBuffer: Buffer, mimeType: string): Promise<TranscriptionResult> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return { success: false, error: 'Gemini API key not configured' };
    }

    try {
        // Convert buffer to base64
        const base64Audio = audioBuffer.toString('base64');

        // Use Gemini 1.5 Flash for audio transcription
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: 'Transcribe el siguiente audio de voz a texto. Solo responde con la transcripción exacta, sin agregar explicaciones ni comentarios adicionales. Si el audio está en español, transcríbelo en español.'
                                },
                                {
                                    inlineData: {
                                        mimeType: mimeType,
                                        data: base64Audio,
                                    },
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 1024,
                    },
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini transcription error:', data);
            return { success: false, error: data.error?.message || 'Transcription failed' };
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            return { success: true, text: text.trim() };
        } else {
            return { success: false, error: 'No transcription returned' };
        }
    } catch (error) {
        console.error('Transcription error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Main function: Download and transcribe WhatsApp audio
 */
export async function transcribeWhatsAppAudio(mediaId: string): Promise<TranscriptionResult> {
    console.log('🎤 Transcribiendo audio:', mediaId);

    // Step 1: Get media URL
    const urlResult = await getMediaUrl(mediaId);
    if (!urlResult.success || !urlResult.url) {
        console.error('❌ Error getting media URL:', urlResult.error);
        return { success: false, error: urlResult.error };
    }

    // Step 2: Download the audio file
    const downloadResult = await downloadMedia(urlResult.url);
    if (!downloadResult.success || !downloadResult.buffer) {
        console.error('❌ Error downloading media:', downloadResult.error);
        return { success: false, error: downloadResult.error };
    }

    console.log('📥 Audio descargado:', downloadResult.buffer.length, 'bytes');

    // Step 3: Transcribe with Gemini
    const transcriptionResult = await transcribeWithGemini(
        downloadResult.buffer,
        downloadResult.mimeType || 'audio/ogg'
    );

    if (transcriptionResult.success) {
        console.log('✅ Audio transcrito:', transcriptionResult.text?.substring(0, 100));
    } else {
        console.error('❌ Error transcribing:', transcriptionResult.error);
    }

    return transcriptionResult;
}
