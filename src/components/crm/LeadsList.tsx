'use client';

import { useState } from 'react';
import { Lead } from '@/types/lead';
import { ProactiveBadge } from './ProactiveSuggestionsPanel';
import {
    Search,
    Filter,
    Download,
    Upload,
    MoreHorizontal,
    Phone,
    Mail,
    Building,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Zap,
} from 'lucide-react';

interface LeadsListProps {
    leads: Lead[];
    onLeadClick: (lead: Lead) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
    }).format(value);
};

const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--error)';
};

const statusLabels: Record<string, string> = {
    nuevo: 'Nuevo',
    contactado: 'Contactado',
    agendado: 'Agendado',
    show: 'Show',
    no_show: 'No Show',
    propuesta_enviada: 'Propuesta',
    negociacion: 'Negociación',
    ganado: 'Ganado',
    perdido: 'Perdido',
};

export function LeadsList({ leads, onLeadClick }: LeadsListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [sourceFilter, setSourceFilter] = useState<string[]>([]);
    const [scoreFilter, setScoreFilter] = useState<{ min: number; max: number }>({ min: 0, max: 100 });
    const itemsPerPage = 10;

    // Apply filters
    const filteredLeads = leads.filter((lead) => {
        const nombre = lead.nombre || lead.name || '';
        const email = lead.email || '';
        const empresa = lead.empresa || '';
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch =
            nombre.toLowerCase().includes(searchLower) ||
            email.toLowerCase().includes(searchLower) ||
            empresa.toLowerCase().includes(searchLower);

        const matchesStatus = statusFilter.length === 0 || statusFilter.includes(lead.status);
        const matchesSource = sourceFilter.length === 0 || (lead.source && sourceFilter.includes(lead.source));
        const matchesScore = (lead.leadScore || 0) >= scoreFilter.min && (lead.leadScore || 0) <= scoreFilter.max;

        return matchesSearch && matchesStatus && matchesSource && matchesScore;
    });

    // Export to CSV
    const handleExport = () => {
        const headers = ['Nombre', 'Apellido', 'Email', 'Teléfono', 'Empresa', 'Estado', 'Fuente', 'Score', 'Valor', 'Creado'];
        const rows = filteredLeads.map(lead => [
            lead.nombre,
            lead.apellido || '',
            lead.email,
            lead.telefono,
            lead.empresa || '',
            lead.status,
            lead.source,
            lead.leadScore?.toString() || '',
            lead.potentialValue?.toString() || '',
            formatDate(lead.createdAt),
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Import from CSV
    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const content = evt.target?.result as string;
                    const lines = content.split('\n');
                    const imported = lines.slice(1).filter(line => line.trim()).length;
                    alert(`✅ Se importarían ${imported} leads.\n\n(Funcionalidad de importación requiere integración con backend)`);
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    // Clear all filters
    const clearFilters = () => {
        setStatusFilter([]);
        setSourceFilter([]);
        setScoreFilter({ min: 0, max: 100 });
        setSearchTerm('');
    };

    const activeFiltersCount = statusFilter.length + sourceFilter.length + (scoreFilter.min > 0 || scoreFilter.max < 100 ? 1 : 0);

    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Toolbar */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                }}
            >
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search
                        size={16}
                        strokeWidth={1.5}
                        style={{
                            position: 'absolute',
                            left: '0.875rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-tertiary)',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Buscar leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input"
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-secondary" onClick={() => setShowFilterModal(true)} style={{ position: 'relative' }}>
                        <Filter size={16} strokeWidth={1.5} />
                        Filtros
                        {activeFiltersCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-6px',
                                right: '-6px',
                                background: 'var(--accent-primary)',
                                color: 'white',
                                fontSize: '0.65rem',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                            }}>
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                    <button className="btn-secondary" onClick={handleExport}>
                        <Download size={16} strokeWidth={1.5} />
                        Exportar
                    </button>
                    <button className="btn-secondary" onClick={handleImport}>
                        <Upload size={16} strokeWidth={1.5} />
                        Importar
                    </button>
                </div>
            </div>

            {/* Table */}
            <div
                className="card"
                style={{ padding: 0, overflow: 'hidden' }}
            >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                            <th
                                style={{
                                    padding: '0.875rem 1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: 'var(--text-tertiary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}>
                                    Lead
                                    <ArrowUpDown size={12} strokeWidth={1.5} />
                                </div>
                            </th>
                            <th
                                style={{
                                    padding: '0.875rem 1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: 'var(--text-tertiary)',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Contacto
                            </th>
                            <th
                                style={{
                                    padding: '0.875rem 1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: 'var(--text-tertiary)',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Estado
                            </th>
                            <th
                                style={{
                                    padding: '0.875rem 1rem',
                                    textAlign: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: 'var(--text-tertiary)',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Score
                            </th>
                            <th
                                style={{
                                    padding: '0.875rem 1rem',
                                    textAlign: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: 'var(--text-tertiary)',
                                    textTransform: 'uppercase',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}>
                                    <Zap size={12} />
                                    IA
                                </div>
                            </th>
                            <th
                                style={{
                                    padding: '0.875rem 1rem',
                                    textAlign: 'right',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: 'var(--text-tertiary)',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Valor
                            </th>
                            <th
                                style={{
                                    padding: '0.875rem 1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: 'var(--text-tertiary)',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Fuente
                            </th>
                            <th
                                style={{
                                    padding: '0.875rem 1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: 'var(--text-tertiary)',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Creado
                            </th>
                            <th style={{ padding: '0.875rem 1rem', width: '48px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLeads.map((lead) => (
                            <tr
                                key={lead.id}
                                onClick={() => onLeadClick(lead)}
                                style={{
                                    borderBottom: '1px solid var(--border-primary)',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--bg-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <td style={{ padding: '0.875rem 1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                background: 'var(--accent-glow)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--accent-primary)',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            {(lead.nombre || lead.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                                {lead.nombre || lead.name || 'Sin nombre'} {lead.apellido || ''}
                                            </div>
                                            {lead.empresa && (
                                                <div
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        color: 'var(--text-tertiary)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                    }}
                                                >
                                                    <Building size={12} strokeWidth={1.5} />
                                                    {lead.empresa}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '0.875rem 1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.375rem',
                                                fontSize: '0.8rem',
                                                color: 'var(--text-secondary)',
                                            }}
                                        >
                                            <Mail size={12} strokeWidth={1.5} />
                                            {lead.email || 'Sin email'}
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.375rem',
                                                fontSize: '0.8rem',
                                                color: 'var(--text-secondary)',
                                            }}
                                        >
                                            <Phone size={12} strokeWidth={1.5} />
                                            {lead.telefono || lead.phone || 'Sin teléfono'}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '0.875rem 1rem' }}>
                                    <span className="status-pill" style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)' }}>
                                        {statusLabels[lead.status] || lead.status}
                                    </span>
                                </td>
                                <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: `${getScoreColor(lead.leadScore)}20`,
                                            color: getScoreColor(lead.leadScore),
                                            fontWeight: 600,
                                            fontSize: '0.8rem',
                                        }}
                                    >
                                        {lead.leadScore}
                                    </div>
                                </td>
                                <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                                    <ProactiveBadge lead={lead} />
                                </td>
                                <td
                                    style={{
                                        padding: '0.875rem 1rem',
                                        textAlign: 'right',
                                        fontWeight: 500,
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    {lead.potentialValue ? formatCurrency(lead.potentialValue) : '-'}
                                </td>
                                <td style={{ padding: '0.875rem 1rem' }}>
                                    <span
                                        style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--text-secondary)',
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {(lead.source || 'directo').replace('_', ' ')}
                                    </span>
                                </td>
                                <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                    {formatDate(lead.createdAt)}
                                </td>
                                <td style={{ padding: '0.875rem 1rem' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-tertiary)',
                                            cursor: 'pointer',
                                            padding: '0.25rem',
                                        }}
                                    >
                                        <MoreHorizontal size={16} strokeWidth={1.5} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                }}
            >
                <span>
                    Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLeads.length)} de{' '}
                    {filteredLeads.length} leads
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="btn-secondary"
                        style={{ padding: '0.5rem' }}
                    >
                        <ChevronLeft size={16} strokeWidth={1.5} />
                    </button>
                    <span style={{ padding: '0 0.75rem' }}>
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="btn-secondary"
                        style={{ padding: '0.5rem' }}
                    >
                        <ChevronRight size={16} strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* Filter Modal */}
            {showFilterModal && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
                    onClick={() => setShowFilterModal(false)}
                >
                    <div className="card" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '450px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Filtrar Leads
                            </h2>
                            <button onClick={() => setShowFilterModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
                        </div>

                        {/* Status Filter */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Estado
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                {Object.entries(statusLabels).map(([key, label]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setStatusFilter(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key])}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: statusFilter.includes(key) ? '2px solid var(--accent-primary)' : '1px solid var(--border-secondary)',
                                            background: statusFilter.includes(key) ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                                            color: statusFilter.includes(key) ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Source Filter */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Fuente
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                {['meta_ads', 'google_ads', 'landing', 'referido', 'organico', 'whatsapp'].map((source) => (
                                    <button
                                        key={source}
                                        type="button"
                                        onClick={() => setSourceFilter(prev => prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source])}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: sourceFilter.includes(source) ? '2px solid var(--accent-primary)' : '1px solid var(--border-secondary)',
                                            background: sourceFilter.includes(source) ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                                            color: sourceFilter.includes(source) ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {source.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Score Range */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Score: {scoreFilter.min} - {scoreFilter.max}
                            </label>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={scoreFilter.min}
                                    onChange={(e) => setScoreFilter(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                                    className="input"
                                    style={{ width: '80px', textAlign: 'center' }}
                                />
                                <span style={{ color: 'var(--text-tertiary)' }}>-</span>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={scoreFilter.max}
                                    onChange={(e) => setScoreFilter(prev => ({ ...prev, max: parseInt(e.target.value) || 100 }))}
                                    className="input"
                                    style={{ width: '80px', textAlign: 'center' }}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button className="btn-secondary" onClick={clearFilters}>
                                Limpiar Filtros
                            </button>
                            <button className="btn-primary" onClick={() => setShowFilterModal(false)}>
                                Aplicar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
