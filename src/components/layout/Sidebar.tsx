'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
    LayoutDashboard,
    Crosshair,
    Users,
    Calendar,
    FileText,
    Settings,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Plus,
    Brain,
    Target,
    ClipboardList,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

interface NavSection {
    id: string;
    label: string;
    icon: React.ReactNode;
    items: NavItem[];
    isMain?: boolean;
}

const navSections: NavSection[] = [
    {
        id: 'sniper-crm',
        label: 'Sniper CRM',
        icon: <Crosshair size={18} strokeWidth={1.5} />,
        isMain: true,
        items: [
            { href: '/crm', label: 'Dashboard', icon: <LayoutDashboard size={18} strokeWidth={1.5} /> },
            { href: '/crm/pipeline', label: 'Pipeline', icon: <Target size={18} strokeWidth={1.5} /> },
            { href: '/crm/leads', label: 'Leads', icon: <Users size={18} strokeWidth={1.5} /> },
            { href: '/crm/calendario', label: 'Calendario', icon: <Calendar size={18} strokeWidth={1.5} /> },
            { href: '/crm/cotizaciones', label: 'Cotizaciones', icon: <FileText size={18} strokeWidth={1.5} /> },
            { href: '/crm/formularios', label: 'Formularios', icon: <ClipboardList size={18} strokeWidth={1.5} /> },
        ],
    },
    {
        id: 'ia-hub',
        label: 'IA Hub',
        icon: <Brain size={18} strokeWidth={1.5} />,
        isMain: true,
        items: [
            { href: '/crm/ia-hub', label: 'Centro de Control', icon: <Brain size={18} strokeWidth={1.5} /> },
        ],
    },
];

interface SidebarProps {
    onAddLead?: () => void;
}

export function Sidebar({ onAddLead }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>(['sniper-crm', 'ia-hub']);

    const handleAddLead = () => {
        if (onAddLead) {
            onAddLead();
        } else {
            router.push('/crm/leads?add=true');
        }
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const isSectionActive = (section: NavSection) => {
        return section.items.some((item) => pathname === item.href || pathname.startsWith(item.href + '/'));
    };

    return (
        <aside
            className="sidebar"
            style={{
                width: collapsed ? '72px' : '280px',
                minHeight: '100vh',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-primary)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.2s ease',
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 40,
            }}
        >
            {/* Logo */}
            <div
                style={{
                    padding: '1.25rem',
                    borderBottom: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                }}
            >
                <div
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Brain size={20} color="white" strokeWidth={1.5} />
                </div>
                {!collapsed && (
                    <div>
                        <h1 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Gravita OS
                        </h1>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Marketing Brain</p>
                    </div>
                )}
            </div>

            {/* Add Lead Button */}
            <div style={{ padding: '1rem' }}>
                <button
                    className="btn-primary"
                    onClick={handleAddLead}
                    style={{
                        width: '100%',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                >
                    <Plus size={18} strokeWidth={1.5} />
                    {!collapsed && <span>Nuevo Lead</span>}
                </button>
            </div>

            {/* Navigation Sections */}
            <nav style={{ flex: 1, padding: '0 0.75rem', overflowY: 'auto' }}>
                {navSections.map((section) => {
                    const isExpanded = expandedSections.includes(section.id);
                    const sectionActive = isSectionActive(section);

                    return (
                        <div key={section.id} style={{ marginBottom: '0.5rem' }}>
                            {/* Section Header */}
                            <button
                                onClick={() => !collapsed && toggleSection(section.id)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: collapsed ? 'center' : 'space-between',
                                    gap: '0.75rem',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: sectionActive ? 'var(--accent-glow)' : 'transparent',
                                    border: 'none',
                                    color: sectionActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {section.icon}
                                    {!collapsed && <span>{section.label}</span>}
                                </div>
                                {!collapsed && (
                                    <ChevronDown
                                        size={16}
                                        style={{
                                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                                            transition: 'transform 0.2s ease',
                                            color: 'var(--text-tertiary)',
                                        }}
                                    />
                                )}
                            </button>

                            {/* Section Items */}
                            {!collapsed && isExpanded && (
                                <div
                                    style={{
                                        marginLeft: '1rem',
                                        paddingLeft: '0.75rem',
                                        borderLeft: '1px solid var(--border-secondary)',
                                        marginTop: '0.25rem',
                                    }}
                                >
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.625rem',
                                                    padding: '0.625rem 0.75rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                                    background: isActive ? 'var(--accent-glow)' : 'transparent',
                                                    textDecoration: 'none',
                                                    fontSize: '0.8rem',
                                                    fontWeight: isActive ? 500 : 400,
                                                    marginBottom: '0.125rem',
                                                    transition: 'all 0.15s ease',
                                                }}
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Collapsed mode - show items on hover */}
                            {collapsed && (
                                <div style={{ marginTop: '0.25rem' }}>
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                title={item.label}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: '0.625rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                                    background: isActive ? 'var(--accent-glow)' : 'transparent',
                                                    textDecoration: 'none',
                                                    marginBottom: '0.125rem',
                                                    transition: 'all 0.15s ease',
                                                }}
                                            >
                                                {item.icon}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div
                style={{
                    padding: '1rem',
                    borderTop: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                }}
            >
                <ThemeToggle />
                {!collapsed && (
                    <Link
                        href="/crm/configuracion"
                        style={{ color: 'var(--text-secondary)', padding: '0.5rem' }}
                    >
                        <Settings size={18} strokeWidth={1.5} />
                    </Link>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '0.5rem',
                    }}
                    aria-label="Colapsar sidebar"
                >
                    {collapsed ? (
                        <ChevronRight size={18} strokeWidth={1.5} />
                    ) : (
                        <ChevronLeft size={18} strokeWidth={1.5} />
                    )}
                </button>
            </div>
        </aside>
    );
}
