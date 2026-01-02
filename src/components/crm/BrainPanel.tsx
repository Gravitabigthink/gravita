'use client';

import {
    Brain,
    TrendingUp,
    AlertTriangle,
    Lightbulb,
    DollarSign,
    Target,
    Clock,
    Users,
    ChevronRight,
    Sparkles,
} from 'lucide-react';

// Brain insights structure
interface BrainInsights {
    pricing: {
        avgAccepted: number;
        avgRejected: number;
        optimalRange: { min: number; max: number };
        trend: 'up' | 'down' | 'stable';
    };
    psychology: {
        dominantType: string;
        commonObjections: { text: string; frequency: number; resolution?: string }[];
    };
    needs: {
        topServices: { name: string; count: number }[];
        emergingTrends: string[];
    };
    predictions: {
        avgCloseTime: number;
        bestDayToContact: string;
        bestTimeToContact: string;
        hotLeads: { name: string; probability: number; reason: string }[];
    };
    alerts: { type: 'warning' | 'opportunity'; message: string }[];
    suggestions: string[];
}

// Mock brain data - would come from accumulated learnings
const brainInsights: BrainInsights = {
    pricing: {
        avgAccepted: 28500,
        avgRejected: 45000,
        optimalRange: { min: 20000, max: 35000 },
        trend: 'up',
    },
    psychology: {
        dominantType: 'Analítico (45%)',
        commonObjections: [
            { text: 'Presupuesto limitado', frequency: 34, resolution: 'Ofrecer plan escalonado' },
            { text: 'Necesito consultar', frequency: 28, resolution: 'Agendar follow-up con decisor' },
            { text: 'Ya tengo agencia', frequency: 18, resolution: 'Comparativa de resultados' },
        ],
    },
    needs: {
        topServices: [
            { name: 'Meta Ads', count: 45 },
            { name: 'Landing Pages', count: 38 },
            { name: 'SEO', count: 27 },
        ],
        emergingTrends: ['TikTok Ads', 'Email Automation', 'WhatsApp Marketing'],
    },
    predictions: {
        avgCloseTime: 12,
        bestDayToContact: 'Martes',
        bestTimeToContact: '10:00 - 12:00',
        hotLeads: [
            { name: 'Roberto Silva', probability: 85, reason: 'Alta intención + presupuesto confirmado' },
            { name: 'Carlos Mendoza', probability: 72, reason: 'Urgencia demostrada en llamada' },
        ],
    },
    alerts: [
        { type: 'opportunity', message: '3 leads listos para propuesta esta semana' },
        { type: 'warning', message: '2 leads sin contacto por más de 5 días' },
    ],
    suggestions: [
        'Considera ofrecer paquete de TikTok Ads, demanda creciente detectada',
        'Los leads analíticos responden mejor con casos de estudio con datos',
        'Precio óptimo para cierre: $25,000 - $32,000 MXN',
    ],
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
    }).format(value);
};

export function BrainPanel() {
    return (
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(139, 92, 246, 0.05) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3
                    style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    <Brain size={18} strokeWidth={1.5} color="var(--accent-primary)" />
                    Brain Insights
                    <span
                        style={{
                            fontSize: '0.65rem',
                            padding: '0.125rem 0.5rem',
                            background: 'var(--accent-glow)',
                            color: 'var(--accent-primary)',
                            borderRadius: '9999px',
                            fontWeight: 500,
                        }}
                    >
                        LIVE
                    </span>
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    Actualizado hace 2 min
                </span>
            </div>

            {/* Alerts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {brainInsights.alerts.map((alert, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            background: alert.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8rem',
                            color: alert.type === 'warning' ? 'var(--warning)' : 'var(--success)',
                        }}
                    >
                        {alert.type === 'warning' ? (
                            <AlertTriangle size={14} />
                        ) : (
                            <Sparkles size={14} />
                        )}
                        {alert.message}
                    </div>
                ))}
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <DollarSign size={16} color="var(--success)" style={{ marginBottom: '0.25rem' }} />
                    <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formatCurrency(brainInsights.pricing.optimalRange.min)} - {formatCurrency(brainInsights.pricing.optimalRange.max).replace('MXN', '')}
                    </p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Precio óptimo</p>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <Clock size={16} color="var(--info)" style={{ marginBottom: '0.25rem' }} />
                    <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {brainInsights.predictions.avgCloseTime} días
                    </p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Tiempo promedio cierre</p>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <Target size={16} color="var(--accent-primary)" style={{ marginBottom: '0.25rem' }} />
                    <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {brainInsights.predictions.bestDayToContact}
                    </p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Mejor día contacto</p>
                </div>
            </div>

            {/* Hot Leads Prediction */}
            <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <TrendingUp size={14} />
                    Leads con Mayor Probabilidad de Cierre
                </h4>
                {brainInsights.predictions.hotLeads.map((lead, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.5rem',
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-sm)',
                            marginBottom: '0.375rem',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: 'var(--accent-glow)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--accent-primary)',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                }}
                            >
                                {lead.name.charAt(0)}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>{lead.name}</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{lead.reason}</p>
                            </div>
                        </div>
                        <div
                            style={{
                                padding: '0.25rem 0.5rem',
                                background: lead.probability >= 80 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                color: lead.probability >= 80 ? 'var(--success)' : 'var(--warning)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                            }}
                        >
                            {lead.probability}%
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Suggestions */}
            <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Lightbulb size={14} color="var(--warning)" />
                    Sugerencias del Brain
                </h4>
                {brainInsights.suggestions.map((suggestion, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem',
                            padding: '0.5rem',
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            borderLeft: '2px solid var(--accent-primary)',
                            marginBottom: '0.375rem',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                        }}
                    >
                        <ChevronRight size={14} style={{ marginTop: '2px', flexShrink: 0 }} color="var(--accent-primary)" />
                        {suggestion}
                    </div>
                ))}
            </div>

            {/* Common Objections */}
            <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Users size={14} />
                    Objeciones Frecuentes y Cómo Resolverlas
                </h4>
                {brainInsights.psychology.commonObjections.slice(0, 3).map((obj, i) => (
                    <div
                        key={i}
                        style={{
                            padding: '0.5rem',
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-sm)',
                            marginBottom: '0.375rem',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{obj.text}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{obj.frequency}%</span>
                        </div>
                        {obj.resolution && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
                                💡 {obj.resolution}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
