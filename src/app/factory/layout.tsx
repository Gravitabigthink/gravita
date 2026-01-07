/**
 * Factory Layout - Wrapper for The Factory module
 */

import { Sidebar } from '@/components/layout/Sidebar';

export default function FactoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                marginLeft: '280px',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
            }}>
                {children}
            </main>
        </div>
    );
}
