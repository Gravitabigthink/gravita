/**
 * Quote Agent - Generador de Cotizaciones
 * 
 * Genera cotizaciones personalizadas basadas en:
 * - Análisis de transcripción
 * - Necesidades detectadas
 * - Perfil psicológico del cliente
 */

import { Lead, Quote, QuoteService, PsychType } from '@/types/lead';

// Catálogo de servicios
export interface ServiceCatalog {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    category: string;
}

export const SERVICE_CATALOG: ServiceCatalog[] = [
    // Generación de Leads
    {
        id: 'meta-ads',
        name: 'Campañas Meta Ads',
        description: 'Gestión completa de campañas en Facebook e Instagram',
        basePrice: 8000,
        category: 'Publicidad digital',
    },
    {
        id: 'google-ads',
        name: 'Campañas Google Ads',
        description: 'Campañas de búsqueda, display y remarketing',
        basePrice: 10000,
        category: 'Publicidad digital',
    },
    {
        id: 'landing-page',
        name: 'Landing Page Optimizada',
        description: 'Página de aterrizaje con alta conversión',
        basePrice: 15000,
        category: 'Desarrollo web',
    },

    // Redes Sociales
    {
        id: 'social-basic',
        name: 'Pack Redes Básico',
        description: '12 posts mensuales + stories + moderación',
        basePrice: 6000,
        category: 'Redes sociales',
    },
    {
        id: 'social-pro',
        name: 'Pack Redes Pro',
        description: '20 posts + reels + stories + moderación + reportes',
        basePrice: 12000,
        category: 'Redes sociales',
    },
    {
        id: 'social-premium',
        name: 'Pack Redes Premium',
        description: '30 posts + reels + influencers + community management',
        basePrice: 20000,
        category: 'Redes sociales',
    },

    // SEO
    {
        id: 'seo-local',
        name: 'SEO Local',
        description: 'Optimización Google My Business + SEO on-page',
        basePrice: 5000,
        category: 'SEO/Posicionamiento',
    },
    {
        id: 'seo-full',
        name: 'SEO Completo',
        description: 'Estrategia SEO integral + link building + contenido',
        basePrice: 15000,
        category: 'SEO/Posicionamiento',
    },

    // Branding
    {
        id: 'branding-basic',
        name: 'Branding Básico',
        description: 'Logo + manual de marca + papelería básica',
        basePrice: 12000,
        category: 'Branding',
    },
    {
        id: 'branding-full',
        name: 'Branding Completo',
        description: 'Identidad visual completa + aplicaciones + guía de marca',
        basePrice: 35000,
        category: 'Branding',
    },

    // Contenido
    {
        id: 'content-blog',
        name: 'Pack Blog',
        description: '4 artículos SEO mensuales',
        basePrice: 4000,
        category: 'Marketing de contenidos',
    },
    {
        id: 'video-basic',
        name: 'Pack Video Básico',
        description: '4 reels/tiktoks mensuales',
        basePrice: 8000,
        category: 'Video marketing',
    },
    {
        id: 'video-pro',
        name: 'Pack Video Pro',
        description: '8 reels + 2 videos testimoniales',
        basePrice: 18000,
        category: 'Video marketing',
    },

    // Automatización
    {
        id: 'crm-setup',
        name: 'Setup CRM',
        description: 'Configuración de CRM + automatizaciones básicas',
        basePrice: 10000,
        category: 'Automatización',
    },
    {
        id: 'automation-full',
        name: 'Automatización Completa',
        description: 'Flujos de email, WhatsApp y seguimiento automático',
        basePrice: 25000,
        category: 'Automatización',
    },

    // Email
    {
        id: 'email-monthly',
        name: 'Email Marketing Mensual',
        description: '4 campañas de email + automatizaciones',
        basePrice: 5000,
        category: 'Email marketing',
    },
];

