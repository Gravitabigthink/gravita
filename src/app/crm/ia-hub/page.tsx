'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import TokenUsageWidget from '@/components/crm/TokenUsageWidget';
import {
    getAllAgents,
    getGlobalAgentStats,
    toggleAgent,
    createAgent,
    updateAgent,
    addCustomInstruction,
    AIAgent
} from '@/lib/agent-manager';
import { ModelTier } from '@/lib/llm-router';
import {
    Bot, Zap, Brain, MessageSquare, Code, Settings, Plus,
    Power, PowerOff, TrendingUp, Clock, DollarSign, Loader2,
    ChevronRight, X, Save, Sparkles
} from 'lucide-react';

// ============================================
// COMPONENTE: AgentCard
// ============================================

interface AgentCardProps {
    agent: AIAgent;
    onToggle: (id: string) => void;
    onConfigure: (agent: AIAgent) => void;
}

function AgentCard({ agent, onToggle, onConfigure }: AgentCardProps) {
    const categoryColors: Record<string, string> = {
        sales: '#10b981',
        analysis: '#8b5cf6',
        automation: '#f59e0b',
        development: '#3b82f6',
        custom: '#ec4899'
    };

    const tierLabels: Record<ModelTier, string> = {
        simple: 'Flash Lite',
        standard: 'Flash',
        advanced: 'DeepSeek'
    };

    return (
        <div
            className="card"
            style={{
                opacity: agent.isActive ? 1 : 0.6,
                transition: 'all 0.3s ease'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius-md)',
                            background: `${categoryColors[agent.category]}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}
                    >
                        {agent.avatar}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                            {agent.name}
                        </h3>
                        <span
                            style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '9999px',
                                background: `${categoryColors[agent.category]}30`,
                                color: categoryColors[agent.category]
                            }}
                        >
                            {tierLabels[agent.modelTier]}
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => onToggle(agent.id)}
                    style={{
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: agent.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: agent.isActive ? '#10b981' : '#ef4444',
                        cursor: 'pointer'
                    }}
                    title={agent.isActive ? 'Desactivar' : 'Activar'}
                >
                    {agent.isActive ? <Power size={16} /> : <PowerOff size={16} />}
                </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                {agent.description}
            </p>

            {/* Stats */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius-sm)'
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {agent.stats.totalCalls}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Llamadas</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {agent.stats.successfulCalls > 0
                            ? `${Math.round((agent.stats.successfulCalls / agent.stats.totalCalls) * 100)}%`
                            : '-'}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Éxito</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        ${agent.stats.costUSD.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Costo</div>
                </div>
            </div>

            <button
                onClick={() => onConfigure(agent)}
                className="btn btn-secondary"
                style={{ width: '100%', gap: '0.5rem' }}
            >
                <Settings size={14} />
                Configurar / Entrenar
            </button>
        </div>
    );
}

// ============================================
// COMPONENTE: CreateAgentModal
// ============================================

interface CreateAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

function CreateAgentModal({ isOpen, onClose, onCreated }: CreateAgentModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [avatar, setAvatar] = useState('🤖');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [modelTier, setModelTier] = useState<ModelTier>('standard');
    const [category, setCategory] = useState<AIAgent['category']>('custom');

    const emojis = ['🤖', '🧠', '💬', '📊', '🎯', '⚡', '🔮', '🎨', '📝', '🔍', '💡', '🚀'];

    const handleCreate = () => {
        if (!name || !systemPrompt) return;

        createAgent({
            name,
            description,
            avatar,
            systemPrompt,
            modelTier,
            category
        });

        // Reset form
        setName('');
        setDescription('');
        setAvatar('🤖');
        setSystemPrompt('');
        setModelTier('standard');
        setCategory('custom');

        onCreated();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(4px)'
            }}
            onClick={onClose}
        >
            <div
                className="card"
                style={{
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    margin: '1rem'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <Sparkles size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        Crear Nuevo Agente
                    </h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Avatar */}
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                            Avatar
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {emojis.map(e => (
                                <button
                                    key={e}
                                    onClick={() => setAvatar(e)}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        fontSize: '1.25rem',
                                        border: avatar === e ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                                        borderRadius: 'var(--radius-sm)',
                                        background: avatar === e ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nombre */}
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                            Nombre del Agente *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ej: Sales Coach"
                            className="input"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                            Descripción
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="¿Qué hace este agente?"
                            className="input"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Modelo y Categoría */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                                Modelo
                            </label>
                            <select
                                value={modelTier}
                                onChange={e => setModelTier(e.target.value as ModelTier)}
                                className="input"
                                style={{ width: '100%' }}
                            >
                                <option value="simple">Simple (Gemini Lite)</option>
                                <option value="standard">Standard (Gemini Flash)</option>
                                <option value="advanced">Advanced (DeepSeek)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                                Categoría
                            </label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value as AIAgent['category'])}
                                className="input"
                                style={{ width: '100%' }}
                            >
                                <option value="custom">Personalizado</option>
                                <option value="sales">Ventas</option>
                                <option value="analysis">Análisis</option>
                                <option value="automation">Automatización</option>
                                <option value="development">Desarrollo</option>
                            </select>
                        </div>
                    </div>

                    {/* System Prompt */}
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                            System Prompt (Personalidad) *
                        </label>
                        <textarea
                            value={systemPrompt}
                            onChange={e => setSystemPrompt(e.target.value)}
                            placeholder="Eres un experto en... Tu trabajo es..."
                            className="input"
                            style={{ width: '100%', minHeight: '150px', resize: 'vertical' }}
                        />
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                            Define la personalidad, rol y comportamiento del agente.
                        </p>
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={!name || !systemPrompt}
                        className="btn btn-primary"
                        style={{ marginTop: '0.5rem' }}
                    >
                        <Plus size={16} />
                        Crear Agente
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE: ConfigureAgentModal
// ============================================

interface ConfigureAgentModalProps {
    agent: AIAgent | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

function ConfigureAgentModal({ agent, isOpen, onClose, onUpdated }: ConfigureAgentModalProps) {
    const [systemPrompt, setSystemPrompt] = useState('');
    const [newInstruction, setNewInstruction] = useState('');

    useEffect(() => {
        if (agent) {
            setSystemPrompt(agent.systemPrompt);
        }
    }, [agent]);

    const handleSave = () => {
        if (!agent) return;
        updateAgent(agent.id, { systemPrompt });
        onUpdated();
        onClose();
    };

    const handleAddInstruction = () => {
        if (!agent || !newInstruction.trim()) return;
        addCustomInstruction(agent.id, newInstruction.trim());
        setNewInstruction('');
        onUpdated();
    };

    if (!isOpen || !agent) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(4px)'
            }}
            onClick={onClose}
        >
            <div
                className="card"
                style={{
                    width: '100%',
                    maxWidth: '700px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    margin: '1rem'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '2rem' }}>{agent.avatar}</span>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {agent.name}
                            </h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                Configurar y entrenar
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* System Prompt */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                        🧠 System Prompt
                    </label>
                    <textarea
                        value={systemPrompt}
                        onChange={e => setSystemPrompt(e.target.value)}
                        className="input"
                        style={{ width: '100%', minHeight: '200px', resize: 'vertical' }}
                    />
                </div>

                {/* Custom Instructions */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                        📝 Instrucciones Adicionales
                    </label>
                    {agent.customInstructions.length > 0 ? (
                        <ul style={{ margin: '0 0 1rem 0', padding: '0 0 0 1.5rem' }}>
                            {agent.customInstructions.map((inst, i) => (
                                <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                    {inst}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                            Sin instrucciones adicionales aún.
                        </p>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            value={newInstruction}
                            onChange={e => setNewInstruction(e.target.value)}
                            placeholder="Nueva instrucción..."
                            className="input"
                            style={{ flex: 1 }}
                        />
                        <button onClick={handleAddInstruction} className="btn btn-secondary">
                            <Plus size={14} />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div
                    style={{
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem'
                    }}
                >
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                        📊 Estadísticas
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                                {agent.stats.totalCalls}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Total llamadas</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#10b981' }}>
                                {agent.stats.successfulCalls}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Exitosas</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {agent.stats.tokensUsed.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Tokens</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f59e0b' }}>
                                ${agent.stats.costUSD.toFixed(3)}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Costo USD</div>
                        </div>
                    </div>
                </div>

                <button onClick={handleSave} className="btn btn-primary" style={{ width: '100%' }}>
                    <Save size={16} />
                    Guardar Cambios
                </button>
            </div>
        </div>
    );
}

// ============================================
// PÁGINA PRINCIPAL: IA Hub
// ============================================

export default function IAHubPage() {
    const [agents, setAgents] = useState<AIAgent[]>([]);
    const [globalStats, setGlobalStats] = useState<ReturnType<typeof getGlobalAgentStats> | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

    useEffect(() => {
        setIsClient(true);
        loadData();
    }, []);

    const loadData = () => {
        setAgents(getAllAgents());
        setGlobalStats(getGlobalAgentStats());
    };

    const handleToggle = (id: string) => {
        toggleAgent(id);
        loadData();
    };

    if (!isClient) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar />
                <main style={{ flex: 1, marginLeft: '280px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
                </main>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main style={{ flex: 1, marginLeft: '280px', padding: '1.5rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Brain size={28} />
                        Centro de Control IA
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Gestiona tus agentes, monitorea el uso de tokens y entrena tu IA
                    </p>
                </div>

                {/* Stats Overview */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}
                >
                    <div className="card" style={{ textAlign: 'center' }}>
                        <Bot size={24} style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {globalStats?.totalAgents || 0}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Agentes Totales</div>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <Zap size={24} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                            {globalStats?.activeAgents || 0}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Activos</div>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <MessageSquare size={24} style={{ color: '#3b82f6', marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {globalStats?.totalCalls || 0}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Llamadas Totales</div>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <DollarSign size={24} style={{ color: '#f59e0b', marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
                            ${globalStats?.totalCostUSD.toFixed(2) || '0.00'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Gasto Total USD</div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
                    {/* Agents List */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                🤖 Mis Agentes
                            </h2>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="btn btn-primary"
                                style={{ gap: '0.5rem' }}
                            >
                                <Plus size={16} />
                                Nuevo Agente
                            </button>
                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '1rem'
                            }}
                        >
                            {agents.map(agent => (
                                <AgentCard
                                    key={agent.id}
                                    agent={agent}
                                    onToggle={handleToggle}
                                    onConfigure={setSelectedAgent}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Token Usage Widget */}
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                            💰 Consumo de Tokens
                        </h2>
                        <TokenUsageWidget />
                    </div>
                </div>
            </main>

            {/* Modals */}
            <CreateAgentModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={loadData}
            />

            <ConfigureAgentModal
                agent={selectedAgent}
                isOpen={!!selectedAgent}
                onClose={() => setSelectedAgent(null)}
                onUpdated={loadData}
            />
        </div>
    );
}
