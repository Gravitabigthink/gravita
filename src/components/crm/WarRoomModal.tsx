'use client';

import { useState } from 'react';
import { Lead, PsychType, Quote } from '@/types/lead';
import { QuoteEditor } from './QuoteEditor';
import { ProactiveSuggestionsPanel } from './ProactiveSuggestionsPanel';
import { EditLeadModal } from './EditLeadModal';
import {
    X,
    Phone,
    Mail,
    Building,
    Calendar,
    MessageCircle,
    Video,
    FileText,
    Send,
    Upload,
    Brain,
    Target,
    TrendingUp,
    Clock,
    User,
    Tag,
    MoreHorizontal,
    StickyNote,
    Plus,
    Edit,
} from 'lucide-react';

interface WarRoomModalProps {
    lead: Lead;
    isOpen: boolean;
    onClose: () => void;
    onUpdateLead: (lead: Lead) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
    }).format(value);
};

const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const psychTypeLabels: Record<PsychType, string> = {
    analitico: 'Analítico',
    emocional: 'Emocional',
    asertivo: 'Asertivo',
    indeciso: 'Indeciso',
};

const getInteractionIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
        whatsapp: <MessageCircle size={14} strokeWidth={1.5} />,
        email: <Mail size={14} strokeWidth={1.5} />,
        llamada: <Phone size={14} strokeWidth={1.5} />,
        videollamada: <Video size={14} strokeWidth={1.5} />,
        sistema: <Target size={14} strokeWidth={1.5} />,
        ia: <Brain size={14} strokeWidth={1.5} />,
    };
    return icons[type] || <MessageCircle size={14} strokeWidth={1.5} />;
};

interface LeadNote {
    id: string;
    content: string;
    createdAt: Date;
    type: 'conversacion' | 'solicitud' | 'recordatorio' | 'general';
}

