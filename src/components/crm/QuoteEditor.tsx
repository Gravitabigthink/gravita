'use client';

import { useState } from 'react';
import { Quote, Lead } from '@/types/lead';
import {
    FileText,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    Download,
    MessageCircle,
    Mail,
    Sparkles,
    RefreshCw,
    Printer,
} from 'lucide-react';
import {
    SlideCover,
    SlidePhilosophy,
    SlideProblem,
    SlideMethodology,
    SlideResults,
    SlidePricing,
    SlideFAQ,
    SlideCTA,
} from './SalesDeck';
import './SalesDeck.css';
import { downloadQuotePDF } from '@/lib/pdfService';

interface QuoteEditorProps {
    lead: Lead;
    quote?: Quote;
    onSave: (quote: Quote) => void;
    onApprove: (quote: Quote) => void;
    onClose: () => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
    }).format(value);
};

export function QuoteEditor({ lead, quote: initialQuote, onSave, onApprove, onClose }: QuoteEditorProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [editPrompt, setEditPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<'ignition' | 'orbit' | 'velocity'>('orbit');

    // Package prices
    const packages = {
        ignition: { name: 'Ignition', price: 10000 },
        orbit: { name: 'Orbit', price: 20000 },
        velocity: { name: 'Velocity', price: 35000 },
    };

    // Estado de la cotización
    const [quote, setQuote] = useState<Quote>(
        initialQuote || {
            id: `q-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            services: [
                { name: packages[selectedPackage].name, description: 'Paquete de servicios', price: packages[selectedPackage].price, quantity: 1 },
            ],
            subtotal: packages[selectedPackage].price,
            discount: 0,
            total: packages[selectedPackage].price,
            currency: 'MXN',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'borrador',
        }
    );

    const totalSlides = 8;

    // Slides array with components
    const slides = [
        { id: 'cover', Component: SlideCover },
        { id: 'philosophy', Component: SlidePhilosophy },
        { id: 'problem', Component: SlideProblem },
        { id: 'methodology', Component: SlideMethodology },
        { id: 'results', Component: SlideResults },
        { id: 'pricing', Component: SlidePricing },
        { id: 'faq', Component: SlideFAQ },
        { id: 'cta', Component: SlideCTA },
    ];

    // Procesar prompt de edición con IA
    const handleEditWithPrompt = async () => {
        if (!editPrompt.trim()) return;

        setIsProcessing(true);

        setTimeout(() => {
            const promptLower = editPrompt.toLowerCase();
            let newPrice = quote.total;
            let newDiscount = quote.discount;

            // Detectar intención del prompt
            if (promptLower.includes('ignition')) {
                setSelectedPackage('ignition');
                newPrice = 10000;
            } else if (promptLower.includes('orbit')) {
                setSelectedPackage('orbit');
                newPrice = 20000;
            } else if (promptLower.includes('velocity')) {
                setSelectedPackage('velocity');
                newPrice = 35000;
            }

            if (promptLower.includes('descuento') || promptLower.includes('bajar')) {
                const match = promptLower.match(/(\d+)%/);
                const percent = match ? parseInt(match[1]) : 10;
                newDiscount = (newPrice * percent) / 100;
            }

            setQuote({
                ...quote,
                services: [{ name: packages[selectedPackage].name, description: 'Paquete completo', price: newPrice, quantity: 1 }],
                subtotal: newPrice,
                discount: newDiscount,
                total: newPrice - newDiscount,
                updatedAt: new Date(),
            });

            setEditPrompt('');
            setIsProcessing(false);
        }, 1500);
    };

    // Aprobar cotización
    const handleApprove = () => {
        const approvedQuote = {
            ...quote,
            status: 'enviada' as const,
            updatedAt: new Date(),
            approvedAt: new Date(),
        };
        setQuote(approvedQuote);
        onApprove(approvedQuote);
    };

    // Print/Export
    const handlePrint = () => {
        window.print();
    };

    // Render current slide
    const CurrentSlideComponent = slides[currentSlide].Component;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '1200px',
                    maxWidth: '95vw',
                    height: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid var(--border-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexShrink: 0,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FileText size={20} strokeWidth={1.5} color="var(--accent-primary)" />
                        <div>
                            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Propuesta para {lead.nombre} {lead.apellido}
                            </h2>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                {quote.status === 'borrador' ? 'Borrador - Pendiente de aprobación' : `Estado: ${quote.status}`}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={handlePrint} className="btn-secondary" style={{ gap: '0.375rem' }}>
                            <Printer size={16} strokeWidth={1.5} />
                            Imprimir
                        </button>
                        <button
                            onClick={() => downloadQuotePDF({
                                leadName: `${lead.nombre || lead.name} ${lead.apellido || ''}`,
                                leadEmail: lead.email,
                                leadPhone: lead.telefono || lead.phone,
                                leadCompany: lead.empresa,
                                quote,
                            })}
                            className="btn-secondary"
                            style={{ gap: '0.375rem' }}
                        >
                            <Download size={16} strokeWidth={1.5} />
                            PDF
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-tertiary)',
                                cursor: 'pointer',
                                padding: '0.5rem'
                            }}
                        >
                            <X size={20} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Slide Preview */}
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            background: '#E5E5E5',
                            padding: '1.5rem',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Slide Container */}
                        <div
                            className="sales-deck-container"
                            style={{
                                flex: 1,
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                            }}
                        >
                            <CurrentSlideComponent
                                lead={lead}
                                quote={quote}
                                slideNumber={currentSlide + 1}
                                totalSlides={totalSlides}
                            />
                        </div>

                        {/* Slide Navigation */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                marginTop: '1rem',
                            }}
                        >
                            <button
                                onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
                                disabled={currentSlide === 0}
                                className="btn-secondary"
                                style={{ padding: '0.5rem' }}
                            >
                                <ChevronLeft size={20} strokeWidth={1.5} />
                            </button>
                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                                {slides.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentSlide(i)}
                                        style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: i === currentSlide ? 'var(--accent-primary)' : 'rgba(0,0,0,0.2)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentSlide((s) => Math.min(totalSlides - 1, s + 1))}
                                disabled={currentSlide === totalSlides - 1}
                                className="btn-secondary"
                                style={{ padding: '0.5rem' }}
                            >
                                <ChevronRight size={20} strokeWidth={1.5} />
                            </button>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginLeft: '0.5rem' }}>
                                {currentSlide + 1} / {totalSlides}
                            </span>
                        </div>
                    </div>

                    {/* Edit Panel */}
                    <div
                        style={{
                            width: '340px',
                            borderLeft: '1px solid var(--border-primary)',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'var(--bg-secondary)',
                        }}
                    >
                        {/* Package Selection */}
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-primary)' }}>
                            <h4
                                style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: 'var(--text-tertiary)',
                                    marginBottom: '0.75rem',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Paquete Seleccionado
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {(Object.entries(packages) as [keyof typeof packages, typeof packages.ignition][]).map(([key, pkg]) => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setSelectedPackage(key);
                                            setQuote({
                                                ...quote,
                                                services: [{ name: pkg.name, description: 'Paquete completo', price: pkg.price, quantity: 1 }],
                                                subtotal: pkg.price,
                                                total: pkg.price - quote.discount,
                                                updatedAt: new Date(),
                                            });
                                        }}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.75rem 1rem',
                                            background: selectedPackage === key ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                                            border: selectedPackage === key ? '1px solid var(--accent-primary)' : '1px solid transparent',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <div style={{ textAlign: 'left' }}>
                                            <p style={{
                                                fontWeight: 600,
                                                color: selectedPackage === key ? 'var(--accent-primary)' : 'var(--text-primary)',
                                                fontSize: '0.9rem',
                                            }}>
                                                {pkg.name}
                                            </p>
                                        </div>
                                        <span style={{
                                            fontWeight: 700,
                                            color: selectedPackage === key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                            fontSize: '0.9rem',
                                        }}>
                                            {formatCurrency(pkg.price)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* AI Edit */}
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-primary)' }}>
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
                                <Sparkles size={14} strokeWidth={1.5} color="var(--accent-primary)" />
                                Editar con IA
                            </h4>
                            <textarea
                                value={editPrompt}
                                onChange={(e) => setEditPrompt(e.target.value)}
                                placeholder="Ej: Cambiar a paquete Ignition, agregar 10% de descuento..."
                                className="input"
                                rows={2}
                                style={{ resize: 'none', marginBottom: '0.75rem', fontSize: '0.85rem' }}
                            />
                            <button
                                onClick={handleEditWithPrompt}
                                disabled={isProcessing || !editPrompt.trim()}
                                className="btn-secondary"
                                style={{ width: '100%' }}
                            >
                                {isProcessing ? (
                                    <>
                                        <RefreshCw size={14} strokeWidth={1.5} className="animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={14} strokeWidth={1.5} />
                                        Aplicar Cambios
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Summary */}
                        <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                            <h4
                                style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: 'var(--text-tertiary)',
                                    textTransform: 'uppercase',
                                    marginBottom: '0.75rem',
                                }}
                            >
                                Resumen
                            </h4>
                            <div style={{
                                padding: '1rem',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '1rem',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Paquete</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{packages[selectedPackage].name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                                    <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(quote.subtotal)}</span>
                                </div>
                                {quote.discount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ color: 'var(--success)' }}>Descuento</span>
                                        <span style={{ color: 'var(--success)' }}>-{formatCurrency(quote.discount)}</span>
                                    </div>
                                )}
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        paddingTop: '0.75rem',
                                        borderTop: '1px solid var(--border-primary)',
                                        marginTop: '0.5rem',
                                    }}
                                >
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total Mensual</span>
                                    <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--accent-primary)' }}>
                                        {formatCurrency(quote.total)}
                                    </span>
                                </div>
                            </div>

                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(34, 211, 238, 0.1)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--accent-cyan)',
                            }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                                    <strong>Válida hasta:</strong>{' '}
                                    {quote.validUntil.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-primary)' }}>
                            <button
                                onClick={handleApprove}
                                className="btn-primary"
                                style={{ width: '100%', marginBottom: '0.5rem' }}
                            >
                                <Check size={16} strokeWidth={1.5} />
                                Aprobar y Enviar al Cliente
                            </button>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn-secondary" style={{ flex: 1 }}>
                                    <Mail size={14} strokeWidth={1.5} />
                                    Email
                                </button>
                                <button className="btn-secondary" style={{ flex: 1 }}>
                                    <MessageCircle size={14} strokeWidth={1.5} />
                                    WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
