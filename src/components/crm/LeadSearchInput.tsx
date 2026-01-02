'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, User, X, Building } from 'lucide-react';

export interface LeadOption {
    id: string;
    nombre: string;
    apellido?: string;
    empresa?: string;
    email?: string;
    telefono?: string;
}

interface LeadSearchInputProps {
    value: LeadOption | null;
    onChange: (lead: LeadOption | null) => void;
    placeholder?: string;
}

export function LeadSearchInput({ value, onChange, placeholder = "Buscar lead..." }: LeadSearchInputProps) {
    const [query, setQuery] = useState('');
    const [leads, setLeads] = useState<LeadOption[]>([]);
    const [filteredLeads, setFilteredLeads] = useState<LeadOption[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Load leads from API on mount
    useEffect(() => {
        const loadLeads = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/leads');
                if (response.ok) {
                    const data = await response.json();
                    if (data.leads && Array.isArray(data.leads)) {
                        const leadOptions: LeadOption[] = data.leads.map((lead: LeadOption & { company?: string; phone?: string }) => ({
                            id: lead.id,
                            nombre: lead.nombre || '',
                            apellido: lead.apellido || '',
                            empresa: lead.empresa || lead.company || '',
                            email: lead.email || '',
                            telefono: lead.telefono || lead.phone || '',
                        }));
                        setLeads(leadOptions);
                        setFilteredLeads(leadOptions);
                    }
                }
            } catch (error) {
                console.error('Error loading leads:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadLeads();
    }, []);

    // Filter leads based on query
    useEffect(() => {
        if (!query.trim()) {
            setFilteredLeads(leads.slice(0, 10)); // Show first 10 when empty
            return;
        }

        const searchTerms = query.toLowerCase().split(' ');
        const filtered = leads.filter((lead) => {
            const fullName = `${lead.nombre} ${lead.apellido || ''}`.toLowerCase();
            const empresa = (lead.empresa || '').toLowerCase();
            const email = (lead.email || '').toLowerCase();

            return searchTerms.every(term =>
                fullName.includes(term) ||
                empresa.includes(term) ||
                email.includes(term)
            );
        }).slice(0, 10); // Limit to 10 results

        setFilteredLeads(filtered);
    }, [query, leads]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (lead: LeadOption) => {
        onChange(lead);
        setQuery('');
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange(null);
        setQuery('');
    };

    // If a lead is selected, show it as a chip
    if (value) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 0.75rem',
                    background: 'var(--accent-glow)',
                    border: '1px solid var(--accent-primary)',
                    borderRadius: 'var(--radius-md)',
                }}
            >
                <User size={16} style={{ color: 'var(--accent-primary)' }} />
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {value.nombre} {value.apellido || ''}
                    </div>
                    {value.empresa && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            {value.empresa}
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleClear}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-tertiary)',
                        padding: '0.25rem',
                    }}
                >
                    <X size={16} />
                </button>
            </div>
        );
    }

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
                <Search
                    size={16}
                    style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-tertiary)',
                    }}
                />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="input"
                    style={{
                        width: '100%',
                        paddingLeft: '2.5rem',
                    }}
                />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '0.25rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                        maxHeight: '280px',
                        overflowY: 'auto',
                        zIndex: 100,
                    }}
                >
                    {isLoading ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                            Cargando leads...
                        </div>
                    ) : filteredLeads.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                            {query ? `No se encontraron leads para "${query}"` : 'No hay leads disponibles'}
                        </div>
                    ) : (
                        filteredLeads.map((lead) => (
                            <div
                                key={lead.id}
                                onClick={() => handleSelect(lead)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid var(--border-secondary)',
                                    transition: 'background 0.1s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--bg-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
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
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    {lead.nombre?.charAt(0)}{lead.apellido?.charAt(0) || ''}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                        {lead.nombre} {lead.apellido || ''}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {lead.empresa && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Building size={10} />
                                                {lead.empresa}
                                            </span>
                                        )}
                                        {lead.email && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                {lead.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
