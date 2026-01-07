'use client';

/**
 * Estrategias - List of all marketing strategies
 */

import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, Calendar, Eye } from 'lucide-react';
import '../the-factory.css';

interface Strategy {
    id: string;
    clientName: string;
    status: string;
    progress: { completed: number; total: number; percentage: number };
    createdAt: string;
}

export default function EstrategiasPage() {
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStrategies();
    }, []);

    const loadStrategies = async () => {
        try {
            const res = await fetch('/api/marketing/status');
            const data = await res.json();
            if (data.success) {
                setStrategies(data.strategies || []);
            }
        } catch (error) {
            console.error('Error loading strategies:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#4ade80';
            case 'in_progress': return '#60a5fa';
            case 'error': return '#f87171';
            default: return '#8892b0';
        }
    };

    return (
        <div className="the-factory">
            <header className="factory-header">
                <div className="header-content">
                    <div className="header-icon">
                        <FileText />
                    </div>
                    <div className="header-text">
                        <h1>Estrategias</h1>
                        <p>Historial de estrategias de marketing generadas</p>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="stat">
                        <TrendingUp />
                        <span>{strategies.length} Total</span>
                    </div>
                    <div className="stat">
                        <Calendar />
                        <span>{strategies.filter(s => s.status === 'completed').length} Completadas</span>
                    </div>
                </div>
            </header>

            <main className="factory-content">
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#8892b0' }}>
                        Cargando estrategias...
                    </div>
                ) : strategies.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#5a6a8a' }}>
                        <FileText size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                        <p>No hay estrategias generadas aún</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Ve a "Nueva Estrategia" para crear tu primera estrategia de marketing
                        </p>
                    </div>
                ) : (
                    <div className="history-list">
                        {strategies.map((strategy) => (
                            <div
                                key={strategy.id}
                                className="history-card"
                                onClick={() => window.location.href = `/factory?id=${strategy.id}`}
                            >
                                <div className="history-info">
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '10px',
                                        background: `${getStatusColor(strategy.status)}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '1rem'
                                    }}>
                                        <FileText color={getStatusColor(strategy.status)} />
                                    </div>
                                    <div>
                                        <h4>{strategy.clientName}</h4>
                                        <span style={{ fontSize: '0.85rem', color: '#8892b0' }}>
                                            {new Date(strategy.createdAt).toLocaleDateString('es-MX')}
                                        </span>
                                    </div>
                                </div>
                                <div className="history-meta">
                                    <span className={`status-badge ${strategy.status}`}>
                                        {strategy.status}
                                    </span>
                                    <span>{strategy.progress.percentage}%</span>
                                    <Eye size={18} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
