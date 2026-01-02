'use client';

import { useState } from 'react';
import { CRMMetrics, LeadStatus, LeadSource } from '@/types/lead';
import {
    Users,
    TrendingUp,
    DollarSign,
    Target,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Calendar,
    Sparkles,
    ChevronDown,
} from 'lucide-react';

interface MetricsDashboardProps {
    metrics: CRMMetrics;
}

type DateRange = 'today' | '7days' | '30days' | '90days';

const dateRangeLabels: Record<DateRange, string> = {
    today: 'Hoy',
    '7days': 'Últimos 7 días',
    '30days': 'Últimos 30 días',
    '90days': 'Últimos 90 días',
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        notation: 'compact',
    }).format(value);
};

const formatPercent = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'percent',
        minimumFractionDigits: 1,
    }).format(value / 100);
};

const statusLabels: Record<LeadStatus, string> = {
    nuevo: 'Nuevos',
    contactado: 'Contactados',
    agendado: 'Agendados',
    show: 'Show',
    no_show: 'No Show',
    propuesta_enviada: 'Propuesta',
    negociacion: 'Negociación',
    ganado: 'Ganados',
    perdido: 'Perdidos',
};

const statusColors: Record<LeadStatus, string> = {
    nuevo: '#6366f1',
    contactado: '#8b5cf6',
    agendado: '#0ea5e9',
    show: '#10b981',
    no_show: '#ef4444',
    propuesta_enviada: '#f59e0b',
    negociacion: '#ec4899',
    ganado: '#22c55e',
    perdido: '#64748b',
};

const sourceLabels: Record<LeadSource, string> = {
    meta_ads: 'Meta Ads',
    google_ads: 'Google Ads',
    organico: 'Orgánico',
    referido: 'Referidos',
    landing: 'Landing',
    whatsapp: 'WhatsApp',
    manual: 'Manual',
};

// Donut Chart Component
function DonutChart({ data, total }: { data: { label: string; value: number; color: string }[]; total: number }) {
    const size = 180;
    const strokeWidth = 28;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let currentOffset = 0;

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--bg-tertiary)"
                    strokeWidth={strokeWidth}
                />
                {/* Data segments */}
                {data.filter(d => d.value > 0).map((segment, index) => {
                    const percent = (segment.value / total) * 100;
                    const dashLength = (percent / 100) * circumference;
                    const offset = currentOffset;
                    currentOffset += dashLength;

                    return (
                        <circle
                            key={index}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                            strokeDashoffset={-offset}
                            style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                    );
                })}
            </svg>
            {/* Center text */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                }}
            >
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {total}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Total</p>
            </div>
        </div>
    );
}

