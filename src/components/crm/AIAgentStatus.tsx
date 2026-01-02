'use client';

import { Brain, MessageSquare, FileText, Zap, Activity, CheckCircle } from 'lucide-react';

interface AgentStatus {
    id: string;
    name: string;
    role: string;
    icon: React.ReactNode;
    isActive: boolean;
    stats: {
        leadsProcessed: number;
        lastActive: string;
        successRate: number;
    };
    color: string;
}

const agents: AgentStatus[] = [
    {
        id: 'setter',
        name: 'Setter Agent',
        role: 'Califica y prioriza leads entrantes',
        icon: <MessageSquare size={20} />,
        isActive: true,
        stats: {
            leadsProcessed: 127,
            lastActive: 'Hace 5 min',
            successRate: 89,
        },
        color: '#10b981',
    },
    {
        id: 'profiler',
        name: 'Profiler Agent',
        role: 'Analiza transcripciones y perfil psicológico',
        icon: <Brain size={20} />,
        isActive: true,
        stats: {
            leadsProcessed: 45,
            lastActive: 'Hace 12 min',
            successRate: 94,
        },
        color: '#8b5cf6',
    },
    {
        id: 'closer',
        name: 'Closer Agent',
        role: 'Genera cotizaciones y estrategias de cierre',
        icon: <FileText size={20} />,
        isActive: true,
        stats: {
            leadsProcessed: 34,
            lastActive: 'Hace 2 min',
            successRate: 91,
        },
        color: '#f59e0b',
    },
];

export function AIAgentStatus() {
    return (
        <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
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
                    <Zap size={18} strokeWidth={1.5} color="var(--warning)" />
                    Agentes IA Activos
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--success)',
                            animation: 'pulse 2s infinite',
                        }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Sistema Online</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {agents.map((agent) => (
                    <div
                        key={agent.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.75rem',
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${agent.isActive ? `${agent.color}30` : 'var(--border-primary)'}`,
                        }}
                    >
                        {/* Icon */}
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: 'var(--radius-md)',
                                background: `${agent.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: agent.color,
                            }}
                        >
                            {agent.icon}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {agent.name}
                                </span>
                                {agent.isActive && (
                                    <CheckCircle size={12} color="var(--success)" />
                                )}
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{agent.role}</p>
                        </div>

                        {/* Stats */}
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                <Activity size={12} color="var(--text-tertiary)" />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {agent.stats.leadsProcessed} procesados
                                </span>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                {agent.stats.lastActive}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
