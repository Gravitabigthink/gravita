'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Calendar as CalendarComponent } from '@/components/crm/Calendar';
import { CalendarEvent } from '@/types/lead';
import { LeadSearchInput, LeadOption } from '@/components/crm/LeadSearchInput';
import { generateWhatsAppLink, generateAppointmentWhatsAppMessage, AppointmentDetails } from '@/lib/notificationService';
import { Plus, X, Video, Phone, FileText, Calendar, Clock, User, Settings, Trash2, Edit2, CheckCircle, XCircle, Users, Filter, Bell, Mail, MessageSquare, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCalendars, saveCalendars, Calendar as CalendarType, CalendarAvailability, MOCK_USERS, CURRENT_USER_ID, getUsersByIds, User as UserType } from '@/lib/calendarStorage';

// Mock events
const mockEvents: CalendarEvent[] = [
    {
        id: '1',
        leadId: '1',
        leadName: 'Carlos Mendoza',
        title: 'Llamada de descubrimiento',
        start: new Date(new Date().setHours(10, 0, 0, 0)),
        end: new Date(new Date().setHours(10, 30, 0, 0)),
        type: 'videollamada',
        meetLink: 'https://meet.google.com/abc-defg-hij',
        status: 'pendiente',
    },
    {
        id: '2',
        leadId: '2',
        leadName: 'María González',
        title: 'Seguimiento propuesta',
        start: new Date(new Date().setHours(14, 0, 0, 0)),
        end: new Date(new Date().setHours(14, 15, 0, 0)),
        type: 'seguimiento',
        status: 'pendiente',
    },
    {
        id: '3',
        leadId: '3',
        leadName: 'Roberto Silva',
        title: 'Presentación de propuesta',
        start: new Date(Date.now() + 86400000),
        end: new Date(Date.now() + 86400000 + 3600000),
        type: 'propuesta',
        meetLink: 'https://meet.google.com/xyz-uvwx-rst',
        status: 'pendiente',
    },
    {
        id: '4',
        leadId: '4',
        leadName: 'Ana Torres',
        title: 'Demo servicios',
        start: new Date(Date.now() + 172800000),
        end: new Date(Date.now() + 172800000 + 1800000),
        type: 'videollamada',
        meetLink: 'https://meet.google.com/demo-meet-123',
        status: 'pendiente',
    },
];

// Mock leads for selection
const mockLeads = [
    { id: '1', nombre: 'Carlos Mendoza', empresa: 'Tech Solutions MX' },
    { id: '2', nombre: 'María González', empresa: 'Retail Express' },
    { id: '3', nombre: 'Roberto Silva', empresa: 'Consultoría Integral' },
    { id: '4', nombre: 'Ana Torres', empresa: 'Clínica Dental Premium' },
    { id: '5', nombre: 'Luis Ramírez', empresa: 'Constructora Norte' },
];

