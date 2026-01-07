/**
 * Marketing Strategy Orchestrator
 * 
 * Orchestrates the 14-step Chain of Thought process for marketing strategy generation.
 * Manages context passing between steps and supports dual AI validation.
 */

import {
    MarketingClientInput,
    StrategyContext,
    StrategyStep,
    StepStatus
} from '@/types/marketing';
import { MARKETING_STEPS, getStepById, canExecuteStep, getNextStep } from './marketing-steps';
import { routeToLLMSafe } from '@/lib/llm-router';

// Generate unique IDs using crypto
function generateId(): string {
    return crypto.randomUUID();
}

// =============================================================================
// CONTEXT MANAGEMENT
// =============================================================================

/**
 * Crea un nuevo contexto de estrategia
 */
export function createStrategyContext(
    clientInput: MarketingClientInput,
    clientId?: string
): StrategyContext {
    const steps: StrategyStep[] = MARKETING_STEPS.map(stepDef => ({
        id: stepDef.id,
        name: stepDef.name,
        description: stepDef.description,
        status: 'pending' as StepStatus,
        dualAI: stepDef.dualAI
    }));

    return {
        id: generateId(),
        clientId: clientId || generateId(),
        clientInput,
        steps,
        currentStep: 0,
        status: 'not_started',
        createdAt: new Date(),
        updatedAt: new Date()
    };
}

/**
 * Obtiene el contexto acumulado de todos los pasos completados
 */
export function getAccumulatedContext(context: StrategyContext): string {
    const completedSteps = context.steps.filter(s => s.status === 'completed');

    if (completedSteps.length === 0) {
        return 'No hay pasos completados aún.';
    }

    return completedSteps.map(step =>
        `### PASO ${step.id}: ${step.name}\n${step.output || ''}`
    ).join('\n\n---\n\n');
}

/**
 * Obtiene el output de un paso específico
 */
export function getStepOutput(context: StrategyContext, stepId: number): string {
    const step = context.steps.find(s => s.id === stepId);
    return step?.output || '';
}

// =============================================================================
// PROMPT BUILDING
// =============================================================================

/**
 * Construye el prompt para un paso, reemplazando las variables
 */
export function buildPromptForStep(
    stepId: number,
    context: StrategyContext
): string {
    const stepDef = getStepById(stepId);
    if (!stepDef) {
        throw new Error(`Step ${stepId} not found`);
    }

    let prompt = stepDef.promptTemplate;
    const input = context.clientInput;

    // Reemplazar variables del cliente
    const replacements: Record<string, string> = {
        '{nombre_contacto}': input.nombre_contacto,
        '{nombre_empresa}': input.nombre_empresa,
        '{sitio_web}': input.sitio_web || 'No proporcionado',
        '{redes_sociales}': input.redes_sociales?.join(', ') || 'No proporcionadas',
        '{etapa_crecimiento}': input.etapa_crecimiento,
        '{descripcion_productos}': input.descripcion_productos,
        '{producto_estrella_1}': input.producto_estrella_1,
        '{producto_2}': input.producto_2 || 'No proporcionado',
        '{producto_3}': input.producto_3 || 'No proporcionado',
        '{mercado_general}': input.mercado_general,
        '{nicho}': input.nicho,
        '{cliente_ideal}': input.cliente_ideal,
        '{dolores_cliente}': input.dolores_cliente.join('\n- '),
        '{competencia}': formatCompetencia(input.competencia),
        '{objetivos_negocio}': input.objetivos_negocio.map(o => `- ${o}`).join('\n'),
        '{restricciones}': input.restricciones?.join('\n- ') || 'Ninguna especificada'
    };

    // Reemplazar outputs de pasos anteriores
    for (let i = 1; i <= 14; i++) {
        replacements[`{step_${i}_output}`] = getStepOutput(context, i) || 'Pendiente';
    }

    // Aplicar reemplazos
    for (const [key, value] of Object.entries(replacements)) {
        prompt = prompt.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return prompt;
}

function formatCompetencia(competencia: MarketingClientInput['competencia']): string {
    if (!competencia || competencia.length === 0) {
        return 'No se proporcionaron datos de competidores.';
    }

    return competencia.map((c, i) => `
**Competidor ${i + 1}: ${c.nombre}**
- Website: ${c.website || 'No disponible'}
- Fortalezas: ${c.fortalezas || 'No especificadas'}
- Debilidades: ${c.debilidades || 'No especificadas'}
- Notas: ${c.notas || 'Sin notas'}
`).join('\n');
}

// =============================================================================
// STEP EXECUTION
// =============================================================================

/**
 * Ejecuta un paso específico
 */
export async function executeStep(
    context: StrategyContext,
    stepId: number
): Promise<StrategyContext> {
    const stepDef = getStepById(stepId);
    if (!stepDef) {
        throw new Error(`Step ${stepId} not found`);
    }

    // Verificar dependencias
    const completedStepIds = context.steps
        .filter(s => s.status === 'completed')
        .map(s => s.id);

    if (!canExecuteStep(stepId, completedStepIds)) {
        throw new Error(`Step ${stepId} cannot be executed. Required steps not completed.`);
    }

    // Encontrar el step en el contexto
    const stepIndex = context.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) {
        throw new Error(`Step ${stepId} not found in context`);
    }

    // Marcar como running
    context.steps[stepIndex].status = 'running';
    context.steps[stepIndex].startedAt = new Date();
    context.status = 'in_progress';
    context.currentStep = stepId;

    try {
        const prompt = buildPromptForStep(stepId, context);
        context.steps[stepIndex].prompt = prompt;

        let output: string;

        if (stepDef.dualAI) {
            // Ejecutar con validación dual
            output = await executeDualAI(prompt, stepId);
            // Guardar también los outputs individuales
            // (esto se implementará cuando tengamos DeepSeek configurado)
        } else {
            // Ejecutar solo con Gemini
            output = await routeToLLMSafe(prompt, {
                taskType: 'deep-analysis',
                overrideTier: 'advanced'
            });
        }

        // Marcar como completado
        context.steps[stepIndex].output = output;
        context.steps[stepIndex].status = 'completed';
        context.steps[stepIndex].completedAt = new Date();

        // Si era el último paso, marcar contexto como completado
        const allCompleted = context.steps.every(s => s.status === 'completed');
        if (allCompleted) {
            context.status = 'completed';
            context.completedAt = new Date();
        }

        // Guardar HTML si es un paso de documento
        if (stepId === 12) {
            context.briefHtml = output;
        } else if (stepId === 14) {
            context.strategyHtml = output;
        }

    } catch (error) {
        context.steps[stepIndex].status = 'error';
        context.steps[stepIndex].error = String(error);
        context.status = 'error';
    }

    context.updatedAt = new Date();
    return context;
}

