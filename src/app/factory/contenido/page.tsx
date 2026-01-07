'use client';

/**
 * Contenido - Content Calendar Management
 */

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Calendar, Image, Video, FileText } from 'lucide-react';
import '../the-factory.css';

interface ContentItem {
    id: string;
    clientName: string;
    month: string;
    year: number;
    totalPieces: number;
    posts: number;
    carousels: number;
    reels: number;
    generatedAt: string;
}

export default function ContenidoPage() {
    const [contents, setContents] = useState<ContentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadContents();
    }, []);

    const loadContents = async () => {
        try {
            // Load from strategies that have content generated
            const res = await fetch('/api/marketing/status');
            const data = await res.json();
            if (data.success) {
                // Filter strategies with content CSV
                const withContent = (data.strategies || []).filter((s: { hasContent?: boolean }) => s.hasContent);
                setContents(withContent);
            }
        } catch (error) {
            console.error('Error loading contents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadCSV = async (strategyId: string, clientName: string) => {
        try {
            const res = await fetch(`/api/marketing/content?id=${strategyId}`);
            const blob = await res.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contenido_${clientName.replace(/\s+/g, '_')}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading CSV:', error);
        }
    };

    return (
        <div className="the-factory">
            <header className="factory-header">
                <div className="header-content">
                    <div className="header-icon">
                        <FileSpreadsheet />
                    </div>
                    <div className="header-text">
                        <h1>Contenido</h1>
                        <p>Calendarios de contenido generados</p>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="stat">
                        <Image />
                        <span>Posts</span>
                    </div>
                    <div className="stat">
                        <FileText />
                        <span>Carruseles</span>
                    </div>
                    <div className="stat">
                        <Video />
                        <span>Reels</span>
                    </div>
                </div>
            </header>

            <main className="factory-content">
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#8892b0' }}>
                        Cargando contenido...
                    </div>
                ) : contents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#5a6a8a' }}>
                        <FileSpreadsheet size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                        <p>No hay contenido generado aún</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Completa una estrategia y genera el contenido para ver los calendarios aquí
                        </p>
                    </div>
                ) : (
                    <div className="documents-grid">
                        {contents.map((content) => (
                            <div key={content.id} className="document-card">
                                <div className="doc-icon">
                                    <Calendar />
                                </div>
                                <h4>{content.clientName}</h4>
                                <p style={{ color: '#8892b0', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    {content.month} {content.year}
                                </p>
                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    justifyContent: 'center',
                                    marginBottom: '1rem',
                                    fontSize: '0.85rem',
                                    color: '#ccd6f6'
                                }}>
                                    <span>{content.posts} Posts</span>
                                    <span>{content.carousels} Carruseles</span>
                                    <span>{content.reels} Reels</span>
                                </div>
                                <div className="doc-actions">
                                    <button onClick={() => downloadCSV(content.id, content.clientName)}>
                                        <Download size={16} /> Descargar CSV
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
