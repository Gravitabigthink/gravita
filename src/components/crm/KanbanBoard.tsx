'use client';

import { useState } from 'react';
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from '@hello-pangea/dnd';
import { Lead, LeadStatus, PIPELINE_COLUMNS, PipelineColumn } from '@/types/lead';
import { LeadCard } from './LeadCard';
import {
    Sparkles,
    MessageCircle,
    Calendar,
    Video,
    FileText,
    Handshake,
    Trophy,
    XCircle,
    MoreHorizontal,
    Plus,
} from 'lucide-react';

interface KanbanBoardProps {
    leads: Lead[];
    onLeadClick: (lead: Lead) => void;
    onLeadMove: (leadId: string, newStatus: LeadStatus) => void;
    onAddLead?: () => void;
}

const getColumnIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
        sparkles: <Sparkles size={16} strokeWidth={1.5} />,
        'message-circle': <MessageCircle size={16} strokeWidth={1.5} />,
        calendar: <Calendar size={16} strokeWidth={1.5} />,
        video: <Video size={16} strokeWidth={1.5} />,
        'file-text': <FileText size={16} strokeWidth={1.5} />,
        handshake: <Handshake size={16} strokeWidth={1.5} />,
        trophy: <Trophy size={16} strokeWidth={1.5} />,
        'x-circle': <XCircle size={16} strokeWidth={1.5} />,
    };
    return icons[iconName] || <Sparkles size={16} strokeWidth={1.5} />;
};

export function KanbanBoard({ leads, onLeadClick, onLeadMove, onAddLead }: KanbanBoardProps) {
    // Group leads by status
    const getLeadsByStatus = (status: LeadStatus) =>
        leads.filter((lead) => lead.status === status);

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        // Dropped outside a valid target
        if (!destination) return;

        // Dropped in the same position
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Get new status from destination droppableId
        const newStatus = destination.droppableId as LeadStatus;
        onLeadMove(draggableId, newStatus);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            notation: 'compact',
        }).format(value);
    };

    const getColumnTotal = (status: LeadStatus) => {
        return getLeadsByStatus(status).reduce(
            (sum, lead) => sum + (lead.potentialValue || 0),
            0
        );
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    overflowX: 'auto',
                    padding: '1rem 0',
                    minHeight: 'calc(100vh - 180px)',
                }}
            >
                {PIPELINE_COLUMNS.filter(
                    (col) => col.id !== 'no_show' && col.id !== 'perdido'
                ).map((column) => {
                    const columnLeads = getLeadsByStatus(column.id);
                    const columnTotal = getColumnTotal(column.id);

                    return (
                        <div key={column.id} className="kanban-column">
                            {/* Column Header */}
                            <div className="kanban-column-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ color: column.color }}>
                                        {getColumnIcon(column.icon)}
                                    </span>
                                    <h3
                                        style={{
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)',
                                        }}
                                    >
                                        {column.title}
                                    </h3>
                                    <span
                                        style={{
                                            background: 'var(--bg-tertiary)',
                                            color: 'var(--text-secondary)',
                                            padding: '0.125rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {columnLeads.length}
                                    </span>
                                </div>
                                <button
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
                            </div>

                            {/* Column Value */}
                            {columnTotal > 0 && (
                                <div
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderBottom: '1px solid var(--border-primary)',
                                        fontSize: '0.75rem',
                                        color: 'var(--text-secondary)',
                                    }}
                                >
                                    Valor: <span style={{ fontWeight: 600 }}>{formatCurrency(columnTotal)}</span>
                                </div>
                            )}

                            {/* Droppable Area */}
                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="kanban-column-content"
                                        style={{
                                            background: snapshot.isDraggingOver
                                                ? 'var(--accent-glow)'
                                                : 'transparent',
                                            transition: 'background 0.2s ease',
                                            minHeight: '200px',
                                        }}
                                    >
                                        {columnLeads.map((lead, index) => (
                                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <LeadCard
                                                            lead={lead}
                                                            onClick={() => onLeadClick(lead)}
                                                            isDragging={snapshot.isDragging}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}

                                        {/* Add Card Button */}
                                        {column.id === 'nuevo' && onAddLead && (
                                            <button
                                                onClick={onAddLead}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    background: 'transparent',
                                                    border: '1px dashed var(--border-secondary)',
                                                    borderRadius: 'var(--radius-md)',
                                                    color: 'var(--text-tertiary)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.375rem',
                                                    fontSize: '0.875rem',
                                                    transition: 'all 0.2s ease',
                                                }}
                                            >
                                                <Plus size={16} strokeWidth={1.5} />
                                                Agregar Lead
                                            </button>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}
