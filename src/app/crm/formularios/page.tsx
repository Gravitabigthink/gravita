'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import {
    Plus,
    ClipboardList,
    Calendar,
    Eye,
    Edit2,
    Trash2,
    Copy,
    Link2,
    MoreVertical,
    CheckCircle,
    Users,
    BarChart3,
    Code,
    X,
} from 'lucide-react';
import { getForms, saveForms, Form, FormField } from '@/lib/formStorage';
import { getActiveCalendars, Calendar as CalendarType } from '@/lib/calendarStorage';

export default function FormulariosPage() {
    const [forms, setForms] = useState<Form[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingForm, setEditingForm] = useState<Form | null>(null);
    const [selectedForm, setSelectedForm] = useState<Form | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft'>('all');
    const [embedForm, setEmbedForm] = useState<Form | null>(null);

    // Load forms from localStorage on mount
    useEffect(() => {
        setForms(getForms());
    }, []);

    // Save forms whenever they change
    const updateForms = (newForms: Form[]) => {
        setForms(newForms);
        saveForms(newForms);
    };

    // Handle form save (create or update)
    const handleSaveForm = (form: Form) => {
        if (editingForm) {
            // Update existing form
            updateForms(forms.map(f => f.id === form.id ? form : f));
        } else {
            // Create new form
            updateForms([form, ...forms]);
        }
        setShowCreateModal(false);
        setEditingForm(null);
    };

    // Handle edit form
    const handleEditForm = (form: Form) => {
        setEditingForm(form);
        setShowCreateModal(true);
    };

    // Handle delete form
    const handleDeleteForm = (formId: string) => {
        if (confirm('¿Estás seguro de eliminar este formulario?')) {
            updateForms(forms.filter(f => f.id !== formId));
        }
    };

    const filteredForms = forms.filter((form) => {
        if (activeTab === 'all') return true;
        return form.status === activeTab;
    });

    const getStatusColor = (status: Form['status']) => {
        switch (status) {
            case 'active':
                return 'var(--success)';
            case 'draft':
                return 'var(--warning)';
            case 'archived':
                return 'var(--text-tertiary)';
        }
    };

    const getStatusLabel = (status: Form['status']) => {
        switch (status) {
            case 'active':
                return 'Activo';
            case 'draft':
                return 'Borrador';
            case 'archived':
                return 'Archivado';
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
                            Formularios
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Crea formularios de pre-calificación y vincúlalos a tus calendarios
                        </p>
                    </div>
                    <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                        <Plus size={16} strokeWidth={1.5} />
                        Nuevo Formulario
                    </button>
                </div>

                {/* Stats Cards */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                    }}
                >
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--accent-glow)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--accent-primary)',
                                }}
                            >
                                <ClipboardList size={20} />
                            </div>
                            <div>
                                <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {forms.length}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                    Formularios
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'rgba(34, 197, 94, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--success)',
                                }}
                            >
                                <Users size={20} />
                            </div>
                            <div>
                                <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {forms.reduce((acc, f) => acc + f.responses, 0)}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                    Respuestas totales
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'rgba(14, 165, 233, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--info)',
                                }}
                            >
                                <BarChart3 size={20} />
                            </div>
                            <div>
                                <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {forms.filter((f) => f.status === 'active').length}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                    Activos
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div
                    style={{
                        display: 'flex',
                        gap: '0.25rem',
                        marginBottom: '1rem',
                        borderBottom: '1px solid var(--border-primary)',
                    }}
                >
                    {[
                        { id: 'all', label: 'Todos' },
                        { id: 'active', label: 'Activos' },
                        { id: 'draft', label: 'Borradores' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            style={{
                                padding: '0.75rem 1rem',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                marginBottom: '-1px',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Forms Grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '1rem',
                    }}
                >
                    {filteredForms.map((form) => (
                        <div
                            key={form.id}
                            className="card"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedForm(form)}
                        >
                            {/* Form Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span
                                            style={{
                                                padding: '0.25rem 0.5rem',
                                                fontSize: '0.7rem',
                                                background: `${getStatusColor(form.status)}20`,
                                                color: getStatusColor(form.status),
                                                borderRadius: 'var(--radius-sm)',
                                            }}
                                        >
                                            {getStatusLabel(form.status)}
                                        </span>
                                        {form.linkedCalendar && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--info)' }}>
                                                <Calendar size={12} />
                                                Vinculado
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {form.name}
                                    </h3>
                                </div>
                                <button
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-tertiary)',
                                        cursor: 'pointer',
                                        padding: '0.25rem',
                                    }}
                                >
                                    <MoreVertical size={16} />
                                </button>
                            </div>

                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                {form.description}
                            </p>

                            {/* Form Stats */}
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    padding: '0.75rem',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {form.responses}
                                    </p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Respuestas</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--success)' }}>
                                        {form.conversionRate}%
                                    </p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Conversión</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {form.fields.length}
                                    </p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Campos</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button
                                    className="btn-secondary"
                                    style={{ flex: 1, fontSize: '0.75rem' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Open form preview in new tab
                                        window.open(`/form/${form.id}`, '_blank');
                                    }}
                                >
                                    <Eye size={14} />
                                    Ver
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{ flex: 1, fontSize: '0.75rem' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditForm(form);
                                    }}
                                >
                                    <Edit2 size={14} />
                                    Editar
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{ flex: 1, fontSize: '0.75rem' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Copy form link to clipboard
                                        const formUrl = `${window.location.origin}/form/${form.id}`;
                                        navigator.clipboard.writeText(formUrl).then(() => {
                                            alert(`Link copiado: ${formUrl}`);
                                        });
                                    }}
                                >
                                    <Link2 size={14} />
                                    Link
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{ flex: 1, fontSize: '0.75rem' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEmbedForm(form);
                                    }}
                                >
                                    <Code size={14} />
                                    Embed
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{ fontSize: '0.75rem', color: 'var(--error)' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteForm(form.id);
                                    }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Create New Card */}
                    <div
                        className="card"
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '200px',
                            border: '2px dashed var(--border-secondary)',
                            cursor: 'pointer',
                            background: 'transparent',
                        }}
                    >
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'var(--accent-glow)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--accent-primary)',
                                marginBottom: '0.75rem',
                            }}
                        >
                            <Plus size={24} />
                        </div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                            Crear nuevo formulario
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            Pre-califica tus leads automáticamente
                        </p>
                    </div>
                </div>
            </main>

            {/* Create/Edit Form Modal */}
            {showCreateModal && (
                <CreateFormModal
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingForm(null);
                    }}
                    onSave={handleSaveForm}
                    editingForm={editingForm}
                />
            )}

            {/* Form Detail Modal */}
            {selectedForm && (
                <FormDetailModal
                    form={selectedForm}
                    onClose={() => setSelectedForm(null)}
                />
            )}

            {/* Embed Code Modal */}
            {embedForm && (
                <div className="modal-overlay" onClick={() => setEmbedForm(null)}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '600px', maxWidth: '95vw' }}
                    >
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Código Embed - {embedForm.name}
                            </h2>
                            <button onClick={() => setEmbedForm(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '1.25rem' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                Copia y pega este código en tu landing page para embeber el formulario.
                                Cuando un lead complete el formulario, aparecerá automáticamente en tu CRM.
                            </p>

                            <div style={{ marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                                    Opción 1: iFrame (Recomendado)
                                </h4>
                                <div style={{ position: 'relative' }}>
                                    <pre style={{
                                        background: 'var(--bg-tertiary)',
                                        border: '1px solid var(--border-secondary)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '1rem',
                                        fontSize: '0.75rem',
                                        color: 'var(--text-primary)',
                                        overflow: 'auto',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-all',
                                    }}>
                                        {`<iframe
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/form/${embedForm.id}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 12px;">
</iframe>`}
                                    </pre>
                                    <button
                                        className="btn-secondary"
                                        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                                        onClick={() => {
                                            const code = `<iframe src="${window.location.origin}/form/${embedForm.id}" width="100%" height="600" frameborder="0" style="border: none; border-radius: 12px;"></iframe>`;
                                            navigator.clipboard.writeText(code);
                                            alert('Código copiado!');
                                        }}
                                    >
                                        <Copy size={12} />
                                        Copiar
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                                    Opción 2: Link Directo
                                </h4>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                        readOnly
                                        className="input"
                                        value={typeof window !== 'undefined' ? `${window.location.origin}/form/${embedForm.id}` : `/form/${embedForm.id}`}
                                        style={{ fontSize: '0.8rem', flex: 1 }}
                                    />
                                    <button
                                        className="btn-primary"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/form/${embedForm.id}`);
                                            alert('Link copiado!');
                                        }}
                                    >
                                        <Copy size={14} />
                                        Copiar
                                    </button>
                                </div>
                            </div>

                            <div style={{ background: 'var(--accent-glow)', padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                                    💡 Los leads que completen este formulario aparecerán en tu CRM automáticamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Create/Edit Form Modal Component
function CreateFormModal({
    onClose,
    onSave,
    editingForm,
}: {
    onClose: () => void;
    onSave: (form: Form) => void;
    editingForm: Form | null;
}) {
    const isEditing = !!editingForm;
    const [step, setStep] = useState(1);
    const [formName, setFormName] = useState(editingForm?.name || '');
    const [formDescription, setFormDescription] = useState(editingForm?.description || '');
    const [formStatus, setFormStatus] = useState<Form['status']>(editingForm?.status || 'draft');
    const [fields, setFields] = useState<FormField[]>(
        editingForm?.fields || [
            { id: '1', type: 'text', label: 'Nombre completo', required: true },
            { id: '2', type: 'email', label: 'Correo electrónico', required: true },
            { id: '3', type: 'phone', label: 'WhatsApp', required: true },
        ]
    );
    const [linkedCalendar, setLinkedCalendar] = useState(editingForm?.linkedCalendar || '');

    const fieldTypes = [
        { type: 'text', label: 'Texto', icon: '📝' },
        { type: 'email', label: 'Email', icon: '✉️' },
        { type: 'phone', label: 'Teléfono', icon: '📱' },
        { type: 'select', label: 'Selección', icon: '📋' },
        { type: 'textarea', label: 'Texto largo', icon: '📄' },
        { type: 'budget', label: 'Presupuesto', icon: '💰' },
        { type: 'rating', label: 'Calificación', icon: '⭐' },
    ];

    const addField = (type: FormField['type']) => {
        const newField: FormField = {
            id: Date.now().toString(),
            type,
            label: `Nuevo campo ${type}`,
            required: false,
            options: type === 'select' || type === 'budget' ? ['Opción 1', 'Opción 2'] : undefined,
        };
        setFields([...fields, newField]);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    };

    const removeField = (id: string) => {
        setFields(fields.filter((f) => f.id !== id));
    };

    const handleSave = () => {
        const formToSave: Form = {
            id: editingForm?.id || Date.now().toString(),
            name: formName,
            description: formDescription,
            fields,
            linkedCalendar: linkedCalendar || undefined,
            status: formStatus,
            createdAt: editingForm?.createdAt || new Date(),
            responses: editingForm?.responses || 0,
            conversionRate: editingForm?.conversionRate || 0,
        };
        onSave(formToSave);
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
            }}
            onClick={onClose}
        >
            <div
                className="card"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '700px',
                    maxHeight: '85vh',
                    overflow: 'auto',
                }}
            >
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {isEditing ? 'Editar formulario' : (step === 1 ? 'Información del formulario' : step === 2 ? 'Agregar campos' : 'Vincular calendario')}
                        </h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                            {isEditing ? `Editando: ${formName || 'Sin nombre'}` : `Paso ${step} de 3`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
                    >
                        ×
                    </button>
                </div>

                {/* Progress */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            style={{
                                flex: 1,
                                height: '4px',
                                borderRadius: '2px',
                                background: s <= step ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                            }}
                        />
                    ))}
                </div>

                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                Nombre del formulario *
                            </label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Ej: Formulario de calificación"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                Descripción
                            </label>
                            <textarea
                                className="input"
                                placeholder="¿Para qué se usará este formulario?"
                                rows={3}
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                Estado
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setFormStatus('active')}
                                    style={{
                                        flex: 1,
                                        padding: '0.625rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: formStatus === 'active' ? '2px solid var(--success)' : '1px solid var(--border-secondary)',
                                        background: formStatus === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
                                        color: formStatus === 'active' ? 'var(--success)' : 'var(--text-tertiary)',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    ✓ Activo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormStatus('draft')}
                                    style={{
                                        flex: 1,
                                        padding: '0.625rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: formStatus === 'draft' ? '2px solid var(--warning)' : '1px solid var(--border-secondary)',
                                        background: formStatus === 'draft' ? 'rgba(234, 179, 8, 0.1)' : 'var(--bg-secondary)',
                                        color: formStatus === 'draft' ? 'var(--warning)' : 'var(--text-tertiary)',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    📝 Borrador
                                </button>
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.375rem' }}>
                                Solo los formularios activos son accesibles públicamente
                            </p>
                        </div>
                    </div>
                )}


                {/* Step 2: Fields */}
                {step === 2 && (
                    <div>
                        {/* Add Field Buttons */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                            {fieldTypes.map((ft) => (
                                <button
                                    key={ft.type}
                                    onClick={() => addField(ft.type as FormField['type'])}
                                    className="btn-secondary"
                                    style={{ fontSize: '0.75rem' }}
                                >
                                    {ft.icon} {ft.label}
                                </button>
                            ))}
                        </div>

                        {/* Fields List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {fields.map((field, idx) => (
                                <div
                                    key={field.id}
                                    style={{
                                        padding: '1rem',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-primary)',
                                    }}
                                >
                                    {/* Field Header Row */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 600 }}>{idx + 1}</span>
                                        <input
                                            type="text"
                                            className="input"
                                            value={field.label}
                                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                                            placeholder="Nombre del campo"
                                            style={{ flex: 1 }}
                                        />
                                        <span style={{
                                            fontSize: '0.7rem',
                                            color: 'var(--accent-primary)',
                                            padding: '0.25rem 0.5rem',
                                            background: 'var(--accent-glow)',
                                            borderRadius: 'var(--radius-sm)',
                                            fontWeight: 500
                                        }}>
                                            {field.type}
                                        </span>
                                        <button
                                            onClick={() => removeField(field.id)}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '0.25rem' }}
                                            title="Eliminar campo"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    {/* Field Options Row */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: (field.type === 'select' || field.type === 'budget') ? '0.5rem' : 0 }}>
                                        {/* Required Toggle */}
                                        <label
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.8rem',
                                                color: field.required ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                                                cursor: 'pointer',
                                                padding: '0.375rem 0.75rem',
                                                background: field.required ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                                                borderRadius: 'var(--radius-sm)',
                                                border: field.required ? '1px solid var(--accent-primary)' : '1px solid var(--border-secondary)',
                                                transition: 'all 0.15s ease',
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={field.required}
                                                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                style={{ display: 'none' }}
                                            />
                                            <span style={{
                                                width: '14px',
                                                height: '14px',
                                                borderRadius: '3px',
                                                background: field.required ? 'var(--accent-primary)' : 'transparent',
                                                border: field.required ? 'none' : '2px solid var(--text-tertiary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '10px',
                                            }}>
                                                {field.required && '✓'}
                                            </span>
                                            Obligatorio
                                        </label>

                                        {/* Placeholder input for text fields */}
                                        {(field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'textarea') && (
                                            <input
                                                type="text"
                                                className="input"
                                                value={field.placeholder || ''}
                                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                                placeholder="Texto de ayuda (placeholder)"
                                                style={{ flex: 1, fontSize: '0.8rem' }}
                                            />
                                        )}
                                    </div>

                                    {/* Options Editor for select/budget types */}
                                    {(field.type === 'select' || field.type === 'budget') && (
                                        <div style={{
                                            marginTop: '0.5rem',
                                            padding: '0.75rem',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px dashed var(--border-secondary)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                                    📋 Opciones (una por línea)
                                                </label>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.scorable || false}
                                                        onChange={(e) => updateField(field.id, { scorable: e.target.checked, scoreWeight: e.target.checked ? 25 : undefined })}
                                                    />
                                                    Usar para scoring
                                                </label>
                                            </div>
                                            <textarea
                                                className="input"
                                                value={(field.options || []).join('\n')}
                                                onChange={(e) => {
                                                    const options = e.target.value.split('\n');
                                                    updateField(field.id, { options: options.length > 0 ? options : ['Opción 1'] });
                                                }}
                                                onKeyDown={(e) => {
                                                    // Allow Enter to create new lines without submitting
                                                    if (e.key === 'Enter') {
                                                        e.stopPropagation();
                                                    }
                                                }}
                                                placeholder={field.type === 'budget'
                                                    ? "Menos de $10,000\n$10,000 - $25,000\n$25,000 - $50,000\nMás de $50,000"
                                                    : "Opción 1\nOpción 2\nOpción 3"}
                                                rows={4}
                                                style={{
                                                    width: '100%',
                                                    fontSize: '0.8rem',
                                                    fontFamily: 'monospace',
                                                    resize: 'vertical'
                                                }}
                                            />
                                            {field.scorable && (
                                                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                                        Peso del score:
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="input"
                                                        value={field.scoreWeight || 25}
                                                        onChange={(e) => updateField(field.id, { scoreWeight: parseInt(e.target.value) || 25 })}
                                                        min={1}
                                                        max={100}
                                                        style={{ width: '70px', fontSize: '0.8rem', padding: '0.375rem 0.5rem' }}
                                                    />
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>%</span>
                                                </div>
                                            )}
                                            <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                                                💡 {field.type === 'budget' ? 'Las primeras opciones indican mayor presupuesto y dan más puntos.' : 'Las primeras opciones dan más puntos si el scoring está activo.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* Step 3: Link Calendar */}
                {step === 3 && (
                    <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Vincula este formulario a un calendario para que los leads puedan agendar una cita después de llenar el formulario.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {/* Dynamic calendars from storage */}
                            {getActiveCalendars().map((cal) => (
                                <label
                                    key={cal.id}
                                    style={{
                                        padding: '1rem',
                                        background: linkedCalendar === cal.id ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                                        border: linkedCalendar === cal.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="calendar"
                                        value={cal.id}
                                        checked={linkedCalendar === cal.id}
                                        onChange={(e) => setLinkedCalendar(e.target.value)}
                                        style={{ display: 'none' }}
                                    />
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        background: cal.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Calendar size={18} color="white" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{cal.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                            {cal.availability.slotDuration} min • {cal.availability.days.length} días disponibles
                                        </p>
                                    </div>
                                    {linkedCalendar === cal.id && (
                                        <CheckCircle size={20} color="var(--accent-primary)" />
                                    )}
                                </label>
                            ))}

                            {/* No calendar option */}
                            <label
                                style={{
                                    padding: '1rem',
                                    background: linkedCalendar === '' ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                                    border: linkedCalendar === '' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                }}
                            >
                                <input
                                    type="radio"
                                    name="calendar"
                                    value=""
                                    checked={linkedCalendar === ''}
                                    onChange={(e) => setLinkedCalendar(e.target.value)}
                                    style={{ display: 'none' }}
                                />
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    background: 'var(--bg-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-tertiary)'
                                }}>
                                    ✗
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>Sin calendario</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Solo recolectar información</p>
                                </div>
                            </label>

                            {/* Link to create calendar */}
                            {getActiveCalendars().length === 0 && (
                                <div style={{
                                    padding: '1rem',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'center',
                                }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                        No tienes calendarios configurados
                                    </p>
                                    <a
                                        href="/crm/calendarios/configuracion"
                                        style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}
                                    >
                                        Configurar calendarios →
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                    <button
                        className="btn-secondary"
                        onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
                    >
                        {step > 1 ? 'Anterior' : 'Cancelar'}
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => (step < 3 ? setStep(step + 1) : handleSave())}
                        disabled={step === 1 && !formName}
                    >
                        {step < 3 ? 'Siguiente' : (isEditing ? 'Guardar Cambios' : 'Crear Formulario')}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Form Detail Modal
function FormDetailModal({ form, onClose }: { form: Form; onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<'preview' | 'responses' | 'settings'>('preview');

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
            }}
            onClick={onClose}
        >
            <div
                className="card"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '85vh',
                    overflow: 'auto',
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {form.name}
                        </h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{form.description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
                    >
                        ×
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--border-primary)', marginBottom: '1rem' }}>
                    {[
                        { id: 'preview', label: 'Vista previa' },
                        { id: 'responses', label: `Respuestas (${form.responses})` },
                        { id: 'settings', label: 'Configuración' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            style={{
                                padding: '0.75rem 1rem',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                marginBottom: '-1px',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Preview Tab */}
                {activeTab === 'preview' && (
                    <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', textAlign: 'center' }}>
                            {form.name}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {form.fields.map((field) => (
                                <div key={field.id}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                        {field.label} {field.required && <span style={{ color: 'var(--error)' }}>*</span>}
                                    </label>
                                    {field.type === 'select' ? (
                                        <select className="input" disabled>
                                            <option>Selecciona una opción</option>
                                            {field.options?.map((opt) => (
                                                <option key={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : field.type === 'textarea' ? (
                                        <textarea className="input" rows={3} disabled placeholder={field.placeholder} />
                                    ) : (
                                        <input type={field.type} className="input" disabled placeholder={field.placeholder} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled>
                            Enviar
                        </button>
                    </div>
                )}

                {/* Responses Tab */}
                {activeTab === 'responses' && (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <Users size={48} color="var(--text-tertiary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {form.responses} respuestas recibidas
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                            Las respuestas crean leads automáticamente en el Pipeline
                        </p>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                            <div>
                                <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>Estado</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Activa o desactiva el formulario</p>
                            </div>
                            <span style={{ padding: '0.5rem 1rem', background: `${form.status === 'active' ? 'var(--success)' : 'var(--warning)'}20`, color: form.status === 'active' ? 'var(--success)' : 'var(--warning)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                                {form.status === 'active' ? 'Activo' : 'Borrador'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-secondary" style={{ flex: 1 }}>
                                <Edit2 size={14} />
                                Editar
                            </button>
                            <button className="btn-secondary" style={{ flex: 1 }}>
                                <Copy size={14} />
                                Duplicar
                            </button>
                            <button className="btn-secondary" style={{ flex: 1, color: 'var(--error)' }}>
                                <Trash2 size={14} />
                                Eliminar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
