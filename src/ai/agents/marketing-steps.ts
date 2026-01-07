/**
 * Marketing Strategy Steps - Prompt Definitions
 * 
 * Defines the 14 steps of the Chain of Thought process for marketing strategy generation.
 * Each step includes its prompt template and configuration.
 */

import { StepDefinition } from '@/types/marketing';

// =============================================================================
// STEP DEFINITIONS
// =============================================================================

export const MARKETING_STEPS: StepDefinition[] = [
    {
        id: 1,
        name: 'Análisis Inicial y Validación',
        description: 'Análisis completo de la información del cliente, validación de datos y detección de oportunidades.',
        dualAI: false,
        requiredPreviousSteps: [],
        promptTemplate: `Eres un estratega de negocios y marketing senior. Analiza la siguiente información del cliente:

**INFORMACIÓN DEL CLIENTE:**
- Empresa: {nombre_empresa}
- Contacto: {nombre_contacto}
- Sitio web: {sitio_web}
- Redes sociales: {redes_sociales}
- Etapa de crecimiento: {etapa_crecimiento}

**PRODUCTOS/SERVICIOS:**
- Descripción general: {descripcion_productos}
- Producto estrella: {producto_estrella_1}
- Producto secundario: {producto_2}
- Producto terciario: {producto_3}

**MERCADO:**
- Mercado general: {mercado_general}
- Nicho: {nicho}
- Cliente ideal: {cliente_ideal}
- Dolores del cliente: {dolores_cliente}

**OBJETIVOS:**
{objetivos_negocio}

**RESTRICCIONES:**
{restricciones}

Tu tarea es generar un análisis estructurado que incluya:

1. **Resumen ejecutivo** de los objetivos del cliente (3-5 bullets)
2. **Dolores, Deseos y Miedos** del público objetivo (formato tabla)
3. **Un día típico del cliente ideal** - Antes y Después de usar el producto/servicio
4. **Áreas claramente definidas** vs **Áreas ambiguas que necesitan clarificación**
5. **3-5 oportunidades obvias** que se pueden explotar inmediatamente

Responde en español con formato estructurado y profesional.`
    },
    {
        id: 2,
        name: 'Contexto de Mercado',
        description: 'Identificación del mercado general y sectores aplicables.',
        dualAI: false,
        requiredPreviousSteps: [1],
        promptTemplate: `Con base en el análisis inicial del cliente:

**ANÁLISIS PREVIO:**
{step_1_output}

**INFORMACIÓN DEL CLIENTE:**
- Empresa: {nombre_empresa}
- Mercado: {mercado_general}
- Productos: {descripcion_productos}

Tu tarea es:

1. **Mercado General:** ¿A qué mercado general pertenece este negocio? (ej: Salud, Tecnología, Educación, etc.)

2. **3 Industrias/Sectores Aplicables:** Identifica 3 industrias o sectores donde este negocio puede competir o expandirse.
   Para cada sector incluye:
   - Nombre del sector
   - Características principales
   - Tamaño estimado del mercado
   - 2-3 empresas destacadas como referencia

3. **Tendencias del Mercado:** Principales tendencias que afectan estos sectores.

Responde con datos específicos y ejemplos reales cuando sea posible.`
    },
    {
        id: 3,
        name: 'Identificación del Nicho',
        description: 'Profundización en el nicho específico más relevante.',
        dualAI: false,
        requiredPreviousSteps: [2],
        promptTemplate: `Basándote en el contexto de mercado identificado:

**CONTEXTO DE MERCADO:**
{step_2_output}

**NICHO DECLARADO POR EL CLIENTE:**
{nicho}

**CLIENTE IDEAL:**
{cliente_ideal}

Profundiza en el análisis:

1. **Nicho de Mayor Relevancia:** ¿Cuál de los nichos identificados tiene mayor potencial para este negocio? Justifica tu elección.

2. **Características del Nicho:**
   - Tamaño estimado (número de empresas/personas)
   - Poder adquisitivo
   - Nivel de digitalización
   - Barreras de entrada

3. **Necesidades Específicas del Nicho:**
   - Top 5 necesidades no satisfechas
   - Problemas recurrentes
   - Aspiraciones comunes

4. **Motivaciones de Compra:**
   - ¿Por qué compran?
   - ¿Qué los detiene de comprar?
   - Ciclo de decisión típico

5. **Ejemplos Reales/Tendencias:**
   - Casos de éxito en este nicho
   - Tendencias emergentes
   - Oportunidades de diferenciación

Sé específico y usa ejemplos reales cuando sea posible.`
    },
    {
        id: 4,
        name: 'Selección de Micronicho',
        description: 'Identificación del micronicho más prometedor.',
        dualAI: false,
        requiredPreviousSteps: [3],
        promptTemplate: `Dentro del nicho identificado:

**ANÁLISIS DEL NICHO:**
{step_3_output}

Tu tarea es identificar y definir un MICRONICHO específico:

1. **Micronicho Seleccionado:**
   - Nombre/descripción del micronicho
   - Por qué es la mejor oportunidad

2. **Perfil Demográfico Detallado:**
   - Edad
   - Género
   - Ubicación geográfica
   - Nivel socioeconómico
   - Nivel educativo
   - Estado civil/familiar
   - Ocupación

3. **Perfil Psicográfico:**
   - Valores
   - Estilo de vida
   - Intereses
   - Marcas que admiran
   - Medios que consumen

4. **Comportamientos de Compra:**
   - ¿Dónde buscan información?
   - ¿Cómo toman decisiones?
   - ¿Qué influencers/referentes siguen?
   - Sensibilidad al precio
   - Frecuencia de compra

5. **Desafíos Específicos del Micronicho:**
   - Top 3 problemas urgentes
   - Frustraciones con soluciones actuales
   - "Trabajo por hacer" (Jobs to be Done)

Sé lo más específico posible. Este micronicho será el foco de toda la estrategia.`
    },
    {
        id: 5,
        name: 'Propuesta de Valor',
        description: 'Análisis de cómo el producto aporta valor al micronicho.',
        dualAI: false,
        requiredPreviousSteps: [4],
        promptTemplate: `Analiza cómo los productos del cliente aportan valor al micronicho identificado:

**MICRONICHO:**
{step_4_output}

**PRODUCTOS DEL CLIENTE:**
- Principal: {producto_estrella_1}
- Secundario: {producto_2}
- Terciario: {producto_3}
- Descripción: {descripcion_productos}

Tu tarea:

1. **5 Beneficios Clave del Producto:**
   Para cada beneficio incluye:
   - El beneficio (qué obtiene el cliente)
   - La característica que lo hace posible
   - La necesidad específica del micronicho que resuelve
   - Evidencia o prueba social

2. **Mapping Beneficio → Necesidad:**
   Crea una tabla que conecte cada beneficio con un dolor/deseo específico del micronicho.

3. **Propuesta de Valor Única (UVP):**
   - En una oración: ¿Qué hace único a este producto?
   - ¿Por qué el micronicho debería elegirlo sobre la competencia?

4. **Casos de Éxito Similares:**
   - 2-3 ejemplos de empresas que han usado propuestas similares exitosamente
   - Qué podemos aprender de ellos

5. **Gaps Identificados:**
   - ¿Qué necesidades del micronicho NO cubre el producto actual?
   - Oportunidades de mejora o expansión`
    },
    {
        id: 6,
        name: 'Análisis Competitivo (Deep Search)',
        description: 'Análisis profundo de la competencia con validación dual AI.',
        dualAI: true,  // Gemini + DeepSeek
        requiredPreviousSteps: [5],
        promptTemplate: `Eres un experto en análisis competitivo. Analiza a los competidores del cliente:

**COMPETIDORES IDENTIFICADOS:**
{competencia}

**CONTEXTO:**
- Micronicho: {step_4_output}
- Propuesta de valor del cliente: {step_5_output}

Si la información de competidores es limitada, investiga empresas similares en el sector.

Tu análisis debe incluir:

1. **Por cada competidor:**
   - Propuesta de valor
   - Diferenciadores clave
   - Fortalezas principales
   - Debilidades detectadas
   - Rango de precios (si es público)

2. **Estrategia Digital de Competidores:**
   - Tono de comunicación
   - Frecuencia de publicación
   - Tipos de contenido que usan
   - Nivel de engagement
   - Canales principales

3. **Patrones de Contenido Exitoso:**
   - ¿Qué tipo de posts tienen más interacción?
   - ¿Qué temas resuenan más?
   - ¿Qué evitan hacer?

4. **FODA del Sector:**
   | Fortalezas del sector | Oportunidades |
   | Debilidades comunes | Amenazas |

5. **Recomendaciones Estratégicas:**
   - ¿Cómo diferenciarse de cada competidor?
   - ¿Qué hacen MAL que podemos hacer BIEN?
   - ¿Qué NO están haciendo que podemos explotar?
   - Posicionamiento recomendado`
    },
    {
        id: 7,
        name: 'FODA del Cliente',
        description: 'Análisis FODA específico para el cliente.',
        dualAI: false,
        requiredPreviousSteps: [6],
        promptTemplate: `Realiza un análisis FODA específico para el cliente:

**INFORMACIÓN DEL CLIENTE:**
- Empresa: {nombre_empresa}
- Productos: {descripcion_productos}
- Etapa: {etapa_crecimiento}
- Objetivos: {objetivos_negocio}
- Restricciones: {restricciones}

**ANÁLISIS COMPETITIVO:**
{step_6_output}

**PROPUESTA DE VALOR:**
{step_5_output}

Genera un FODA detallado:

**FORTALEZAS (Internas - Positivas):**
- Lista 5-7 fortalezas específicas
- Para cada una, indica cómo aprovecharla

**DEBILIDADES (Internas - Negativas):**
- Lista 5-7 debilidades o áreas de mejora
- Para cada una, indica cómo mitigarla

**OPORTUNIDADES (Externas - Positivas):**
- Lista 5-7 oportunidades del mercado/entorno
- Para cada una, indica la acción para capitalizarla

**AMENAZAS (Externas - Negativas):**
- Lista 5-7 amenazas del mercado/competencia
- Para cada una, indica la estrategia defensiva

Sé específico y basado en los datos analizados, no genérico.`
    },
    {
        id: 8,
        name: 'Estrategia de Acción (Cruce FODA)',
        description: 'Conexión estratégica de los elementos del FODA.',
        dualAI: false,
        requiredPreviousSteps: [7],
        promptTemplate: `Conecta los elementos del FODA para crear estrategias accionables:

**FODA DEL CLIENTE:**
{step_7_output}

Realiza el cruce estratégico:

1. **ESTRATEGIAS FO (Fortalezas + Oportunidades) - QUÉ HACER MÁS:**
   - ¿Cómo usar las fortalezas para aprovechar las oportunidades?
   - Lista 3-5 estrategias ofensivas específicas
   - Prioriza por impacto

2. **ESTRATEGIAS DO (Debilidades + Oportunidades) - QUÉ MEJORAR:**
   - ¿Qué debilidades corregir para no perder oportunidades?
   - Lista 3-5 estrategias de mejora
   - Indica recursos necesarios

3. **ESTRATEGIAS FA (Fortalezas + Amenazas) - CÓMO DEFENDERSE:**
   - ¿Cómo usar las fortalezas para protegerse de amenazas?
   - Lista 3-5 estrategias defensivas

4. **ESTRATEGIAS DA (Debilidades + Amenazas) - QUÉ DEJAR DE HACER:**
   - ¿Qué actividades/enfoques eliminar?
   - Lista 3-5 cosas que deben dejar de hacer
   - Justifica cada una

5. **PRIORIZACIÓN:**
   Clasifica las estrategias en:
   - Urgente e importante (hacer ahora)
   - Importante no urgente (planificar)
   - Urgente no importante (delegar)
   - Ni urgente ni importante (eliminar)`
    },
    {
        id: 9,
        name: 'Matriz Facilitador-Inspiracional',
        description: 'Ubicación del cliente en la matriz de experiencia.',
        dualAI: false,
        requiredPreviousSteps: [8],
        promptTemplate: `Analiza la posición actual del cliente en la Matriz Facilitador-Inspiracional:

**CONTEXTO:**
- Propuesta de valor: {step_5_output}
- Análisis competitivo: {step_6_output}
- Estrategias FODA: {step_8_output}

La matriz tiene dos ejes:
- **Eje X:** Facilitador (cumple lo mínimo) → Inspiracional (supera expectativas)
- **Eje Y:** Funcional (resuelve problemas) → Emocional (conecta emocionalmente)

1. **Posición Actual:**
   - ¿Dónde está el cliente actualmente en la matriz?
   - ¿Por qué está en esa posición?

2. **Elementos Facilitadores (actuales):**
   - ¿Qué expectativas mínimas cumple?
   - ¿Qué hace "igual que todos"?

3. **Elementos Inspiracionales (potenciales):**
   - ¿Qué tiene potencial de "enamorar" al cliente?
   - ¿Qué experiencias WOW puede crear?

4. **Plan de Movimiento:**
   - 5 acciones específicas para moverse hacia lo INSPIRACIONAL
   - 3 acciones para conectar EMOCIONALMENTE
   - Métricas para medir el progreso

5. **Benchmark:**
   - 2 marcas inspiracionales en el sector que sirvan de referencia
   - ¿Qué hacen diferente?`
    },
    {
        id: 10,
        name: 'Alineación Estratégica',
        description: 'Evaluación de la alineación entre diferentes dimensiones del negocio.',
        dualAI: false,
        requiredPreviousSteps: [9],
        promptTemplate: `Evalúa la alineación estratégica del cliente:

**CONTEXTO ACUMULADO:**
- Cliente ideal: {cliente_ideal}
- Propuesta de valor: {step_5_output}
- Estrategias: {step_8_output}
- Posición en matriz: {step_9_output}

Analiza la alineación en 4 dimensiones:

1. **VOCACIÓN vs MERCADO:**
   - ¿El negocio está haciendo lo que realmente le apasiona al dueño/equipo?
   - ¿Hay demanda real en el mercado para esa vocación?
   - Nivel de alineación: Alto / Medio / Bajo
   - Recomendaciones

2. **HABILIDADES vs VALOR:**
   - ¿Las habilidades del equipo generan el valor que prometen?
   - ¿Hay gaps de competencias?
   - Nivel de alineación: Alto / Medio / Bajo
   - Recomendaciones

3. **OFERTA vs TENDENCIAS:**
   - ¿La oferta actual está alineada con las tendencias del mercado?
   - ¿Están quedando obsoletos o van adelantados?
   - Nivel de alineación: Alto / Medio / Bajo
   - Recomendaciones

4. **DIFERENCIACIÓN vs COMPETENCIA:**
   - ¿La diferenciación es real y sostenible?
   - ¿Es fácilmente copiable por competidores?
   - Nivel de alineación: Alto / Medio / Bajo
   - Recomendaciones

5. **MAPA DE ALINEACIÓN:**
   Crea un resumen visual de las 4 dimensiones y el nivel de alineación general.`
    },
    {
        id: 11,
        name: 'Prioridades y Plan de Acción',
        description: 'Definición de prioridades estratégicas y plan concreto.',
        dualAI: false,
        requiredPreviousSteps: [10],
        promptTemplate: `Define las prioridades estratégicas y el plan de acción:

**TODO EL ANÁLISIS PREVIO:**
- Análisis inicial: {step_1_output}
- Micronicho: {step_4_output}
- Propuesta de valor: {step_5_output}
- Estrategias FODA: {step_8_output}
- Alineación: {step_10_output}

**OBJETIVOS DEL CLIENTE:**
{objetivos_negocio}

1. **TRES PRIORIDADES ESTRATÉGICAS (6-12 meses):**
   Para cada prioridad:
   - Nombre de la prioridad
   - Descripción (qué lograr)
   - Por qué es prioritaria
   - Impacto esperado
   - Plazo sugerido

2. **PLAN DE ACCIÓN POR PRIORIDAD:**
   Para cada prioridad, lista:
   - Actividades específicas (máximo 5)
   - Responsable sugerido
   - Recursos necesarios
   - Timeline (mes a mes)

3. **KPIs RECOMENDADOS:**
   - 3-5 métricas clave para medir el éxito
   - Valor actual (si se conoce)
   - Meta a 6 meses
   - Meta a 12 meses

4. **QUICK WINS:**
   - 3 acciones que se pueden implementar esta semana
   - Impacto inmediato esperado

5. **RIESGOS Y MITIGACIÓN:**
   - 3 principales riesgos del plan
   - Estrategia de mitigación para cada uno`
    },
    {
        id: 12,
        name: 'Generación de Brief (HTML)',
        description: 'Generación del documento Brief en formato HTML.',
        dualAI: false,
        requiredPreviousSteps: [11],
        promptTemplate: `Genera un documento BRIEF ESTRATÉGICO en formato HTML limpio.

**USA TODO EL CONTEXTO ACUMULADO DE LOS PASOS 1-11**

El HTML debe incluir:

1. **Estructura del documento:**
   - Portada con nombre del cliente y fecha
   - Índice
   - Resumen ejecutivo (1 página)
   - Análisis del público objetivo
   - Análisis del producto/servicio
   - Análisis de competencia (resumen)
   - Propuesta de valor
   - Recomendaciones estratégicas
   - Plan de acción (resumen)

2. **Formato:**
   - CSS limpio y profesional
   - Colores corporativos (usar #1a1a2e como primario, #e94560 como acento)
   - Tipografía legible (usar font-family: 'Segoe UI', Arial, sans-serif)
   - Tablas bien formateadas
   - Espaciado adecuado para lectura

3. **Características:**
   - El HTML debe ser autocontenido (CSS inline o en <style>)
   - Optimizado para exportar a PDF
   - Máximo 10 páginas

Genera SOLO el código HTML completo, sin explicaciones adicionales.`
    },
    {
        id: 13,
        name: 'Creatividad Disruptiva',
        description: 'Generación de ideas creativas usando Design Thinking y SCAMPER.',
        dualAI: true,  // Gemini + DeepSeek para máxima creatividad
        requiredPreviousSteps: [11],
        promptTemplate: `Eres un estratega creativo experto en Design Thinking, SCAMPER, 4C's y Metodología Disruptiva.

**CONTEXTO ESTRATÉGICO:**
- Micronicho: {step_4_output}
- Propuesta de valor: {step_5_output}
- Competencia: {step_6_output}
- Prioridades: {step_11_output}

**PRODUCTO:**
{producto_estrella_1}

Aplica metodologías creativas:

1. **EMPATIZAR (Design Thinking):**
   - 5 puntos de dolor EMOCIONALES del cliente ideal
   - Mapa de empatía condensado

2. **DEFINIR EL PROBLEMA CENTRAL:**
   - Insight principal (la verdad oculta del consumidor)
   - Problema reformulado como oportunidad

3. **ROMPER CONVENCIONES:**
   | Lo que TODOS hacen | Lo que NOSOTROS haremos |
   | --- | --- |
   | (lista 5 convenciones del sector) | (5 formas de romperlas) |

4. **3 CONCEPTOS DE CAMPAÑA DISRUPTIVOS:**
   Para cada concepto:
   - **Nombre de la campaña** (creativo y memorable)
   - **Big Idea** (en una frase)
   - **Descripción** (2-3 párrafos)
   - **Ejecución Digital:**
     - Contenido para redes
     - Hashtag propuesto
     - Posibles colaboraciones/influencers
   - **Impacto Esperado**

5. **SCAMPER APLICADO AL PRODUCTO:**
   - Sustituir: ¿Qué cambiar?
   - Combinar: ¿Con qué mezclarlo?
   - Adaptar: ¿De dónde inspirarse?
   - Modificar: ¿Qué exagerar o minimizar?
   - Propósito: ¿Otros usos?
   - Eliminar: ¿Qué sobra?
   - Reordenar: ¿Qué invertir?

6. **SELECCIÓN FINAL:**
   Elige los 3 conceptos más potentes y justifica por qué.

Sé audaz, creativo y específico.`
    },
    {
        id: 14,
        name: 'Estrategia de Marketing Final (HTML)',
        description: 'Generación del documento de Estrategia de Marketing en HTML.',
        dualAI: false,
        requiredPreviousSteps: [12, 13],
        promptTemplate: `Genera el documento ESTRATEGIA DE MARKETING en formato HTML.

**INTEGRA:**
- Brief generado: {step_12_output}
- Ideas creativas: {step_13_output}
- Plan de acción: {step_11_output}

El documento debe incluir:

1. **Secciones:**
   - Portada
   - Resumen Ejecutivo
   - Insights del Design Thinking
   - Estrategia General (objetivo, audiencia, posicionamiento)
   - Concepto Creativo Central
   - Campañas Propuestas (las 3 del paso 13)
   - Alineación Estratégica
   - Plan de Acción Detallado
   - Metodología 5W (Qué, Por qué, Quién, Cuándo, Dónde)
   - KPIs y Métricas

2. **Diseño:**
   - CSS moderno y atractivo
   - Uso de gradientes sutiles
   - Iconos o emojis para visual appeal
   - Secciones bien diferenciadas
   - Colores: #1a1a2e (base), #16213e (secundario), #e94560 (acento)

3. **Extensión:**
   - Documento completo de 15-20 páginas
   - Visuales claros (tablas, listas, highlights)

Genera SOLO el código HTML completo.`
    }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Obtiene un paso por su ID
 */
export function getStepById(stepId: number): StepDefinition | undefined {
    return MARKETING_STEPS.find(step => step.id === stepId);
}

/**
 * Obtiene los pasos que requieren validación dual
 */
export function getDualAISteps(): StepDefinition[] {
    return MARKETING_STEPS.filter(step => step.dualAI);
}

/**
 * Verifica si un paso puede ejecutarse (dependencias completas)
 */
export function canExecuteStep(stepId: number, completedSteps: number[]): boolean {
    const step = getStepById(stepId);
    if (!step) return false;

    return step.requiredPreviousSteps.every(reqId => completedSteps.includes(reqId));
}

/**
 * Obtiene el siguiente paso a ejecutar
 */
export function getNextStep(completedSteps: number[]): StepDefinition | undefined {
    return MARKETING_STEPS.find(step =>
        !completedSteps.includes(step.id) &&
        canExecuteStep(step.id, completedSteps)
    );
}
