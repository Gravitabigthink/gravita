import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

// Generate and serve a quote PDF
// This endpoint is publicly accessible so WhatsApp can access the PDF
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const searchParams = request.nextUrl.searchParams;

        // Get quote data from query params (base64 encoded)
        const quoteDataParam = searchParams.get('data');

        if (!quoteDataParam) {
            return NextResponse.json({ error: 'Quote data required' }, { status: 400 });
        }

        // Decode quote data
        const quoteData = JSON.parse(Buffer.from(quoteDataParam, 'base64').toString());
        const { leadName, leadEmail, leadPhone, quote } = quoteData;

        // Generate PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;

        // Colors
        const primaryColor: [number, number, number] = [99, 102, 241];
        const textColor: [number, number, number] = [24, 24, 27];
        const grayColor: [number, number, number] = [113, 113, 122];

        // Header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 45, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('GRAVITA Marketing', 20, 28);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Cotización Profesional', 20, 38);

        // Quote ID and date
        doc.setFontSize(10);
        doc.text(`#${id.toUpperCase()}`, pageWidth - 60, 25);
        doc.text(new Date().toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }), pageWidth - 60, 35);

        y = 60;

        // Client Info
        doc.setTextColor(...textColor);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Preparado para:', 20, y);
        y += 8;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(leadName || 'Cliente', 20, y);
        y += 6;

        doc.setTextColor(...grayColor);
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
        doc.text('Precio', 160, y + 3);

        y += 15;

        // Services
        doc.setFont('helvetica', 'normal');
        if (quote.services && Array.isArray(quote.services)) {
            for (const service of quote.services) {
                doc.setTextColor(...textColor);
                const lines = doc.splitTextToSize(service.name, 120);
                doc.text(lines, 20, y);

                doc.text(`$${(service.price * (service.quantity || 1)).toLocaleString()} MXN`, 160, y);

                y += Math.max(8, lines.length * 6) + 5;
            }
        }

        y += 10;

        // Total
        doc.setFillColor(...primaryColor);
        doc.rect(125, y - 5, pageWidth - 140, 14, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL:', 130, y + 4);
        doc.text(`$${(quote.total || 0).toLocaleString()} MXN`, 160, y + 4);

        y += 25;

        // Validity
        doc.setTextColor(...grayColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const validUntil = quote.validUntil
            ? new Date(quote.validUntil).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
            : '7 días';
        doc.text(`Cotización válida hasta: ${validUntil}`, 20, y);

        // Footer
        const footerY = doc.internal.pageSize.getHeight() - 20;
        doc.setTextColor(...grayColor);
        doc.setFontSize(9);
        doc.text('Gracias por confiar en nosotros.', pageWidth / 2, footerY, { align: 'center' });
        doc.text('GRAVITA Marketing | www.gravita.mx', pageWidth / 2, footerY + 5, { align: 'center' });

        // Return PDF as response
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="cotizacion-${id}.pdf"`,
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