// Add Event Modal Component - Now with Lead Search and Notifications
function AddEventModal({
    isOpen,
    selectedDate,
    onClose,
    onSave,
}: {
    isOpen: boolean;
    selectedDate: Date | null;
    onClose: () => void;
    onSave: (event: Omit<CalendarEvent, 'id'>, notifications: NotificationSettings) => void;
}) {
    const [eventType, setEventType] = useState<CalendarEvent['type']>('videollamada');
    const [selectedLead, setSelectedLead] = useState<LeadOption | null>(null);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
    const [startTime, setStartTime] = useState(selectedDate ? format(selectedDate, 'HH:mm') : '10:00');
    const [endTime, setEndTime] = useState('10:30');
    const [notes, setNotes] = useState('');

    // Notification settings
    const [sendEmail, setSendEmail] = useState(true);
    const [sendWhatsApp, setSendWhatsApp] = useState(true);
    const [remindOneDayBefore, setRemindOneDayBefore] = useState(true);
    const [remindHoursBefore, setRemindHoursBefore] = useState(true);
    const [remindMinutesBefore, setRemindMinutesBefore] = useState(true);

    // Update date/time when selectedDate prop changes
    useEffect(() => {
        if (selectedDate) {
            setDate(format(selectedDate, 'yyyy-MM-dd'));
            const hour = selectedDate.getHours();
            if (hour >= 8 && hour <= 19) {
                setStartTime(format(selectedDate, 'HH:mm'));
                const endHour = new Date(selectedDate);
                endHour.setMinutes(endHour.getMinutes() + 30);
                setEndTime(format(endHour, 'HH:mm'));
            }
        }
    }, [selectedDate]);

    // Auto-generate title when lead is selected
    useEffect(() => {
        if (selectedLead && !title) {
            const titleByType = {
                videollamada: 'Videollamada con',
                seguimiento: 'Seguimiento con',
                propuesta: 'Propuesta para',
            };
            setTitle(`${titleByType[eventType]} ${selectedLead.nombre}`);
        }
    }, [selectedLead, eventType]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!selectedLead || !title) return;

        const startDate = new Date(`${date}T${startTime}`);
        const endDate = new Date(`${date}T${endTime}`);

        // Extended event with phone/email for notifications
        const eventData = {
            leadId: selectedLead.id,
            leadName: `${selectedLead.nombre} ${selectedLead.apellido || ''}`.trim(),
            leadPhone: selectedLead.telefono || '',
            leadEmail: selectedLead.email || '',
            title,
            start: startDate,
            end: endDate,
            type: eventType,
            status: 'pendiente' as const,
            meetLink: eventType === 'videollamada' ? `https://meet.google.com/new-${Date.now().toString(36)}` : undefined,
            notes,
        };

        onSave(eventData, {
            sendEmail,
            sendWhatsApp,
            remindOneDayBefore,
            remindHoursBefore,
            remindMinutesBefore,
        });

        // Reset form
        setSelectedLead(null);
        setTitle('');
        setNotes('');
        onClose();
    };

    const eventTypes: { type: CalendarEvent['type']; label: string; icon: React.ReactNode }[] = [
        { type: 'videollamada', label: 'Videollamada', icon: <Video size={16} /> },
        { type: 'seguimiento', label: 'Seguimiento', icon: <Phone size={16} /> },
        { type: 'propuesta', label: 'Propuesta', icon: <FileText size={16} /> },
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ width: '520px', maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            >
                {/* Header */}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Calendar size={20} color="var(--accent-primary)" />
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Nueva Cita
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form - Scrollable */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1 }}>
                    {/* Event Type */}
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                            Tipo de Evento
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {eventTypes.map((et) => (
                                <button
                                    key={et.type}
                                    onClick={() => setEventType(et.type)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: eventType === et.type ? '2px solid var(--accent-primary)' : '1px solid var(--border-primary)',
                                        background: eventType === et.type ? 'var(--accent-glow)' : 'transparent',
                                        color: eventType === et.type ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    {et.icon}
                                    <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{et.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lead Selection - Now with Search! */}
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                            <User size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                            Buscar Lead / Cliente *
                        </label>
                        <LeadSearchInput
                            value={selectedLead}
                            onChange={setSelectedLead}
                            placeholder="Escribe para buscar..."
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                            Título del Evento
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Llamada de descubrimiento"
                            className="input"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Date and Time */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                                <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                Fecha
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="input"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                                <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                Inicio
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="input"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                                <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                Fin
                            </label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="input"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div
                        style={{
                            padding: '1rem',
                            background: 'rgba(139, 92, 246, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                        }}
                    >
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Bell size={16} color="var(--accent-primary)" />
                            Notificaciones al Lead
                        </label>

                        {/* Immediate notifications */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                <input
                                    type="checkbox"
                                    checked={sendEmail}
                                    onChange={(e) => setSendEmail(e.target.checked)}
                                    style={{ accentColor: 'var(--accent-primary)' }}
                                />
                                <Mail size={14} />
                                Email
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                <input
                                    type="checkbox"
                                    checked={sendWhatsApp}
                                    onChange={(e) => setSendWhatsApp(e.target.checked)}
                                    style={{ accentColor: 'var(--accent-primary)' }}
                                />
                                <MessageSquare size={14} />
                                WhatsApp
                            </label>
                        </div>

                        {/* Reminders */}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                            Recordatorios:
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.375rem 0.75rem',
                                background: remindOneDayBefore ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                                border: remindOneDayBefore ? '1px solid var(--accent-primary)' : '1px solid var(--border-secondary)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                color: remindOneDayBefore ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={remindOneDayBefore}
                                    onChange={(e) => setRemindOneDayBefore(e.target.checked)}
                                    style={{ display: 'none' }}
                                />
                                1 día antes
                            </label>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.375rem 0.75rem',
                                background: remindHoursBefore ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                                border: remindHoursBefore ? '1px solid var(--accent-primary)' : '1px solid var(--border-secondary)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                color: remindHoursBefore ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={remindHoursBefore}
                                    onChange={(e) => setRemindHoursBefore(e.target.checked)}
                                    style={{ display: 'none' }}
                                />
                                3 horas antes
                            </label>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.375rem 0.75rem',
                                background: remindMinutesBefore ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                                border: remindMinutesBefore ? '1px solid var(--accent-primary)' : '1px solid var(--border-secondary)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                color: remindMinutesBefore ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={remindMinutesBefore}
                                    onChange={(e) => setRemindMinutesBefore(e.target.checked)}
                                    style={{ display: 'none' }}
                                />
                                15 min antes
                            </label>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                            Notas (opcional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Agregar notas o contexto..."
                            className="input"
                            rows={2}
                            style={{ width: '100%', resize: 'none' }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: '1rem 1.25rem',
                        borderTop: '1px solid var(--border-primary)',
                        display: 'flex',
                        gap: '0.75rem',
                        justifyContent: 'flex-end',
                        flexShrink: 0,
                        background: 'var(--bg-secondary)',
                    }}
                >
                    <button onClick={onClose} className="btn-secondary">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!selectedLead || !title}
                        className="btn-primary"
                    >
                        <Plus size={16} />
                        Crear Cita
                    </button>
                </div>
            </div>
        </div>
    );
}

// Notification settings type
interface NotificationSettings {
    sendEmail: boolean;
    sendWhatsApp: boolean;
    remindOneDayBefore: boolean;
    remindHoursBefore: boolean;
    remindMinutesBefore: boolean;
}


// Days of week and hours constants for configuration
const DAYS_OF_WEEK = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${i.toString().padStart(2, '0')}:00`,
}));

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [activeTab, setActiveTab] = useState<'calendar' | 'config'>('calendar');

    // Calendar config state
    const [calendars, setCalendars] = useState<CalendarType[]>([]);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [editingCalendar, setEditingCalendar] = useState<CalendarType | null>(null);
    const [showOnlyMine, setShowOnlyMine] = useState(false);

    useEffect(() => {
        setCalendars(getCalendars());
    }, []);

    // Filter calendars based on showOnlyMine
    const displayedCalendars = showOnlyMine
        ? calendars.filter(c => c.assignedUsers.includes(CURRENT_USER_ID))
        : calendars;

    const updateCalendars = (newCalendars: CalendarType[]) => {
        setCalendars(newCalendars);
        saveCalendars(newCalendars);
    };

    const handleEventClick = (event: CalendarEvent) => {
        console.log('Event clicked:', event);
    };

    const handleAddEvent = (date: Date) => {
        setSelectedDate(date);
        setShowAddModal(true);
    };

    const handleSaveEvent = (newEvent: Omit<CalendarEvent, 'id'>, notifications: NotificationSettings) => {
        const event: CalendarEvent = {
            ...newEvent,
            id: `event-${Date.now()}`,
        };
        setEvents([...events, event]);

        // Get phone from lead data (extended event)
        const extendedEvent = newEvent as typeof newEvent & { leadPhone?: string; leadEmail?: string };
        const leadPhone = extendedEvent.leadPhone || '';
        const leadEmail = extendedEvent.leadEmail || '';

        const appointmentDetails: AppointmentDetails = {
            id: event.id,
            title: event.title,
            leadName: event.leadName,
            leadPhone: leadPhone,
            leadEmail: leadEmail,
            start: new Date(event.start),
            end: new Date(event.end),
            type: event.type,
            meetLink: event.meetLink,
            notes: event.notes,
        };

        let whatsAppLink = '';
        if (notifications.sendWhatsApp && leadPhone) {
            const message = generateAppointmentWhatsAppMessage(appointmentDetails);
            whatsAppLink = generateWhatsAppLink(leadPhone, message);
        }

        // Show success with WhatsApp button
        const showSuccess = () => {
            const modal = document.createElement('div');
            modal.innerHTML = `
                <div style="position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999">
                    <div style="background:#1a1a1a;border-radius:16px;padding:32px;max-width:400px;text-align:center;border:1px solid #333">
                        <div style="width:64px;height:64px;background:rgba(34,197,94,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px">
                            <span style="font-size:32px">✅</span>
                        </div>
                        <h2 style="color:#fff;margin:0 0 8px;font-size:1.25rem">¡Cita Creada!</h2>
                        <p style="color:#888;margin:0 0 24px;font-size:0.9rem">${event.title}</p>
                        
                        ${notifications.sendWhatsApp && whatsAppLink ? `
                        <a href="${whatsAppLink}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;background:#25D366;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;margin-bottom:16px">
                            <span>💬</span> Enviar por WhatsApp
                        </a>
                        ` : ''}
                        
                        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:8px">
                            ${notifications.sendEmail ? '<span style="background:rgba(99,102,241,0.2);color:#818cf8;padding:4px 12px;border-radius:20px;font-size:0.75rem">📧 Email pendiente</span>' : ''}
                        </div>
                        
                        <div style="margin-top:16px;font-size:0.75rem;color:#666">
                            Recordatorios: ${[
                    notifications.remindOneDayBefore ? '1 día' : '',
                    notifications.remindHoursBefore ? '3 hrs' : '',
                    notifications.remindMinutesBefore ? '15 min' : '',
                ].filter(Boolean).join(', ') || 'Ninguno'}
                        </div>
                        
                        <button onclick="this.closest('div[style*=fixed]').remove()" style="margin-top:20px;background:#333;color:#fff;border:none;padding:10px 24px;border-radius:8px;cursor:pointer">
                            Cerrar
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        };

        setTimeout(showSuccess, 100);
    };

    const handleSaveCalendar = (calendar: CalendarType) => {
        if (editingCalendar) {
            updateCalendars(calendars.map(c => c.id === calendar.id ? calendar : c));
        } else {
            updateCalendars([calendar, ...calendars]);
        }
        setShowCalendarModal(false);
        setEditingCalendar(null);
    };

    const handleDeleteCalendar = (id: string) => {
        if (confirm('¿Eliminar este calendario?')) {
            updateCalendars(calendars.filter(c => c.id !== id));
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
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header with Tabs */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                Calendario
                            </h1>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {activeTab === 'calendar' ? 'Gestiona tus citas y reuniones' : 'Configura disponibilidad y horarios'}
                            </p>
                        </div>
                        {activeTab === 'calendar' ? (
                            <button className="btn-primary" onClick={() => { setSelectedDate(new Date()); setShowAddModal(true); }}>
                                <Plus size={16} strokeWidth={1.5} />
                                Nueva Cita
                            </button>
                        ) : (
                            <button className="btn-primary" onClick={() => { setEditingCalendar(null); setShowCalendarModal(true); }}>
                                <Plus size={16} strokeWidth={1.5} />
                                Nuevo Calendario
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-tertiary)', padding: '0.25rem', borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
                        <button
                            onClick={() => setActiveTab('calendar')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                background: activeTab === 'calendar' ? 'var(--bg-primary)' : 'transparent',
                                color: activeTab === 'calendar' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                fontWeight: 500,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: activeTab === 'calendar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            }}
                        >
                            <Calendar size={16} />
                            Vista Calendario
                        </button>
                        <button
                            onClick={() => setActiveTab('config')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                background: activeTab === 'config' ? 'var(--bg-primary)' : 'transparent',
                                color: activeTab === 'config' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                fontWeight: 500,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: activeTab === 'config' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            }}
                        >
                            <Settings size={16} />
                            Configuración
                        </button>
                    </div>
                </div>

                {/* Calendar View */}
                {activeTab === 'calendar' && (
                    <div style={{ flex: 1 }}>
                        <CalendarComponent
                            events={events}
                            onEventClick={handleEventClick}
                            onAddEvent={handleAddEvent}
                        />
                    </div>
                )}

                {/* Configuration View */}
                {activeTab === 'config' && (
                    <div>
                        {/* Filter Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <button
                                onClick={() => setShowOnlyMine(false)}
                                className={showOnlyMine ? 'btn-secondary' : 'btn-primary'}
                                style={{ fontSize: '0.8rem' }}
                            >
                                Todos ({calendars.length})
                            </button>
                            <button
                                onClick={() => setShowOnlyMine(true)}
                                className={showOnlyMine ? 'btn-primary' : 'btn-secondary'}
                                style={{ fontSize: '0.8rem' }}
                            >
                                <User size={14} />
                                Mis Calendarios ({calendars.filter(c => c.assignedUsers.includes(CURRENT_USER_ID)).length})
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                            {displayedCalendars.map((cal) => {
                                const assignedUsers = getUsersByIds(cal.assignedUsers);
                                const isMyCalendar = cal.assignedUsers.includes(CURRENT_USER_ID);

                                return (
                                    <div
                                        key={cal.id}
                                        className="card"
                                        style={{ position: 'relative', overflow: 'hidden' }}
                                    >
                                        {/* Color bar */}
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: cal.color }} />

                                        {/* My Calendar Badge */}
                                        {isMyCalendar && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                fontSize: '0.6rem',
                                                padding: '0.125rem 0.375rem',
                                                background: 'var(--accent-glow)',
                                                color: 'var(--accent-primary)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontWeight: 600,
                                            }}>
                                                Mi calendario
                                            </div>
                                        )}

                                        <div style={{ marginTop: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
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

                                        {/* Assigned Users */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                            <Users size={14} color="var(--text-tertiary)" />
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '-0.25rem' }}>
                                                {assignedUsers.slice(0, 4).map((user, i) => (
                                                    <div key={user.id} style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        background: `hsl(${(user.id.charCodeAt(5) || 0) * 40}, 70%, 50%)`,
                                                        border: '2px solid var(--bg-primary)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '0.55rem',
                                                        fontWeight: 600,
                                                        marginLeft: i > 0 ? '-6px' : '0',
                                                        zIndex: 10 - i,
                                                    }}>
                                                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </div>
                                                ))}
                                                {assignedUsers.length > 4 && (
                                                    <div style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        background: 'var(--bg-tertiary)',
                                                        border: '2px solid var(--bg-primary)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'var(--text-secondary)',
                                                        fontSize: '0.55rem',
                                                        fontWeight: 600,
                                                        marginLeft: '-6px',
                                                    }}>
                                                        +{assignedUsers.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginLeft: '0.25rem' }}>
                                                {assignedUsers.length} usuario{assignedUsers.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={14} />
                                                <span>{cal.availability.slotDuration} min • {HOURS[cal.availability.startHour]?.label} - {HOURS[cal.availability.endHour]?.label}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={14} />
                                                <span>{cal.availability.days.map(d => DAYS_OF_WEEK[d]?.label).join(', ')}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn-secondary"
                                                style={{ flex: 1, fontSize: '0.75rem' }}
                                                onClick={() => { setEditingCalendar(cal); setShowCalendarModal(true); }}
                                            >
                                                <Edit2 size={14} />
                                                Editar
                                            </button>
                                            <button
                                                className="btn-secondary"
                                                style={{ flex: 1, fontSize: '0.75rem' }}
                                                onClick={() => {
                                                    updateCalendars(calendars.map(c =>
                                                        c.id === cal.id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
                                                    ));
                                                }}
                                            >
                                                {cal.status === 'active' ? 'Desactivar' : 'Activar'}
                                            </button>
                                            <button
                                                className="btn-secondary"
                                                style={{ fontSize: '0.75rem', color: 'var(--error)' }}
                                                onClick={() => handleDeleteCalendar(cal.id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add New Card */}
                            <div
                                className="card"
                                onClick={() => { setEditingCalendar(null); setShowCalendarModal(true); }}
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
                                    Nuevo calendario
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Add Event Modal */}
            <AddEventModal
                isOpen={showAddModal}
                selectedDate={selectedDate}
                onClose={() => setShowAddModal(false)}
                onSave={handleSaveEvent}
            />

            {/* Calendar Config Modal */}
            {showCalendarModal && (
                <CalendarConfigModal
                    onClose={() => { setShowCalendarModal(false); setEditingCalendar(null); }}
                    onSave={handleSaveCalendar}
                    editingCalendar={editingCalendar}
                />
            )}
        </div>
    );
}

