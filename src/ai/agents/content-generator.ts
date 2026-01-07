/**
 * Content Generator - Social Media Content Creation Engine
 * 
 * Generates 11 pieces of content per month:
 * - 4 Posts (Week 1)
 * - 4 Carousels (Week 2)
 * - 3 Reels (Week 3)
 */

import { routeToLLMSafe } from '@/lib/llm-router';
import { StrategyContext, ContentPiece, ContentCalendar } from '@/types/marketing';

// Types for parsed content
interface ParsedPost {
    tema: string;
    objetivo: string;
    copy: string;
    hashtags: string[];
    cta: string;
}

interface ParsedCarousel {
    tema: string;
    estructura: string;
    slides: string[];
    caption: string;
    hashtags: string[];
}

interface ParsedReel {
    tema: string;
    hook: string;
    guion: string;
    visual: string;
    audio: string;
    caption: string;
    hashtags: string[];
}

// =============================================================================
// CONTENT PROMPTS
// =============================================================================

const CONTENT_SYSTEM_PROMPT = `Eres un copywriter experto en marketing de contenidos para redes sociales.

REGLAS IMPORTANTES:
1. Nunca uses venta agresiva - enfoca en valor, educación e inspiración
2. Conecta emocionalmente con los dolores y aspiraciones del público
3. Usa el tono de marca especificado
4. Cada pieza debe tener un objetivo claro
5. Los CTAs deben ser naturales, no forzados
6. Incluye emojis de manera estratégica (no excesiva)

FORMATOS:
- POSTS: Mensaje corto y contundente con CTA sutil
- CARRUSELES: Usa estructura AIDA o PAS, máximo 8-10 slides
- REELS: Guion con tiempos específicos, hooks fuertes en primeros 3 segundos`;

// =============================================================================
// MAIN GENERATOR
// =============================================================================

export async function generateContentCalendar(
    context: StrategyContext
): Promise<ContentCalendar> {
    const { clientInput, steps } = context;

    const strategyOutput = steps.find(s => s.id === 11)?.output || '';
    const microniche = steps.find(s => s.id === 4)?.output || '';
    const valueProposition = steps.find(s => s.id === 5)?.output || '';
    const creativity = steps.find(s => s.id === 13)?.output || '';

    const pieces: ContentPiece[] = [];

    console.log('📝 Generando Posts (Semana 1)...');
    const posts = await generatePosts(clientInput, strategyOutput, valueProposition, 4);
    pieces.push(...posts);

    console.log('📊 Generando Carruseles (Semana 2)...');
    const carousels = await generateCarousels(clientInput, strategyOutput, microniche, 4);
    pieces.push(...carousels);

    console.log('🎬 Generando Reels (Semana 3)...');
    const reels = await generateReels(clientInput, strategyOutput, creativity, 3);
    pieces.push(...reels);

    const now = new Date();

    return {
        strategyId: context.id,
        clientName: clientInput.nombre_empresa,
        month: now.toLocaleString('es-MX', { month: 'long' }),
        year: now.getFullYear(),
        pieces,
        generatedAt: now
    };
}

// =============================================================================
// POST GENERATION
// =============================================================================

async function generatePosts(
    clientInput: StrategyContext['clientInput'],
    strategy: string,
    valueProposition: string,
    count: number
): Promise<ContentPiece[]> {
    const prompt = `${CONTENT_SYSTEM_PROMPT}

INFORMACIÓN DEL CLIENTE:
- Empresa: ${clientInput.nombre_empresa}
- Producto estrella: ${clientInput.producto_estrella_1}
- Tono de marca: ${clientInput.tono_marca || 'amigable'}
- Cliente ideal: ${clientInput.cliente_ideal}
- Dolores del cliente: ${clientInput.dolores_cliente.join(', ')}

PROPUESTA DE VALOR:
${valueProposition.substring(0, 1500)}

ESTRATEGIA:
${strategy.substring(0, 1500)}

TAREA: Genera ${count} POSTS para Instagram/Facebook.

FORMATO DE RESPUESTA (JSON):
{
  "posts": [
    {
      "tema": "...",
      "objetivo": "...",
      "copy": "...",
      "hashtags": ["#tag1", "#tag2"],
      "cta": "..."
    }
  ]
}`;

    try {
        const response = await routeToLLMSafe(prompt, { taskType: 'email-draft', overrideTier: 'standard' });
        const parsed = extractJSON(response) as { posts?: ParsedPost[] } | null;

        if (!parsed?.posts || !Array.isArray(parsed.posts)) {
            return generateFallbackPosts(clientInput, count);
        }

        return parsed.posts.map((post, index): ContentPiece => ({
            semana: 1,
            cliente: clientInput.nombre_empresa,
            numeroPost: index + 1,
            responsable: 'Por asignar',
            formato: 'Post',
            redSocial: 'Instagram',
            textoIn: `TEMA: ${post.tema}\nOBJETIVO: ${post.objetivo}`,
            copy: `${post.copy}\n\n${post.hashtags?.join(' ') || ''}\n\n${post.cta || ''}`,
            hashtags: post.hashtags,
            callToAction: post.cta
        }));
    } catch (error) {
        console.error('Error generating posts:', error);
        return generateFallbackPosts(clientInput, count);
    }
}

