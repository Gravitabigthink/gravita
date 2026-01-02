'use client';

import { useState } from 'react';
import { LeadSource } from '@/types/lead';
import { X, User, Mail, Phone, Building, Briefcase, Tag, DollarSign } from 'lucide-react';

interface AddLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: LeadFormData) => void;
}

export interface LeadFormData {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    empresa: string;
    cargo: string;
    source: LeadSource;
    potentialValue: number;
    tags: string[];
    notes: string;
}

const sourceOptions: { value: LeadSource; label: string }[] = [
    { value: 'meta_ads', label: 'Meta Ads' },
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'organico', label: 'Orgánico' },
    { value: 'referido', label: 'Referido' },
    { value: 'landing', label: 'Landing Page' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'manual', label: 'Manual' },
];

export function AddLeadModal({ isOpen, onClose, onSubmit }: AddLeadModalProps) {
    const [formData, setFormData] = useState<LeadFormData>({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        empresa: '',
        cargo: '',
        source: 'manual',
        potentialValue: 0,
        tags: [],
        notes: '',
    });
    const [tagInput, setTagInput] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '560px',
                    maxWidth: '95vw',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header - Fixed */}
                <div
                    style={{
                        padding: '1.25rem',
                        borderBottom: '1px solid var(--border-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexShrink: 0,
                    }}
                >
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Agregar Nuevo Lead
                    </h2>
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

                {/* Form - Scrollable */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            {/* Nombre */}
                            <div>
                                <label
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        fontSize: '0.8rem',
                                        color: 'var(--text-secondary)',
                                        marginBottom: '0.375rem',
                                    }}
                                >
                                    <User size={14} strokeWidth={1.5} />
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="input"
                                    required
                                    placeholder="Juan"
                                />
                            </div>

                            {/* Apellido */}
                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        fontSize: '0.8rem',
                                        color: 'var(--text-secondary)',
                                        marginBottom: '0.375rem',
                                    }}
                                >
                                    Apellido
                                </label>
                                <input
                                    type="text"
                                    value={formData.apellido}
                                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                    className="input"
                                    placeholder="Pérez"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.375rem',
                                }}
                            >
                                <Mail size={14} strokeWidth={1.5} />
                                Email *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input"
                                required
                                placeholder="juan@empresa.com"
                            />
                        </div>

                        {/* Teléfono */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.375rem',
                                }}
                            >
                                <Phone size={14} strokeWidth={1.5} />
                                Teléfono (WhatsApp) *
                            </label>
                            <input
                                type="tel"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                className="input"
                                required
                                placeholder="+52 55 1234 5678"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            {/* Empresa */}
                            <div>
                                <label
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        fontSize: '0.8rem',
                                        color: 'var(--text-secondary)',
                                        marginBottom: '0.375rem',
                                    }}
                                >
                                    <Building size={14} strokeWidth={1.5} />
                                    Empresa
                                </label>
                                <input
                                    type="text"
                                    value={formData.empresa}
                                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                                    className="input"
                                    placeholder="Nombre de la empresa"
                                />
                            </div>

                            {/* Cargo */}
                            <div>
                                <label
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        fontSize: '0.8rem',
                                        color: 'var(--text-secondary)',
                                        marginBottom: '0.375rem',
                                    }}
                                >
                                    <Briefcase size={14} strokeWidth={1.5} />
                                    Cargo
                                </label>
                                <input
                                    type="text"
                                    value={formData.cargo}
                                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                                    className="input"
                                    placeholder="Director, Gerente, etc."
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            {/* Fuente */}
                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        fontSize: '0.8rem',
                                        color: 'var(--text-secondary)',
                                        marginBottom: '0.375rem',
                                    }}
                                >
                                    Fuente
                                </label>
                                <select
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
                                    className="input"
                                    style={{ cursor: 'pointer' }}
                                >
                                    {sourceOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Valor potencial */}
                            <div>
                                <label
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        fontSize: '0.8rem',
                                        color: 'var(--text-secondary)',
                                        marginBottom: '0.375rem',
                                    }}
                                >
                                    <DollarSign size={14} strokeWidth={1.5} />
                                    Valor Potencial (MXN)
                                </label>
                                <input
                                    type="number"
                                    value={formData.potentialValue || ''}
                                    onChange={(e) => setFormData({ ...formData, potentialValue: Number(e.target.value) })}
                                    className="input"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.375rem',
                                }}
                            >
                                <Tag size={14} strokeWidth={1.5} />
                                Etiquetas
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                    className="input"
                                    placeholder="Agregar etiqueta..."
                                    style={{ flex: 1 }}
                                />
                                <button type="button" onClick={handleAddTag} className="btn-secondary">
                                    Agregar
                                </button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
                                    {formData.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                padding: '0.25rem 0.5rem',
                                                background: 'var(--accent-glow)',
                                                color: 'var(--accent-primary)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.8rem',
                                            }}
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--accent-primary)',
                                                    cursor: 'pointer',
                                                    padding: 0,
                                                    display: 'flex',
                                                }}
                                            >
                                                <X size={12} strokeWidth={2} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notas */}
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.375rem',
                                }}
                            >
                                Notas
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="input"
                                rows={2}
                                placeholder="Notas adicionales..."
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    {/* Actions - Fixed at bottom */}
                    <div
                        style={{
                            padding: '1rem 1.25rem',
                            borderTop: '1px solid var(--border-primary)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '0.75rem',
                            flexShrink: 0,
                            background: 'var(--bg-secondary)',
                        }}
                    >
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            Guardar Lead
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