// Calendar Configuration Modal
function CalendarConfigModal({
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
            days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day].sort((a, b) => a - b),
        }));
    };

    const handleSave = () => {
        const calendar: CalendarType = {
            id: editingCalendar?.id || `cal-${Date.now()}`,
            name,
            description,
            type: 'general',
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
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
            onClick={onClose}
        >
            <div className="card" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '550px', maxHeight: '85vh', overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {isEditing ? 'Editar Calendario' : 'Nuevo Calendario'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Nombre *</label>
                        <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Consultoría inicial" />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Descripción</label>
                        <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="¿Para qué es este calendario?" rows={2} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Color</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {COLORS.map((c) => (
                                <button key={c} type="button" onClick={() => setColor(c)} style={{ width: '28px', height: '28px', borderRadius: '6px', background: c, border: color === c ? '3px solid white' : 'none', cursor: 'pointer', boxShadow: color === c ? `0 0 0 2px ${c}` : 'none' }} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Días disponibles</label>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {DAYS_OF_WEEK.map((day) => (
                                <button key={day.value} type="button" onClick={() => toggleDay(day.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: availability.days.includes(day.value) ? `2px solid ${color}` : '1px solid var(--border-secondary)', background: availability.days.includes(day.value) ? `${color}20` : 'var(--bg-secondary)', color: availability.days.includes(day.value) ? color : 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 500 }}>
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Hora inicio</label>
                            <select className="input" value={availability.startHour} onChange={(e) => setAvailability(prev => ({ ...prev, startHour: parseInt(e.target.value) }))}>
                                {HOURS.map((h) => (<option key={h.value} value={h.value}>{h.label}</option>))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Hora fin</label>
                            <select className="input" value={availability.endHour} onChange={(e) => setAvailability(prev => ({ ...prev, endHour: parseInt(e.target.value) }))}>
                                {HOURS.map((h) => (<option key={h.value} value={h.value}>{h.label}</option>))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Duración de cita</label>
                            <select className="input" value={availability.slotDuration} onChange={(e) => setAvailability(prev => ({ ...prev, slotDuration: parseInt(e.target.value) }))}>
                                <option value={15}>15 min</option>
                                <option value={30}>30 min</option>
                                <option value={45}>45 min</option>
                                <option value={60}>1 hora</option>
                                <option value={90}>1.5 horas</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Buffer entre citas</label>
                            <select className="input" value={availability.bufferTime} onChange={(e) => setAvailability(prev => ({ ...prev, bufferTime: parseInt(e.target.value) }))}>
                                <option value={0}>Sin buffer</option>
                                <option value={5}>5 min</option>
                                <option value={10}>10 min</option>
                                <option value={15}>15 min</option>
                                <option value={30}>30 min</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Bloquear fechas</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="date" className="input" value={blockedDateInput} onChange={(e) => setBlockedDateInput(e.target.value)} style={{ flex: 1 }} />
                            <button type="button" className="btn-secondary" onClick={() => { if (blockedDateInput) { setAvailability(prev => ({ ...prev, blockedDates: [...prev.blockedDates, blockedDateInput] })); setBlockedDateInput(''); } }}>Bloquear</button>
                        </div>
                        {availability.blockedDates.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
                                {availability.blockedDates.map((date) => (
                                    <span key={date} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {date}
                                        <button type="button" onClick={() => setAvailability(prev => ({ ...prev, blockedDates: prev.blockedDates.filter(d => d !== date) }))} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 0 }}>×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Estado</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="button" onClick={() => setStatus('active')} style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)', border: status === 'active' ? '2px solid var(--success)' : '1px solid var(--border-secondary)', background: status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)', color: status === 'active' ? 'var(--success)' : 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.85rem' }}>✓ Activo</button>
                            <button type="button" onClick={() => setStatus('inactive')} style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)', border: status === 'inactive' ? '2px solid var(--text-tertiary)' : '1px solid var(--border-secondary)', background: status === 'inactive' ? 'rgba(100, 116, 139, 0.1)' : 'var(--bg-secondary)', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.85rem' }}>○ Inactivo</button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button className="btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn-primary" onClick={handleSave} disabled={!name}>{isEditing ? 'Guardar' : 'Crear'}</button>
                </div>
            </div>
        </div>
    );
}
