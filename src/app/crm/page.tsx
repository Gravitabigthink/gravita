'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MetricsDashboard } from '@/components/crm/MetricsDashboard';
import { AIAgentStatus } from '@/components/crm/AIAgentStatus';
import { BrainPanel } from '@/components/crm/BrainPanel';
import TokenUsageWidget from '@/components/crm/TokenUsageWidget';
import { CRMMetrics } from '@/types/lead';
import { getCRMMetricsFromFirestore } from '@/lib/firestoreService';
import { TrendingUp, Users, Calendar, Target, Loader2 } from 'lucide-react';
import Link from 'next/link';


// Default empty metrics for loading state
const emptyMetrics: CRMMetrics = {
    totalLeads: 0,
    leadsByStatus: {
        nuevo: 0, contactado: 0, agendado: 0, show: 0, no_show: 0,
        propuesta_enviada: 0, negociacion: 0, ganado: 0, perdido: 0
    },
    leadsBySource: {
        meta_ads: 0, google_ads: 0, organico: 0, referido: 0,
        landing: 0, whatsapp: 0, manual: 0
    },
    conversionRate: 0,
    showRate: 0,
    avgDealValue: 0,
    totalPipelineValue: 0,
    avgResponseTime: 0,
    leadsThisMonth: 0,
    wonThisMonth: 0,
};

const quickActions = [
    {
        href: '/crm/pipeline',
        icon: <Target size={24} strokeWidth={1.5} />,
        title: 'Pipeline',
        description: 'Ver y gestionar leads',
        color: 'var(--accent-primary)',
    },
    {
        href: '/crm/leads',
        icon: <Users size={24} strokeWidth={1.5} />,
        title: 'Leads',
        description: 'Lista completa',
        color: 'var(--success)',
    },
    {
        href: '/crm/calendario',
        icon: <Calendar size={24} strokeWidth={1.5} />,
        title: 'Calendario',
        description: 'Citas programadas',
        color: 'var(--info)',
    },
    {
        href: '/crm/cotizaciones',
        icon: <TrendingUp size={24} strokeWidth={1.5} />,
        title: 'Cotizaciones',
        description: 'Propuestas enviadas',
        color: 'var(--warning)',
    },
];

export default function CRMDashboard() {
    const [metrics, setMetrics] = useState<CRMMetrics>(emptyMetrics);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMetrics() {
            try {
                const data = await getCRMMetricsFromFirestore();
                setMetrics(data);
            } catch (error) {
                console.error('Error loading metrics:', error);
            } finally {
                setLoading(false);
            }
        }
        loadMetrics();
    }, []);

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
                <div style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Dashboard CRM
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {loading ? 'Cargando métricas...' : 'Métricas en tiempo real desde Firestore'}
                    </p>
                </div>

                {/* Quick Actions */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem',
                    }}
                >
                    {quickActions.map((action) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="card"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                textDecoration: 'none',
                            }}
                        >
                            <div
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: 'var(--radius-md)',
                                    background: `${action.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: action.color,
                                }}
                            >
                                {action.icon}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {action.title}
                                </h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                    {action.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Metrics Dashboard */}
                {loading ? (
                    <div
                        className="card"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4rem',
                            gap: '1rem'
                        }}
                    >
                        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>Cargando métricas desde Firestore...</span>
                    </div>
                ) : (
                    <MetricsDashboard metrics={metrics} />
                )}

                {/* Brain & AI Section */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '1rem',
                        marginTop: '1.5rem',
                    }}
                >
                    <AIAgentStatus />
                    <BrainPanel />
                </div>
            </main>
        </div>
    );
}

