'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { LeadsList } from '@/components/crm/LeadsList';
import { WarRoomModal } from '@/components/crm/WarRoomModal';
import { AddLeadModal, LeadFormData } from '@/components/crm/AddLeadModal';
import { Lead } from '@/types/lead';
import { Plus } from 'lucide-react';

// Mock data
const mockLeads: Lead[] = [
    {
        id: '1',
        nombre: 'Carlos',
        apellido: 'Mendoza',
        email: 'carlos@empresa.mx',
        telefono: '+52 55 1234 5678',
        empresa: 'Tech Solutions MX',
        cargo: 'Director General',
        status: 'nuevo',
        source: 'meta_ads',
        leadScore: 85,
        scoreHistory: [],
        meetings: [],
        quotes: [],
        interactions: [],
        potentialValue: 45000,
        currency: 'MXN',
        detectedNeeds: [],
        interests: [],
        tags: ['B2B', 'Tecnología'],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '2',
        nombre: 'María',
        apellido: 'González',
        email: 'maria@retail.mx',
        telefono: '+52 33 9876 5432',
        empresa: 'Retail Express',
        cargo: 'Gerente de Marketing',
        status: 'agendado',
        source: 'google_ads',
        leadScore: 72,
        scoreHistory: [],
        meetings: [],
        quotes: [],
        interactions: [],
        potentialValue: 28000,
        currency: 'MXN',
        detectedNeeds: [],
        interests: [],
        tags: ['Retail'],
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(),
    },
    {
        id: '3',
        nombre: 'Roberto',
        apellido: 'Silva',
        email: 'roberto@consultoria.mx',
        telefono: '+52 81 5555 1234',
        empresa: 'Consultoría Integral',
        status: 'show',
        source: 'referido',
        leadScore: 91,
        scoreHistory: [],
        meetings: [
            {
                scheduledAt: new Date(Date.now() - 172800000),
                meetLink: 'https://meet.google.com/abc-defg-hij',
                googleEventId: 'evt_123',
                duration: 45,
                status: 'completada',
                transcript: `Roberto: Hola, mucho gusto. Gracias por tomarse el tiempo.
Closer: ¡Hola Roberto! El gusto es mío. Cuéntame, ¿cómo está la situación actual de marketing en tu empresa?
Roberto: Pues mira, hemos invertido en redes sociales pero no vemos resultados concretos. Necesitamos más leads calificados.
Closer: Entiendo. ¿Cuántos leads están generando actualmente al mes?
Roberto: Unos 20-30, pero la mayoría no califican. Queremos por lo menos 50 leads buenos.
Closer: Perfecto. ¿Han considerado campañas de Meta Ads con un embudo más segmentado?
Roberto: Sí, pero nos preocupa el presupuesto. Tenemos como $15,000 al mes para publicidad.
Closer: Con ese presupuesto podemos hacer algo muy efectivo. ¿Cuál es el ticket promedio de sus clientes?
Roberto: Ronda los $25,000 MXN mensuales por contrato.
Closer: Excelente. Con 3-4 cierres al mes ya estarían recuperando la inversión x5.
Roberto: Eso suena bien. ¿Qué servicios incluiría la propuesta?`,
                summary: 'Roberto busca aumentar leads calificados de 20-30 a 50+ mensuales. Presupuesto de $15k/mes. Ticket promedio $25k. Interesado en Meta Ads con embudo segmentado.',
                nextSteps: [
                    'Enviar propuesta con paquete de Meta Ads + Landing',
                    'Incluir proyección de ROI',
                    'Agendar seguimiento para esta semana',
                ],
            },
        ],
        quotes: [],
        interactions: [],
        potentialValue: 65000,
        currency: 'MXN',
        detectedNeeds: ['leads calificados', 'meta ads', 'embudo de ventas'],
        interests: ['campañas digitales', 'generación de leads'],
        tags: ['Consultoría', 'B2B'],
        psychProfile: {
            dominantType: 'analitico',
            traits: ['orientado a datos', 'cauteloso con presupuesto'],
            painPoints: ['leads no calificados', 'ROI bajo'],
            motivators: ['resultados medibles', 'crecimiento'],
            objections: ['presupuesto limitado'],
            recommendedStrategy: 'Presenta números concretos y proyecciones de ROI. Muestra casos de éxito similares.',
            closingTips: ['Usa calculadora de ROI', 'Ofrece garantía de resultados'],
            confidence: 85,
        },
        createdAt: new Date(Date.now() - 604800000),
        updatedAt: new Date(),
    },
    {
        id: '4',
        nombre: 'Ana',
        apellido: 'Torres',
        email: 'ana@clinica.mx',
        telefono: '+52 55 7777 8888',
        empresa: 'Clínica Dental Premium',
        status: 'propuesta_enviada',
        source: 'landing',
        leadScore: 68,
        scoreHistory: [],
        meetings: [],
        quotes: [],
        interactions: [],
        potentialValue: 12000,
        currency: 'MXN',
        detectedNeeds: [],
        interests: [],
        tags: ['Salud'],
        createdAt: new Date(Date.now() - 259200000),
        updatedAt: new Date(),
    },
    {
        id: '5',
        nombre: 'Fernando',
        apellido: 'Ramírez',
        email: 'fernando@inmobiliaria.mx',
        telefono: '+52 999 123 4567',
        empresa: 'Inmobiliaria Costa',
        status: 'ganado',
        source: 'meta_ads',
        leadScore: 95,
        scoreHistory: [],
        meetings: [],
        quotes: [],
        interactions: [],
        potentialValue: 85000,
        currency: 'MXN',
        detectedNeeds: [],
        interests: [],
        tags: ['Inmobiliaria'],
        createdAt: new Date(Date.now() - 432000000),
        updatedAt: new Date(),
    },
];

export default function LeadsPage() {
    const searchParams = useSearchParams();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load leads from Firestore on mount
    useEffect(() => {
        const loadLeads = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/leads');
                if (response.ok) {
                    const data = await response.json();
                    if (data.leads && Array.isArray(data.leads)) {
                        // Process leads to ensure proper structure
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
                    } else {
                        setLeads([]);
                    }
                }
            } catch (error) {
                console.log('Using mock data, Firestore not configured:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadLeads();
    }, []);

    // Check for add=true query param
    useEffect(() => {
        if (searchParams.get('add') === 'true') {
            setShowAddModal(true);
        }
    }, [searchParams]);

    const handleAddLead = async (data: LeadFormData) => {
        const newLead: Lead = {
            id: Date.now().toString(),
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

        // Save to Firestore in background
        try {
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLead),
            });
        } catch (error) {
            console.log('Lead saved locally, Firestore sync failed:', error);
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
                            Todos los Leads
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Gestiona y visualiza todos tus leads en un solo lugar
                        </p>
                    </div>
                    <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                        <Plus size={16} strokeWidth={1.5} />
                        Nuevo Lead
                    </button>
                </div>

                {/* Leads List */}
                <LeadsList leads={leads} onLeadClick={setSelectedLead} />
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
