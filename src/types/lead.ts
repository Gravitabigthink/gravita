// Sniper CRM - Lead Types
// Interfaces para Firestore

export type LeadStatus =
  | 'nuevo'
  | 'contactado'
  | 'agendado'
  | 'show'
  | 'no_show'
  | 'propuesta_enviada'
  | 'negociacion'
  | 'ganado'
  | 'perdido';

export type LeadSource =
  | 'meta_ads'
  | 'google_ads'
  | 'organico'
  | 'referido'
  | 'landing'
  | 'whatsapp'
  | 'manual';

export type PsychType = 'analitico' | 'emocional' | 'asertivo' | 'indeciso';

export type InteractionType = 'whatsapp' | 'email' | 'llamada' | 'videollamada' | 'sistema' | 'ia';

export interface PsychProfile {
  dominantType: PsychType;
  traits: string[];
  painPoints: string[];
  motivators: string[];
  objections: string[];
  recommendedStrategy: string;
  closingTips: string[];
  confidence: number; // 0-100
}

export interface Meeting {
  scheduledAt: Date;
  meetLink: string;
  googleEventId: string;
  duration: number; // minutos
  status: 'pendiente' | 'completada' | 'cancelada' | 'no_show';
  transcript?: string;
  summary?: string;
  nextSteps?: string[];
}

export interface Quote {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  services: QuoteService[];
  subtotal: number;
  discount: number;
  total: number;
  currency: 'MXN';
  validUntil: Date;
  status: 'borrador' | 'enviada' | 'vista' | 'aceptada' | 'rechazada';
  pdfUrl?: string;
  notes?: string;
  approvedBy?: string; // ID del closer que aprobó
  approvedAt?: Date;
  sentVia?: ('email' | 'whatsapp')[];
  sentAt?: Date;
}

// Contrato - Información completa cuando el cliente acepta
export interface Contract {
  id: string;
  leadId: string;
  quoteId: string;

  // Información del cliente
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany?: string;

  // Servicios contratados
  services: QuoteService[];

  // Financiero
  monthlyAmount: number;
  setupFee?: number;
  adBudget?: number; // Pauta publicitaria incluida
  currency: 'MXN';
  paymentMethod?: 'transferencia' | 'tarjeta' | 'efectivo';
  billingCycle: 'mensual' | 'trimestral' | 'anual';

  // Fechas
  startDate: Date;
  endDate?: Date;
  signedAt: Date;

  // Status
  status: 'activo' | 'pausado' | 'cancelado' | 'finalizado';

  // Configuración de campañas (para setup posterior)
  campaignConfig?: {
    targetAudience?: string;
    geoLocations?: string[];
    budget?: number;
    objectives?: string[];
    platforms?: ('facebook' | 'instagram' | 'google' | 'tiktok')[];
    startDate?: Date;
    notes?: string;
  };

  // Documentos
  contractPdfUrl?: string;
  signedDocumentUrl?: string;

  // Notas internas
  internalNotes?: string;
}

export interface QuoteService {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface Interaction {
  id: string;
  type: InteractionType;
  content: string;
  timestamp: Date;
  direction: 'entrante' | 'saliente';
  channel: string;
  sentiment?: 'positivo' | 'neutral' | 'negativo';
  aiGenerated: boolean;
  metadata?: Record<string, unknown>;
}

export interface Lead {
  id: string;
  // Información básica
  nombre: string;
  apellido?: string;
  email: string;
  telefono: string; // WhatsApp enabled
  empresa?: string;
  cargo?: string;

  // Compatibilidad con Firestore (campos alternativos)
  name?: string;      // Alias for nombre
  phone?: string;     // Alias for telefono
  score?: number;     // Alias for leadScore

  // Estado del pipeline
  status: LeadStatus;
  source: LeadSource;

  // Scoring AI
  leadScore: number; // 0-100
  scoreHistory: Array<{
    score: number;
    reason: string;
    timestamp: Date;
  }>;

  // Perfil psicológico (AI)
  psychProfile?: PsychProfile;

  // Reuniones
  meetings: Meeting[];
  nextMeeting?: Meeting;

  // Cotizaciones
  quotes: Quote[];
  currentQuote?: Quote;

  // Historial de interacciones
  interactions: Interaction[];

  // Valor potencial
  potentialValue?: number;
  currency: 'MXN';

  // Necesidades detectadas (AI)
  detectedNeeds: string[];
  interests: string[];

  // Asignación
  assignedTo?: string;
  closerId?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastContactAt?: Date;

  // Meta
  metaLeadId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  // Tags personalizados
  tags: string[];

  // Notas del closer
  closerNotes?: string;
}

// Columnas del Kanban
export interface PipelineColumn {
  id: LeadStatus;
  title: string;
  color: string;
  icon: string;
  leads: Lead[];
}

// Configuración del pipeline
export const PIPELINE_COLUMNS: Omit<PipelineColumn, 'leads'>[] = [
  { id: 'nuevo', title: 'Nuevos', color: '#6366f1', icon: 'sparkles' },
  { id: 'contactado', title: 'Contactados', color: '#8b5cf6', icon: 'message-circle' },
  { id: 'agendado', title: 'Agendados', color: '#0ea5e9', icon: 'calendar' },
  { id: 'show', title: 'Show', color: '#10b981', icon: 'video' },
  { id: 'propuesta_enviada', title: 'Propuesta', color: '#f59e0b', icon: 'file-text' },
  { id: 'negociacion', title: 'Negociación', color: '#ec4899', icon: 'handshake' },
  { id: 'ganado', title: 'Ganados', color: '#22c55e', icon: 'trophy' },
  { id: 'perdido', title: 'Perdidos', color: '#ef4444', icon: 'x-circle' },
];

// Eventos del calendario
export interface CalendarEvent {
  id: string;
  leadId: string;
  leadName: string;
  title: string;
  start: Date;
  end: Date;
  type: 'videollamada' | 'seguimiento' | 'propuesta';
  meetLink?: string;
  googleEventId?: string;
  status: 'pendiente' | 'completado' | 'cancelado';
  notes?: string;
  // Transcript fields
  transcript?: string;
  transcriptAnalysis?: {
    clientNeeds: string[];
    objections: string[];
    interests: string[];
    budget?: string;
    timeline?: string;
    nextSteps: string[];
    closingRecommendation: string;
    sentiment: 'positivo' | 'neutral' | 'negativo';
  };
  transcriptAddedAt?: Date;
}

// Analytics
export interface CRMMetrics {
  totalLeads: number;
  leadsByStatus: Record<LeadStatus, number>;
  leadsBySource: Record<LeadSource, number>;
  conversionRate: number;
  showRate: number;
  avgDealValue: number;
  totalPipelineValue: number;
  avgResponseTime: number; // minutos
  leadsThisMonth: number;
  wonThisMonth: number;
}

// Marketing Insights (4 Ps)
export interface MarketingInsights {
  product: {
    topServices: string[];
    frequentRequests: string[];
    improvements: string[];
  };
  price: {
    avgAcceptedPrice: number;
    priceObjections: string[];
    recommendedRange: { min: number; max: number };
  };
  place: {
    topSources: LeadSource[];
    bestPerformingCampaigns: string[];
  };
  promotion: {
    effectiveMessages: string[];
    hooks: string[];
    callToActions: string[];
  };
  psychology: {
    dominantTypes: Record<PsychType, number>;
    commonObjections: string[];
    buyingTriggers: string[];
  };
}
