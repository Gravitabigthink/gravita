'use client';

/**
 * The Factory - Marketing Strategy Engine
 * 
 * Complete UI for generating AI-powered marketing strategies
 * with 14-step Chain of Thought process.
 */

import React, { useState, useEffect } from 'react';
import {
    Rocket, Play, RefreshCw, Download, Eye, Check,
    Loader2, AlertTriangle, Clock, Plus,
    ChevronDown, ChevronUp, FileText, FileSpreadsheet,
    Brain, Lightbulb, TrendingUp, Users
} from 'lucide-react';
import './the-factory.css';

// Types
interface CompetitorData {
    nombre: string;
    website?: string;
    fortalezas?: string;
    debilidades?: string;
    notas?: string;
}

interface MarketingClientInput {
    nombre_contacto: string;
    nombre_empresa: string;
    sitio_web?: string;
    redes_sociales?: string[];
    etapa_crecimiento: 'startup' | 'crecimiento' | 'establecido' | 'enterprise';
    descripcion_productos: string;
    producto_estrella_1: string;
    producto_2?: string;
    producto_3?: string;
    mercado_general: string;
    nicho: string;
    cliente_ideal: string;
    dolores_cliente: string[];
    competencia: CompetitorData[];
    objetivos_negocio: string[];
    restricciones?: string[];
    tono_marca?: 'formal' | 'casual' | 'inspiracional' | 'tecnico' | 'amigable';
}

interface StrategyStep {
    id: number;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    hasOutput?: boolean;
    error?: string;
}

interface Strategy {
    id: string;
    clientName: string;
    status: string;
    progress: { completed: number; total: number; percentage: number };
    steps: StrategyStep[];
    hasBrief: boolean;
    hasStrategy: boolean;
    hasContent: boolean;
    createdAt: string;
}

// Initial form state
const initialFormState: MarketingClientInput = {
    nombre_contacto: '',
    nombre_empresa: '',
    sitio_web: '',
    redes_sociales: [],
    etapa_crecimiento: 'crecimiento',
    descripcion_productos: '',
    producto_estrella_1: '',
    producto_2: '',
    producto_3: '',
    mercado_general: '',
    nicho: '',
    cliente_ideal: '',
    dolores_cliente: [''],
    competencia: [{ nombre: '', website: '', fortalezas: '', debilidades: '' }],
    objetivos_negocio: [''],
    restricciones: [''],
    tono_marca: 'amigable'
};

