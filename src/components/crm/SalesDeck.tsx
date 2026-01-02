'use client';

import { Lead, Quote, QuoteService } from '@/types/lead';

interface SalesDeckProps {
    lead: Lead;
    quote: Quote;
    slideNumber: number;
    totalSlides: number;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

// Slide 1: Cover
export function SlideCover({ lead, slideNumber, totalSlides }: SalesDeckProps) {
    return (
        <div className="slide">
            <div className="blob b1" />
            <div className="blob b2" />
            <div className="safe-zone">
                <div className="label">● PROPUESTA PERSONALIZADA</div>
                <h1>
                    Tu crecimiento.
                    <br />
                    <span className="grad-text">Nuestro sistema.</span>
                </h1>
                <p>
                    Propuesta exclusiva para{' '}
                    <strong>
                        {lead.nombre} {lead.apellido || ''}
                    </strong>
                    {lead.empresa && (
                        <>
                            {' '}de <strong>{lead.empresa}</strong>
                        </>
                    )}
                    .<br />
                    Estrategia, tecnología y obsesión por los resultados.
                </p>
            </div>
            <div className="footer">
                <span>GRAVITA / BIG THINKER</span>
                <span>
                    {String(slideNumber).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
}

// Slide 2: Nuestra Filosofía
export function SlidePhilosophy({ slideNumber, totalSlides }: SalesDeckProps) {
    return (
        <div className="slide">
            <div className="blob b3" />
            <div className="safe-zone">
                <div className="grid-2">
                    <div style={{ textAlign: 'left' }}>
                        <div className="label" style={{ marginLeft: 0 }}>
                            NUESTRO ADN
                        </div>
                        <h2 style={{ textAlign: 'left', marginBottom: '20px' }}>No somos una agencia genérica.</h2>
                        <p style={{ textAlign: 'left', margin: '0 0 20px 0' }}>
                            En <strong>Big Thinker (Gravita)</strong> nos especializamos en una sola cosa: Escalar.
                        </p>
                        <p style={{ textAlign: 'left', margin: '0 0 30px 0' }}>
                            No vendemos publicaciones ni paquetes vacíos. Diseñamos sistemas de ventas con lógica, data y
                            creatividad aplicada.
                        </p>
                        <div style={{ paddingLeft: '20px', borderLeft: '4px solid #D946EF' }}>
                            <h3 className="grad-text" style={{ fontSize: '2rem', margin: 0 }}>
                                "Crear, creer y crecer."
                            </h3>
                            <p style={{ textAlign: 'left', fontSize: '0.9rem', margin: '5px 0 0 0' }}>— Nuestro Mantra</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className="orbit-graphic">
                            <svg width="180" height="180" viewBox="0 0 100 100" fill="none" stroke="#D946EF" strokeWidth="1.5">
                                <circle cx="50" cy="50" r="40" strokeOpacity="0.15" />
                                <circle cx="50" cy="50" r="28" strokeOpacity="0.3" />
                                <circle cx="50" cy="50" r="12" />
                                <path d="M50 5 L50 95 M5 50 L95 50" strokeOpacity="0.15" strokeDasharray="4 4" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer">
                <span>FILOSOFÍA</span>
                <span>
                    {String(slideNumber).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
}

// Slide 3: Problema
export function SlideProblem({ lead, slideNumber, totalSlides }: SalesDeckProps) {
    const painPoints = lead.psychProfile?.painPoints || [
        'Marketing de esperanza. Sin datos, solo "feeling" y subjetividad.',
        'Presupuesto quemado en anuncios que nadie ve y clics que no compran.',
        'Ventas planas y ROAS decreciente aunque subas la inversión.',
    ];

    return (
        <div className="slide">
            <div className="blob b1" />
            <div className="safe-zone">
                <h2>El mercado cambió. Tu estrategia debe cambiar.</h2>
                <p>
                    La mayoría de las marcas mueren por <strong>incertidumbre</strong>. Contratan "creatividad bonita", cruzan
                    los dedos y esperan ventas.
                </p>
                <div className="grid-3">
                    <div className="card">
                        <div className="icon-box">
                            <svg className="icon-svg" viewBox="0 0 24 24">
                                <rect x="2" y="6" width="20" height="12" rx="2" />
                                <path d="M6 12h.01M12 12h.01M18 12h.01" />
                            </svg>
                        </div>
                        <h3>El Casino</h3>
                        <p>{painPoints[0] || 'Marketing de esperanza. Sin datos, solo intuición.'}</p>
                    </div>
                    <div className="card">
                        <div className="icon-box">
                            <svg className="icon-svg" viewBox="0 0 24 24">
                                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                        <h3>Desperdicio</h3>
                        <p>{painPoints[1] || 'Presupuesto quemado en anuncios que no convierten.'}</p>
                    </div>
                    <div className="card">
                        <div className="icon-box">
                            <svg className="icon-svg" viewBox="0 0 24 24">
                                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
                                <polyline points="16 17 22 17 22 11" />
                            </svg>
                        </div>
                        <h3>Estancamiento</h3>
                        <p>{painPoints[2] || 'Ventas planas aunque subas la inversión.'}</p>
                    </div>
                </div>
            </div>
            <div className="footer">
                <span>SITUACIÓN ACTUAL</span>
                <span>
                    {String(slideNumber).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
}

// Slide 4: Metodología
export function SlideMethodology({ slideNumber, totalSlides }: SalesDeckProps) {
    return (
        <div className="slide">
            <div className="blob b2" />
            <div className="safe-zone">
                <div className="label">NUESTRO SISTEMA PROPIETARIO</div>
                <h2>Metodología D.L.F.</h2>
                <p>Cómo eliminamos la suerte de la ecuación con fuerza bruta de datos.</p>
                <div className="grid-3">
                    <div className="card">
                        <div className="icon-box">
                            <svg className="icon-svg" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                        <h3>1. Detective</h3>
                        <p>
                            <strong>Inteligencia.</strong> Analizamos si tu cliente compra por miedo, estatus o lógica antes de
                            diseñar un solo pixel.
                        </p>
                    </div>
                    <div className="card">
                        <div className="icon-box">
                            <svg className="icon-svg" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M10 2v2M14 2v2M2 12h2M20 12h2" />
                            </svg>
                        </div>
                        <h3>2. Laboratorio</h3>
                        <p>
                            <strong>Producción.</strong> Lanzamos 10-12 variaciones para saturar al algoritmo. Buscamos ganadores
                            matemáticos.
                        </p>
                    </div>
                    <div className="card">
                        <div className="icon-box">
                            <svg className="icon-svg" viewBox="0 0 24 24">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <h3>3. Filtro</h3>
                        <p>
                            <strong>Blindaje.</strong> Si un anuncio no es rentable en 5 días, se apaga. Solo inyectamos presupuesto a
                            lo que imprime dinero.
                        </p>
                    </div>
                </div>
            </div>
            <div className="footer">
                <span>METODOLOGÍA</span>
                <span>
                    {String(slideNumber).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
}

// Slide 5: Resultados
export function SlideResults({ slideNumber, totalSlides }: SalesDeckProps) {
    return (
        <div className="slide">
            <div className="blob b3" />
            <div className="safe-zone">
                <h2>Resultados, no promesas.</h2>
                <div className="grid-3" style={{ margin: '40px 0' }}>
                    <div style={{ textAlign: 'center' }}>
                        <span className="grad-text stat-number">+$15M</span>
                        <p className="stat-label">Generados en Ventas</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <span className="grad-text stat-number">340%</span>
                        <p className="stat-label">ROAS Promedio</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <span className="grad-text stat-number">45+</span>
                        <p className="stat-label">Industrias Dominadas</p>
                    </div>
                </div>
                <div className="testimonial-box">
                    <p className="testimonial-quote">
                        "Dejamos de tirar dinero en 48 horas. El sistema de 'Filtro' es lo único que nos dio control real sobre
                        nuestro crecimiento."
                    </p>
                    <p className="testimonial-author">— CEO, SolarTech Pro</p>
                </div>
            </div>
            <div className="footer">
                <span>EVIDENCIA</span>
                <span>
                    {String(slideNumber).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
}

// Slide 6: Pricing (Packages)
export function SlidePricing({ quote, slideNumber, totalSlides }: SalesDeckProps) {
    // Define service packages
    const packages = [
        {
            name: 'Ignition',
            description: 'Validación y flujo inicial.',
            price: 10000,
            features: ['Estrategia Adquisición', '3 Ángulos de Venta', 'Gestión Campaña', 'Optimización Básica'],
            isPopular: false,
        },
        {
            name: 'Orbit',
            description: 'Escalamiento seguro.',
            price: 20000,
            features: ['Todo lo de Ignition +', 'Landing Page Incluida', 'Rebote Semanal', 'Análisis Psicológico'],
            isPopular: true,
        },
        {
            name: 'Velocity',
            description: 'Dominio total.',
            price: 35000,
            features: ['Estrategia Dinámica', 'Contenido Orgánico', 'Oferta Irresistible', 'Landing High-Ticket'],
            isPopular: false,
        },
    ];

    return (
        <div className="slide">
            <div className="safe-zone">
                <div className="label">INVERSIÓN INTELIGENTE</div>
                <h2>Protocolos de Crecimiento</h2>
                <div className="grid-3" style={{ alignItems: 'center' }}>
                    {packages.map((pkg, i) => (
                        <div key={i} className={`price-col ${pkg.isPopular ? 'black' : ''}`}>
                            {pkg.isPopular && <div className="recommended-badge">RECOMENDADO</div>}
                            <h3 className="price-title">{pkg.name}</h3>
                            <p className="price-desc">{pkg.description}</p>
                            <div className="price-num">{formatCurrency(pkg.price)}</div>
                            <ul className="features">
                                {pkg.features.map((feature, j) => (
                                    <li key={j} style={pkg.isPopular && j > 0 ? { fontWeight: 700, color: 'white' } : {}}>
                                        <svg className="check-svg" viewBox="0 0 24 24">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <div className="footer">
                <span>OFERTA</span>
                <span>
                    {String(slideNumber).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
}

// Slide 7: FAQ
export function SlideFAQ({ slideNumber, totalSlides }: SalesDeckProps) {
    const faqs = [
        {
            q: '¿Por qué una iguala?',
            a: 'Somos ingenieros, no apostadores. Usted paga por la infraestructura técnica, el equipo y la estabilidad, no por un golpe de suerte.',
        },
        {
            q: '¿Qué es el Blindaje?',
            a: 'Si un anuncio no cumple KPIs en 5 días, cortamos el gasto. Garantizamos que no tirará dinero en publicidad mala.',
        },
        {
            q: '¿Necesito web?',
            a: 'No. En Orbit y Velocity nosotros construimos su Landing Page de alta conversión.',
        },
        {
            q: '¿Tiempos?',
            a: 'Investigación: Semana 1. Lanzamiento: Semana 2. Optimización y resultados constantes: Día 21 en adelante.',
        },
    ];

    return (
        <div className="slide">
            <div className="blob b1" />
            <div className="safe-zone">
                <h2>Blindaje de Riesgo (FAQ)</h2>
                <div className="grid-2" style={{ alignItems: 'stretch' }}>
                    {faqs.map((faq, i) => (
                        <div key={i} className="card">
                            <h3>{faq.q}</h3>
                            <p style={{ fontSize: '1rem' }}>{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="footer">
                <span>RESOLUCIÓN DE DUDAS</span>
                <span>
                    {String(slideNumber).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
}

// Slide 8: CTA Final
export function SlideCTA({ lead, quote, slideNumber, totalSlides }: SalesDeckProps) {
    return (
        <div className="slide slide-dark">
            <div className="blob b1" style={{ opacity: 0.1 }} />
            <div className="safe-zone">
                <h1 style={{ color: '#fff' }}>¿Empezamos, {lead.nombre}?</h1>
                <p style={{ fontSize: '1.5rem', color: '#94A3B8' }}>Define el ritmo de tu crecimiento hoy.</p>
                <div className="cta-buttons">
                    <div className="cta-outline">Opción A: Orbit</div>
                    <div className="cta-solid">Opción B: Velocity</div>
                </div>
                <div className="brand-footer">BIG THINKER // GRAVITA SYSTEMS 2026</div>
            </div>
            <div className="footer footer-dark">
                <span>FINAL</span>
                <span>
                    {String(slideNumber).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
}

// Export all slides as an array generator
export function generateSalesDeckSlides(lead: Lead, quote: Quote) {
    const totalSlides = 8;

    return [
        { id: 'cover', component: SlideCover, props: { lead, quote, slideNumber: 1, totalSlides } },
        { id: 'philosophy', component: SlidePhilosophy, props: { lead, quote, slideNumber: 2, totalSlides } },
        { id: 'problem', component: SlideProblem, props: { lead, quote, slideNumber: 3, totalSlides } },
        { id: 'methodology', component: SlideMethodology, props: { lead, quote, slideNumber: 4, totalSlides } },
        { id: 'results', component: SlideResults, props: { lead, quote, slideNumber: 5, totalSlides } },
        { id: 'pricing', component: SlidePricing, props: { lead, quote, slideNumber: 6, totalSlides } },
        { id: 'faq', component: SlideFAQ, props: { lead, quote, slideNumber: 7, totalSlides } },
        { id: 'cta', component: SlideCTA, props: { lead, quote, slideNumber: 8, totalSlides } },
    ];
}
