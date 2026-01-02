'use client';

import { useState, useRef, useEffect } from 'react';
import {
    MessageSquare,
    Send,
    Sparkles,
    Loader2,
    Bot,
    User,
    Lightbulb,
    X,
    Maximize2,
    Minimize2,
} from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const QUICK_ACTIONS = [
    { label: '📊 Analizar pipeline', prompt: '¿Cómo va mi pipeline de ventas? Dame un resumen y recomendaciones.' },
    { label: '💡 Próximo paso', prompt: '¿Cuál debería ser mi siguiente acción con los leads pendientes?' },
    { label: '📧 Sugerir email', prompt: 'Necesito un email de seguimiento para un lead que no ha respondido en 3 días.' },
    { label: '💰 Estrategia precio', prompt: '¿Cuál es la mejor estrategia de precios para cerrar más ventas?' },
];

export function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: '¡Hola! Soy GRAVITA Brain, tu asistente de ventas con IA. ¿En qué puedo ayudarte hoy?',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'chat',
                    message: content,
                    context: 'assistant',
                }),
            });

            const data = await response.json();

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response || 'Lo siento, no pude procesar tu solicitud.',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Hubo un error al conectar con la IA. Por favor intenta de nuevo.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (prompt: string) => {
        sendMessage(prompt);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-primary) 0%, #7c3aed 100%)',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    zIndex: 1000,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(139, 92, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)';
                }}
            >
                <Sparkles size={28} />
            </button>
        );
    }

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                width: isExpanded ? '500px' : '380px',
                height: isExpanded ? '600px' : '500px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                transition: 'width 0.3s, height 0.3s',
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, var(--accent-primary) 0%, #7c3aed 100%)',
                    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'white',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bot size={20} />
                    <span style={{ fontWeight: 600 }}>GRAVITA Brain</span>
                    <span
                        style={{
                            fontSize: '0.65rem',
                            padding: '0.125rem 0.375rem',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '9999px',
                        }}
                    >
                        IA
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '4px',
                        }}
                    >
                        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '4px',
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                }}
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.5rem',
                                maxWidth: '85%',
                                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            }}
                        >
                            <div
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background:
                                        msg.role === 'user'
                                            ? 'var(--accent-primary)'
                                            : 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                {msg.role === 'user' ? (
                                    <User size={14} color="white" />
                                ) : (
                                    <Bot size={14} color="white" />
                                )}
                            </div>
                            <div
                                style={{
                                    padding: '0.75rem',
                                    background:
                                        msg.role === 'user'
                                            ? 'var(--accent-primary)'
                                            : 'var(--bg-tertiary)',
                                    color:
                                        msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.85rem',
                                    lineHeight: 1.5,
                                    whiteSpace: 'pre-wrap',
                                }}
                            >
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                            style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Loader2 size={14} color="white" className="animate-spin" />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                            Pensando...
                        </span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
                <div
                    style={{
                        padding: '0.5rem 1rem',
                        borderTop: '1px solid var(--border-secondary)',
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                    }}
                >
                    {QUICK_ACTIONS.map((action, i) => (
                        <button
                            key={i}
                            onClick={() => handleQuickAction(action.prompt)}
                            style={{
                                padding: '0.375rem 0.75rem',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-secondary)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div
                style={{
                    padding: '0.75rem 1rem',
                    borderTop: '1px solid var(--border-secondary)',
                    display: 'flex',
                    gap: '0.5rem',
                }}
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') sendMessage(input);
                    }}
                    placeholder="Escribe tu mensaje..."
                    className="input"
                    style={{ flex: 1, fontSize: '0.85rem' }}
                    disabled={isLoading}
                />
                <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    className="btn-primary"
                    style={{ padding: '0.5rem 0.75rem' }}
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
}
