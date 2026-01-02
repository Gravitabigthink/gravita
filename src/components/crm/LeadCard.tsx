'use client';

import { Lead, LeadStatus, PIPELINE_COLUMNS } from '@/types/lead';
import {
    Sparkles,
    MessageCircle,
    Calendar,
    Video,
    FileText,
    Handshake,
    Trophy,
    XCircle,
} from 'lucide-react';

interface LeadCardProps {
    lead: Lead;
    onClick: () => void;
    isDragging?: boolean;
}

const getScoreColor = (score: number) => {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
};

const getStatusIcon = (status: LeadStatus) => {
    const icons: Record<LeadStatus, React.ReactNode> = {
        nuevo: <Sparkles size={14} strokeWidth={1.5} />,
        contactado: <MessageCircle size={14} strokeWidth={1.5} />,
        agendado: <Calendar size={14} strokeWidth={1.5} />,
        show: <Video size={14} strokeWidth={1.5} />,
        no_show: <XCircle size={14} strokeWidth={1.5} />,
        propuesta_enviada: <FileText size={14} strokeWidth={1.5} />,
        negociacion: <Handshake size={14} strokeWidth={1.5} />,
        ganado: <Trophy size={14} strokeWidth={1.5} />,
        perdido: <XCircle size={14} strokeWidth={1.5} />,
    };
    return icons[status];
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
    }).format(value);
};

const getNextAction = (lead: Lead): string => {
    if (lead.status === 'nuevo') return 'Enviar mensaje de bienvenida';
    if (lead.status === 'contactado') return 'Agendar llamada';
    if (lead.status === 'agendado' && lead.nextMeeting) {
        const date = new Date(lead.nextMeeting.scheduledAt);
        return `Llamada: ${date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`;
    }
    if (lead.status === 'show') return 'Generar cotización';
    if (lead.status === 'propuesta_enviada') return 'Seguimiento propuesta';
    if (lead.status === 'negociacion') return 'Cerrar venta';
    return '';
};

export function LeadCard({ lead, onClick, isDragging }: LeadCardProps) {
    const scoreClass = getScoreColor(lead.leadScore);
    const column = PIPELINE_COLUMNS.find((c) => c.id === lead.status);

    return (
        <div
            onClick={onClick}
            className={`lead-card ${isDragging ? 'dragging' : ''}`}
            style={{
                opacity: isDragging ? 0.5 : 1,
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                }}
            >
                <div>
                    <h4
                        style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '0.125rem',
                        }}
                    >
                        {lead.nombre || lead.name || 'Sin nombre'} {lead.apellido || ''}
                    </h4>
                    {lead.empresa && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            {lead.empresa}
                        </p>
                    )}
                </div>
                <span
                    className={scoreClass}
                    style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                    }}
                >
                    {lead.leadScore || lead.score || 0}
                </span>
            </div>

            {/* Potential Value */}
            {lead.potentialValue && (
                <div
                    style={{
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        marginBottom: '0.75rem',
                    }}
                >
                    {formatCurrency(lead.potentialValue)}
                </div>
            )}

            {/* Source Tag */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                }}
            >
                <span
                    className="status-pill"
                    style={{
                        background: `${column?.color}20`,
                        color: column?.color,
                    }}
                >
                    {getStatusIcon(lead.status)}
                    {(lead.source || 'manual').replace('_', ' ')}
                </span>
            </div>

            {/* Next Action */}
            {getNextAction(lead) && (
                <div
                    style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        padding: '0.5rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                    }}
                >
                    <span style={{ color: 'var(--accent-primary)' }}>→</span>
                    {getNextAction(lead)}
                </div>
            )}

            {/* Tags */}
            {lead.tags && lead.tags.length > 0 && (
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.25rem',
                        marginTop: '0.75rem',
                    }}
                >
                    {lead.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            style={{
                                fontSize: '0.65rem',
                                padding: '0.125rem 0.375rem',
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-tertiary)',
                                borderRadius: 'var(--radius-sm)',
                            }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
