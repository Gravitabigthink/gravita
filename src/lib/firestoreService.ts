// Firebase Firestore Service for CRM data
// Gracefully handles missing Firebase configuration
import { db, isFirebaseConfigured } from './firebase';
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    serverTimestamp,
    Firestore,
} from 'firebase/firestore';

// Collection names
const COLLECTIONS = {
    LEADS: 'leads',
    FORMS: 'forms',
    CALENDARS: 'calendars',
    QUOTES: 'quotes',
    FORM_SUBMISSIONS: 'form_submissions',
    APPOINTMENTS: 'appointments',
} as const;

// Helper to safely get db instance
function getDb(): Firestore | null {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase not configured');
        return null;
    }
    return db;
}

// ============== LEADS ==============

export interface SimpleLead {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    source: string;
    status: string;
    stage?: string;
    score: number;
    tags?: string[];
    notes?: string[];
    createdAt?: Date;
    lastActivity?: Date;
}

export async function getLeadsFromFirestore(): Promise<SimpleLead[]> {
    const database = getDb();
    if (!database) return [];

    try {
        const leadsRef = collection(database, COLLECTIONS.LEADS);
        const q = query(leadsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            name: docSnap.data().name || '',
            email: docSnap.data().email || '',
            phone: docSnap.data().phone || '',
            company: docSnap.data().company || '',
            source: docSnap.data().source || 'unknown',
            status: docSnap.data().status || 'nuevo',
            stage: docSnap.data().stage || 'lead_entrante',
            score: docSnap.data().score || 0,
            tags: docSnap.data().tags || [],
            notes: docSnap.data().notes || [],
            createdAt: docSnap.data().createdAt?.toDate() || new Date(),
            lastActivity: docSnap.data().lastActivity?.toDate() || new Date(),
        }));
    } catch (error) {
        console.error('Error fetching leads:', error);
        return [];
    }
}