// =============================================================================
// CAROUSEL GENERATION
// =============================================================================

async function generateCarousels(
    clientInput: StrategyContext['clientInput'],
    strategy: string,
    microniche: string,
    count: number
): Promise<ContentPiece[]> {
    const prompt = `${CONTENT_SYSTEM_PROMPT}

INFORMACIÓN DEL CLIENTE:
- Empresa: ${clientInput.nombre_empresa}
- Producto estrella: ${clientInput.producto_estrella_1}
- Tono de marca: ${clientInput.tono_marca || 'amigable'}
- Micronicho: ${microniche.substring(0, 800)}
- Dolores del cliente: ${clientInput.dolores_cliente.join(', ')}

ESTRATEGIA:
${strategy.substring(0, 1500)}

TAREA: Genera ${count} CARRUSELES para Instagram.

FORMATO DE RESPUESTA (JSON):
{
  "carousels": [
    {
      "tema": "...",
      "estructura": "AIDA",
      "slides": ["Slide 1: ...", "Slide 2: ..."],
      "caption": "...",
      "hashtags": ["#tag1", "#tag2"]
    }
  ]
}`;

    try {
        const response = await routeToLLMSafe(prompt, { taskType: 'email-draft', overrideTier: 'standard' });
        const parsed = extractJSON(response) as { carousels?: ParsedCarousel[] } | null;

        if (!parsed?.carousels || !Array.isArray(parsed.carousels)) {
            return generateFallbackCarousels(clientInput, count);
        }

        return parsed.carousels.map((carousel, index): ContentPiece => ({
            semana: 2,
            cliente: clientInput.nombre_empresa,
            numeroPost: index + 1,
            responsable: 'Por asignar',
            formato: 'Carrusel',
            redSocial: 'Instagram',
            textoIn: carousel.slides?.join('\n\n') || `Carrusel sobre ${carousel.tema}`,
            copy: `${carousel.caption}\n\n${carousel.hashtags?.join(' ') || ''}`,
            hashtags: carousel.hashtags,
            callToAction: carousel.slides?.[carousel.slides.length - 1] || ''
        }));
    } catch (error) {
        console.error('Error generating carousels:', error);
        return generateFallbackCarousels(clientInput, count);
    }
}

// =============================================================================
// REEL GENERATION
// =============================================================================

async function generateReels(
    clientInput: StrategyContext['clientInput'],
    strategy: string,
    creativity: string,
    count: number
): Promise<ContentPiece[]> {
    const prompt = `${CONTENT_SYSTEM_PROMPT}

INFORMACIÓN DEL CLIENTE:
- Empresa: ${clientInput.nombre_empresa}
- Producto estrella: ${clientInput.producto_estrella_1}
- Tono de marca: ${clientInput.tono_marca || 'amigable'}
- Cliente ideal: ${clientInput.cliente_ideal}

IDEAS CREATIVAS:
${creativity.substring(0, 1500)}

ESTRATEGIA:
${strategy.substring(0, 1000)}

TAREA: Genera ${count} GUIONES DE REELS para Instagram/TikTok.

FORMATO DE RESPUESTA (JSON):
{
  "reels": [
    {
      "tema": "...",
      "hook": "...",
      "guion": "[0-3s] Hook: ...",
      "visual": "...",
      "audio": "...",
      "caption": "...",
      "hashtags": ["#tag1", "#tag2"]
    }
  ]
}`;

    try {
        const response = await routeToLLMSafe(prompt, { taskType: 'email-draft', overrideTier: 'standard' });
        const parsed = extractJSON(response) as { reels?: ParsedReel[] } | null;

        if (!parsed?.reels || !Array.isArray(parsed.reels)) {
            return generateFallbackReels(clientInput, count);
        }

        return parsed.reels.map((reel, index): ContentPiece => ({
            semana: 3,
            cliente: clientInput.nombre_empresa,
            numeroPost: index + 1,
            responsable: 'Por asignar',
            formato: 'Reel',
            redSocial: 'Instagram',
            textoIn: `HOOK: ${reel.hook}\n\nGUION:\n${reel.guion}\n\nVISUAL: ${reel.visual}\n\nAUDIO: ${reel.audio}`,
            copy: `${reel.caption}\n\n${reel.hashtags?.join(' ') || ''}`,
            hashtags: reel.hashtags,
            callToAction: reel.hook
        }));
    } catch (error) {
        console.error('Error generating reels:', error);
        return generateFallbackReels(clientInput, count);
    }
}

