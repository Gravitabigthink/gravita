'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Quote } from '@/types/lead';
import {
    FileText,
    Plus,
    Search,
    Download,
    Eye,
    Edit3,
    Send,
    CheckCircle,
    XCircle,
    Clock,
    MoreHorizontal,
    ChevronRight,
    ChevronLeft,
    X,
    AlertCircle,
    RefreshCw,
    Sparkles,
    MessageCircle,
    Mail,
    Bell,
    Check,
    Presentation,
    Play,
} from 'lucide-react';

// Extended Quote with send tracking
interface ExtendedQuote extends Quote {
    leadName: string;
    leadId: string;
    sentVia?: ('email' | 'whatsapp')[];
    sentAt?: Date;
    lastError?: string;
    sendAttempts?: number;
    // Meeting context for quotes
    meetingContext?: {
        date: Date;
        summary: string;
        clientNeeds: string[];
        objections: string[];
        budget?: string;
        nextSteps: string[];
    };
}

// Mock quotes
const mockQuotes: ExtendedQuote[] = [
    {
        id: 'q1',
        leadId: '1',
        leadName: 'Carlos Mendoza - Tech Solutions MX',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
        services: [
            { name: 'Campañas Meta Ads', description: 'Gestión completa', price: 8000, quantity: 1 },
            { name: 'Landing Page', description: 'Página optimizada', price: 15000, quantity: 1 },
        ],
        subtotal: 23000,
        discount: 2300,
        total: 20700,
        currency: 'MXN',
        validUntil: new Date(Date.now() + 604800000),
        status: 'enviada',
        sentVia: ['email', 'whatsapp'],
        sentAt: new Date(Date.now() - 86400000),
    },
    {
        id: 'q2',
        leadId: '2',
        leadName: 'María González - Retail Express',
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 86400000),
        services: [
            { name: 'Pack Redes Pro', description: '20 posts + reels', price: 12000, quantity: 1 },
        ],
        subtotal: 12000,
        discount: 0,
        total: 12000,
        currency: 'MXN',
        validUntil: new Date(Date.now() + 432000000),
        status: 'vista',
        sentVia: ['email'],
        sentAt: new Date(Date.now() - 172800000),
    },
    {
        id: 'q3',
        leadId: '3',
        leadName: 'Roberto Silva - Consultoría Integral',
        createdAt: new Date(Date.now() - 604800000),
        updatedAt: new Date(Date.now() - 259200000),
        services: [
            { name: 'Campañas Meta Ads', description: 'Gestión + optimización', price: 15000, quantity: 1 },
            { name: 'Landing Page', description: 'Diseño + desarrollo', price: 12000, quantity: 1 },
            { name: 'Embudo de Leads', description: 'Configuración completa', price: 8000, quantity: 1 },
        ],
        subtotal: 35000,
        discount: 5000,
        total: 30000,
        currency: 'MXN',
        validUntil: new Date(Date.now() + 259200000),
        status: 'enviada',
        sentVia: ['email', 'whatsapp'],
        sentAt: new Date(Date.now() - 345600000),
        meetingContext: {
            date: new Date(Date.now() - 172800000),
            summary: 'Roberto busca aumentar leads calificados de 20-30 a 50+ mensuales. Presupuesto de $15k/mes. Ticket promedio $25k. Interesado en Meta Ads con embudo segmentado.',
            clientNeeds: ['Leads calificados (50+/mes)', 'Meta Ads con embudo', 'Landing page optimizada'],
            objections: ['Presupuesto limitado ($15k)', 'Resultados anteriores no satisfactorios'],
            budget: '$15,000 MXN mensuales',
            nextSteps: ['Enviar propuesta con Meta Ads + Landing', 'Incluir proyección de ROI', 'Agendar seguimiento'],
        },
    },
    {
        id: 'q4',
        leadId: '4',
        leadName: 'Ana Torres - Clínica Dental Premium',
        createdAt: new Date(Date.now() - 432000000),
        updatedAt: new Date(Date.now() - 432000000),
        services: [
            { name: 'SEO Local', description: 'Google My Business', price: 5000, quantity: 1 },
        ],
        subtotal: 5000,
        discount: 0,
        total: 5000,
        currency: 'MXN',
        validUntil: new Date(Date.now() - 86400000),
        status: 'enviada',
        lastError: 'No se pudo entregar por WhatsApp - Número inválido',
        sendAttempts: 2,
        sentVia: ['email'],
        sentAt: new Date(Date.now() - 432000000),
    },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
    }).format(value);
};

