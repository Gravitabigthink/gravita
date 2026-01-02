'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { WarRoomModal } from '@/components/crm/WarRoomModal';
import { AddLeadModal, LeadFormData } from '@/components/crm/AddLeadModal';
import { Lead, LeadStatus } from '@/types/lead';
import { Plus, Filter, Loader2, AlertCircle } from 'lucide-react';

export default function PipelinePage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load leads from API/Firestore
    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('/api/leads');
            if (response.ok) {
                const data = await response.json();
                if (data.leads && Array.isArray(data.leads)) {
                    // Convert dates and ensure proper structure
                    const processedLeads = data.leads.map((lead: Lead) => ({
                        ...lead,
                        createdAt: lead.createdAt ? new Date(lead.createdAt) : new Date(),
                        updatedAt: lead.updatedAt ? new Date(lead.updatedAt) : new Date(),
                        scoreHistory: lead.scoreHistory || [],
                        meetings: lead.meetings || [],
                        quotes: lead.quotes || [],
                        interactions: lead.interactions || [],
                        detectedNeeds: lead.detectedNeeds || [],
                        interests: lead.interests || [],
                        tags: lead.tags || [],
                    }));
                    setLeads(processedLeads);
                }
            } else {
                setError('No se pudieron cargar los leads');
            }
        } catch (err) {
            console.error('Error loading leads:', err);
            setError('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeadMove = async (leadId: string, newStatus: LeadStatus) => {
        // Validar que no se pueda mover a propuesta_enviada sin cotización
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;

        if (newStatus === 'propuesta_enviada' && (!lead.quotes || lead.quotes.length === 0)) {
            alert('⚠️ No puedes mover este lead a "Propuesta Enviada" sin antes crear una cotización.');
            return;
        }

        // Update locally first for responsiveness
        setLeads((prev) =>
            prev.map((l) =>
                l.id === leadId ? { ...l, status: newStatus, updatedAt: new Date() } : l
            )
        );

        // Sync with Firestore
        try {
            await fetch(`/api/leads/${leadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, updatedAt: new Date().toISOString() }),
            });
        } catch (err) {
            console.error('Error updating lead status:', err);
            // Revert on error
            loadLeads();
        }
    };

    const handleAddLead = async (data: LeadFormData) => {
        const newLead: Lead = {
            id: `temp-${Date.now()}`,
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email,
            telefono: data.telefono,
            empresa: data.empresa,
            cargo: data.cargo,
            status: 'nuevo',
            source: data.source,
            leadScore: 50,
            scoreHistory: [],
            meetings: [],
            quotes: [],
            interactions: [],
            potentialValue: data.potentialValue,
            currency: 'MXN',
            detectedNeeds: [],
            interests: [],
            tags: data.tags,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Add to local state immediately
        setLeads((prev) => [newLead, ...prev]);

        // Save to Firestore
        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLead),
            });

            if (response.ok) {
                const result = await response.json();
                // Update with real ID from Firestore
                if (result.id) {
                    setLeads((prev) =>
                        prev.map((l) =>
                            l.id === newLead.id ? { ...l, id: result.id } : l
                        )
                    );
                }
            }
        } catch (err) {
            console.error('Error saving lead:', err);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main
                style={{
                    flex: 1,
                    marginLeft: '280px',
                    padding: '1.5rem',
                    transition: 'margin-left 0.2s ease',
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
                            Pipeline de Ventas
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {isLoading ? 'Cargando...' : `${leads.length} leads en el pipeline`}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn-secondary">
                            <Filter size={16} strokeWidth={1.5} />
                            Filtros
                        </button>
                        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                            <Plus size={16} strokeWidth={1.5} />
                            Nuevo Lead
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
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
                        <span style={{ color: 'var(--text-secondary)' }}>Cargando leads desde Firestore...</span>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div
                        className="card"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem',
                            gap: '0.5rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderColor: 'rgba(239, 68, 68, 0.3)'
                        }}
                    >
                        <AlertCircle size={20} style={{ color: '#ef4444' }} />
                        <span style={{ color: '#ef4444' }}>{error}</span>
                        <button onClick={loadLeads} className="btn-secondary" style={{ marginLeft: '1rem' }}>
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Kanban Board */}
                {!isLoading && !error && (
                    <KanbanBoard
                        leads={leads}
                        onLeadClick={setSelectedLead}
                        onLeadMove={handleLeadMove}
                        onAddLead={() => setShowAddModal(true)}
                    />
                )}
            </main>

            {/* War Room Modal */}
            {selectedLead && (
                <WarRoomModal
                    lead={selectedLead}
                    isOpen={!!selectedLead}
                    onClose={() => setSelectedLead(null)}
                    onUpdateLead={(updated) => {
                        setLeads((prev) =>
                            prev.map((l) => (l.id === updated.id ? updated : l))
                        );
                    }}
                />
            )}

            {/* Add Lead Modal */}
            <AddLeadModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddLead}
            />
        </div>
    );
}
