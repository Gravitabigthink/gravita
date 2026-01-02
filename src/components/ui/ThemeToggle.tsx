'use client';

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ padding: '0.5rem' }}
            aria-label="Cambiar tema"
        >
            {theme === 'dark' ? (
                <Sun size={18} strokeWidth={1.5} />
            ) : (
                <Moon size={18} strokeWidth={1.5} />
            )}
        </button>
    );
}