// =============================================================================
// FALLBACK GENERATORS
// =============================================================================

function generateFallbackPosts(clientInput: StrategyContext['clientInput'], count: number): ContentPiece[] {
    const themes = ['Beneficio principal', 'Historia de éxito', 'Tip educativo', 'Behind the scenes'];
    return Array.from({ length: count }, (_, i) => ({
        semana: 1,
        cliente: clientInput.nombre_empresa,
        numeroPost: i + 1,
        responsable: 'Por asignar',
        formato: 'Post' as const,
        redSocial: 'Instagram' as const,
        textoIn: `Post sobre: ${themes[i % themes.length]}`,
        copy: `[Contenido pendiente]\n\nTema: ${themes[i % themes.length]}`,
        hashtags: [`#${clientInput.nombre_empresa.replace(/\s+/g, '')}`]
    }));
}

function generateFallbackCarousels(clientInput: StrategyContext['clientInput'], count: number): ContentPiece[] {
    const themes = ['Guía paso a paso', 'Mitos vs Realidades', 'Checklist', 'Antes/después'];
    return Array.from({ length: count }, (_, i) => ({
        semana: 2,
        cliente: clientInput.nombre_empresa,
        numeroPost: i + 1,
        responsable: 'Por asignar',
        formato: 'Carrusel' as const,
        redSocial: 'Instagram' as const,
        textoIn: `Carrusel: ${themes[i % themes.length]}`,
        copy: `[Contenido pendiente]\n\nTema: ${themes[i % themes.length]}`,
        hashtags: [`#${clientInput.nombre_empresa.replace(/\s+/g, '')}`]
    }));
}

function generateFallbackReels(clientInput: StrategyContext['clientInput'], count: number): ContentPiece[] {
    const themes = ['Tutorial rápido', 'Trend adaptado', 'FAQ'];
    return Array.from({ length: count }, (_, i) => ({
        semana: 3,
        cliente: clientInput.nombre_empresa,
        numeroPost: i + 1,
        responsable: 'Por asignar',
        formato: 'Reel' as const,
        redSocial: 'Instagram' as const,
        textoIn: `[0-3s] Hook\n[3-15s] Desarrollo\n[15-30s] CTA\n\nTema: ${themes[i % themes.length]}`,
        copy: `[Contenido pendiente]\n\nTema: ${themes[i % themes.length]}`,
        hashtags: [`#${clientInput.nombre_empresa.replace(/\s+/g, '')}`]
    }));
}

// =============================================================================
// CSV EXPORT
// =============================================================================

export function exportContentToCSV(calendar: ContentCalendar): string {
    const headers = ['Semana', 'Cliente', 'Post #', 'Responsable', 'Formato', 'Red Social', 'Texto In', 'COPY', 'Hashtags', 'CTA'];

    const escapeCSV = (value: string | undefined): string => {
        if (!value) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const rows = calendar.pieces.map(piece => [
        piece.semana,
        escapeCSV(piece.cliente),
        piece.numeroPost,
        escapeCSV(piece.responsable),
        piece.formato,
        piece.redSocial,
        escapeCSV(piece.textoIn),
        escapeCSV(piece.copy),
        escapeCSV(piece.hashtags?.join(', ')),
        escapeCSV(piece.callToAction)
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

// =============================================================================
// UTILITY
// =============================================================================

function extractJSON(text: string): Record<string, unknown> | null {
    try {
        return JSON.parse(text);
    } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
            try { return JSON.parse(match[0]); } catch { return null; }
        }
        return null;
    }
}