/**
 * Ejecuta validación dual con Gemini y DeepSeek
 */
async function executeDualAI(prompt: string, stepId: number): Promise<string> {
    console.log(`🔀 Ejecutando paso ${stepId} con validación dual...`);

    // Por ahora, usamos solo Gemini con tier avanzado
    // Cuando DeepSeek esté configurado, ejecutaremos ambos en paralelo

    const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;

    if (!hasDeepSeek) {
        console.log('⚠️ DeepSeek no configurado, usando solo Gemini');
        return routeToLLMSafe(prompt, {
            taskType: 'deep-analysis',
            overrideTier: 'advanced'
        });
    }

    // Ejecutar ambos en paralelo
    const [geminiResult, deepseekResult] = await Promise.all([
        routeToLLMSafe(prompt, {
            taskType: 'deep-analysis',
            overrideTier: 'standard',
            overrideProvider: 'gemini'
        }),
        routeToLLMSafe(prompt, {
            taskType: 'deep-analysis',
            overrideTier: 'advanced',
            overrideProvider: 'deepseek'
        })
    ]);

    // Usar un "Judge" para fusionar las respuestas
    const judgePrompt = `Eres un juez experto. Analiza estas dos respuestas al mismo prompt y fusiona lo mejor de cada una en una respuesta final superior.

**RESPUESTA A (Gemini):**
${geminiResult}

**RESPUESTA B (DeepSeek):**
${deepseekResult}

Tu tarea:
1. Identifica los puntos fuertes de cada respuesta
2. Combina las mejores ideas de ambas
3. Genera una respuesta final que sea mejor que cualquiera de las dos originales
4. Mantén el formato y estructura profesional

Genera la respuesta fusionada:`;

    const fusedResult = await routeToLLMSafe(judgePrompt, {
        taskType: 'deep-analysis',
        overrideTier: 'standard'
    });

    return fusedResult;
}

/**
 * Ejecuta el siguiente paso disponible
 */
export async function executeNextStep(
    context: StrategyContext
): Promise<StrategyContext> {
    const completedStepIds = context.steps
        .filter(s => s.status === 'completed')
        .map(s => s.id);

    const nextStep = getNextStep(completedStepIds);

    if (!nextStep) {
        console.log('✅ Todos los pasos completados');
        context.status = 'completed';
        return context;
    }

    console.log(`▶️ Ejecutando paso ${nextStep.id}: ${nextStep.name}`);
    return executeStep(context, nextStep.id);
}

/**
 * Ejecuta todos los pasos secuencialmente
 */
export async function executeAllSteps(
    context: StrategyContext,
    onStepComplete?: (step: StrategyStep, context: StrategyContext) => void
): Promise<StrategyContext> {
    let currentContext = context;

    for (const stepDef of MARKETING_STEPS) {
        console.log(`\n📍 Ejecutando paso ${stepDef.id}/${MARKETING_STEPS.length}: ${stepDef.name}`);

        currentContext = await executeStep(currentContext, stepDef.id);

        const completedStep = currentContext.steps.find(s => s.id === stepDef.id);
        if (completedStep && onStepComplete) {
            onStepComplete(completedStep, currentContext);
        }

        if (currentContext.status === 'error') {
            console.error(`❌ Error en paso ${stepDef.id}`);
            break;
        }

        console.log(`✅ Paso ${stepDef.id} completado`);
    }

    return currentContext;
}

/**
 * Regenera un paso específico (y sus dependientes si es necesario)
 */
export async function regenerateStep(
    context: StrategyContext,
    stepId: number
): Promise<StrategyContext> {
    // Reset el paso y todos los dependientes
    for (const step of context.steps) {
        const stepDef = getStepById(step.id);
        if (step.id === stepId || (stepDef?.requiredPreviousSteps.includes(stepId))) {
            step.status = 'pending';
            step.output = undefined;
            step.error = undefined;
            step.startedAt = undefined;
            step.completedAt = undefined;
        }
    }

    // Re-ejecutar el paso
    return executeStep(context, stepId);
}

// =============================================================================
// PROGRESS TRACKING
// =============================================================================

/**
 * Obtiene el progreso de la estrategia
 */
export function getProgress(context: StrategyContext): {
    completed: number;
    total: number;
    percentage: number;
    currentStep: StrategyStep | undefined;
} {
    const completed = context.steps.filter(s => s.status === 'completed').length;
    const total = context.steps.length;

    return {
        completed,
        total,
        percentage: Math.round((completed / total) * 100),
        currentStep: context.steps.find(s => s.status === 'running')
    };
}
