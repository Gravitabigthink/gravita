'use client';

import React from 'react';

import { useState } from 'react';
import { CalendarEvent } from '@/types/lead';
import {
    ChevronLeft,
    ChevronRight,
    Video,
    Phone,
    FileText,
    Plus,
    Clock,
} from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
    addDays,
    subDays,
} from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarProps {
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
    onAddEvent: (date: Date) => void;
}

type ViewType = 'mes' | 'semana' | 'dia';

const getEventIcon = (type: CalendarEvent['type']) => {
    const icons: Record<CalendarEvent['type'], React.ReactNode> = {
        videollamada: <Video size={12} strokeWidth={1.5} />,
        seguimiento: <Phone size={12} strokeWidth={1.5} />,
        propuesta: <FileText size={12} strokeWidth={1.5} />,
    };
    return icons[type];
};

const getEventColor = (type: CalendarEvent['type']) => {
    const colors: Record<CalendarEvent['type'], string> = {
        videollamada: 'var(--accent-primary)',
        seguimiento: 'var(--success)',
        propuesta: 'var(--warning)',
    };
    return colors[type];
};

export function Calendar({ events, onEventClick, onAddEvent }: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<ViewType>('mes');

    const navigateBack = () => {
        if (view === 'mes') setCurrentDate(subMonths(currentDate, 1));
        else if (view === 'semana') setCurrentDate(subWeeks(currentDate, 1));
        else setCurrentDate(subDays(currentDate, 1));
    };

    const navigateForward = () => {
        if (view === 'mes') setCurrentDate(addMonths(currentDate, 1));
        else if (view === 'semana') setCurrentDate(addWeeks(currentDate, 1));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const goToToday = () => setCurrentDate(new Date());

    const getEventsForDate = (date: Date) =>
        events.filter((event) => isSameDay(new Date(event.start), date));

    const getHeaderTitle = () => {
        if (view === 'mes') return format(currentDate, 'MMMM yyyy', { locale: es });
        if (view === 'semana') {
            const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
            return `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM yyyy', { locale: es })}`;
        }
        return format(currentDate, "EEEE, d 'de' MMMM yyyy", { locale: es });
    };

    // Generate days for month view
    const getMonthDays = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    };

    // Generate days for week view
    const getWeekDays = () => {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
    };

    // Hours for day/week view
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button onClick={navigateBack} className="btn-secondary" style={{ padding: '0.5rem' }}>
                        <ChevronLeft size={18} strokeWidth={1.5} />
                    </button>
                    <h2
                        style={{
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            textTransform: 'capitalize',
                            minWidth: '200px',
                        }}
                    >
                        {getHeaderTitle()}
                    </h2>
                    <button onClick={navigateForward} className="btn-secondary" style={{ padding: '0.5rem' }}>
                        <ChevronRight size={18} strokeWidth={1.5} />
                    </button>
                    <button onClick={goToToday} className="btn-secondary">
                        Hoy
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {(['mes', 'semana', 'dia'] as ViewType[]).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={view === v ? 'btn-primary' : 'btn-secondary'}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            {/* Month View */}
            {view === 'mes' && (
                <div className="card" style={{ flex: 1, overflow: 'hidden', padding: 0 }}>
                    {/* Weekday Headers */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            borderBottom: '1px solid var(--border-primary)',
                        }}
                    >
                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                            <div
                                key={day}
                                style={{
                                    padding: '0.75rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: 'var(--text-tertiary)',
                                    textAlign: 'center',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            flex: 1,
                        }}
                    >
                        {getMonthDays().map((day) => {
                            const dayEvents = getEventsForDate(day);
                            const isCurrentMonth = isSameMonth(day, currentDate);

                            return (
                                <div
                                    key={day.toISOString()}
                                    onClick={() => onAddEvent(day)}
                                    style={{
                                        minHeight: '100px',
                                        padding: '0.5rem',
                                        borderRight: '1px solid var(--border-primary)',
                                        borderBottom: '1px solid var(--border-primary)',
                                        background: !isCurrentMonth ? 'var(--bg-tertiary)' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--bg-hover)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = !isCurrentMonth
                                            ? 'var(--bg-tertiary)'
                                            : 'transparent';
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            fontSize: '0.875rem',
                                            fontWeight: isToday(day) ? 600 : 400,
                                            color: isToday(day)
                                                ? 'white'
                                                : isCurrentMonth
                                                    ? 'var(--text-primary)'
                                                    : 'var(--text-tertiary)',
                                            background: isToday(day) ? 'var(--accent-primary)' : 'transparent',
                                            marginBottom: '0.25rem',
                                        }}
                                    >
                                        {format(day, 'd')}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        {dayEvents.slice(0, 3).map((event) => (
                                            <div
                                                key={event.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEventClick(event);
                                                }}
                                                style={{
                                                    padding: '0.25rem 0.375rem',
                                                    background: `${getEventColor(event.type)}20`,
                                                    color: getEventColor(event.type),
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 500,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {getEventIcon(event.type)}
                                                {event.leadName}
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <span
                                                style={{
                                                    fontSize: '0.65rem',
                                                    color: 'var(--text-tertiary)',
                                                }}
                                            >
                                                +{dayEvents.length - 3} más
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Week View */}
            {view === 'semana' && (
                <div className="card" style={{ flex: 1, overflow: 'auto', padding: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)' }}>
                        {/* Header */}
                        <div style={{ borderBottom: '1px solid var(--border-primary)' }} />
                        {getWeekDays().map((day) => (
                            <div
                                key={day.toISOString()}
                                style={{
                                    padding: '0.75rem',
                                    borderBottom: '1px solid var(--border-primary)',
                                    borderLeft: '1px solid var(--border-primary)',
                                    textAlign: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-tertiary)',
                                        marginBottom: '0.25rem',
                                    }}
                                >
                                    {format(day, 'EEE', { locale: es })}
                                </div>
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        color: isToday(day) ? 'white' : 'var(--text-primary)',
                                        background: isToday(day) ? 'var(--accent-primary)' : 'transparent',
                                    }}
                                >
                                    {format(day, 'd')}
                                </div>
                            </div>
                        ))}

                        {/* Time Slots */}
                        {hours.map((hour) => (
                            <React.Fragment key={`hour-${hour}`}>
                                <div
                                    style={{
                                        padding: '0.5rem',
                                        fontSize: '0.75rem',
                                        color: 'var(--text-tertiary)',
                                        textAlign: 'right',
                                        borderBottom: '1px solid var(--border-primary)',
                                    }}
                                >
                                    {hour}:00
                                </div>
                                {getWeekDays().map((day) => {
                                    const dayEvents = getEventsForDate(day).filter((e) => {
                                        const eventHour = new Date(e.start).getHours();
                                        return eventHour === hour;
                                    });

                                    return (
                                        <div
                                            key={`${day.toISOString()}-${hour}`}
                                            onClick={() => {
                                                const newDate = new Date(day);
                                                newDate.setHours(hour, 0, 0, 0);
                                                onAddEvent(newDate);
                                            }}
                                            style={{
                                                minHeight: '60px',
                                                padding: '0.25rem',
                                                borderLeft: '1px solid var(--border-primary)',
                                                borderBottom: '1px solid var(--border-primary)',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {dayEvents.map((event) => (
                                                <div
                                                    key={event.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEventClick(event);
                                                    }}
                                                    style={{
                                                        padding: '0.375rem',
                                                        background: `${getEventColor(event.type)}20`,
                                                        color: getEventColor(event.type),
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 500,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        {getEventIcon(event.type)}
                                                        {format(new Date(event.start), 'HH:mm')}
                                                    </div>
                                                    <div>{event.leadName}</div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {/* Day View */}
            {view === 'dia' && (
                <div className="card" style={{ flex: 1, overflow: 'auto', padding: 0 }}>
                    {hours.map((hour) => {
                        const dayEvents = getEventsForDate(currentDate).filter((e) => {
                            const eventHour = new Date(e.start).getHours();
                            return eventHour === hour;
                        });

                        return (
                            <div
                                key={hour}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '80px 1fr',
                                    borderBottom: '1px solid var(--border-primary)',
                                }}
                            >
                                <div
                                    style={{
                                        padding: '1rem',
                                        fontSize: '0.875rem',
                                        color: 'var(--text-tertiary)',
                                        textAlign: 'right',
                                        borderRight: '1px solid var(--border-primary)',
                                    }}
                                >
                                    {hour}:00
                                </div>
                                <div
                                    onClick={() => {
                                        const newDate = new Date(currentDate);
                                        newDate.setHours(hour, 0, 0, 0);
                                        onAddEvent(newDate);
                                    }}
                                    style={{
                                        minHeight: '80px',
                                        padding: '0.5rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.375rem',
                                    }}
                                >
                                    {dayEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEventClick(event);
                                            }}
                                            style={{
                                                padding: '0.75rem',
                                                background: `${getEventColor(event.type)}15`,
                                                borderLeft: `3px solid ${getEventColor(event.type)}`,
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    marginBottom: '0.25rem',
                                                }}
                                            >
                                                <span style={{ color: getEventColor(event.type) }}>
                                                    {getEventIcon(event.type)}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: '0.9rem',
                                                        fontWeight: 600,
                                                        color: 'var(--text-primary)',
                                                    }}
                                                >
                                                    {event.leadName}
                                                </span>
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
                                                <Clock size={12} strokeWidth={1.5} />
                                                {format(new Date(event.start), 'HH:mm')} -{' '}
                                                {format(new Date(event.end), 'HH:mm')}
                                            </div>
                                            {event.meetLink && (
                                                <a
                                                    href={event.meetLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        marginTop: '0.5rem',
                                                        fontSize: '0.75rem',
                                                        color: 'var(--accent-primary)',
                                                    }}
                                                >
                                                    <Video size={12} strokeWidth={1.5} />
                                                    Unirse a Meet
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
