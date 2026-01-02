// Shared calendar storage using localStorage
// Calendars can be assigned to funnels or users

export interface CalendarAvailability {
    days: number[]; // 0-6 (Sunday-Saturday), e.g., [1,2,3,4,5] for Mon-Fri
    startHour: number; // 9 = 9:00 AM
    endHour: number; // 18 = 6:00 PM
    slotDuration: number; // minutes per slot (e.g., 30, 60)
    bufferTime: number; // minutes between appointments
    blockedDates: string[]; // ISO date strings
}

export interface Calendar {
    id: string;
    name: string;
    description: string;
    type: 'funnel' | 'user' | 'general';
    funnelId?: string;
    assignedUsers: string[];
    availability: CalendarAvailability;
    googleCalendarId?: string;
    googleConnected: boolean;
    color: string;
    status: 'active' | 'inactive';
    createdAt: Date;
}

// User interface for calendar assignment
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'closer' | 'setter' | 'manager';
}

// Mock users for the system
export const MOCK_USERS: User[] = [
    { id: 'user-1', name: 'Tu (Admin)', email: 'admin@gravita.mx', role: 'admin' },
    { id: 'user-2', name: 'Carlos López', email: 'carlos@gravita.mx', role: 'closer' },
    { id: 'user-3', name: 'María García', email: 'maria@gravita.mx', role: 'setter' },
    { id: 'user-4', name: 'Juan Pérez', email: 'juan@gravita.mx', role: 'closer' },
];

// Current user (simulated - normally from auth context)
export const CURRENT_USER_ID = 'user-1';

// Get user by ID
export function getUserById(id: string): User | undefined {
    return MOCK_USERS.find(u => u.id === id);
}

// Get users by IDs
export function getUsersByIds(ids: string[]): User[] {
    return MOCK_USERS.filter(u => ids.includes(u.id));
}

// Get calendars for current user
export function getMyCalendars(): Calendar[] {
    return getCalendars().filter(c => c.assignedUsers.includes(CURRENT_USER_ID));
}

const STORAGE_KEY = 'gravita_calendars';

// Default calendars
const defaultCalendars: Calendar[] = [
    {
        id: 'cal-general',
        name: 'Consultoría General',
        description: 'Calendario para nuevos prospectos',
        type: 'general',
        assignedUsers: ['user-1'],
        availability: {
            days: [1, 2, 3, 4, 5], // Mon-Fri
            startHour: 9,
            endHour: 18,
            slotDuration: 30,
            bufferTime: 15,
            blockedDates: [],
        },
        googleConnected: false,
        color: '#6366f1',
        status: 'active',
        createdAt: new Date(Date.now() - 604800000),
    },
    {
        id: 'cal-discovery',
        name: 'Llamada de Descubrimiento',
        description: 'Primera llamada con prospectos calificados',
        type: 'funnel',
        funnelId: 'funnel-marketing',
        assignedUsers: ['user-1', 'user-2'],
        availability: {
            days: [1, 2, 3, 4, 5],
            startHour: 10,
            endHour: 17,
            slotDuration: 45,
            bufferTime: 15,
            blockedDates: [],
        },
        googleConnected: false,
        color: '#22c55e',
        status: 'active',
        createdAt: new Date(Date.now() - 1209600000),
    },
    {
        id: 'cal-demo',
        name: 'Demo de Producto',
        description: 'Demos para prospectos interesados',
        type: 'funnel',
        funnelId: 'funnel-ventas',
        assignedUsers: ['user-2'],
        availability: {
            days: [2, 3, 4], // Tue-Thu
            startHour: 14,
            endHour: 18,
            slotDuration: 60,
            bufferTime: 30,
            blockedDates: [],
        },
        googleConnected: false,
        color: '#f59e0b',
        status: 'active',
        createdAt: new Date(Date.now() - 86400000),
    },
];

// Get all calendars from localStorage (or defaults if empty)
export function getCalendars(): Calendar[] {
    if (typeof window === 'undefined') return defaultCalendars;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        // Initialize with defaults
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCalendars));
        return defaultCalendars;
    }

    try {
        const calendars = JSON.parse(stored);
        return calendars.map((c: Calendar) => ({
            ...c,
            createdAt: new Date(c.createdAt),
        }));
    } catch {
        return defaultCalendars;
    }
}

// Get a single calendar by ID
export function getCalendarById(id: string): Calendar | null {
    const calendars = getCalendars();
    return calendars.find(c => c.id === id) || null;
}

// Save all calendars to localStorage
export function saveCalendars(calendars: Calendar[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calendars));
}

// Add a new calendar
export function addCalendar(calendar: Calendar): void {
    const calendars = getCalendars();
    calendars.unshift(calendar);
    saveCalendars(calendars);
}

// Update an existing calendar
export function updateCalendar(id: string, updates: Partial<Calendar>): void {
    const calendars = getCalendars();
    const index = calendars.findIndex(c => c.id === id);
    if (index !== -1) {
        calendars[index] = { ...calendars[index], ...updates };
        saveCalendars(calendars);
    }
}

// Delete a calendar
export function deleteCalendar(id: string): void {
    const calendars = getCalendars();
    const filtered = calendars.filter(c => c.id !== id);
    saveCalendars(filtered);
}

// Get calendars for linking to forms
export function getActiveCalendars(): Calendar[] {
    return getCalendars().filter(c => c.status === 'active');
}
