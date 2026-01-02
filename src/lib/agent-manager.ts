/**
 * Agent Manager Service
 * 
 * Gestiona todos los agentes de IA de la plataforma:
 * - Registro y configuración
 * - Estadísticas de uso
 * - Entrenamiento personalizado
 */

import { ModelTier, Provider } from './llm-router';

// ============================================
// TIPOS
// ============================================

export interface AgentStats {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    tokensUsed: number;
    costUSD: number;
    lastUsed?: Date;
    avgResponseTime?: number;
}

export interface TrainingExample {
    id: string;
    input: string;
    expectedOutput: string;
    addedAt: Date;
}

export interface AIAgent {
    id: string;
    name: string;
    description: string;
    avatar: string;
    systemPrompt: string;
    modelTier: ModelTier;
    provider: Provider;
    isActive: boolean;
    isBuiltIn: boolean; // true = agente del sistema, false = creado por usuario
    createdAt: Date;
    updatedAt: Date;

    // Estadísticas
    stats: AgentStats;

    // Entrenamiento adicional
    customInstructions: string[];
    trainingExamples: TrainingExample[];

    // Categoría
    category: 'sales' | 'analysis' | 'automation' | 'development' | 'custom';
}

// ============================================
// AGENTES PREDEFINIDOS
// ============================================

const BUILT_IN_AGENTS: Omit<AIAgent, 'stats'>[] = [
    {
        id: 'setter-agent',
        name: 'Setter Agent',
        description: 'Envía mensajes automáticos de seguimiento y califica leads según su etapa en el pipeline.',
        avatar: '💬',
        systemPrompt: `Eres un setter profesional de ventas. Tu trabajo es:
- Enviar mensajes de bienvenida personalizados
- Hacer seguimiento a leads que no responden
- Calificar leads según sus respuestas
- Agendar citas con el closer
Sé amigable pero profesional. Siempre busca avanzar al lead en el pipeline.`,
        modelTier: 'standard',
        provider: 'gemini',
        isActive: true,
        isBuiltIn: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        customInstructions: [],
        trainingExamples: [],
        category: 'sales'
    },
    {
        id: 'profiler-agent',
        name: 'Profiler Agent',
        description: 'Analiza transcripciones de llamadas para crear perfiles psicológicos y detectar señales de compra.',
        avatar: '🧠',
        systemPrompt: `Eres un experto en análisis psicológico de prospectos. Tu trabajo es:
- Analizar transcripciones de llamadas
- Identificar el tipo de personalidad (analítico, emocional, asertivo, indeciso)
- Detectar objeciones y pain points
- Sugerir estrategias de cierre personalizadas
Basa tus análisis en patrones de lenguaje y comportamiento.`,
        modelTier: 'advanced',
        provider: 'deepseek',
        isActive: true,
        isBuiltIn: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        customInstructions: [],
        trainingExamples: [],
        category: 'analysis'
    },
    {
        id: 'quote-agent',
        name: 'Quote Agent',
        description: 'Genera y edita cotizaciones basándose en las necesidades detectadas del cliente.',
        avatar: '📋',
        systemPrompt: `Eres un experto en crear propuestas comerciales. Tu trabajo es:
- Generar cotizaciones personalizadas
- Editar propuestas según instrucciones
- Sugerir servicios adicionales relevantes
- Calcular descuentos estratégicos
Siempre presenta opciones claras y justifica los precios.`,
        modelTier: 'standard',
        provider: 'gemini',
        isActive: true,
        isBuiltIn: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        customInstructions: [],
        trainingExamples: [],
        category: 'sales'
    },
    {
        id: 'dev-agent',
        name: 'Dev Agent',
        description: 'Sugiere mejoras de código, analiza errores y propone nuevas funcionalidades para la plataforma.',
        avatar: '👨‍💻',
        systemPrompt: `Eres un desarrollador senior experto en Next.js, TypeScript y React. Tu trabajo es:
- Analizar código y sugerir mejoras
- Identificar y resolver bugs
- Proponer nuevas funcionalidades
- Documentar cambios importantes
- Optimizar rendimiento
Siempre explica el "por qué" de tus sugerencias. Prioriza código limpio y mantenible.`,
        modelTier: 'advanced',
        provider: 'deepseek',
        isActive: true,
        isBuiltIn: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        customInstructions: [],
        trainingExamples: [],
        category: 'development'
    },
    {
        id: 'orchestrator-agent',
        name: 'Orchestrator',
        description: 'Coordina todos los agentes y genera sugerencias proactivas basadas en el estado de los leads.',
        avatar: '🎯',
        systemPrompt: `Eres el coordinador central de todos los agentes de IA. Tu trabajo es:
- Analizar el estado de cada lead
- Determinar qué acciones tomar
- Priorizar tareas según urgencia
- Coordinar entre diferentes agentes
Piensa de forma estratégica y prioriza el cierre de ventas.`,
        modelTier: 'standard',
        provider: 'gemini',
        isActive: true,
        isBuiltIn: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        customInstructions: [],
        trainingExamples: [],
        category: 'automation'
    }
];