export async function addLeadToFirestore(lead: Omit<SimpleLead, 'id'>): Promise<string | null> {
    const database = getDb();
    if (!database) return null;

    try {
        const leadsRef = collection(database, COLLECTIONS.LEADS);
        const docRef = await addDoc(leadsRef, {
            ...lead,
            createdAt: serverTimestamp(),
            lastActivity: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding lead:', error);
        return null;
    }
}

export async function updateLeadInFirestore(id: string, data: Partial<SimpleLead>): Promise<boolean> {
    const database = getDb();
    if (!database) return false;

    try {
        const leadRef = doc(database, COLLECTIONS.LEADS, id);
        await updateDoc(leadRef, {
            ...data,
            lastActivity: serverTimestamp(),
        });
        return true;
    } catch (error) {
        console.error('Error updating lead:', error);
        return false;
    }
}

export async function deleteLeadFromFirestore(id: string): Promise<boolean> {
    const database = getDb();
    if (!database) return false;

    try {
        const leadRef = doc(database, COLLECTIONS.LEADS, id);
        await deleteDoc(leadRef);
        return true;
    } catch (error) {
        console.error('Error deleting lead:', error);
        return false;
    }
}

// ============== FORM SUBMISSIONS ==============

export interface FormSubmission {
    id?: string;
    formId: string;
    formName: string;
    data: Record<string, string | number>;
    score: number;
    submittedAt: Date;
    convertedToLead: boolean;
    leadId?: string;
}

export async function saveFormSubmission(submission: Omit<FormSubmission, 'id'>): Promise<string | null> {
    const database = getDb();
    if (!database) {
        console.log('Firestore not available, submission not saved');
        return null;
    }

    try {
        const submissionsRef = collection(database, COLLECTIONS.FORM_SUBMISSIONS);
        const docRef = await addDoc(submissionsRef, {
            ...submission,
            submittedAt: serverTimestamp(),
        });

        // Also create a lead from the submission
        const leadData: Omit<SimpleLead, 'id'> = {
            name: (submission.data.nombre as string) || (submission.data.name as string) || 'Lead sin nombre',
            email: (submission.data.email as string) || '',
            phone: (submission.data.telefono as string) || (submission.data.phone as string) || '',
            company: (submission.data.empresa as string) || (submission.data.company as string) || '',
            source: 'landing',
            status: 'nuevo',
            stage: 'lead_entrante',
            score: submission.score,
            tags: ['web-form', submission.formName],
            notes: [],
            createdAt: new Date(),
            lastActivity: new Date(),
        };

        const leadId = await addLeadToFirestore(leadData);

        // Update submission with lead reference
        if (leadId) {
            await updateDoc(docRef, { convertedToLead: true, leadId });
        }

        return docRef.id;
    } catch (error) {
        console.error('Error saving form submission:', error);
        return null;
    }
}

// ============== APPOINTMENTS ==============

export interface Appointment {
    id?: string;
    calendarId: string;
    leadId?: string;
    leadName: string;
    leadEmail: string;
    leadPhone?: string;
    date: Date;
    timeSlot: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
    notes?: string;
    createdAt: Date;
}

export async function saveAppointment(appointment: Omit<Appointment, 'id'>): Promise<string | null> {
    const database = getDb();
    if (!database) return null;

    try {
        const appointmentsRef = collection(database, COLLECTIONS.APPOINTMENTS);
        const docRef = await addDoc(appointmentsRef, {
            ...appointment,
            date: Timestamp.fromDate(appointment.date),
            createdAt: serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        console.error('Error saving appointment:', error);
        return null;
    }
}

export async function getAppointmentsByCalendar(calendarId: string): Promise<Appointment[]> {
    const database = getDb();
    if (!database) return [];

    try {
        const appointmentsRef = collection(database, COLLECTIONS.APPOINTMENTS);
        const q = query(
            appointmentsRef,
            where('calendarId', '==', calendarId),
            orderBy('date', 'asc')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            calendarId: docSnap.data().calendarId,
            leadName: docSnap.data().leadName || '',
            leadEmail: docSnap.data().leadEmail || '',
            leadPhone: docSnap.data().leadPhone,
            date: docSnap.data().date?.toDate() || new Date(),
            timeSlot: docSnap.data().timeSlot || '',
            status: docSnap.data().status || 'scheduled',
            notes: docSnap.data().notes,
            createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        }));
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return [];
    }
}

// ============== CRM METRICS ==============

import { CRMMetrics, LeadStatus, LeadSource } from '@/types/lead';

const ALL_STATUSES: LeadStatus[] = [
    'nuevo', 'contactado', 'agendado', 'show', 'no_show',
    'propuesta_enviada', 'negociacion', 'ganado', 'perdido'
];

const ALL_SOURCES: LeadSource[] = [
    'meta_ads', 'google_ads', 'organico', 'referido', 'landing', 'whatsapp', 'manual'
];

export async function getCRMMetricsFromFirestore(): Promise<CRMMetrics> {
    // Default empty metrics
    const emptyMetrics: CRMMetrics = {
        totalLeads: 0,
        leadsByStatus: {
            nuevo: 0, contactado: 0, agendado: 0, show: 0, no_show: 0,
            propuesta_enviada: 0, negociacion: 0, ganado: 0, perdido: 0
        },
        leadsBySource: {
            meta_ads: 0, google_ads: 0, organico: 0, referido: 0,
            landing: 0, whatsapp: 0, manual: 0
        },
        conversionRate: 0,
        showRate: 0,
        avgDealValue: 0,
        totalPipelineValue: 0,
        avgResponseTime: 0,
        leadsThisMonth: 0,
        wonThisMonth: 0,
    };

    const database = getDb();
    if (!database) return emptyMetrics;

    try {
        const leadsRef = collection(database, COLLECTIONS.LEADS);
        const snapshot = await getDocs(leadsRef);

        if (snapshot.empty) return emptyMetrics;

        const leads = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                status: (data.status as string) || 'nuevo',
                source: (data.source as string) || 'manual',
                potentialValue: (data.potentialValue as number) || 0,
                createdAt: data.createdAt?.toDate() || new Date(),
            };
        });

        // Calculate metrics
        const totalLeads = leads.length;

        // Leads by status
        const leadsByStatus = { ...emptyMetrics.leadsByStatus };
        ALL_STATUSES.forEach(status => {
            leadsByStatus[status] = leads.filter(l => l.status === status).length;
        });

        // Leads by source
        const leadsBySource = { ...emptyMetrics.leadsBySource };
        ALL_SOURCES.forEach(source => {
            leadsBySource[source] = leads.filter(l => l.source === source).length;
        });

        // Conversion rate: ganados / total * 100
        const ganados = leadsByStatus.ganado;
        const conversionRate = totalLeads > 0 ? (ganados / totalLeads) * 100 : 0;

        // Show rate: show / (agendado + show + no_show) * 100
        const agendadosTotal = leadsByStatus.agendado + leadsByStatus.show + leadsByStatus.no_show;
        const showRate = agendadosTotal > 0 ? (leadsByStatus.show / agendadosTotal) * 100 : 0;

        // Pipeline value: suma de potentialValue de leads activos (no ganados ni perdidos)
        const activeLeads = leads.filter(l =>
            l.status !== 'ganado' && l.status !== 'perdido'
        );
        const totalPipelineValue = activeLeads.reduce((sum, l) =>
            sum + (l.potentialValue || 0), 0
        );

        // Average deal value from won leads
        const wonLeads = leads.filter(l => l.status === 'ganado');
        const avgDealValue = wonLeads.length > 0
            ? wonLeads.reduce((sum, l) => sum + (l.potentialValue || 0), 0) / wonLeads.length
            : 0;

        // Leads this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const leadsThisMonth = leads.filter(l =>
            l.createdAt >= startOfMonth
        ).length;

        // Won this month
        const wonThisMonth = leads.filter(l =>
            l.status === 'ganado' && l.createdAt >= startOfMonth
        ).length;

        return {
            totalLeads,
            leadsByStatus,
            leadsBySource,
            conversionRate: Math.round(conversionRate * 10) / 10,
            showRate: Math.round(showRate * 10) / 10,
            avgDealValue: Math.round(avgDealValue),
            totalPipelineValue,
            avgResponseTime: 0, // Would need interaction timestamps
            leadsThisMonth,
            wonThisMonth,
        };
    } catch (error) {
        console.error('Error calculating CRM metrics:', error);
        return emptyMetrics;
    }
}