export default function TheFactoryPage() {
    // State
    const [activeTab, setActiveTab] = useState<'new' | 'active' | 'history'>('new');
    const [formData, setFormData] = useState<MarketingClientInput>(initialFormState);
    const [currentStrategy, setCurrentStrategy] = useState<Strategy | null>(null);
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
    const [stepOutputs, setStepOutputs] = useState<Record<number, string>>({});
    const [showPreview, setShowPreview] = useState<'brief' | 'strategy' | null>(null);
    const [previewContent, setPreviewContent] = useState<string>('');
    const [socialNetworks, setSocialNetworks] = useState<string>('');

    // Load strategies on mount
    useEffect(() => {
        loadStrategies();
    }, []);

    // Poll for updates when executing
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isExecuting && currentStrategy) {
            interval = setInterval(() => {
                loadStrategyStatus(currentStrategy.id);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isExecuting, currentStrategy]);

    // API Functions
    const loadStrategies = async () => {
        try {
            const res = await fetch('/api/marketing/status');
            const data = await res.json();
            if (data.success) {
                setStrategies(data.strategies || []);
            }
        } catch (error) {
            console.error('Error loading strategies:', error);
        }
    };

    const loadStrategyStatus = async (strategyId: string) => {
        try {
            const res = await fetch(`/api/marketing/status?id=${strategyId}`);
            const data = await res.json();
            if (data.success) {
                setCurrentStrategy(data.strategy);
                if (data.strategy.status === 'completed' || data.strategy.status === 'error') {
                    setIsExecuting(false);
                }
            }
        } catch (error) {
            console.error('Error loading status:', error);
        }
    };

    const startStrategy = async () => {
        setIsLoading(true);
        try {
            // Parse social networks
            const redes = socialNetworks.split(',').map(s => s.trim()).filter(Boolean);

            const res = await fetch('/api/marketing/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientInput: {
                        ...formData,
                        redes_sociales: redes,
                        dolores_cliente: formData.dolores_cliente.filter(Boolean),
                        objetivos_negocio: formData.objetivos_negocio.filter(Boolean),
                        restricciones: formData.restricciones?.filter(Boolean),
                        competencia: formData.competencia.filter(c => c.nombre)
                    }
                })
            });
            const data = await res.json();

            if (data.success) {
                setActiveTab('active');
                await loadStrategyStatus(data.contextId);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error starting strategy:', error);
            alert('Error al iniciar la estrategia');
        } finally {
            setIsLoading(false);
        }
    };

    const executeAllSteps = async () => {
        if (!currentStrategy) return;
        setIsExecuting(true);

        try {
            const res = await fetch('/api/marketing/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contextId: currentStrategy.id,
                    executeAll: true
                })
            });
            const data = await res.json();

            if (!data.success) {
                setIsExecuting(false);
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error executing steps:', error);
            setIsExecuting(false);
        }
    };

    const executeStep = async (stepId: number) => {
        if (!currentStrategy) return;

        try {
            const res = await fetch('/api/marketing/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contextId: currentStrategy.id,
                    stepId
                })
            });
            const data = await res.json();

            if (data.success) {
                await loadStrategyStatus(currentStrategy.id);
            }
        } catch (error) {
            console.error('Error executing step:', error);
        }
    };

    const regenerateStep = async (stepId: number) => {
        if (!currentStrategy) return;

        try {
            const res = await fetch('/api/marketing/regenerate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contextId: currentStrategy.id,
                    stepId
                })
            });
            const data = await res.json();

            if (data.success) {
                await loadStrategyStatus(currentStrategy.id);
            }
        } catch (error) {
            console.error('Error regenerating step:', error);
        }
    };

    const loadStepOutput = async (stepId: number) => {
        if (!currentStrategy) return;

        try {
            const res = await fetch(`/api/marketing/generate?id=${currentStrategy.id}`);
            const data = await res.json();

            if (data.success && data.context?.steps) {
                const step = data.context.steps.find((s: StrategyStep & { output?: string }) => s.id === stepId);
                if (step?.output) {
                    setStepOutputs(prev => ({ ...prev, [stepId]: step.output }));
                }
            }
        } catch (error) {
            console.error('Error loading step output:', error);
        }
    };

    const loadDocument = async (type: 'brief' | 'strategy') => {
        if (!currentStrategy) return;

        try {
            const res = await fetch(`/api/marketing/documents?id=${currentStrategy.id}&type=${type}`);
            const data = await res.json();

            if (data.success) {
                setPreviewContent(type === 'brief' ? data.briefHtml : data.strategyHtml);
                setShowPreview(type);
            }
        } catch (error) {
            console.error('Error loading document:', error);
        }
    };

    const downloadDocument = async (type: 'brief' | 'strategy' | 'content') => {
        if (!currentStrategy) return;

        try {
            const res = await fetch('/api/marketing/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contextId: currentStrategy.id,
                    type
                })
            });

            const blob = await res.blob();
            const extension = type === 'content' ? 'csv' : 'html';
            const filename = `${type}_${currentStrategy.clientName.replace(/\s+/g, '_')}.${extension}`;

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading document:', error);
        }
    };

    // Form handlers
    const updateFormField = (field: keyof MarketingClientInput, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addArrayItem = (field: 'dolores_cliente' | 'objetivos_negocio' | 'restricciones') => {
        setFormData(prev => ({
            ...prev,
            [field]: [...(prev[field] || []), '']
        }));
    };

    const updateArrayItem = (
        field: 'dolores_cliente' | 'objetivos_negocio' | 'restricciones',
        index: number,
        value: string
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev[field] || []).map((item, i) => i === index ? value : item)
        }));
    };

    const addCompetitor = () => {
        setFormData(prev => ({
            ...prev,
            competencia: [...prev.competencia, { nombre: '', website: '', fortalezas: '', debilidades: '' }]
        }));
    };

    const updateCompetitor = (index: number, field: keyof CompetitorData, value: string) => {
        setFormData(prev => ({
            ...prev,
            competencia: prev.competencia.map((c, i) =>
                i === index ? { ...c, [field]: value } : c
            )
        }));
    };

    const toggleStepExpanded = (stepId: number) => {
        setExpandedSteps(prev => {
            const newSet = new Set(prev);
            if (newSet.has(stepId)) {
                newSet.delete(stepId);
            } else {
                newSet.add(stepId);
                loadStepOutput(stepId);
            }
            return newSet;
        });
    };

    // Render step status icon
    const renderStepIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <Check className="step-icon completed" />;
            case 'running':
                return <Loader2 className="step-icon running spin" />;
            case 'error':
                return <AlertTriangle className="step-icon error" />;
            default:
                return <Clock className="step-icon pending" />;
        }
    };

    return (
        <div className="the-factory">
            {/* Header */}
            <header className="factory-header">
                <div className="header-content">
                    <div className="header-icon">
                        <Brain />
                    </div>
                    <div className="header-text">
                        <h1>The Factory</h1>
                        <p>Motor de Estrategia de Marketing con IA</p>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="stat">
                        <Lightbulb />
                        <span>14 Pasos</span>
                    </div>
                    <div className="stat">
                        <TrendingUp />
                        <span>Chain of Thought</span>
                    </div>
                    <div className="stat">
                        <Users />
                        <span>{strategies.length} Estrategias</span>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <nav className="factory-tabs">
                <button
                    className={`tab ${activeTab === 'new' ? 'active' : ''}`}
                    onClick={() => setActiveTab('new')}
                >
                    <Plus /> Nuevo Cliente
                </button>
                <button
                    className={`tab ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                    disabled={!currentStrategy}
                >
                    <Rocket /> Estrategia Activa
                </button>
                <button
                    className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <FileText /> Historial
                </button>
            </nav>

            {/* Content */}
            <main className="factory-content">
                {/* New Client Form */}
                {activeTab === 'new' && (
                    <div className="new-client-form">
                        <h2>📋 Información del Cliente</h2>

                        {/* Basic Info */}
                        <section className="form-section">
                            <h3>Datos Básicos</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nombre del Contacto *</label>
                                    <input
                                        type="text"
                                        value={formData.nombre_contacto}
                                        onChange={(e) => updateFormField('nombre_contacto', e.target.value)}
                                        placeholder="Ej: Juan Pérez"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nombre de la Empresa *</label>
                                    <input
                                        type="text"
                                        value={formData.nombre_empresa}
                                        onChange={(e) => updateFormField('nombre_empresa', e.target.value)}
                                        placeholder="Ej: Acme Corp"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Sitio Web</label>
                                    <input
                                        type="url"
                                        value={formData.sitio_web}
                                        onChange={(e) => updateFormField('sitio_web', e.target.value)}
                                        placeholder="https://ejemplo.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Redes Sociales (separadas por coma)</label>
                                    <input
                                        type="text"
                                        value={socialNetworks}
                                        onChange={(e) => setSocialNetworks(e.target.value)}
                                        placeholder="@instagram, @facebook, @linkedin"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Etapa de Crecimiento</label>
                                    <select
                                        value={formData.etapa_crecimiento}
                                        onChange={(e) => updateFormField('etapa_crecimiento', e.target.value)}
                                    >
                                        <option value="startup">Startup (0-2 años)</option>
                                        <option value="crecimiento">En Crecimiento (2-5 años)</option>
                                        <option value="establecido">Establecido (5+ años)</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Tono de Marca</label>
                                    <select
                                        value={formData.tono_marca}
                                        onChange={(e) => updateFormField('tono_marca', e.target.value)}
                                    >
                                        <option value="formal">Formal</option>
                                        <option value="casual">Casual</option>
                                        <option value="inspiracional">Inspiracional</option>
                                        <option value="tecnico">Técnico</option>
                                        <option value="amigable">Amigable</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Products */}
                        <section className="form-section">
                            <h3>Productos / Servicios</h3>
                            <div className="form-group full-width">
                                <label>Descripción General de Productos/Servicios *</label>
                                <textarea
                                    value={formData.descripcion_productos}
                                    onChange={(e) => updateFormField('descripcion_productos', e.target.value)}
                                    placeholder="Describe brevemente qué ofrece la empresa..."
                                    rows={3}
                                />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Producto/Servicio Estrella *</label>
                                    <input
                                        type="text"
                                        value={formData.producto_estrella_1}
                                        onChange={(e) => updateFormField('producto_estrella_1', e.target.value)}
                                        placeholder="El producto principal"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Producto Secundario</label>
                                    <input
                                        type="text"
                                        value={formData.producto_2}
                                        onChange={(e) => updateFormField('producto_2', e.target.value)}
                                        placeholder="Opcional"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Producto Terciario</label>
                                    <input
                                        type="text"
                                        value={formData.producto_3}
                                        onChange={(e) => updateFormField('producto_3', e.target.value)}
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Market */}
                        <section className="form-section">
                            <h3>Mercado y Audiencia</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Mercado General *</label>
                                    <input
                                        type="text"
                                        value={formData.mercado_general}
                                        onChange={(e) => updateFormField('mercado_general', e.target.value)}
                                        placeholder="Ej: Salud y Bienestar, Tecnología, etc."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nicho Específico *</label>
                                    <input
                                        type="text"
                                        value={formData.nicho}
                                        onChange={(e) => updateFormField('nicho', e.target.value)}
                                        placeholder="Ej: Fitness para ejecutivos"
                                    />
                                </div>
                            </div>
                            <div className="form-group full-width">
                                <label>Descripción del Cliente Ideal *</label>
                                <textarea
                                    value={formData.cliente_ideal}
                                    onChange={(e) => updateFormField('cliente_ideal', e.target.value)}
                                    placeholder="Describe en detalle a tu cliente ideal (demographics, comportamientos, etc.)"
                                    rows={3}
                                />
                            </div>
                        </section>

                        {/* Pain Points */}
                        <section className="form-section">
                            <h3>Dolores del Cliente</h3>
                            <div className="dynamic-list">
                                {formData.dolores_cliente.map((dolor, index) => (
                                    <div key={index} className="list-item">
                                        <input
                                            type="text"
                                            value={dolor}
                                            onChange={(e) => updateArrayItem('dolores_cliente', index, e.target.value)}
                                            placeholder={`Dolor/problema #${index + 1}`}
                                        />
                                    </div>
                                ))}
                                <button type="button" className="btn-add" onClick={() => addArrayItem('dolores_cliente')}>
                                    <Plus /> Agregar Dolor
                                </button>
                            </div>
                        </section>

                        {/* Competitors */}
                        <section className="form-section">
                            <h3>Competencia</h3>
                            <div className="competitors-list">
                                {formData.competencia.map((comp, index) => (
                                    <div key={index} className="competitor-card">
                                        <h4>Competidor {index + 1}</h4>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Nombre</label>
                                                <input
                                                    type="text"
                                                    value={comp.nombre}
                                                    onChange={(e) => updateCompetitor(index, 'nombre', e.target.value)}
                                                    placeholder="Nombre del competidor"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Website</label>
                                                <input
                                                    type="text"
                                                    value={comp.website}
                                                    onChange={(e) => updateCompetitor(index, 'website', e.target.value)}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Fortalezas</label>
                                                <input
                                                    type="text"
                                                    value={comp.fortalezas}
                                                    onChange={(e) => updateCompetitor(index, 'fortalezas', e.target.value)}
                                                    placeholder="¿Qué hacen bien?"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Debilidades</label>
                                                <input
                                                    type="text"
                                                    value={comp.debilidades}
                                                    onChange={(e) => updateCompetitor(index, 'debilidades', e.target.value)}
                                                    placeholder="¿Qué hacen mal?"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="btn-add" onClick={addCompetitor}>
                                    <Plus /> Agregar Competidor
                                </button>
                            </div>
                        </section>

                        {/* Objectives */}
                        <section className="form-section">
                            <h3>Objetivos de Negocio</h3>
                            <div className="dynamic-list">
                                {formData.objetivos_negocio.map((objetivo, index) => (
                                    <div key={index} className="list-item">
                                        <input
                                            type="text"
                                            value={objetivo}
                                            onChange={(e) => updateArrayItem('objetivos_negocio', index, e.target.value)}
                                            placeholder={`Objetivo #${index + 1}`}
                                        />
                                    </div>
                                ))}
                                <button type="button" className="btn-add" onClick={() => addArrayItem('objetivos_negocio')}>
                                    <Plus /> Agregar Objetivo
                                </button>
                            </div>
                        </section>

                        {/* Restrictions */}
                        <section className="form-section">
                            <h3>Restricciones (Opcional)</h3>
                            <div className="dynamic-list">
                                {(formData.restricciones || ['']).map((restriccion, index) => (
                                    <div key={index} className="list-item">
                                        <input
                                            type="text"
                                            value={restriccion}
                                            onChange={(e) => updateArrayItem('restricciones', index, e.target.value)}
                                            placeholder={`Restricción #${index + 1}`}
                                        />
                                    </div>
                                ))}
                                <button type="button" className="btn-add" onClick={() => addArrayItem('restricciones')}>
                                    <Plus /> Agregar Restricción
                                </button>
                            </div>
                        </section>

                        {/* Submit */}
                        <div className="form-actions">
                            <button
                                className="btn-primary btn-large"
                                onClick={startStrategy}
                                disabled={isLoading || !formData.nombre_empresa || !formData.nombre_contacto}
                            >
                                {isLoading ? (
                                    <><Loader2 className="spin" /> Iniciando...</>
                                ) : (
                                    <><Rocket /> Iniciar Estrategia IA</>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Active Strategy */}
                {activeTab === 'active' && currentStrategy && (
                    <div className="active-strategy">
                        {/* Strategy Header */}
                        <div className="strategy-header">
                            <div className="strategy-info">
                                <h2>{currentStrategy.clientName}</h2>
                                <span className={`status-badge ${currentStrategy.status}`}>
                                    {currentStrategy.status}
                                </span>
                            </div>
                            <div className="strategy-actions">
                                {currentStrategy.status !== 'completed' && (
                                    <button
                                        className="btn-primary"
                                        onClick={executeAllSteps}
                                        disabled={isExecuting}
                                    >
                                        {isExecuting ? (
                                            <><Loader2 className="spin" /> Ejecutando...</>
                                        ) : (
                                            <><Play /> Ejecutar Todos los Pasos</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="progress-section">
                            <div className="progress-header">
                                <span>Progreso: {currentStrategy.progress.completed}/{currentStrategy.progress.total}</span>
                                <span>{currentStrategy.progress.percentage}%</span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${currentStrategy.progress.percentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Steps List */}
                        <div className="steps-list">
                            {currentStrategy.steps.map((step) => (
                                <div key={step.id} className={`step-card ${step.status}`}>
                                    <div className="step-header" onClick={() => toggleStepExpanded(step.id)}>
                                        <div className="step-left">
                                            {renderStepIcon(step.status)}
                                            <span className="step-number">Paso {step.id}</span>
                                            <span className="step-name">{step.name}</span>
                                        </div>
                                        <div className="step-right">
                                            {step.status === 'completed' && (
                                                <button
                                                    className="btn-icon"
                                                    onClick={(e) => { e.stopPropagation(); regenerateStep(step.id); }}
                                                    title="Regenerar"
                                                >
                                                    <RefreshCw />
                                                </button>
                                            )}
                                            {step.status === 'pending' && (
                                                <button
                                                    className="btn-icon"
                                                    onClick={(e) => { e.stopPropagation(); executeStep(step.id); }}
                                                    title="Ejecutar"
                                                >
                                                    <Play />
                                                </button>
                                            )}
                                            {expandedSteps.has(step.id) ? <ChevronUp /> : <ChevronDown />}
                                        </div>
                                    </div>
                                    {expandedSteps.has(step.id) && (
                                        <div className="step-content">
                                            {step.error ? (
                                                <div className="error-message">{step.error}</div>
                                            ) : stepOutputs[step.id] ? (
                                                <div className="step-output">
                                                    <pre>{stepOutputs[step.id]}</pre>
                                                </div>
                                            ) : (
                                                <div className="loading-output">
                                                    <Loader2 className="spin" /> Cargando...
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Documents Section */}
                        {currentStrategy.status === 'completed' && (
                            <div className="documents-section">
                                <h3>📄 Documentos Generados</h3>
                                <div className="documents-grid">
                                    <div className="document-card">
                                        <FileText className="doc-icon" />
                                        <h4>Brief Estratégico</h4>
                                        <div className="doc-actions">
                                            <button onClick={() => loadDocument('brief')}>
                                                <Eye /> Ver
                                            </button>
                                            <button onClick={() => downloadDocument('brief')}>
                                                <Download /> Descargar
                                            </button>
                                        </div>
                                    </div>
                                    <div className="document-card">
                                        <FileText className="doc-icon" />
                                        <h4>Estrategia de Marketing</h4>
                                        <div className="doc-actions">
                                            <button onClick={() => loadDocument('strategy')}>
                                                <Eye /> Ver
                                            </button>
                                            <button onClick={() => downloadDocument('strategy')}>
                                                <Download /> Descargar
                                            </button>
                                        </div>
                                    </div>
                                    <div className="document-card">
                                        <FileSpreadsheet className="doc-icon" />
                                        <h4>Calendario de Contenido</h4>
                                        <div className="doc-actions">
                                            <button onClick={() => downloadDocument('content')}>
                                                <Download /> Descargar CSV
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* History */}
                {activeTab === 'history' && (
                    <div className="history-section">
                        <h2>📜 Historial de Estrategias</h2>
                        {strategies.length === 0 ? (
                            <div className="empty-state">
                                <FileText />
                                <p>No hay estrategias anteriores</p>
                            </div>
                        ) : (
                            <div className="history-list">
                                {strategies.map((strategy) => (
                                    <div key={strategy.id} className="history-card" onClick={() => {
                                        loadStrategyStatus(strategy.id);
                                        setActiveTab('active');
                                    }}>
                                        <div className="history-info">
                                            <h4>{strategy.clientName}</h4>
                                            <span className={`status-badge ${strategy.status}`}>
                                                {strategy.status}
                                            </span>
                                        </div>
                                        <div className="history-meta">
                                            <span>Progreso: {strategy.progress.percentage}%</span>
                                            <span>{new Date(strategy.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Document Preview Modal */}
            {showPreview && (
                <div className="preview-modal">
                    <div className="preview-header">
                        <h3>{showPreview === 'brief' ? 'Brief Estratégico' : 'Estrategia de Marketing'}</h3>
                        <button onClick={() => setShowPreview(null)}>✕</button>
                    </div>
                    <div className="preview-content">
                        <iframe
                            srcDoc={previewContent}
                            title="Document Preview"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