// ============================================
// STORAGE
// ============================================

const AGENTS_STORAGE_KEY = 'gravita_ai_agents';
const AGENT_STATS_KEY = 'gravita_agent_stats';

function getStoredAgents(): AIAgent[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(AGENTS_STORAGE_KEY);
        if (data) {
            const agents = JSON.parse(data);
            return agents.map((a: AIAgent) => ({
                ...a,
                createdAt: new Date(a.createdAt),
                updatedAt: new Date(a.updatedAt),
                stats: {
                    ...a.stats,
                    lastUsed: a.stats.lastUsed ? new Date(a.stats.lastUsed) : undefined
                }
            }));
        }
    } catch { }
    return [];
}

function saveAgents(agents: AIAgent[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agents));
}

function getStoredStats(): Record<string, AgentStats> {
    if (typeof window === 'undefined') return {};
    try {
        const data = localStorage.getItem(AGENT_STATS_KEY);
        if (data) return JSON.parse(data);
    } catch { }
    return {};
}

function saveStats(stats: Record<string, AgentStats>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AGENT_STATS_KEY, JSON.stringify(stats));
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Obtiene todos los agentes (built-in + custom)
 */
export function getAllAgents(): AIAgent[] {
    const storedAgents = getStoredAgents();
    const storedStats = getStoredStats();

    // Merge built-in agents with stored custom agents
    const builtInWithStats = BUILT_IN_AGENTS.map(agent => {
        const stats = storedStats[agent.id] || createEmptyStats();
        const stored = storedAgents.find(a => a.id === agent.id);
        return {
            ...agent,
            ...stored, // Apply any stored customizations
            isBuiltIn: true,
            stats
        };
    });

    // Get custom agents (not built-in)
    const customAgents = storedAgents.filter(a => !a.isBuiltIn).map(agent => ({
        ...agent,
        stats: storedStats[agent.id] || createEmptyStats()
    }));

    return [...builtInWithStats, ...customAgents];
}

/**
 * Obtiene un agente por ID
 */
export function getAgentById(id: string): AIAgent | null {
    const agents = getAllAgents();
    return agents.find(a => a.id === id) || null;
}

/**
 * Crea estadísticas vacías
 */
function createEmptyStats(): AgentStats {
    return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        tokensUsed: 0,
        costUSD: 0
    };
}

/**
 * Crea un nuevo agente personalizado
 */
export function createAgent(params: {
    name: string;
    description: string;
    avatar: string;
    systemPrompt: string;
    modelTier: ModelTier;
    category: AIAgent['category'];
}): AIAgent {
    const provider: Provider = params.modelTier === 'advanced' ? 'deepseek' : 'gemini';

    const newAgent: AIAgent = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: params.name,
        description: params.description,
        avatar: params.avatar,
        systemPrompt: params.systemPrompt,
        modelTier: params.modelTier,
        provider,
        isActive: true,
        isBuiltIn: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: createEmptyStats(),
        customInstructions: [],
        trainingExamples: [],
        category: params.category
    };

    const agents = getStoredAgents();
    agents.push(newAgent);
    saveAgents(agents);

    return newAgent;
}

/**
 * Actualiza un agente
 */
export function updateAgent(id: string, updates: Partial<AIAgent>): AIAgent | null {
    const agents = getStoredAgents();
    const index = agents.findIndex(a => a.id === id);

    if (index === -1) {
        // If it's a built-in agent, create an entry with the updates
        const builtIn = BUILT_IN_AGENTS.find(a => a.id === id);
        if (builtIn) {
            const updatedAgent: AIAgent = {
                ...builtIn,
                stats: createEmptyStats(),
                ...updates,
                updatedAt: new Date()
            };
            agents.push(updatedAgent);
            saveAgents(agents);
            return updatedAgent;
        }
        return null;
    }

    agents[index] = {
        ...agents[index],
        ...updates,
        updatedAt: new Date()
    };
    saveAgents(agents);
    return agents[index];
}

