'use client';

import { useState } from 'react';
import { Lead } from '@/types/lead';
import { X, Save, User, Mail, Phone, Building, Tag, DollarSign } from 'lucide-react';

interface EditLeadModalProps {
    lead: Lead;
    onSave: (updatedLead: Lead) => void;
    onClose: () => void;
}

const statusOptions = [
    { value: 'nuevo', label: 'Nuevo' },
    { value: 'contactado', label: 'Contactado' },
    { value: 'agendado', label: 'Agendado' },
    { value: 'show', label: 'Show' },
    { value: 'no_show', label: 'No Show' },
    { value: 'propuesta_enviada', label: 'Propuesta Enviada' },
    { value: 'negociacion', label: 'Negociación' },
    { value: 'ganado', label: 'Ganado' },
    { value: 'perdido', label: 'Perdido' },
];

const sourceOptions = [
    { value: 'meta_ads', label: 'Meta Ads' },
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'landing', label: 'Landing Page' },
    { value: 'referido', label: 'Referido' },
    { value: 'organico', label: 'Orgánico' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'directo', label: 'Directo' },
];

export function EditLeadModal({ lead, onSave, onClose }: EditLeadModalProps) {
    const [formData, setFormData] = useState({
        nombre: lead.nombre || lead.name || '',
        apellido: lead.apellido || '',
        email: lead.email || '',
        telefono: lead.telefono || lead.phone || '',
        empresa: lead.empresa || '',
        status: lead.status || 'nuevo',
        source: lead.source || 'directo',
        potentialValue: lead.potentialValue || 0,
        leadScore: lead.leadScore || 50,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const updatedLead: Lead = {
            ...lead,
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            telefono: formData.telefono,
            empresa: formData.empresa,
            status: formData.status as Lead['status'],
            source: formData.source as Lead['source'],
            potentialValue: Number(formData.potentialValue),
            leadScore: Number(formData.leadScore),
            updatedAt: new Date(),
        };

        // Save to Firestore
        try {
            const response = await fetch(`/api/leads/${lead.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedLead),
            });

            if (response.ok) {
                onSave(updatedLead);
                onClose();
            } else {
                // If API fails, still update locally
                onSave(updatedLead);
                onClose();
            }
        } catch (error) {
            console.error('Error saving lead:', error);
            // Update locally anyway
            onSave(updatedLead);
            onClose();
        }

        setIsSaving(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '500px',
                    maxWidth: '95vw',
                    maxHeight: '90vh',
                    overflow: 'auto',
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
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Editar Lead
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

                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                            <User size={14} />
                            Nombre *
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => handleChange('nombre', e.target.value)}
                                className="input"
                                placeholder="Nombre"
                                required
                                style={{ flex: 1 }}
                            />
                            <input
                                type="text"
                                value={formData.apellido}
                                onChange={(e) => handleChange('apellido', e.target.value)}
                                className="input"
                                placeholder="Apellido"
                                style={{ flex: 1 }}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                            <Mail size={14} />
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="input"
                            placeholder="correo@ejemplo.com"
                        />
                    </div>

                    {/* Phone */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                            <Phone size={14} />
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            value={formData.telefono}
                            onChange={(e) => handleChange('telefono', e.target.value)}
                            className="input"
                            placeholder="524921234567"
                        />
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                            Formato WhatsApp: código país + número (ej: 524921234567)
                        </p>
                    </div>

                    {/* Company */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                            <Building size={14} />
                            Empresa
                        </label>
                        <input
                            type="text"
                            value={formData.empresa}
                            onChange={(e) => handleChange('empresa', e.target.value)}
                            className="input"
                            placeholder="Nombre de la empresa"
                        />
                    </div>

                    {/* Status & Source */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                <Tag size={14} />
                                Estado
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="input"
                            >
                                {statusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                Fuente
                            </label>
                            <select
                                value={formData.source}
                                onChange={(e) => handleChange('source', e.target.value)}
                                className="input"
                            >
                                {sourceOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Value & Score */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                <DollarSign size={14} />
                                Valor potencial
                            </label>
                            <input
                                type="number"
                                value={formData.potentialValue}
                                onChange={(e) => handleChange('potentialValue', e.target.value)}
                                className="input"
                                placeholder="0"
                                min="0"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                Lead Score (0-100)
                            </label>
                            <input
                                type="number"
                                value={formData.leadScore}
                                onChange={(e) => handleChange('leadScore', e.target.value)}
                                className="input"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSaving}>
                            <Save size={16} strokeWidth={1.5} />
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