// Mapeo de necesidades a servicios recomendados
const NEED_TO_SERVICES: Record<string, string[]> = {
    'Generación de leads': ['meta-ads', 'google-ads', 'landing-page'],
    'Redes sociales': ['social-basic', 'social-pro', 'social-premium'],
    'Desarrollo web': ['landing-page'],
    'SEO/Posicionamiento': ['seo-local', 'seo-full'],
    'Publicidad digital': ['meta-ads', 'google-ads'],
    'Branding': ['branding-basic', 'branding-full'],
    'Marketing de contenidos': ['content-blog'],
    'Email marketing': ['email-monthly'],
    'Video marketing': ['video-basic', 'video-pro'],
    'Automatización': ['crm-setup', 'automation-full'],
};

// Descuentos por perfil psicológico
const PSYCH_DISCOUNTS: Record<PsychType, number> = {
    analitico: 0, // Sin descuento, prefiere valor objetivo
    emocional: 5, // Pequeño descuento como gesto
    asertivo: 10, // Descuento por decisión rápida
    indeciso: 0, // Sin descuento, pero proyecto piloto
};

export interface QuoteGenerationResult {
    quote: Quote;
    reasoning: string;
    alternatives: Quote[];
}

export function generateQuote(lead: Lead): QuoteGenerationResult {
    const needs = lead.detectedNeeds;
    const psychType = lead.psychProfile?.dominantType || 'asertivo';
    const budget = lead.potentialValue;

    // Identificar servicios recomendados
    const recommendedServiceIds = new Set<string>();
    for (const need of needs) {
        const serviceIds = NEED_TO_SERVICES[need] || [];
        serviceIds.forEach((id) => recommendedServiceIds.add(id));
    }

    // Si no hay necesidades específicas, sugerir pack básico
    if (recommendedServiceIds.size === 0) {
        recommendedServiceIds.add('social-pro');
        recommendedServiceIds.add('meta-ads');
    }

    // Obtener servicios del catálogo
    const recommendedServices = SERVICE_CATALOG.filter((s) =>
        recommendedServiceIds.has(s.id)
    );

    // Ajustar a budget si existe
    let selectedServices = recommendedServices;
    if (budget && budget > 0) {
        // Ordenar por prioridad y ajustar a budget
        selectedServices = fitToBudget(recommendedServices, budget);
    }

    // Crear items de cotización
    const quoteServices: QuoteService[] = selectedServices.map((s) => ({
        name: s.name,
        description: s.description,
        price: s.basePrice,
        quantity: 1,
    }));

    // Calcular totales
    const subtotal = quoteServices.reduce((sum, s) => sum + s.price * s.quantity, 0);
    const discountPercent = PSYCH_DISCOUNTS[psychType];
    const discount = (subtotal * discountPercent) / 100;
    const total = subtotal - discount;

    // Crear cotización principal
    const mainQuote: Quote = {
        id: `q-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        services: quoteServices,
        subtotal,
        discount,
        total,
        currency: 'MXN',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        status: 'borrador',
    };

    // Generar alternativas
    const alternatives = generateAlternatives(recommendedServices, psychType);

    // Generar razonamiento
    const reasoning = generateReasoning(lead, quoteServices, psychType);

    return {
        quote: mainQuote,
        reasoning,
        alternatives,
    };
}

function fitToBudget(services: ServiceCatalog[], budget: number): ServiceCatalog[] {
    // Ordenar por relevancia (por ahora, por precio descendente)
    const sorted = [...services].sort((a, b) => b.basePrice - a.basePrice);

    const selected: ServiceCatalog[] = [];
    let currentTotal = 0;

    for (const service of sorted) {
        if (currentTotal + service.basePrice <= budget * 1.2) {
            // Permitir 20% sobre budget
            selected.push(service);
            currentTotal += service.basePrice;
        }
    }

    // Si no cabe nada, tomar el más barato
    if (selected.length === 0 && sorted.length > 0) {
        const cheapest = sorted.reduce((min, s) =>
            s.basePrice < min.basePrice ? s : min
        );
        selected.push(cheapest);
    }

    return selected;
}

function generateAlternatives(
    services: ServiceCatalog[],
    psychType: PsychType
): Quote[] {
    const alternatives: Quote[] = [];

    // Versión económica
    const economicServices = services
        .sort((a, b) => a.basePrice - b.basePrice)
        .slice(0, 2);

    if (economicServices.length > 0) {
        const ecoQuoteServices = economicServices.map((s) => ({
            name: s.name,
            description: s.description,
            price: s.basePrice,
            quantity: 1,
        }));
        const ecoSubtotal = ecoQuoteServices.reduce((sum, s) => sum + s.price, 0);

        alternatives.push({
            id: `q-eco-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            services: ecoQuoteServices,
            subtotal: ecoSubtotal,
            discount: 0,
            total: ecoSubtotal,
            currency: 'MXN',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'borrador',
            notes: 'Opción económica - Servicios esenciales',
        });
    }

    // Versión premium
    const premiumServices = services
        .sort((a, b) => b.basePrice - a.basePrice)
        .slice(0, 4);

    if (premiumServices.length > 1) {
        const premQuoteServices = premiumServices.map((s) => ({
            name: s.name,
            description: s.description,
            price: s.basePrice,
            quantity: 1,
        }));
        const premSubtotal = premQuoteServices.reduce((sum, s) => sum + s.price, 0);
        const premDiscount = premSubtotal * 0.15; // 15% descuento por paquete

        alternatives.push({
            id: `q-prem-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            services: premQuoteServices,
            subtotal: premSubtotal,
            discount: premDiscount,
            total: premSubtotal - premDiscount,
            currency: 'MXN',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'borrador',
            notes: 'Opción premium - 15% de descuento incluido',
        });
    }

    return alternatives;
}

function generateReasoning(
    lead: Lead,
    services: QuoteService[],
    psychType: PsychType
): string {
    let reasoning = `Cotización generada para ${lead.nombre}. `;

    if (lead.detectedNeeds.length > 0) {
        reasoning += `Basado en las necesidades detectadas (${lead.detectedNeeds.join(', ')}), `;
        reasoning += `se recomiendan ${services.length} servicios. `;
    }

    const psychMessages: Record<PsychType, string> = {
        analitico:
            'Se presentan datos de ROI y métricas esperadas para facilitar la evaluación.',
        emocional:
            'Se enfatiza la transformación y resultados que logrará el cliente.',
        asertivo:
            'Se aplica descuento por decisión rápida y opciones claras.',
        indeciso:
            'Se incluye opción de proyecto piloto para reducir riesgo percibido.',
    };

    reasoning += psychMessages[psychType];

    return reasoning;
}

// Función para modificar cotización con prompting
export function modifyQuoteWithPrompt(
    currentQuote: Quote,
    prompt: string
): Quote {
    const promptLower = prompt.toLowerCase();
    const newQuote = { ...currentQuote, updatedAt: new Date() };

    // Detectar intenciones en el prompt
    if (promptLower.includes('descuento') || promptLower.includes('bajar')) {
        // Agregar descuento
        const additionalDiscount = newQuote.subtotal * 0.1;
        newQuote.discount = (newQuote.discount || 0) + additionalDiscount;
        newQuote.total = newQuote.subtotal - newQuote.discount;
        newQuote.notes = (newQuote.notes || '') + ' | Descuento adicional aplicado.';
    }

    if (promptLower.includes('agregar') || promptLower.includes('incluir')) {
        // Buscar servicio mencionado
        for (const service of SERVICE_CATALOG) {
            if (
                promptLower.includes(service.name.toLowerCase()) ||
                promptLower.includes(service.category.toLowerCase())
            ) {
                if (!newQuote.services.find((s) => s.name === service.name)) {
                    newQuote.services.push({
                        name: service.name,
                        description: service.description,
                        price: service.basePrice,
                        quantity: 1,
                    });
                    newQuote.subtotal += service.basePrice;
                    newQuote.total = newQuote.subtotal - (newQuote.discount || 0);
                }
                break;
            }
        }
    }

    if (promptLower.includes('quitar') || promptLower.includes('eliminar')) {
        // Buscar servicio a eliminar
        for (const service of newQuote.services) {
            if (promptLower.includes(service.name.toLowerCase())) {
                newQuote.services = newQuote.services.filter((s) => s.name !== service.name);
                newQuote.subtotal -= service.price * service.quantity;
                newQuote.total = newQuote.subtotal - (newQuote.discount || 0);
                break;
            }
        }
    }

    return newQuote;
}