/**
 * Elimina un agente (solo custom)
 */
export function deleteAgent(id: string): boolean {
    const agents = getStoredAgents();
    const agent = agents.find(a => a.id === id);

    if (!agent || agent.isBuiltIn) return false;

    const filtered = agents.filter(a => a.id !== id);
    saveAgents(filtered);
    return true;
}

/**
 * Activa/desactiva un agente
 */
export function toggleAgent(id: string): boolean {
    const agents = getAllAgents();
    const agent = agents.find(a => a.id === id);
    if (!agent) return false;

    updateAgent(id, { isActive: !agent.isActive });
    return true;
}

/**
 * Registra el uso de un agente
 */
export function recordAgentUsage(
    agentId: string,
    success: boolean,
    tokensUsed: number,
    costUSD: number,
    responseTimeMs?: number
): void {
    const stats = getStoredStats();

    if (!stats[agentId]) {
        stats[agentId] = createEmptyStats();
    }

    stats[agentId].totalCalls++;
    if (success) {
        stats[agentId].successfulCalls++;
    } else {
        stats[agentId].failedCalls++;
    }
    stats[agentId].tokensUsed += tokensUsed;
    stats[agentId].costUSD += costUSD;
    stats[agentId].lastUsed = new Date();

    if (responseTimeMs) {
        const prevAvg = stats[agentId].avgResponseTime || 0;
        const count = stats[agentId].totalCalls;
        stats[agentId].avgResponseTime = (prevAvg * (count - 1) + responseTimeMs) / count;
    }

    saveStats(stats);
}

/**
 * Agrega instrucción de entrenamiento
 */
export function addCustomInstruction(agentId: string, instruction: string): void {
    const agents = getStoredAgents();
    const agent = agents.find(a => a.id === agentId);

    if (agent) {
        agent.customInstructions.push(instruction);
        agent.updatedAt = new Date();
        saveAgents(agents);
    } else {
        // Built-in agent
        updateAgent(agentId, {
            customInstructions: [instruction]
        });
    }
}

/**
 * Agrega ejemplo de entrenamiento
 */
export function addTrainingExample(
    agentId: string,
    input: string,
    expectedOutput: string
): void {
    const example: TrainingExample = {
        id: `ex-${Date.now()}`,
        input,
        expectedOutput,
        addedAt: new Date()
    };

    const agents = getStoredAgents();
    const agent = agents.find(a => a.id === agentId);

    if (agent) {
        agent.trainingExamples.push(example);
        agent.updatedAt = new Date();
        saveAgents(agents);
    } else {
        updateAgent(agentId, {
            trainingExamples: [example]
        });
    }
}

/**
 * Obtiene el prompt completo de un agente (incluyendo entrenamiento)
 */
export function getFullAgentPrompt(agentId: string): string {
    const agent = getAgentById(agentId);
    if (!agent) return '';

    let prompt = agent.systemPrompt;

    if (agent.customInstructions.length > 0) {
        prompt += '\n\nInstrucciones adicionales:\n';
        prompt += agent.customInstructions.map(i => `- ${i}`).join('\n');
    }

    if (agent.trainingExamples.length > 0) {
        prompt += '\n\nEjemplos de referencia:\n';
        agent.trainingExamples.forEach((ex, i) => {
            prompt += `\nEjemplo ${i + 1}:\nEntrada: ${ex.input}\nRespuesta esperada: ${ex.expectedOutput}\n`;
        });
    }

    return prompt;
}

/**
 * Obtiene estadísticas globales de todos los agentes
 */
export function getGlobalAgentStats(): {
    totalAgents: number;
    activeAgents: number;
    totalCalls: number;
    totalTokens: number;
    totalCostUSD: number;
    mostUsedAgent: string | null;
} {
    const agents = getAllAgents();
    const stats = getStoredStats();

    let totalCalls = 0;
    let totalTokens = 0;
    let totalCostUSD = 0;
    let mostUsedAgent: string | null = null;
    let maxCalls = 0;

    Object.entries(stats).forEach(([agentId, agentStats]) => {
        totalCalls += agentStats.totalCalls;
        totalTokens += agentStats.tokensUsed;
        totalCostUSD += agentStats.costUSD;

        if (agentStats.totalCalls > maxCalls) {
            maxCalls = agentStats.totalCalls;
            mostUsedAgent = agentId;
        }
    });

    return {
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.isActive).length,
        totalCalls,
        totalTokens,
        totalCostUSD,
        mostUsedAgent
    };
}