export function MetricsDashboard({ metrics }: MetricsDashboardProps) {
    const [dateRange, setDateRange] = useState<DateRange>('30days');
    const [showDateDropdown, setShowDateDropdown] = useState(false);

    const metricCards = [
        {
            title: 'Total Leads',
            value: metrics.totalLeads.toString(),
            icon: <Users size={20} strokeWidth={1.5} />,
            change: metrics.leadsThisMonth,
            changeLabel: 'este mes',
            color: 'var(--accent-primary)',
        },
        {
            title: 'Tasa de Conversión',
            value: formatPercent(metrics.conversionRate),
            icon: <TrendingUp size={20} strokeWidth={1.5} />,
            change: null,
            changeLabel: 'Show → Ganado',
            color: 'var(--success)',
        },
        {
            title: 'Tasa de Show',
            value: formatPercent(metrics.showRate),
            icon: <Target size={20} strokeWidth={1.5} />,
            change: null,
            changeLabel: 'Agendado → Show',
            color: 'var(--info)',
        },
        {
            title: 'Valor del Pipeline',
            value: formatCurrency(metrics.totalPipelineValue),
            icon: <DollarSign size={20} strokeWidth={1.5} />,
            change: metrics.avgDealValue,
            changeLabel: 'ticket promedio',
            color: 'var(--warning)',
        },
    ];

    // Calculate percentage for status bar
    const totalByStatus = Object.values(metrics.leadsByStatus).reduce((a, b) => a + b, 0);

    // Prepare data for donut chart
    const donutData = Object.entries(metrics.leadsByStatus)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
            label: statusLabels[status as LeadStatus],
            value: count,
            color: statusColors[status as LeadStatus],
        }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Date Range Selector */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowDateDropdown(!showDateDropdown)}
                        className="btn-secondary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            minWidth: '180px',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={16} />
                            {dateRangeLabels[dateRange]}
                        </div>
                        <ChevronDown size={16} style={{ transform: showDateDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    {showDateDropdown && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.25rem',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.25rem',
                                zIndex: 100,
                                minWidth: '180px',
                                boxShadow: 'var(--shadow-lg)',
                            }}
                        >
                            {(Object.keys(dateRangeLabels) as DateRange[]).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => {
                                        setDateRange(range);
                                        setShowDateDropdown(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 0.75rem',
                                        background: dateRange === range ? 'var(--accent-glow)' : 'transparent',
                                        border: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        textAlign: 'left',
                                        color: dateRange === range ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {dateRangeLabels[range]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Metrics */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1rem',
                }}
            >
                {metricCards.map((metric) => (
                    <div key={metric.title} className="card">
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                marginBottom: '0.75rem',
                            }}
                        >
                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: 'var(--radius-md)',
                                    background: `${metric.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: metric.color,
                                }}
                            >
                                {metric.icon}
                            </div>
                        </div>
                        <p
                            style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-tertiary)',
                                marginBottom: '0.25rem',
                            }}
                        >
                            {metric.title}
                        </p>
                        <p
                            style={{
                                fontSize: '1.75rem',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                marginBottom: '0.5rem',
                            }}
                        >
                            {metric.value}
                        </p>
                        {metric.change !== null && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                {typeof metric.change === 'number' ? (
                                    metric.change > 0 ? (
                                        <>
                                            <ArrowUpRight size={14} color="var(--success)" strokeWidth={2} />
                                            <span style={{ color: 'var(--success)' }}>
                                                {typeof metric.change === 'number' && metric.change < 1000
                                                    ? `+${metric.change}`
                                                    : formatCurrency(metric.change as number)}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <ArrowDownRight size={14} color="var(--error)" strokeWidth={2} />
                                            <span style={{ color: 'var(--error)' }}>{metric.change}</span>
                                        </>
                                    )
                                ) : null}
                                <span>{metric.changeLabel}</span>
                            </div>
                        )}
                        {metric.change === null && (
                            <div
                                style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--text-tertiary)',
                                }}
                            >
                                {metric.changeLabel}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pipeline Breakdown & Sources */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '1rem',
                }}
            >
                {/* Pipeline Status - Donut Chart */}
                <div className="card">
                    <h3
                        style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <BarChart3 size={18} strokeWidth={1.5} />
                        Distribución del Pipeline
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        {/* Donut Chart */}
                        <DonutChart data={donutData} total={totalByStatus} />

                        {/* Legend */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                            {donutData.map((item) => {
                                const percent = ((item.value / totalByStatus) * 100).toFixed(1);
                                return (
                                    <div
                                        key={item.label}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            fontSize: '0.8rem',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div
                                                style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '2px',
                                                    background: item.color,
                                                }}
                                            />
                                            <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {item.value}
                                            </span>
                                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                                                {percent}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sources */}
                <div className="card">
                    <h3
                        style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <Sparkles size={18} strokeWidth={1.5} />
                        Fuentes de Leads
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {Object.entries(metrics.leadsBySource)
                            .filter(([_, count]) => count > 0)
                            .sort(([, a], [, b]) => b - a)
                            .map(([source, count]) => {
                                const percent = ((count / metrics.totalLeads) * 100) || 0;
                                return (
                                    <div key={source}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: '0.375rem',
                                                fontSize: '0.85rem',
                                            }}
                                        >
                                            <span style={{ color: 'var(--text-secondary)' }}>
                                                {sourceLabels[source as LeadSource]}
                                            </span>
                                            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                                {count} ({percent.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                height: '6px',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: '3px',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${percent}%`,
                                                    background: 'var(--accent-primary)',
                                                    borderRadius: '3px',
                                                    transition: 'width 0.3s ease',
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>

            {/* Additional Stats */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                }}
            >
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Clock size={16} strokeWidth={1.5} color="var(--text-tertiary)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                            Tiempo de respuesta
                        </span>
                    </div>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {metrics.avgResponseTime} min
                    </p>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Calendar size={16} strokeWidth={1.5} color="var(--text-tertiary)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                            Ganados este mes
                        </span>
                    </div>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--success)' }}>
                        {metrics.wonThisMonth}
                    </p>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <DollarSign size={16} strokeWidth={1.5} color="var(--text-tertiary)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                            Ticket promedio
                        </span>
                    </div>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formatCurrency(metrics.avgDealValue)}
                    </p>
                </div>
            </div>
        </div>
    );
}
