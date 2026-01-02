'use client';

import { useState } from 'react';
import { Lead } from '@/types/lead';
import {
    ProactiveSuggestion,
    getProactiveSuggestions,
    calculateInitialScore
} from '@/ai/agents/proactive-orchestrator';
import {
    Sparkles,
    MessageCircle,
    Phone,
    Mail,
    FileText,
    Bell,
    Clock,
    Target,
    RefreshCw,
    Video,
    CalendarCheck,
    Shield,
    CheckCircle,
    ChevronRight,
    Zap,
    Copy,
    Check,
} from 'lucide-react';

interface ProactiveSuggestionsPanelProps {
    lead: Lead;
    onActionExecuted?: (actionId: string, lead: Lead) => void;
}

// Map icon names to components
const iconMap: Record<string, React.ReactNode> = {
    'sparkles': <Sparkles size={18} />,
    'message-circle': <MessageCircle size={18} />,
    'phone': <Phone size={18} />,
    'mail': <Mail size={18} />,
    'file-text': <FileText size={18} />,
    'bell': <Bell size={18} />,
    'clock': <Clock size={18} />,
    'target': <Target size={18} />,
    'refresh-cw': <RefreshCw size={18} />,
    'video': <Video size={18} />,
    'calendar-check': <CalendarCheck size={18} />,
    'shield': <Shield size={18} />,
    'check-circle': <CheckCircle size={18} />,
};

// Priority colors
const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
    urgent: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
    high: { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316', border: 'rgba(249, 115, 22, 0.3)' },
    medium: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
    low: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' },
};

const priorityLabels: Record<string, string> = {
    urgent: 'Urgente',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
};

export function ProactiveSuggestionsPanel({ lead, onActionExecuted }: ProactiveSuggestionsPanelProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const suggestions = getProactiveSuggestions(lead);

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleAction = (suggestion: ProactiveSuggestion) => {
        console.log('handleAction called with:', suggestion.action?.callback);
        if (onActionExecuted && suggestion.action) {
            console.log('Calling onActionExecuted with callback:', suggestion.action.callback);
            onActionExecuted(suggestion.action.callback, lead);
        }
        // If there's suggested content, also expand to show it
        if (suggestion.suggestedContent) {
            setExpandedId(expandedId === suggestion.id ? null : suggestion.id);
        }
    };

    if (suggestions.length === 0) {
        return (
            <div
                className="card"
                style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: 'var(--bg-tertiary)',
                }}
            >
                <CheckCircle size={32} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    No hay acciones pendientes para este lead
                </p>
            </div>
        );
    }

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div
                style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05))',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={18} color="var(--warning)" />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        Sugerencias IA
                    </span>
                </div>
                <span
                    style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-secondary)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                    }}
                >
                    {suggestions.length} acciones
                </span>
            </div>

            {/* Suggestions List */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {suggestions.map((suggestion, index) => {
                    const colors = priorityColors[suggestion.priority];
                    const isExpanded = expandedId === suggestion.id;

                    return (
                        <div key={suggestion.id}>
                            <div
                                style={{
                                    padding: '1rem 1.25rem',
                                    borderBottom: index < suggestions.length - 1 ? '1px solid var(--border-primary)' : 'none',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '1rem',
                                    cursor: suggestion.suggestedContent ? 'pointer' : 'default',
                                    transition: 'background 0.2s',
                                }}
                                onClick={() => suggestion.suggestedContent && setExpandedId(isExpanded ? null : suggestion.id)}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                {/* Icon */}
                                <div
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: 'var(--radius-md)',
                                        background: colors.bg,
                                        border: `1px solid ${colors.border}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: colors.text,
                                        flexShrink: 0,
                                    }}
                                >
                                    {iconMap[suggestion.icon] || <Sparkles size={18} />}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                            {suggestion.title}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: '0.65rem',
                                                padding: '0.15rem 0.4rem',
                                                borderRadius: 'var(--radius-sm)',
                                                background: colors.bg,
                                                color: colors.text,
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {priorityLabels[suggestion.priority]}
                                        </span>
                                        {suggestion.dueIn && (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                                • {suggestion.dueIn}
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                                        {suggestion.description}
                                    </p>
                                </div>

                                {/* Action Button */}
                                {suggestion.action && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            alert('Botón clickeado: ' + suggestion.action?.callback);
                                            handleAction(suggestion);
                                        }}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: 'var(--radius-md)',
                                            background: colors.text,
                                            color: 'white',
                                            border: 'none',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            whiteSpace: 'nowrap',
                                            transition: 'opacity 0.2s',
                                            position: 'relative',
                                            zIndex: 100,
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                        {suggestion.action.label}
                                        <ChevronRight size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && suggestion.suggestedContent && (
                                <div
                                    style={{
                                        padding: '1rem 1.25rem',
                                        paddingLeft: '4.25rem',
                                        background: 'var(--bg-tertiary)',
                                        borderBottom: index < suggestions.length - 1 ? '1px solid var(--border-primary)' : 'none',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                                        <div
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                background: 'var(--bg-primary)',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--border-primary)',
                                                fontSize: '0.85rem',
                                                color: 'var(--text-secondary)',
                                                whiteSpace: 'pre-wrap',
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            {suggestion.suggestedContent}
                                        </div>
                                        <button
                                            onClick={() => handleCopy(suggestion.suggestedContent!, suggestion.id)}
                                            style={{
                                                padding: '0.5rem',
                                                borderRadius: 'var(--radius-md)',
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-primary)',
                                                cursor: 'pointer',
                                                color: copiedId === suggestion.id ? 'var(--success)' : 'var(--text-secondary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s',
                                            }}
                                            title="Copiar mensaje"
                                        >
                                            {copiedId === suggestion.id ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Compact version for showing in lead lists
 */
export function ProactiveBadge({ lead }: { lead: Lead }) {
    const suggestions = getProactiveSuggestions(lead);

    if (suggestions.length === 0) return null;

    const urgentCount = suggestions.filter(s => s.priority === 'urgent').length;
    const highCount = suggestions.filter(s => s.priority === 'high').length;

    const color = urgentCount > 0
        ? priorityColors.urgent
        : highCount > 0
            ? priorityColors.high
            : priorityColors.medium;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                background: color.bg,
                border: `1px solid ${color.border}`,
            }}
            title={`${suggestions.length} sugerencia(s) pendiente(s)`}
        >
            <Zap size={12} color={color.text} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: color.text }}>
                {suggestions.length}
            </span>
        </div>
    );
}
