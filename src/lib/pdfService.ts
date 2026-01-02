/**
 * PDF Generation Service for Quotes
 * Uses jspdf to generate professional quote PDFs
 */

import { jsPDF } from 'jspdf';
import { Quote } from '@/types/lead';

interface QuotePDFOptions {
    leadName: string;
    leadEmail?: string;
    leadPhone?: string;
    leadCompany?: string;
    quote: Quote;
    companyName?: string;
    companyLogo?: string;
}

export function generateQuotePDF(options: QuotePDFOptions): Blob {
    const {
        leadName,
        leadEmail,
        leadPhone,
        leadCompany,
        quote,
        companyName = 'GRAVITA Marketing',
    } = options;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Colors
    const primaryColor: [number, number, number] = [99, 102, 241]; // Indigo
    const textColor: [number, number, number] = [24, 24, 27];
    const grayColor: [number, number, number] = [113, 113, 122];

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, 20, 28);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Cotización Profesional', 20, 38);

    // Quote number and date on the right
    doc.setFontSize(10);
    doc.text(`#${quote.id.slice(0, 8).toUpperCase()}`, pageWidth - 60, 25);
    doc.text(new Date(quote.createdAt).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }), pageWidth - 60, 35);

    y = 60;

    // Client Info Section
    doc.setTextColor(...textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Preparado para:', 20, y);
    y += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(leadName, 20, y);
    y += 6;

    doc.setTextColor(...grayColor);
    if (leadCompany) {
        doc.text(leadCompany, 20, y);
        y += 6;
    }
    if (leadEmail) {
        doc.text(leadEmail, 20, y);
        y += 6;
    }
    if (leadPhone) {
        doc.text(leadPhone, 20, y);
        y += 6;
    }

    y += 15;

    // Services Table Header
    doc.setFillColor(245, 245, 250);
    doc.rect(15, y - 5, pageWidth - 30, 12, 'F');

    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Servicio', 20, y + 3);
    doc.text('Cantidad', 110, y + 3);
    doc.text('Precio Unit.', 140, y + 3);
    doc.text('Subtotal', 175, y + 3);

    y += 15;

    // Services
    doc.setFont('helvetica', 'normal');
    for (const service of quote.services) {
        if (y > 250) {
            doc.addPage();
            y = 20;
        }

        // Service name (with wrapping)
        doc.setTextColor(...textColor);
        const lines = doc.splitTextToSize(service.name, 85);
        doc.text(lines, 20, y);

        // Quantity
        doc.setTextColor(...grayColor);
        doc.text(String(service.quantity), 115, y);

        // Unit price
        doc.text(`$${service.price.toLocaleString()}`, 140, y);

        // Subtotal
        doc.setTextColor(...textColor);
        doc.text(`$${(service.price * service.quantity).toLocaleString()}`, 175, y);

        y += Math.max(8, lines.length * 6);

        // Description if exists
        if (service.description) {
            doc.setFontSize(9);
            doc.setTextColor(...grayColor);
            const descLines = doc.splitTextToSize(service.description, 150);
            doc.text(descLines, 20, y);
            y += descLines.length * 5;
            doc.setFontSize(11);
        }

        y += 5;
    }

    y += 10;

    // Totals Section
    doc.setDrawColor(230, 230, 230);
    doc.line(100, y, pageWidth - 15, y);
    y += 10;

    // Discount if applicable
    if (quote.discount > 0) {
        doc.setTextColor(...grayColor);
        doc.text('Subtotal:', 130, y);
        doc.text(`$${quote.subtotal.toLocaleString()}`, 175, y);
        y += 8;

        doc.setTextColor(239, 68, 68);
        doc.text('Descuento:', 130, y);
        doc.text(`-$${quote.discount.toLocaleString()}`, 175, y);
        y += 8;
    }

    // Total
    doc.setFillColor(...primaryColor);
    doc.rect(125, y - 5, pageWidth - 140, 14, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 130, y + 4);
    doc.text(`$${quote.total.toLocaleString()} MXN`, 175, y + 4);

    y += 25;

    // Validity
    doc.setTextColor(...grayColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const validUntil = new Date(quote.validUntil).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    doc.text(`Cotización válida hasta: ${validUntil}`, 20, y);

    // Notes
    if (quote.notes) {
        y += 15;
        doc.setTextColor(...textColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Notas:', 20, y);
        y += 7;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...grayColor);
        const noteLines = doc.splitTextToSize(quote.notes, pageWidth - 40);
        doc.text(noteLines, 20, y);
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setTextColor(...grayColor);
    doc.setFontSize(9);
    doc.text('Gracias por confiar en nosotros.', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`${companyName} | www.gravita.mx`, pageWidth / 2, footerY + 5, { align: 'center' });

    return doc.output('blob');
}

export function downloadQuotePDF(options: QuotePDFOptions, filename?: string) {
    const blob = generateQuotePDF(options);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `cotizacion-${options.quote.id.slice(0, 8)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function getQuotePDFBase64(options: QuotePDFOptions): string {
    const doc = new jsPDF();
    // ... recreate PDF
    return doc.output('datauristring');
}