const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('es-MX', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getStatusConfig = (status: Quote['status']) => {
    const configs: Record<Quote['status'], { label: string; color: string; icon: React.ReactNode }> = {
        borrador: { label: 'Borrador', color: 'var(--text-tertiary)', icon: <Edit3 size={14} /> },
        enviada: { label: 'Enviada', color: 'var(--info)', icon: <Send size={14} /> },
        vista: { label: 'Vista', color: 'var(--warning)', icon: <Eye size={14} /> },
        aceptada: { label: 'Aceptada', color: 'var(--success)', icon: <CheckCircle size={14} /> },
        rechazada: { label: 'Rechazada', color: 'var(--error)', icon: <XCircle size={14} /> },
    };
    return configs[status];
};

// Quote Detail Modal Component
function QuoteDetailModal({
    quote,
    onClose,
    onUpdate
}: {
    quote: ExtendedQuote;
    onClose: () => void;
    onUpdate: (quote: ExtendedQuote) => void;
}) {
    const [activeTab, setActiveTab] = useState<'detalle' | 'vistaCliente' | 'contexto' | 'presentacion'>('detalle');
    const [editPrompt, setEditPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slideEditPrompt, setSlideEditPrompt] = useState('');
    const [isEditingSlide, setIsEditingSlide] = useState(false);

    const statusConfig = getStatusConfig(quote.status);

    // Handle AI edit
    const handleAIEdit = async () => {
        if (!editPrompt.trim()) return;
        setIsProcessing(true);

        // Simulate AI processing
        setTimeout(() => {
            const promptLower = editPrompt.toLowerCase();
            let newServices = [...quote.services];
            let newDiscount = quote.discount;
            let message = '';

            if (promptLower.includes('descuento') || promptLower.includes('bajar')) {
                const match = promptLower.match(/(\d+)%/);
                const percent = match ? parseInt(match[1]) : 10;
                newDiscount = (quote.subtotal * percent) / 100;
                message = `Se aplicó ${percent}% de descuento`;
            }

            if (promptLower.includes('quitar') || promptLower.includes('eliminar')) {
                newServices = newServices.filter(
                    s => !promptLower.includes(s.name.toLowerCase().split(' ')[0].toLowerCase())
                );
                message = 'Servicio eliminado de la propuesta';
            }

            if (promptLower.includes('agregar') || promptLower.includes('incluir')) {
                if (promptLower.includes('seo')) {
                    newServices.push({ name: 'SEO Optimización', description: 'Posicionamiento en Google', price: 5000, quantity: 1 });
                    message = 'Se agregó SEO a la propuesta';
                }
                if (promptLower.includes('landing')) {
                    newServices.push({ name: 'Landing Page', description: 'Página optimizada', price: 15000, quantity: 1 });
                    message = 'Se agregó Landing Page a la propuesta';
                }
            }

            const subtotal = newServices.reduce((sum, s) => sum + s.price * s.quantity, 0);
            const updatedQuote = {
                ...quote,
                services: newServices,
                subtotal,
                discount: newDiscount,
                total: subtotal - newDiscount,
                updatedAt: new Date(),
            };

            onUpdate(updatedQuote);
            setEditPrompt('');
            setIsProcessing(false);
            showNotificationToast(message || 'Propuesta actualizada', 'success');
        }, 1500);
    };

    // Handle resend
    const handleResend = async (via: 'email' | 'whatsapp' | 'both') => {
        setIsSending(true);

        // Simulate sending
        setTimeout(() => {
            const success = Math.random() > 0.2; // 80% success rate for demo

            if (success) {
                const sentVia: ('email' | 'whatsapp')[] = via === 'both' ? ['email', 'whatsapp'] : [via];
                onUpdate({
                    ...quote,
                    sentVia: [...(quote.sentVia || []), ...sentVia].filter((v, i, a) => a.indexOf(v) === i),
                    sentAt: new Date(),
                    lastError: undefined,
                    sendAttempts: (quote.sendAttempts || 0) + 1,
                });
                showNotificationToast(
                    `Propuesta reenviada por ${via === 'both' ? 'Email y WhatsApp' : via}`,
                    'success'
                );
            } else {
                onUpdate({
                    ...quote,
                    lastError: `Error al enviar por ${via}: Conexión fallida`,
                    sendAttempts: (quote.sendAttempts || 0) + 1,
                });
                showNotificationToast(
                    `Error al enviar. Notificación enviada al closer.`,
                    'error'
                );
            }

            setIsSending(false);
        }, 2000);
    };

    // Show notification toast
    const showNotificationToast = (message: string, type: 'success' | 'error') => {
        setNotificationMessage(message);
        setNotificationType(type);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 4000);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '700px',
                    maxWidth: '95vw',
                    maxHeight: '90vh',
                    overflow: 'auto',
                }}
            >
                {/* Notification Toast */}
                {showNotification && (
                    <div
                        style={{
                            position: 'fixed',
                            top: '1rem',
                            right: '1rem',
                            padding: '1rem 1.5rem',
                            background: notificationType === 'success' ? 'var(--success)' : 'var(--error)',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            zIndex: 1000,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                    >
                        {notificationType === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                        {notificationMessage}
                    </div>
                )}

                {/* Header */}
                <div
                    style={{
                        padding: '1.25rem',
                        borderBottom: '1px solid var(--border-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {quote.leadName}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                            <span
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.25rem 0.5rem',
                                    background: `${statusConfig.color}15`,
                                    color: statusConfig.color,
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                }}
                            >
                                {statusConfig.icon}
                                {statusConfig.label}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                Actualizado: {formatDateTime(quote.updatedAt)}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-primary)' }}>
                    <button
                        onClick={() => setActiveTab('detalle')}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'detalle' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                            color: activeTab === 'detalle' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <Edit3 size={14} />
                        Detalle y Edición
                    </button>
                    <button
                        onClick={() => setActiveTab('vistaCliente')}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'vistaCliente' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                            color: activeTab === 'vistaCliente' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <Eye size={14} />
                        Vista del Cliente
                    </button>
                    {quote.meetingContext && (
                        <button
                            onClick={() => setActiveTab('contexto')}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'contexto' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                color: activeTab === 'contexto' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            <MessageCircle size={14} />
                            Contexto
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('presentacion')}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'presentacion' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                            color: activeTab === 'presentacion' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <Presentation size={14} />
                        Presentación
                    </button>
                </div>

                {activeTab === 'contexto' && quote.meetingContext && (
                    <div style={{ padding: '1.25rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #7c3aed 100%)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1rem',
                            marginBottom: '1rem',
                            color: 'white',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <MessageCircle size={16} />
                                <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                                    Videollamada del {formatDate(quote.meetingContext.date)}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                                {quote.meetingContext.summary}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {/* Client Needs */}
                            <div className="card">
                                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle size={14} />
                                    Lo que pide el cliente
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                    {quote.meetingContext.clientNeeds.map((need, i) => (
                                        <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                            {need}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Objections */}
                            {quote.meetingContext.objections.length > 0 && (
                                <div className="card" style={{ borderColor: 'var(--warning)' }}>
                                    <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--warning)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <AlertCircle size={14} />
                                        Objeciones a considerar
                                    </h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                        {quote.meetingContext.objections.map((obj, i) => (
                                            <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                                {obj}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Budget */}
                            {quote.meetingContext.budget && (
                                <div style={{
                                    padding: '1rem',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        Presupuesto mencionado:
                                    </span>
                                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                                        {quote.meetingContext.budget}
                                    </span>
                                </div>
                            )}

                            {/* Next Steps */}
                            <div className="card">
                                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--info)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={14} />
                                    Próximos pasos acordados
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                    {quote.meetingContext.nextSteps.map((step, i) => (
                                        <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <button
                            className="btn-primary"
                            style={{ width: '100%', marginTop: '1rem' }}
                            onClick={() => setActiveTab('detalle')}
                        >
                            <Edit3 size={14} />
                            Editar Propuesta con este Contexto
                        </button>
                    </div>
                )}

                {/* Presentation Viewer */}
                {activeTab === 'presentacion' && (
                    <div style={{ padding: '1.25rem' }}>
                        {/* Slides Mock Data */}
                        {(() => {
                            const slides = [
                                {
                                    title: 'Portada',
                                    content: `Propuesta Comercial para ${quote.leadName.split(' - ')[0]}`,
                                    subtitle: 'GRAVITA Marketing Brain',
                                    type: 'cover'
                                },
                                {
                                    title: 'Nuestra Filosofía',
                                    content: 'No vendemos servicios, generamos resultados medibles.',
                                    points: ['Marketing basado en datos', 'Optimización continua', 'ROI transparente'],
                                    type: 'philosophy'
                                },
                                {
                                    title: 'El Problema',
                                    content: 'Identificamos las oportunidades clave en tu negocio',
                                    points: ['Leads no calificados', 'Falta de seguimiento', 'Sin visibilidad de ROI'],
                                    type: 'problem'
                                },
                                {
                                    title: 'Nuestra Metodología',
                                    content: 'Sistema probado para generar resultados',
                                    points: ['Auditoría inicial', 'Estrategia personalizada', 'Implementación ágil', 'Optimización continua'],
                                    type: 'methodology'
                                },
                                {
                                    title: 'Resultados',
                                    content: 'Casos de éxito similares a tu industria',
                                    stats: [{ label: 'Leads generados', value: '+300%' }, { label: 'Costo por lead', value: '-50%' }, { label: 'ROI promedio', value: '5x' }],
                                    type: 'results'
                                },
                                {
                                    title: 'Tu Inversión',
                                    content: 'Servicios incluidos en esta propuesta',
                                    services: quote.services,
                                    total: quote.total,
                                    type: 'pricing'
                                },
                                {
                                    title: 'Preguntas Frecuentes',
                                    content: 'Todo lo que necesitas saber',
                                    faqs: ['¿Cuánto tiempo toma ver resultados?', '¿Qué pasa si no funciona?', '¿Cómo miden el ROI?'],
                                    type: 'faq'
                                },
                                {
                                    title: '¿Listo para Empezar?',
                                    content: 'Agenda una llamada para resolver tus dudas',
                                    cta: 'Agendar Llamada',
                                    type: 'cta'
                                },
                            ];

                            const slide = slides[currentSlide];

                            return (
                                <div>
                                    {/* Slide Navigator */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <button
                                            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                                            disabled={currentSlide === 0}
                                            className="btn-secondary"
                                            style={{ padding: '0.5rem' }}
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            Slide {currentSlide + 1} de {slides.length}
                                        </span>
                                        <button
                                            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                                            disabled={currentSlide === slides.length - 1}
                                            className="btn-secondary"
                                            style={{ padding: '0.5rem' }}
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>

                                    {/* Slide Preview */}
                                    <div
                                        id="slide-preview"
                                        style={{
                                            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #7c3aed 100%)',
                                            borderRadius: 'var(--radius-lg)',
                                            padding: '2rem',
                                            minHeight: '300px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            color: 'white',
                                            textAlign: 'center',
                                            marginBottom: '1rem',
                                        }}>
                                        {slide.type === 'cover' && (
                                            <>
                                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{slide.content}</h2>
                                                <p style={{ opacity: 0.8 }}>{slide.subtitle}</p>
                                            </>
                                        )}
                                        {slide.type === 'philosophy' && (
                                            <>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>{slide.title}</h3>
                                                <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.9 }}>{slide.content}</p>
                                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                                    {slide.points?.map((p, i) => (
                                                        <span key={i} style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.15)', borderRadius: '9999px', fontSize: '0.85rem' }}>{p}</span>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                        {(slide.type === 'problem' || slide.type === 'methodology') && (
                                            <>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>{slide.title}</h3>
                                                <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>{slide.content}</p>
                                                <ul style={{ textAlign: 'left', listStyle: 'disc', paddingLeft: '1.5rem' }}>
                                                    {slide.points?.map((p, i) => (
                                                        <li key={i} style={{ marginBottom: '0.5rem' }}>{p}</li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                        {slide.type === 'results' && (
                                            <>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>{slide.title}</h3>
                                                <div style={{ display: 'flex', gap: '2rem' }}>
                                                    {slide.stats?.map((s, i) => (
                                                        <div key={i} style={{ textAlign: 'center' }}>
                                                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{s.value}</div>
                                                            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{s.label}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                        {slide.type === 'pricing' && (
                                            <>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>{slide.title}</h3>
                                                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', padding: '1rem', width: '100%' }}>
                                                    {slide.services?.map((s, i) => (
                                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                            <span>{s.name}</span>
                                                            <span>{formatCurrency(s.price)}</span>
                                                        </div>
                                                    ))}
                                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                                        <span>Total</span>
                                                        <span>{formatCurrency(slide.total || 0)}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {slide.type === 'faq' && (
                                            <>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>{slide.title}</h3>
                                                <div style={{ textAlign: 'left', width: '100%' }}>
                                                    {slide.faqs?.map((f, i) => (
                                                        <div key={i} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }}>
                                                            {f}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                        {slide.type === 'cta' && (
                                            <>
                                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>{slide.title}</h3>
                                                <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>{slide.content}</p>
                                                <button style={{
                                                    padding: '1rem 2rem',
                                                    background: 'white',
                                                    color: 'var(--accent-primary)',
                                                    border: 'none',
                                                    borderRadius: 'var(--radius-md)',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                }}>
                                                    {slide.cta}
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Slide Thumbnails */}
                                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                        {slides.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentSlide(i)}
                                                style={{
                                                    minWidth: '60px',
                                                    height: '40px',
                                                    background: currentSlide === i ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                                    border: currentSlide === i ? '2px solid var(--accent-primary)' : '1px solid var(--border-secondary)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    color: currentSlide === i ? 'white' : 'var(--text-tertiary)',
                                                    fontSize: '0.65rem',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    {/* AI Slide Editor */}
                                    <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                                        <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Sparkles size={14} color="var(--accent-primary)" />
                                            Editar Slide con IA
                                        </h4>
                                        <textarea
                                            value={slideEditPrompt}
                                            onChange={(e) => setSlideEditPrompt(e.target.value)}
                                            placeholder={`Ej: Cambia el título a "Propuesta Exclusiva", agrega un punto sobre garantía de resultados...`}
                                            className="input"
                                            rows={2}
                                            style={{ resize: 'none', marginBottom: '0.75rem' }}
                                        />
                                        <button
                                            onClick={() => {
                                                setIsEditingSlide(true);
                                                setTimeout(() => {
                                                    showNotificationToast('Slide actualizado con IA', 'success');
                                                    setSlideEditPrompt('');
                                                    setIsEditingSlide(false);
                                                }, 1500);
                                            }}
                                            disabled={isEditingSlide || !slideEditPrompt.trim()}
                                            className="btn-secondary"
                                            style={{ width: '100%' }}
                                        >
                                            {isEditingSlide ? (
                                                <>
                                                    <RefreshCw size={14} className="animate-spin" />
                                                    Procesando...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={14} />
                                                    Aplicar Cambios al Slide
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                        <button
                                            className="btn-secondary"
                                            style={{ flex: 1 }}
                                            onClick={() => {
                                                // Generate PDF (simple approach - opens print dialog)
                                                const printContent = document.getElementById('slide-preview');
                                                if (printContent) {
                                                    const printWindow = window.open('', '', 'width=800,height=600');
                                                    if (printWindow) {
                                                        printWindow.document.write(`
                                                            <html>
                                                            <head><title>Propuesta - ${quote.leadName}</title>
                                                            <style>
                                                                body { font-family: Arial, sans-serif; margin: 0; padding: 40px; background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%); color: white; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
                                                                h1 { font-size: 2rem; margin-bottom: 1rem; }
                                                                p { font-size: 1.2rem; opacity: 0.9; }
                                                            </style>
                                                            </head>
                                                            <body>
                                                                <h1>Propuesta Comercial</h1>
                                                                <p>${quote.leadName}</p>
                                                                <p style="margin-top: 2rem; font-size: 1.5rem; font-weight: bold;">Total: ${formatCurrency(quote.total)}</p>
                                                            </body>
                                                            </html>
                                                        `);
                                                        printWindow.document.close();
                                                        printWindow.print();
                                                    }
                                                }
                                            }}
                                        >
                                            <Download size={14} />
                                            Descargar PDF
                                        </button>
                                        <button
                                            className="btn-primary"
                                            style={{ flex: 1 }}
                                            onClick={() => {
                                                // Open fullscreen presentation
                                                const slidePreview = document.getElementById('slide-preview');
                                                if (slidePreview && slidePreview.requestFullscreen) {
                                                    slidePreview.requestFullscreen();
                                                }
                                            }}
                                        >
                                            <Play size={14} />
                                            Presentar
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {activeTab === 'detalle' ? (
                    <>
                        {/* Error Alert */}
                        {quote.lastError && (
                            <div
                                style={{
                                    margin: '1rem 1.25rem 0',
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid var(--error)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                }}
                            >
                                <AlertCircle size={18} color="var(--error)" />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--error)', fontWeight: 500 }}>
                                        Error de envío
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {quote.lastError}
                                    </p>
                                </div>
                                <button className="btn-secondary" onClick={() => handleResend('whatsapp')}>
                                    <RefreshCw size={14} />
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {/* Send Status */}
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-primary)' }}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                                Estado de Envío
                            </h4>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: quote.sentVia?.includes('email') ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <Mail size={18} color={quote.sentVia?.includes('email') ? 'var(--success)' : 'var(--text-tertiary)'} />
                                    <div>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>Email</p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                            {quote.sentVia?.includes('email') ? (
                                                <span style={{ color: 'var(--success)' }}>✓ Enviado {quote.sentAt && formatDateTime(quote.sentAt)}</span>
                                            ) : (
                                                'No enviado'
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: quote.sentVia?.includes('whatsapp') ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <MessageCircle size={18} color={quote.sentVia?.includes('whatsapp') ? 'var(--success)' : 'var(--text-tertiary)'} />
                                    <div>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>WhatsApp</p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                            {quote.sentVia?.includes('whatsapp') ? (
                                                <span style={{ color: 'var(--success)' }}>✓ Enviado</span>
                                            ) : (
                                                'No enviado'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {quote.sendAttempts && quote.sendAttempts > 1 && (
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                                    Intentos de envío: {quote.sendAttempts}
                                </p>
                            )}
                        </div>

                        {/* Services */}
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-primary)' }}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                                Servicios
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {quote.services.map((service, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '0.75rem',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: 'var(--radius-sm)',
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{service.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{service.description}</p>
                                        </div>
                                        <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{formatCurrency(service.price)}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                                    <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(quote.subtotal)}</span>
                                </div>
                                {quote.discount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--success)' }}>Descuento</span>
                                        <span style={{ color: 'var(--success)' }}>-{formatCurrency(quote.discount)}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-primary)' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
                                    <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--accent-primary)' }}>{formatCurrency(quote.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* AI Edit */}
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-primary)' }}>
                            <h4
                                style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: 'var(--text-tertiary)',
                                    marginBottom: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    textTransform: 'uppercase',
                                }}
                            >
                                <Sparkles size={14} color="var(--accent-primary)" />
                                Editar con IA
                            </h4>
                            <textarea
                                value={editPrompt}
                                onChange={(e) => setEditPrompt(e.target.value)}
                                placeholder="Ej: El cliente pidió 15% de descuento, quitar el SEO, agregar landing page..."
                                className="input"
                                rows={2}
                                style={{ resize: 'none', marginBottom: '0.75rem' }}
                            />
                            <button
                                onClick={handleAIEdit}
                                disabled={isProcessing || !editPrompt.trim()}
                                className="btn-secondary"
                                style={{ width: '100%' }}
                            >
                                {isProcessing ? (
                                    <>
                                        <RefreshCw size={14} className="animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={14} />
                                        Aplicar Cambios
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Actions */}
                        <div style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <button
                                    onClick={() => handleResend('email')}
                                    disabled={isSending}
                                    className="btn-secondary"
                                    style={{ flex: 1 }}
                                >
                                    {isSending ? <RefreshCw size={14} className="animate-spin" /> : <Mail size={14} />}
                                    Reenviar por Email
                                </button>
                                <button
                                    onClick={() => handleResend('whatsapp')}
                                    disabled={isSending}
                                    className="btn-secondary"
                                    style={{ flex: 1 }}
                                >
                                    {isSending ? <RefreshCw size={14} className="animate-spin" /> : <MessageCircle size={14} />}
                                    Reenviar por WhatsApp
                                </button>
                            </div>
                            <button
                                onClick={() => handleResend('both')}
                                disabled={isSending}
                                className="btn-primary"
                                style={{ width: '100%' }}
                            >
                                {isSending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                                Reenviar por Ambos Canales
                            </button>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.75rem', textAlign: 'center' }}>
                                <Bell size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                Se notificará al closer si hay errores de envío
                            </p>
                        </div>
                    </>
                ) : (
                    /* Vista del Cliente - Preview */
                    <div style={{ padding: '1.5rem' }}>
                        {/* Preview Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #7c3aed 100%)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '2rem',
                            marginBottom: '1.5rem',
                            color: 'white',
                            textAlign: 'center',
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                Propuesta Comercial
                            </h2>
                            <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                                Preparada especialmente para {quote.leadName.split(' - ')[0]}
                            </p>
                            <p style={{ opacity: 0.7, fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                Válida hasta {formatDate(quote.validUntil)}
                            </p>
                        </div>

                        {/* Services Preview */}
                        <div style={{
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1.5rem',
                            marginBottom: '1rem',
                        }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                                Servicios Incluidos
                            </h4>
                            {quote.services.map((service, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    padding: '0.75rem 0',
                                    borderBottom: i < quote.services.length - 1 ? '1px solid var(--border-primary)' : 'none',
                                }}>
                                    <div>
                                        <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{service.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{service.description}</p>
                                    </div>
                                    <span style={{ fontWeight: 600, color: 'var(--accent-primary)', whiteSpace: 'nowrap' }}>
                                        {formatCurrency(service.price)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Totals Preview */}
                        <div style={{
                            background: 'var(--bg-secondary)',
                            border: '2px solid var(--accent-primary)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1.25rem',
                            marginBottom: '1.5rem',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                                <span>{formatCurrency(quote.subtotal)}</span>
                            </div>
                            {quote.discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--success)' }}>
                                    <span>🎉 Descuento Especial</span>
                                    <span>-{formatCurrency(quote.discount)}</span>
                                </div>
                            )}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingTop: '0.75rem',
                                borderTop: '2px dashed var(--border-primary)',
                                marginTop: '0.5rem',
                            }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Total</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                                    {formatCurrency(quote.total)}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setActiveTab('detalle')}>
                                <Edit3 size={14} />
                                Editar Propuesta
                            </button>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleResend('both')}>
                                <Send size={14} />
                                Enviar al Cliente
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CotizacionesPage() {
    const [quotes, setQuotes] = useState(mockQuotes);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<Quote['status'] | 'todas'>('todas');
    const [selectedQuote, setSelectedQuote] = useState<ExtendedQuote | null>(null);
    const [showNewQuoteModal, setShowNewQuoteModal] = useState(false);

    const filteredQuotes = quotes.filter((quote) => {
        const matchesSearch = quote.leadName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'todas' || quote.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalValue = quotes
        .filter((q) => q.status === 'enviada' || q.status === 'vista')
        .reduce((sum, q) => sum + q.total, 0);

    const acceptedValue = quotes
        .filter((q) => q.status === 'aceptada')
        .reduce((sum, q) => sum + q.total, 0);

    const errorCount = quotes.filter((q) => q.lastError).length;

    const handleUpdateQuote = (updatedQuote: ExtendedQuote) => {
        setQuotes((prev) => prev.map((q) => (q.id === updatedQuote.id ? updatedQuote : q)));
        setSelectedQuote(updatedQuote);
    };

    const handleCreateQuote = (data: { leadName: string; services: { name: string; description: string; price: number; quantity: number }[]; discount: number }) => {
        const subtotal = data.services.reduce((sum, s) => sum + s.price * s.quantity, 0);
        const newQuote: ExtendedQuote = {
            id: `q${Date.now()}`,
            leadId: `lead-${Date.now()}`,
            leadName: data.leadName,
            createdAt: new Date(),
            updatedAt: new Date(),
            services: data.services,
            subtotal,
            discount: data.discount,
            total: subtotal - data.discount,
            currency: 'MXN',
            validUntil: new Date(Date.now() + 604800000), // 7 days
            status: 'borrador',
        };
        setQuotes((prev) => [newQuote, ...prev]);
        setShowNewQuoteModal(false);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main
                style={{
                    flex: 1,
                    marginLeft: '280px',
                    padding: '1.5rem',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1.5rem',
                    }}
                >
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Cotizaciones
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Gestiona, edita y reenvía tus propuestas
                        </p>
                    </div>
                    <button className="btn-primary" onClick={() => setShowNewQuoteModal(true)}>
                        <Plus size={16} strokeWidth={1.5} />
                        Nueva Cotización
                    </button>
                </div>

                {/* Stats */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                    }}
                >
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Clock size={16} strokeWidth={1.5} color="var(--warning)" />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>En espera</span>
                        </div>
                        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {formatCurrency(totalValue)}
                        </p>
                    </div>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <CheckCircle size={16} strokeWidth={1.5} color="var(--success)" />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Aceptadas</span>
                        </div>
                        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--success)' }}>
                            {formatCurrency(acceptedValue)}
                        </p>
                    </div>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <FileText size={16} strokeWidth={1.5} color="var(--accent-primary)" />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Total</span>
                        </div>
                        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {quotes.length}
                        </p>
                    </div>
                    {errorCount > 0 && (
                        <div className="card" style={{ borderColor: 'var(--error)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <AlertCircle size={16} strokeWidth={1.5} color="var(--error)" />
                                <span style={{ fontSize: '0.8rem', color: 'var(--error)' }}>Con errores</span>
                            </div>
                            <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--error)' }}>
                                {errorCount}
                            </p>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem',
                        flexWrap: 'wrap',
                    }}
                >
                    <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                        <Search
                            size={16}
                            strokeWidth={1.5}
                            style={{
                                position: 'absolute',
                                left: '0.875rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-tertiary)',
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Buscar por cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input"
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {(['todas', 'borrador', 'enviada', 'vista', 'aceptada', 'rechazada'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={filterStatus === status ? 'btn-primary' : 'btn-secondary'}
                                style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quotes List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredQuotes.map((quote) => {
                        const statusConfig = getStatusConfig(quote.status);
                        const isExpired = new Date(quote.validUntil) < new Date() && quote.status !== 'aceptada';
                        const hasError = !!quote.lastError;

                        return (
                            <div
                                key={quote.id}
                                onClick={() => setSelectedQuote(quote)}
                                className="card"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto auto auto',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    cursor: 'pointer',
                                    opacity: isExpired ? 0.7 : 1,
                                    borderColor: hasError ? 'var(--error)' : undefined,
                                }}
                            >
                                {/* Lead Info */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {quote.leadName}
                                        </h3>
                                        {hasError && (
                                            <AlertCircle size={14} color="var(--error)" />
                                        )}
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            fontSize: '0.8rem',
                                            color: 'var(--text-tertiary)',
                                            marginTop: '0.25rem',
                                        }}
                                    >
                                        <span>Creada: {formatDate(quote.createdAt)}</span>
                                        <span>•</span>
                                        <span style={{ color: isExpired ? 'var(--error)' : 'inherit' }}>
                                            {isExpired ? 'Expirada' : `Válida hasta: ${formatDate(quote.validUntil)}`}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '0.5rem',
                                            marginTop: '0.5rem',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        {quote.services.map((service, i) => (
                                            <span
                                                key={i}
                                                style={{
                                                    fontSize: '0.7rem',
                                                    padding: '0.25rem 0.5rem',
                                                    background: 'var(--bg-tertiary)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    color: 'var(--text-secondary)',
                                                }}
                                            >
                                                {service.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Send Status Icons */}
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <div
                                        title={quote.sentVia?.includes('email') ? 'Email enviado' : 'Email no enviado'}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            background: quote.sentVia?.includes('email') ? 'rgba(34, 197, 94, 0.2)' : 'var(--bg-tertiary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Mail size={12} color={quote.sentVia?.includes('email') ? 'var(--success)' : 'var(--text-tertiary)'} />
                                    </div>
                                    <div
                                        title={quote.sentVia?.includes('whatsapp') ? 'WhatsApp enviado' : 'WhatsApp no enviado'}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            background: quote.sentVia?.includes('whatsapp') ? 'rgba(34, 197, 94, 0.2)' : 'var(--bg-tertiary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <MessageCircle size={12} color={quote.sentVia?.includes('whatsapp') ? 'var(--success)' : 'var(--text-tertiary)'} />
                                    </div>
                                </div>

                                {/* Status */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        padding: '0.375rem 0.75rem',
                                        background: `${statusConfig.color}15`,
                                        color: statusConfig.color,
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.8rem',
                                        fontWeight: 500,
                                    }}
                                >
                                    {statusConfig.icon}
                                    {statusConfig.label}
                                </div>

                                {/* Total */}
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {formatCurrency(quote.total)}
                                    </p>
                                    {quote.discount > 0 && (
                                        <p style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
                                            -{formatCurrency(quote.discount)} desc.
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {filteredQuotes.length === 0 && (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '3rem',
                                color: 'var(--text-tertiary)',
                            }}
                        >
                            <FileText size={48} strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>No hay cotizaciones que mostrar</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Quote Detail Modal */}
            {selectedQuote && (
                <QuoteDetailModal
                    quote={selectedQuote}
                    onClose={() => setSelectedQuote(null)}
                    onUpdate={handleUpdateQuote}
                />
            )}

            {/* New Quote Modal */}
            {showNewQuoteModal && (
                <div className="modal-overlay" onClick={() => setShowNewQuoteModal(false)}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '600px', maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto' }}
                    >
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Nueva Cotización</h2>
                            <button onClick={() => setShowNewQuoteModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const leadName = formData.get('leadName') as string;
                            const serviceName = formData.get('serviceName') as string;
                            const servicePrice = parseFloat(formData.get('servicePrice') as string) || 0;
                            const discount = parseFloat(formData.get('discount') as string) || 0;
                            if (leadName && serviceName) {
                                handleCreateQuote({
                                    leadName,
                                    services: [{ name: serviceName, description: 'Servicio incluido', price: servicePrice, quantity: 1 }],
                                    discount,
                                });
                            }
                        }}>
                            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                                        Nombre del Cliente / Lead
                                    </label>
                                    <input name="leadName" className="input" placeholder="Ej: Carlos Mendoza - Tech Solutions" required />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                                        Servicio Principal
                                    </label>
                                    <input name="serviceName" className="input" placeholder="Ej: Campañas Meta Ads" required />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                                        Precio (MXN)
                                    </label>
                                    <input name="servicePrice" type="number" className="input" placeholder="15000" required />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                                        Descuento (MXN)
                                    </label>
                                    <input name="discount" type="number" className="input" placeholder="0" defaultValue="0" />
                                </div>
                            </div>
                            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-primary)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowNewQuoteModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">
                                    <Plus size={14} />
                                    Crear Cotización
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
