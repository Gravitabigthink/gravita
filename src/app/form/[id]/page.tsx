'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Loader2, Calendar, ArrowRight, Star } from 'lucide-react';
import { getFormById, Form, FormField } from '@/lib/formStorage';

// Rating component
function RatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    <Star
                        size={32}
                        fill={star <= value ? '#f59e0b' : 'transparent'}
                        color={star <= value ? '#f59e0b' : '#a1a1aa'}
                        strokeWidth={1.5}
                    />
                </button>
            ))}
        </div>
    );
}

export default function PublicFormPage() {
    const params = useParams();
    const formId = params.id as string;

    const [form, setForm] = useState<Form | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState<Record<string, string | number>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        // Load form from shared storage
        const foundForm = getFormById(formId);
        if (foundForm && foundForm.status !== 'archived') {
            setForm(foundForm);
        }
        setLoading(false);
    }, [formId]);

    const handleInputChange = (fieldId: string, value: string | number) => {
        setFormData((prev) => ({ ...prev, [fieldId]: value }));
        // Clear error when user types
        if (errors[fieldId]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        if (!form) return false;

        const newErrors: Record<string, string> = {};

        form.fields.forEach((field) => {
            const value = formData[field.id];
            if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
                newErrors[field.id] = 'Este campo es requerido';
            }

            // Email validation
            if (field.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value as string)) {
                    newErrors[field.id] = 'Ingresa un email válido';
                }
            }

            // Phone validation
            if (field.type === 'phone' && value) {
                const phoneValue = (value as string).replace(/\D/g, '');
                if (phoneValue.length < 10) {
                    newErrors[field.id] = 'Ingresa un teléfono válido';
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calculateScore = (): number => {
        if (!form) return 50;

        let totalWeight = 0;
        let totalScore = 0;

        form.fields.forEach((field) => {
            if (field.scorable && field.scoreWeight && field.options) {
                const value = formData[field.id] as string;
                if (value) {
                    const optionIndex = field.options.indexOf(value);
                    // First options = higher score
                    const optionScore = ((field.options.length - optionIndex) / field.options.length) * 100;
                    totalScore += optionScore * (field.scoreWeight / 100);
                    totalWeight += field.scoreWeight;
                }
            }
        });

        // Base score if no scorable fields
        if (totalWeight === 0) return 60;

        // Normalize to 100
        return Math.round((totalScore / totalWeight) * 100);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);

        try {
            const score = calculateScore();

            // Submit to API
            const response = await fetch('/api/forms/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formId: form?.id,
                    formName: form?.name,
                    linkedCalendar: form?.linkedCalendar,
                    responses: formData,
                    score,
                }),
            });

            if (!response.ok) {
                throw new Error('Error al enviar formulario');
            }

            const result = await response.json();

            setSubmitted(true);

            // If calendar is linked, redirect after a delay
            if (form?.linkedCalendar && result.calendarUrl) {
                setTimeout(() => {
                    window.location.href = result.calendarUrl;
                }, 2000);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Hubo un error al enviar. Por favor intenta de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
                }}
            >
                <Loader2 size={40} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Form not found
    if (!form) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
                    color: '#fafafa',
                    padding: '2rem',
                    textAlign: 'center',
                }}
            >
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
                    Formulario no encontrado
                </h1>
                <p style={{ color: '#a1a1aa' }}>
                    Este formulario no existe o ya no está disponible.
                </p>
            </div>
        );
    }

    // Success state
    if (submitted) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
                    color: '#fafafa',
                    padding: '2rem',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(34, 197, 94, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                        animation: 'scaleIn 0.3s ease',
                    }}
                >
                    <CheckCircle size={40} color="#22c55e" />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    ¡Gracias por tu información!
                </h1>
                <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>
                    Hemos recibido tu solicitud y te contactaremos pronto.
                </p>
                {form.linkedCalendar && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366f1' }}>
                        <Calendar size={20} />
                        <span>Redirigiendo al calendario...</span>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                )}
                <style>{`
                    @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    // Form view
    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '520px',
                    background: 'rgba(24, 24, 27, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: '2.5rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                        }}
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fafafa', marginBottom: '0.5rem' }}>
                        {form.name}
                    </h1>
                    <p style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>{form.description}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {form.fields.map((field) => (
                        <div key={field.id}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#fafafa',
                                    marginBottom: '0.5rem',
                                }}
                            >
                                {field.label}
                                {field.required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
                            </label>

                            {field.type === 'select' ? (
                                <select
                                    value={(formData[field.id] as string) || ''}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: '#27272a',
                                        color: '#fafafa',
                                        border: errors[field.id] ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        outline: 'none',
                                    }}
                                >
                                    <option value="">Selecciona una opción</option>
                                    {field.options?.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            ) : field.type === 'textarea' ? (
                                <textarea
                                    value={(formData[field.id] as string) || ''}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    placeholder={field.placeholder}
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: '#27272a',
                                        color: '#fafafa',
                                        border: errors[field.id] ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        fontSize: '0.9rem',
                                        resize: 'vertical',
                                        outline: 'none',
                                    }}
                                />
                            ) : field.type === 'rating' ? (
                                <RatingInput
                                    value={(formData[field.id] as number) || 0}
                                    onChange={(v) => handleInputChange(field.id, v)}
                                />
                            ) : (
                                <input
                                    type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                                    value={(formData[field.id] as string) || ''}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    placeholder={field.placeholder}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: '#27272a',
                                        color: '#fafafa',
                                        border: errors[field.id] ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                    }}
                                />
                            )}

                            {errors[field.id] && (
                                <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.375rem' }}>
                                    {errors[field.id]}
                                </p>
                            )}
                        </div>
                    ))}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            marginTop: '0.5rem',
                            width: '100%',
                            padding: '0.875rem 1.5rem',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            opacity: submitting ? 0.7 : 1,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                Enviando...
                            </>
                        ) : (
                            <>
                                {form.linkedCalendar ? 'Continuar al Calendario' : 'Enviar'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p
                    style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        color: '#71717a',
                        marginTop: '1.5rem',
                    }}
                >
                    Powered by Gravita OS
                </p>
            </div>
        </div>
    );
}