export function WarRoomModal({ lead, isOpen, onClose, onUpdateLead }: WarRoomModalProps) {
    const [activeTab, setActiveTab] = useState<'timeline' | 'notas' | 'calls' | 'insights' | 'quotes'>('timeline');
    const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [notes, setNotes] = useState<LeadNote[]>([
        {
            id: '1',
            content: 'Cliente interesado principalmente en redes sociales y generación de leads.',
            createdAt: new Date(Date.now() - 86400000),
            type: 'conversacion',
        },
    ]);
    const [newNote, setNewNote] = useState('');
    const [noteType, setNoteType] = useState<LeadNote['type']>('general');
    const [showQuoteEditor, setShowQuoteEditor] = useState(false);
    const [editingQuote, setEditingQuote] = useState<Quote | undefined>(undefined);
    const [showEditModal, setShowEditModal] = useState(false);

    if (!isOpen) return null;

    const handleTranscriptUpload = async (file: File) => {
        setTranscriptFile(file);
        setIsAnalyzing(true);
        // TODO: Implement AI analysis
        setTimeout(() => setIsAnalyzing(false), 2000);
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: '1000px',
                        maxWidth: '95vw',
                        display: 'grid',
                        gridTemplateColumns: '1fr 380px',
                        height: '85vh',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                    }}
                >
                    {/* Left Column - Main Info */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            borderRight: '1px solid var(--border-primary)',
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                padding: '1.25rem',
                                borderBottom: '1px solid var(--border-primary)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                            }}
                        >
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div
                                    style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: 'var(--radius-lg)',
                                        background: 'var(--accent-glow)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--accent-primary)',
                                        fontSize: '1.5rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    {(lead.nombre || lead.name || 'L').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {lead.nombre || lead.name || 'Sin nombre'} {lead.apellido || ''}
                                    </h2>
                                    {lead.empresa && (
                                        <p
                                            style={{
                                                fontSize: '0.875rem',
                                                color: 'var(--text-secondary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.375rem',
                                            }}
                                        >
                                            <Building size={14} strokeWidth={1.5} />
                                            {lead.empresa}
                                            {lead.cargo && ` · ${lead.cargo}`}
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                        <a
                                            href={`mailto:${lead.email}`}
                                            style={{
                                                fontSize: '0.8rem',
                                                color: 'var(--accent-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                            }}
                                        >
                                            <Mail size={12} strokeWidth={1.5} />
                                            {lead.email || 'Sin email'}
                                        </a>
                                        {(lead.telefono || lead.phone) && (
                                            <a
                                                href={`https://wa.me/${lead.telefono || lead.phone}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    fontSize: '0.8rem',
                                                    color: 'var(--success)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                }}
                                            >
                                                <Phone size={12} strokeWidth={1.5} />
                                                {lead.telefono || lead.phone}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    style={{
                                        background: 'var(--accent-glow)',
                                        border: 'none',
                                        color: 'var(--accent-primary)',
                                        cursor: 'pointer',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: 'var(--radius-sm)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        fontSize: '0.8rem',
                                        fontWeight: 500,
                                    }}
                                >
                                    <Edit size={14} strokeWidth={1.5} />
                                    Editar
                                </button>
                                <button
                                    onClick={onClose}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-tertiary)',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                    }}
                                >
                                    <X size={20} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '1rem',
                                padding: '1rem 1.25rem',
                                borderBottom: '1px solid var(--border-primary)',
                            }}
                        >
                            <div>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                                    Score
                                </p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {lead.leadScore}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                                    Valor
                                </p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {lead.potentialValue ? formatCurrency(lead.potentialValue) : '-'}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                                    Fuente
                                </p>
                                <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                                    {lead.source.replace('_', ' ')}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                                    Creado
                                </p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {formatDateTime(lead.createdAt)}
                                </p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div
                            style={{
                                display: 'flex',
                                gap: '0.25rem',
                                padding: '0 1.25rem',
                                borderBottom: '1px solid var(--border-primary)',
                            }}
                        >
                            {[
                                { id: 'timeline', label: 'Timeline', icon: <Clock size={14} strokeWidth={1.5} /> },
                                { id: 'notas', label: 'Notas', icon: <StickyNote size={14} strokeWidth={1.5} /> },
                                { id: 'calls', label: 'Videollamadas', icon: <Video size={14} strokeWidth={1.5} /> },
                                { id: 'insights', label: 'IA Insights', icon: <Brain size={14} strokeWidth={1.5} /> },
                                { id: 'quotes', label: 'Cotizaciones', icon: <FileText size={14} strokeWidth={1.5} /> },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        padding: '0.875rem 1rem',
                                        background: 'transparent',
                                        border: 'none',
                                        color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                        marginBottom: '-1px',
                                    }}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div style={{ flex: 1, overflow: 'auto', padding: '1.25rem' }}>
                            {activeTab === 'timeline' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {lead.interactions.length === 0 ? (
                                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
                                            No hay interacciones registradas
                                        </p>
                                    ) : (
                                        lead.interactions.map((interaction) => (
                                            <div
                                                key={interaction.id}
                                                style={{
                                                    padding: '0.875rem',
                                                    background: 'var(--bg-tertiary)',
                                                    borderRadius: 'var(--radius-md)',
                                                    display: 'flex',
                                                    gap: '0.75rem',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        background: interaction.aiGenerated ? 'var(--accent-glow)' : 'var(--bg-hover)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: interaction.aiGenerated ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {getInteractionIcon(interaction.type)}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            marginBottom: '0.25rem',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontSize: '0.75rem',
                                                                color: 'var(--text-tertiary)',
                                                                textTransform: 'capitalize',
                                                            }}
                                                        >
                                                            {interaction.type} · {interaction.direction === 'entrante' ? 'Recibido' : 'Enviado'}
                                                            {interaction.aiGenerated && ' · IA'}
                                                        </span>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                                            {formatDateTime(interaction.timestamp)}
                                                        </span>
                                                    </div>
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                                        {interaction.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'notas' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Add Note Form */}
                                    <div className="card">
                                        <h4
                                            style={{
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                color: 'var(--text-primary)',
                                                marginBottom: '0.75rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                            }}
                                        >
                                            <Plus size={16} strokeWidth={1.5} />
                                            Agregar Nota
                                        </h4>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                            {(['general', 'conversacion', 'solicitud', 'recordatorio'] as const).map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setNoteType(type)}
                                                    style={{
                                                        padding: '0.375rem 0.75rem',
                                                        fontSize: '0.75rem',
                                                        borderRadius: 'var(--radius-sm)',
                                                        border: 'none',
                                                        background: noteType === type ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                                        color: noteType === type ? 'white' : 'var(--text-secondary)',
                                                        cursor: 'pointer',
                                                        textTransform: 'capitalize',
                                                    }}
                                                >
                                                    {type === 'conversacion' ? 'Conversación' : type}
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Escribe una nota sobre este lead... (ej: pidió descuento, interesado en X servicio)"
                                            className="input"
                                            rows={3}
                                            style={{ resize: 'vertical', marginBottom: '0.75rem' }}
                                        />
                                        <button
                                            onClick={() => {
                                                if (newNote.trim()) {
                                                    setNotes((prev) => [
                                                        {
                                                            id: Date.now().toString(),
                                                            content: newNote.trim(),
                                                            createdAt: new Date(),
                                                            type: noteType,
                                                        },
                                                        ...prev,
                                                    ]);
                                                    setNewNote('');
                                                }
                                            }}
                                            className="btn-primary"
                                            disabled={!newNote.trim()}
                                        >
                                            <Plus size={14} strokeWidth={1.5} />
                                            Guardar Nota
                                        </button>
                                    </div>

                                    {/* Notes List */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {notes.length === 0 ? (
                                            <p
                                                style={{
                                                    color: 'var(--text-tertiary)',
                                                    fontSize: '0.875rem',
                                                    textAlign: 'center',
                                                    padding: '2rem',
                                                }}
                                            >
                                                No hay notas. Agrega una para recordar detalles importantes.
                                            </p>
                                        ) : (
                                            notes.map((note) => {
                                                const typeColors: Record<LeadNote['type'], string> = {
                                                    general: 'var(--text-tertiary)',
                                                    conversacion: 'var(--info)',
                                                    solicitud: 'var(--warning)',
                                                    recordatorio: 'var(--error)',
                                                };
                                                const typeLabels: Record<LeadNote['type'], string> = {
                                                    general: 'General',
                                                    conversacion: 'Conversación',
                                                    solicitud: 'Solicitud',
                                                    recordatorio: 'Recordatorio',
                                                };
                                                return (
                                                    <div
                                                        key={note.id}
                                                        style={{
                                                            padding: '1rem',
                                                            background: 'var(--bg-tertiary)',
                                                            borderRadius: 'var(--radius-md)',
                                                            borderLeft: `3px solid ${typeColors[note.type]}`,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                marginBottom: '0.5rem',
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontSize: '0.7rem',
                                                                    padding: '0.125rem 0.5rem',
                                                                    background: `${typeColors[note.type]}20`,
                                                                    color: typeColors[note.type],
                                                                    borderRadius: 'var(--radius-sm)',
                                                                    fontWeight: 500,
                                                                }}
                                                            >
                                                                {typeLabels[note.type]}
                                                            </span>
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                                                {formatDateTime(note.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                                            {note.content}
                                                        </p>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'calls' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <h4 style={{
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        color: 'var(--text-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}>
                                        <Video size={16} strokeWidth={1.5} />
                                        Videollamadas con {lead.nombre}
                                    </h4>

                                    {lead.meetings.length === 0 ? (
                                        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                                            <Video size={48} strokeWidth={1} color="var(--text-tertiary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                                                No hay videollamadas registradas
                                            </p>
                                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                                Agenda una cita desde el calendario para verla aquí
                                            </p>
                                        </div>
                                    ) : (
                                        lead.meetings.map((meeting, idx) => (
                                            <div key={idx} className="card">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                            <span style={{
                                                                padding: '0.25rem 0.5rem',
                                                                fontSize: '0.7rem',
                                                                background: meeting.status === 'completada' ? 'rgba(34, 197, 94, 0.2)' : 'var(--accent-glow)',
                                                                color: meeting.status === 'completada' ? 'var(--success)' : 'var(--accent-primary)',
                                                                borderRadius: 'var(--radius-sm)',
                                                                textTransform: 'capitalize',
                                                            }}>
                                                                {meeting.status}
                                                            </span>
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                                {formatDateTime(meeting.scheduledAt)}
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                                            Videollamada · {meeting.duration} min
                                                        </p>
                                                    </div>
                                                    {meeting.meetLink && (
                                                        <a
                                                            href={meeting.meetLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn-secondary"
                                                            style={{ fontSize: '0.75rem' }}
                                                        >
                                                            <Video size={12} />
                                                            Meet
                                                        </a>
                                                    )}
                                                </div>

                                                {/* Transcript Section */}
                                                {meeting.transcript ? (
                                                    <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                                            <FileText size={14} color="var(--success)" />
                                                            <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 500 }}>
                                                                Transcripción adjunta
                                                            </span>
                                                        </div>

                                                        {/* AI Analysis */}
                                                        {meeting.summary && (
                                                            <div style={{ marginBottom: '0.75rem' }}>
                                                                <p style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
                                                                    <Brain size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                                                    Resumen IA
                                                                </p>
                                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                                                    {meeting.summary}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {meeting.nextSteps && meeting.nextSteps.length > 0 && (
                                                            <div>
                                                                <p style={{ fontSize: '0.75rem', color: 'var(--warning)', marginBottom: '0.25rem' }}>
                                                                    Próximos pasos
                                                                </p>
                                                                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                                                    {meeting.nextSteps.map((step, i) => (
                                                                        <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                                            {step}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        <details style={{ marginTop: '0.75rem' }}>
                                                            <summary style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                                                                Ver transcripción completa
                                                            </summary>
                                                            <pre style={{
                                                                marginTop: '0.5rem',
                                                                padding: '0.75rem',
                                                                background: 'var(--bg-secondary)',
                                                                borderRadius: 'var(--radius-sm)',
                                                                fontSize: '0.75rem',
                                                                color: 'var(--text-secondary)',
                                                                whiteSpace: 'pre-wrap',
                                                                maxHeight: '200px',
                                                                overflow: 'auto',
                                                            }}>
                                                                {meeting.transcript}
                                                            </pre>
                                                        </details>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            border: '2px dashed var(--border-secondary)',
                                                            borderRadius: 'var(--radius-md)',
                                                            padding: '1rem',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        <Upload size={20} color="var(--text-tertiary)" style={{ marginBottom: '0.5rem' }} />
                                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                            Sin transcripción
                                                        </p>
                                                        <input
                                                            type="file"
                                                            accept=".txt,.vtt,.srt,.doc,.docx"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    // TODO: Process file and update meeting
                                                                    console.log('Upload transcript for meeting:', idx, file.name);
                                                                }
                                                            }}
                                                            style={{ display: 'none' }}
                                                            id={`transcript-upload-${idx}`}
                                                        />
                                                        <label
                                                            htmlFor={`transcript-upload-${idx}`}
                                                            className="btn-secondary"
                                                            style={{ fontSize: '0.75rem', cursor: 'pointer' }}
                                                        >
                                                            <Upload size={12} />
                                                            Subir Transcripción
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}

                                    {/* Demo meeting for testing */}
                                    {lead.meetings.length === 0 && (
                                        <div className="card" style={{ border: '1px dashed var(--accent-primary)' }}>
                                            <h5 style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '0.75rem' }}>
                                                💡 Demo: Cita con transcripción
                                            </h5>
                                            <div style={{
                                                border: '2px dashed var(--border-secondary)',
                                                borderRadius: 'var(--radius-md)',
                                                padding: '1rem',
                                                textAlign: 'center',
                                            }}>
                                                <Upload size={20} color="var(--text-tertiary)" style={{ marginBottom: '0.5rem' }} />
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                    Pega o sube la transcripción de Google Meet
                                                </p>
                                                <textarea
                                                    placeholder="Pega aquí la transcripción de la videollamada..."
                                                    className="input"
                                                    rows={4}
                                                    style={{ marginBottom: '0.75rem', resize: 'vertical' }}
                                                />
                                                <button className="btn-primary" style={{ width: '100%' }}>
                                                    <Brain size={14} />
                                                    Analizar con IA
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'insights' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Transcript Upload */}
                                    <div className="card">
                                        <h4
                                            style={{
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                color: 'var(--text-primary)',
                                                marginBottom: '0.75rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                            }}
                                        >
                                            <Upload size={16} strokeWidth={1.5} />
                                            Analizar Transcripción
                                        </h4>
                                        <div
                                            style={{
                                                border: '2px dashed var(--border-secondary)',
                                                borderRadius: 'var(--radius-md)',
                                                padding: '1.5rem',
                                                textAlign: 'center',
                                            }}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const file = e.dataTransfer.files[0];
                                                if (file) handleTranscriptUpload(file);
                                            }}
                                        >
                                            <input
                                                type="file"
                                                accept=".txt,.vtt,.srt"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleTranscriptUpload(file);
                                                }}
                                                style={{ display: 'none' }}
                                                id="transcript-upload"
                                            />
                                            <label
                                                htmlFor="transcript-upload"
                                                style={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                }}
                                            >
                                                <Video size={24} strokeWidth={1.5} color="var(--text-tertiary)" />
                                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                    Arrastra la transcripción de Google Meet
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                    .txt, .vtt, .srt
                                                </span>
                                            </label>
                                        </div>
                                        {isAnalyzing && (
                                            <p
                                                style={{
                                                    marginTop: '0.75rem',
                                                    fontSize: '0.875rem',
                                                    color: 'var(--accent-primary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                }}
                                            >
                                                <span className="animate-pulse">●</span>
                                                Analizando con IA...
                                            </p>
                                        )}
                                    </div>

                                    {/* Psych Profile */}
                                    {lead.psychProfile && (
                                        <div className="card">
                                            <h4
                                                style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    color: 'var(--text-primary)',
                                                    marginBottom: '0.75rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                }}
                                            >
                                                <Brain size={16} strokeWidth={1.5} />
                                                Perfil Psicológico
                                            </h4>
                                            <div
                                                style={{
                                                    padding: '0.75rem',
                                                    background: 'var(--accent-glow)',
                                                    borderRadius: 'var(--radius-md)',
                                                    marginBottom: '0.75rem',
                                                }}
                                            >
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                    Tipo dominante
                                                </span>
                                                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                                                    {psychTypeLabels[lead.psychProfile.dominantType]}
                                                </p>
                                            </div>
                                            <div style={{ marginBottom: '0.75rem' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                    Estrategia recomendada
                                                </span>
                                                <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                                    {lead.psychProfile.recommendedStrategy}
                                                </p>
                                            </div>
                                            {lead.psychProfile.closingTips.length > 0 && (
                                                <div>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                        Tips de cierre
                                                    </span>
                                                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                                        {lead.psychProfile.closingTips.map((tip, i) => (
                                                            <li
                                                                key={i}
                                                                style={{
                                                                    fontSize: '0.85rem',
                                                                    color: 'var(--text-secondary)',
                                                                    marginBottom: '0.25rem',
                                                                }}
                                                            >
                                                                {tip}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Detected Needs */}
                                    {lead.detectedNeeds.length > 0 && (
                                        <div className="card">
                                            <h4
                                                style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    color: 'var(--text-primary)',
                                                    marginBottom: '0.75rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                }}
                                            >
                                                <Target size={16} strokeWidth={1.5} />
                                                Necesidades Detectadas
                                            </h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                                {lead.detectedNeeds.map((need, i) => (
                                                    <span
                                                        key={i}
                                                        style={{
                                                            padding: '0.375rem 0.75rem',
                                                            background: 'var(--bg-tertiary)',
                                                            borderRadius: 'var(--radius-sm)',
                                                            fontSize: '0.8rem',
                                                            color: 'var(--text-secondary)',
                                                        }}
                                                    >
                                                        {need}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'quotes' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <button
                                        className="btn-primary"
                                        style={{ alignSelf: 'flex-start' }}
                                        onClick={() => {
                                            setEditingQuote(undefined);
                                            setShowQuoteEditor(true);
                                        }}
                                    >
                                        <FileText size={16} strokeWidth={1.5} />
                                        Generar Cotización
                                    </button>

                                    {lead.quotes.length === 0 ? (
                                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
                                            No hay cotizaciones
                                        </p>
                                    ) : (
                                        lead.quotes.map((quote) => (
                                            <div
                                                key={quote.id}
                                                className="card"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => {
                                                    setEditingQuote(quote);
                                                    setShowQuoteEditor(true);
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                    }}
                                                >
                                                    <div>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                            {formatDateTime(quote.createdAt)}
                                                        </p>
                                                        <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                            {formatCurrency(quote.total)}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className="status-pill"
                                                        style={{
                                                            background:
                                                                quote.status === 'aceptada'
                                                                    ? 'rgba(34, 197, 94, 0.1)'
                                                                    : 'var(--accent-glow)',
                                                            color:
                                                                quote.status === 'aceptada'
                                                                    ? 'var(--success)'
                                                                    : 'var(--accent-primary)',
                                                        }}
                                                    >
                                                        {quote.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - AI Assistant */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'var(--bg-tertiary)',
                            overflow: 'hidden',
                            minHeight: 0,
                        }}
                    >
                        <div
                            style={{
                                padding: '1rem',
                                borderBottom: '1px solid var(--border-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            <Brain size={18} strokeWidth={1.5} color="var(--accent-primary)" />
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Asistente Sniper
                            </h3>
                        </div>

                        {/* AI Suggestions - Proactive Panel */}
                        <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
                            <ProactiveSuggestionsPanel
                                lead={lead}
                                onActionExecuted={(actionId, actionLead) => {
                                    console.log('Action executed:', actionId, 'for lead:', actionLead.nombre || actionLead.name);

                                    const phone = actionLead.telefono || actionLead.phone;

                                    // Handle different actions
                                    switch (actionId) {
                                        case 'GENERATE_QUOTE':
                                            setShowQuoteEditor(true);
                                            setEditingQuote(undefined);
                                            break;

                                        case 'SEND_WHATSAPP':
                                        case 'SEND_FOLLOWUP':
                                        case 'SEND_CONFIRMATION':
                                        case 'SEND_REMINDER':
                                        case 'SEND_POST_CALL':
                                        case 'SEND_PROPOSAL_FOLLOWUP':
                                        case 'SEND_WELCOME':
                                        case 'SEND_NOSHOW_RECOVERY':
                                            if (phone) {
                                                window.open(`https://wa.me/${phone}`, '_blank');
                                            } else {
                                                alert('El lead no tiene número de teléfono registrado');
                                            }
                                            break;

                                        case 'SCHEDULE_MEETING':
                                        case 'AGENDAR_VIDEOLLAMADA':
                                            window.location.href = `/crm/calendario?leadId=${actionLead.id}`;
                                            break;

                                        case 'CALCULATE_SCORE':
                                            const baseScore = 30;
                                            const sourceBonus = (actionLead.source === 'meta_ads') ? 20 :
                                                (actionLead.source === 'referido') ? 25 : 10;
                                            const newScore = Math.min(100, baseScore + sourceBonus);
                                            onUpdateLead({ ...actionLead, leadScore: newScore });
                                            alert(`Score calculado: ${newScore}`);
                                            break;

                                        default:
                                            console.log('Unknown action:', actionId);
                                    }
                                }}
                            />
                        </div>

                        {/* Closing Strategy (below suggestions) */}
                        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-primary)' }}>
                            <div
                                style={{
                                    padding: '1rem',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-primary)',
                                }}
                            >
                                <p style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                                    💡 Estrategia de cierre
                                </p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                    {lead.psychProfile?.recommendedStrategy ||
                                        'Enfócate en mostrar resultados concretos y casos de éxito similares a su industria.'}
                                </p>
                            </div>
                        </div>

                        <div
                            style={{
                                padding: '1rem',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-primary)',
                                marginBottom: '0.75rem',
                            }}
                        >
                            <p style={{ fontSize: '0.75rem', color: 'var(--warning)', marginBottom: '0.5rem' }}>
                                Siguiente acción sugerida
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                Enviar mensaje de seguimiento con propuesta personalizada.
                            </p>
                        </div>

                        {/* Quick Actions */}
                        <div style={{ marginTop: '1rem' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                                Acciones rápidas
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                <button
                                    className="btn-secondary"
                                    style={{ justifyContent: 'flex-start' }}
                                    onClick={async () => {
                                        const phone = lead.telefono || lead.phone;
                                        const leadName = lead.nombre || lead.name || 'Cliente';
                                        if (phone) {
                                            const message = `¡Hola ${leadName}! 👋 Soy del equipo de GRAVITA Marketing. ¿Cómo estás? ¿Tienes un momento para platicar?`;
                                            try {
                                                const res = await fetch('/api/whatsapp/send', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ phone, message, leadName })
                                                });
                                                const result = await res.json();
                                                if (result.success) {
                                                    alert('✅ Mensaje enviado por WhatsApp!');
                                                } else if (result.fallback) {
                                                    window.open(`https://wa.me/${phone}`, '_blank');
                                                } else {
                                                    alert('❌ Error: ' + result.error);
                                                }
                                            } catch (e) {
                                                window.open(`https://wa.me/${phone}`, '_blank');
                                            }
                                        } else {
                                            alert('El lead no tiene número de teléfono registrado');
                                        }
                                    }}
                                >
                                    <MessageCircle size={14} strokeWidth={1.5} />
                                    Enviar WhatsApp
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{ justifyContent: 'flex-start' }}
                                    onClick={() => {
                                        window.location.href = `/crm/calendario?leadId=${lead.id}`;
                                    }}
                                >
                                    <Calendar size={14} strokeWidth={1.5} />
                                    Agendar llamada
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{ justifyContent: 'flex-start' }}
                                    onClick={() => {
                                        setShowQuoteEditor(true);
                                        setEditingQuote(undefined);
                                    }}
                                >
                                    <FileText size={14} strokeWidth={1.5} />
                                    Crear cotización
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* AI Chat Input */}
                    <div
                        style={{
                            padding: '1rem',
                            borderTop: '1px solid var(--border-primary)',
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Pregunta al asistente..."
                                className="input"
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button
                                style={{
                                    position: 'absolute',
                                    right: '0.5rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--accent-primary)',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                }}
                            >
                                <Send size={16} strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quote Editor Modal */}
            {showQuoteEditor && (
                <QuoteEditor
                    lead={lead}
                    quote={editingQuote}
                    onSave={(updatedQuote) => {
                        const updatedQuotes = editingQuote
                            ? lead.quotes.map(q => q.id === updatedQuote.id ? updatedQuote : q)
                            : [...lead.quotes, updatedQuote];
                        onUpdateLead({ ...lead, quotes: updatedQuotes });
                        setShowQuoteEditor(false);
                    }}
                    onApprove={(approvedQuote) => {
                        const updatedQuotes = editingQuote
                            ? lead.quotes.map(q => q.id === approvedQuote.id ? approvedQuote : q)
                            : [...lead.quotes, approvedQuote];
                        onUpdateLead({
                            ...lead,
                            quotes: updatedQuotes,
                            status: 'propuesta_enviada'
                        });
                        setShowQuoteEditor(false);

                        const phone = lead.telefono || lead.phone;
                        const email = lead.email;
                        const leadName = lead.nombre || lead.name || 'Cliente';

                        // Send via WhatsApp
                        if (phone) {
                            fetch('/api/quotes/send', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ phone, leadName, quote: approvedQuote })
                            })
                                .then(r => r.json())
                                .then(result => {
                                    if (result.success) {
                                        console.log('WhatsApp sent!');
                                    } else {
                                        console.log('WhatsApp failed:', result.error);
                                    }
                                });
                        }

                        // Send via Email with PDF
                        if (email) {
                            fetch('/api/quotes/email', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email, leadName, quote: approvedQuote })
                            })
                                .then(r => r.json())
                                .then(result => {
                                    if (result.success) {
                                        console.log('Email sent!');
                                    } else {
                                        console.log('Email failed:', result.error);
                                    }
                                });
                        }

                        // Show success message
                        const channels = [];
                        if (phone) channels.push('WhatsApp');
                        if (email) channels.push('Email');
                        if (channels.length > 0) {
                            alert(`✅ Cotización enviada por ${channels.join(' y ')}`);
                        } else {
                            alert('⚠️ Cotización aprobada pero el lead no tiene teléfono ni email.');
                        }
                    }}
                    onClose={() => setShowQuoteEditor(false)}
                />
            )}

            {/* Edit Lead Modal */}
            {showEditModal && (
                <EditLeadModal
                    lead={lead}
                    onSave={(updatedLead) => {
                        onUpdateLead(updatedLead);
                        setShowEditModal(false);
                    }}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </>
    );
}
