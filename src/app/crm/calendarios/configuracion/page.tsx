'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import {
    Plus,
    Calendar,
    Clock,
    Users,
    Settings,
    Trash2,
    Edit2,
    ExternalLink,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { getCalendars, saveCalendars, Calendar as CalendarType, CalendarAvailability } from '@/lib/calendarStorage';

const DAYS_OF_WEEK = [
    { value: 0, label: 'Dom', fullLabel: 'Domingo' },
    { value: 1, label: 'Lun', fullLabel: 'Lunes' },
    { value: 2, label: 'Mar', fullLabel: 'Martes' },
    { value: 3, label: 'Mié', fullLabel: 'Miércoles' },
    { value: 4, label: 'Jue', fullLabel: 'Jueves' },
    { value: 5, label: 'Vie', fullLabel: 'Viernes' },
    { value: 6, label: 'Sáb', fullLabel: 'Sábado' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${i.toString().padStart(2, '0')}:00`,
}));

const COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
    '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#64748b'
];

export default function CalendarConfigPage() {
    const [calendars, setCalendars] = useState<CalendarType[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingCalendar, setEditingCalendar] = useState<CalendarType | null>(null);

    useEffect(() => {
        setCalendars(getCalendars());
    }, []);

    const updateCalendars = (newCalendars: CalendarType[]) => {
        setCalendars(newCalendars);
        saveCalendars(newCalendars);
    };

    const handleSave = (calendar: CalendarType) => {
        if (editingCalendar) {
            updateCalendars(calendars.map(c => c.id === calendar.id ? calendar : c));
        } else {
            updateCalendars([calendar, ...calendars]);
        }
        setShowModal(false);
        setEditingCalendar(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Eliminar este calendario?')) {
            updateCalendars(calendars.filter(c => c.id !== id));
        }
    };

    const handleEdit = (calendar: CalendarType) => {
        setEditingCalendar(calendar);
        setShowModal(true);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '1.5rem', marginLeft: '280px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Configuración de Calendarios
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Gestiona tus calendarios de citas y disponibilidad
                        </p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => {
                            setEditingCalendar(null);
                            setShowModal(true);
                        }}
                    >
                        <Plus size={18} />
                        Nuevo Calendario
                    </button>
                </div>

                {/* Calendars Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                    {calendars.map((cal) => (
                        <div
                            key={cal.id}
                            className="card"
                            style={{ position: 'relative', overflow: 'hidden' }}
                        >
                            {/* Color bar */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: cal.color
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '0.5rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {cal.name}
                                        </h3>
                                        <span style={{
                                            fontSize: '0.65rem',
                                            padding: '0.125rem 0.375rem',
                                            borderRadius: 'var(--radius-sm)',
                                            background: cal.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                                            color: cal.status === 'active' ? 'var(--success)' : 'var(--text-tertiary)',
                                        }}>
                                            {cal.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                        {cal.description}
                                    </p>
                                </div>
                            </div>

                            {/* Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                    <Clock size={14} />
                                    <span>
                                        {cal.availability.slotDuration} min • {HOURS[cal.availability.startHour]?.label} - {HOURS[cal.availability.endHour]?.label}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                    <Calendar size={14} />
                                    <span>
                                        {cal.availability.days.map(d => DAYS_OF_WEEK[d]?.label).join(', ')}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                    <Users size={14} />
                                    <span>
                                        {cal.assignedUsers.length} usuario(s) asignado(s)
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                    {cal.googleConnected ? (
                                        <>
                                            <CheckCircle size={14} color="var(--success)" />
                                            <span style={{ color: 'var(--success)' }}>Google Calendar conectado</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={14} color="var(--text-tertiary)" />
                                            <span style={{ color: 'var(--text-tertiary)' }}>Google Calendar no conectado</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Blocked dates */}
                            {cal.availability.blockedDates.length > 0 && (
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--warning)',
                                    background: 'rgba(234, 179, 8, 0.1)',
                                    padding: '0.5rem',
                                    borderRadius: 'var(--radius-sm)',
                                    marginBottom: '1rem'
                                }}>
                                    ⚠️ {cal.availability.blockedDates.length} fecha(s) bloqueada(s)
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="btn-secondary"
                                    style={{ flex: 1, fontSize: '0.75rem' }}
                                    onClick={() => handleEdit(cal)}
                                >
                                    <Edit2 size={14} />
                                    Editar
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{ flex: 1, fontSize: '0.75rem' }}
                                    onClick={() => {
                                        // Toggle status
                                        updateCalendars(calendars.map(c =>
                                            c.id === cal.id
                                                ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' }
                                                : c
                                        ));
                                    }}
                                >
                                    <Settings size={14} />
                                    {cal.status === 'active' ? 'Desactivar' : 'Activar'}
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{ fontSize: '0.75rem', color: 'var(--error)' }}
                                    onClick={() => handleDelete(cal.id)}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add New Card */}
                    <div
                        className="card"
                        onClick={() => {
                            setEditingCalendar(null);
                            setShowModal(true);
                        }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '250px',
                            border: '2px dashed var(--border-secondary)',
                            cursor: 'pointer',
                            background: 'transparent',
                        }}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'var(--accent-glow)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-primary)',
                            marginBottom: '0.75rem',
                        }}>
                            <Plus size={24} />
                        </div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                            Crear nuevo calendario
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            Configura disponibilidad y horarios
                        </p>
                    </div>
                </div>

                {/* Google Calendar Info */}
                <div className="card" style={{ marginTop: '2rem', background: 'var(--bg-tertiary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #4285f4, #34a853)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Calendar size={24} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                Integración con Google Calendar
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Conecta tu cuenta de Google Calendar para sincronizar citas automáticamente
                            </p>
                        </div>
                        <button className="btn-secondary" disabled style={{ opacity: 0.5 }}>
                            <ExternalLink size={16} />
                            Próximamente
                        </button>
                    </div>
                </div>
            </main>

            {/* Calendar Modal */}
            {showModal && (
                <CalendarModal
                    onClose={() => {
                        setShowModal(false);
                        setEditingCalendar(null);
                    }}
                    onSave={handleSave}
                    editingCalendar={editingCalendar}
                />
            )}
        </div>
    );
}

// Calendar Edit/Create Modal
function CalendarModal({
    onClose,
    onSave,
    editingCalendar,
}: {
    onClose: () => void;
    onSave: (calendar: CalendarType) => void;
    editingCalendar: CalendarType | null;
}) {
    const isEditing = !!editingCalendar;

    const [name, setName] = useState(editingCalendar?.name || '');
    const [description, setDescription] = useState(editingCalendar?.description || '');
    const [type, setType] = useState<CalendarType['type']>(editingCalendar?.type || 'general');
    const [status, setStatus] = useState<CalendarType['status']>(editingCalendar?.status || 'active');
    const [color, setColor] = useState(editingCalendar?.color || '#6366f1');
    const [availability, setAvailability] = useState<CalendarAvailability>(
        editingCalendar?.availability || {
            days: [1, 2, 3, 4, 5],
            startHour: 9,
            endHour: 18,
            slotDuration: 30,
            bufferTime: 15,
            blockedDates: [],
        }
    );
    const [blockedDateInput, setBlockedDateInput] = useState('');

    const toggleDay = (day: number) => {
        setAvailability(prev => ({
            ...prev,
            days: prev.days.includes(day)
                ? prev.days.filter(d => d !== day)
                : [...prev.days, day].sort((a, b) => a - b),
        }));
    };

    const addBlockedDate = () => {
        if (blockedDateInput && !availability.blockedDates.includes(blockedDateInput)) {
            setAvailability(prev => ({
                ...prev,
                blockedDates: [...prev.blockedDates, blockedDateInput].sort(),
            }));
            setBlockedDateInput('');
        }
    };

    const removeBlockedDate = (date: string) => {
        setAvailability(prev => ({
            ...prev,
            blockedDates: prev.blockedDates.filter(d => d !== date),
        }));
    };

    const handleSave = () => {
        const calendar: CalendarType = {
            id: editingCalendar?.id || `cal-${Date.now()}`,
            name,
            description,
            type,
            assignedUsers: editingCalendar?.assignedUsers || ['current-user'],
            availability,
            googleConnected: editingCalendar?.googleConnected || false,
            color,
            status,
            createdAt: editingCalendar?.createdAt || new Date(),
        };
        onSave(calendar);
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
                    maxWidth: '600px',
                    maxHeight: '85vh',
                    overflow: 'auto',
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {isEditing ? 'Editar Calendario' : 'Nuevo Calendario'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Basic Info */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                            Nombre del calendario *
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Consultoría inicial"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                            Descripción
                        </label>
                        <textarea
                            className="input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="¿Para qué tipo de citas es este calendario?"
                            rows={2}
                        />
                    </div>

                    {/* Color */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                            Color
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        background: c,
                                        border: color === c ? '3px solid white' : 'none',
                                        cursor: 'pointer',
                                        boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Days */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                            Días disponibles
                        </label>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                            {DAYS_OF_WEEK.map((day) => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleDay(day.value)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        borderRadius: 'var(--radius-sm)',
                                        border: availability.days.includes(day.value)
                                            ? `2px solid ${color}`
                                            : '1px solid var(--border-secondary)',
                                        background: availability.days.includes(day.value)
                                            ? `${color}20`
                                            : 'var(--bg-secondary)',
                                        color: availability.days.includes(day.value)
                                            ? color
                                            : 'var(--text-tertiary)',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                    }}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hours */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                Hora inicio
                            </label>
                            <select
                                className="input"
                                value={availability.startHour}
                                onChange={(e) => setAvailability(prev => ({ ...prev, startHour: parseInt(e.target.value) }))}
                            >
                                {HOURS.map((h) => (
                                    <option key={h.value} value={h.value}>{h.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                Hora fin
                            </label>
                            <select
                                className="input"
                                value={availability.endHour}
                                onChange={(e) => setAvailability(prev => ({ ...prev, endHour: parseInt(e.target.value) }))}
                            >
                                {HOURS.map((h) => (
                                    <option key={h.value} value={h.value}>{h.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Slot duration & buffer */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                Duración de cita (min)
                            </label>
                            <select
                                className="input"
                                value={availability.slotDuration}
                                onChange={(e) => setAvailability(prev => ({ ...prev, slotDuration: parseInt(e.target.value) }))}
                            >
                                <option value={15}>15 minutos</option>
                                <option value={30}>30 minutos</option>
                                <option value={45}>45 minutos</option>
                                <option value={60}>1 hora</option>
                                <option value={90}>1.5 horas</option>
                                <option value={120}>2 horas</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                Tiempo entre citas (min)
                            </label>
                            <select
                                className="input"
                                value={availability.bufferTime}
                                onChange={(e) => setAvailability(prev => ({ ...prev, bufferTime: parseInt(e.target.value) }))}
                            >
                                <option value={0}>Sin buffer</option>
                                <option value={5}>5 minutos</option>
                                <option value={10}>10 minutos</option>
                                <option value={15}>15 minutos</option>
                                <option value={30}>30 minutos</option>
                            </select>
                        </div>
                    </div>

                    {/* Blocked dates */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                            Bloquear fechas específicas
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                type="date"
                                className="input"
                                value={blockedDateInput}
                                onChange={(e) => setBlockedDateInput(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={addBlockedDate}
                                disabled={!blockedDateInput}
                            >
                                Bloquear
                            </button>
                        </div>
                        {availability.blockedDates.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                {availability.blockedDates.map((date) => (
                                    <span
                                        key={date}
                                        style={{
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.5rem',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: 'var(--radius-sm)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            color: 'var(--text-secondary)',
                                        }}
                                    >
                                        {date}
                                        <button
                                            type="button"
                                            onClick={() => removeBlockedDate(date)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--error)',
                                                cursor: 'pointer',
                                                padding: 0,
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                            Estado
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => setStatus('active')}
                                style={{
                                    flex: 1,
                                    padding: '0.625rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: status === 'active' ? '2px solid var(--success)' : '1px solid var(--border-secondary)',
                                    background: status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
                                    color: status === 'active' ? 'var(--success)' : 'var(--text-tertiary)',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                }}
                            >
                                ✓ Activo
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus('inactive')}
                                style={{
                                    flex: 1,
                                    padding: '0.625rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: status === 'inactive' ? '2px solid var(--text-tertiary)' : '1px solid var(--border-secondary)',
                                    background: status === 'inactive' ? 'rgba(100, 116, 139, 0.1)' : 'var(--bg-secondary)',
                                    color: 'var(--text-tertiary)',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                }}
                            >
                                ○ Inactivo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button className="btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="btn-primary" onClick={handleSave} disabled={!name}>
                        {isEditing ? 'Guardar Cambios' : 'Crear Calendario'}
                    </button>
                </div>
            </div>
        </div>
    );
}
