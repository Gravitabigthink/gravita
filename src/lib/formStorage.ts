// Shared form storage using localStorage
// This allows forms created in /crm/formularios to be accessible in /form/[id]

export interface FormField {
    id: string;
    type: 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'rating' | 'budget';
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
    scorable?: boolean;
    scoreWeight?: number;
}

export interface Form {
    id: string;
    name: string;
    description: string;
    fields: FormField[];
    linkedCalendar?: string;
    status: 'active' | 'draft' | 'archived';
    createdAt: Date;
    responses: number;
    conversionRate: number;
}

const STORAGE_KEY = 'gravita_forms';

// Default forms
const defaultForms: Form[] = [
    {
        id: 'form-1',
        name: 'Formulario de Calificación - Marketing',
        description: 'Pre-califica leads interesados en servicios de marketing digital',
        fields: [
            { id: 'f1', type: 'text', label: 'Nombre completo', placeholder: 'Tu nombre', required: true },
            { id: 'f2', type: 'email', label: 'Correo electrónico', placeholder: 'tu@email.com', required: true },
            { id: 'f3', type: 'phone', label: 'WhatsApp', placeholder: '+52 55 1234 5678', required: true },
            { id: 'f4', type: 'text', label: 'Empresa', placeholder: 'Nombre de tu empresa', required: false },
            { id: 'f5', type: 'select', label: '¿Cuál es tu presupuesto mensual?', required: true, options: ['Menos de $10,000', '$10,000 - $25,000', '$25,000 - $50,000', 'Más de $50,000'], scorable: true, scoreWeight: 30 },
            { id: 'f6', type: 'select', label: '¿Cuándo quieres comenzar?', required: true, options: ['Esta semana', 'Este mes', 'Próximo mes', 'Solo explorando'], scorable: true, scoreWeight: 25 },
            { id: 'f7', type: 'select', label: '¿Qué servicio te interesa?', required: true, options: ['Meta Ads', 'Google Ads', 'SEO', 'Redes Sociales', 'Todo'] },
        ],
        linkedCalendar: 'cal-general',
        status: 'active',
        createdAt: new Date(Date.now() - 604800000),
        responses: 34,
        conversionRate: 68,
    },
    {
        id: 'form-2',
        name: 'Agenda tu Consultoría Gratuita',
        description: 'Formulario para agendar llamada de descubrimiento',
        fields: [
            { id: 'f1', type: 'text', label: 'Nombre', placeholder: 'Tu nombre', required: true },
            { id: 'f2', type: 'email', label: 'Email', placeholder: 'tu@email.com', required: true },
            { id: 'f3', type: 'phone', label: 'Teléfono', placeholder: '+52 55 1234 5678', required: true },
            { id: 'f4', type: 'textarea', label: '¿Cuál es tu principal reto?', placeholder: 'Cuéntanos brevemente...', required: true },
        ],
        linkedCalendar: 'cal-discovery',
        status: 'active',
        createdAt: new Date(Date.now() - 1209600000),
        responses: 89,
        conversionRate: 45,
    },
    {
        id: 'form-3',
        name: 'Encuesta de Satisfacción',
        description: 'Formulario post-venta para feedback',
        fields: [
            { id: 'f1', type: 'rating', label: '¿Qué tan satisfecho estás?', required: true },
            { id: 'f2', type: 'textarea', label: 'Comentarios adicionales', placeholder: 'Tu opinión...', required: false },
        ],
        status: 'draft',
        createdAt: new Date(Date.now() - 86400000),
        responses: 0,
        conversionRate: 0,
    },
];

// Get all forms from localStorage (or defaults if empty)
export function getForms(): Form[] {
    if (typeof window === 'undefined') return defaultForms;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        // Initialize with defaults
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultForms));
        return defaultForms;
    }

    try {
        const forms = JSON.parse(stored);
        // Convert date strings back to Date objects
        return forms.map((f: Form) => ({
            ...f,
            createdAt: new Date(f.createdAt),
        }));
    } catch {
        return defaultForms;
    }
}

// Get a single form by ID
export function getFormById(id: string): Form | null {
    const forms = getForms();
    return forms.find(f => f.id === id) || null;
}

// Save all forms to localStorage
export function saveForms(forms: Form[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
}

// Add a new form
export function addForm(form: Form): void {
    const forms = getForms();
    forms.unshift(form); // Add to beginning
    saveForms(forms);
}

// Update an existing form
export function updateForm(id: string, updates: Partial<Form>): void {
    const forms = getForms();
    const index = forms.findIndex(f => f.id === id);
    if (index !== -1) {
        forms[index] = { ...forms[index], ...updates };
        saveForms(forms);
    }
}

// Delete a form
export function deleteForm(id: string): void {
    const forms = getForms();
    const filtered = forms.filter(f => f.id !== id);
    saveForms(filtered);
}
