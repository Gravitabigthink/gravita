import { NextRequest, NextResponse } from 'next/server';
import { sendQuoteEmail, isEmailConfigured } from '@/lib/emailService';
import { jsPDF } from 'jspdf';

// Send quote via Email with PDF attachment
export async function POST(request: NextRequest) {
    try {
        const { email, leadName, quote } = await request.json();

        console.log('=== Email Quote Send Request ===');
        console.log('Email:', email);
        console.log('Lead Name:', leadName);
        console.log('Email Configured:', isEmailConfigured());

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        if (!isEmailConfigured()) {
            console.log('Email NOT configured - returning error');
            return NextResponse.json(
                { success: false, error: 'Email service not configured' },
                { status: 503 }
            );
        }

        // Generate PDF buffer
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;

        // Header
        doc.setFillColor(99, 102, 241);
        doc.rect(0, 0, pageWidth, 45, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('GRAVITA Marketing', 20, 28);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Cotización Profesional', 20, 38);
        doc.setFontSize(10);
        doc.text(`#${quote.id?.slice(0, 8)?.toUpperCase() || 'QUOTE'}`, pageWidth - 60, 25);
        doc.text(new Date().toLocaleDateString('es-MX'), pageWidth - 60, 35);

        y = 60;
        doc.setTextColor(24, 24, 27);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Preparado para:', 20, y);
        y += 8;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(leadName || 'Cliente', 20, y);
        y += 20;

        // Services
        doc.setFillColor(245, 245, 250);
        doc.rect(15, y - 5, pageWidth - 30, 12, 'F');
        doc.setTextColor(24, 24, 27);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Servicio', 20, y + 3);
        doc.text('Precio', 160, y + 3);
        y += 15;

        doc.setFont('helvetica', 'normal');
        if (quote.services && Array.isArray(quote.services)) {
            for (const service of quote.services) {
                doc.setTextColor(24, 24, 27);
                doc.text(service.name.substring(0, 40), 20, y);
                doc.text(`$${(service.price * (service.quantity || 1)).toLocaleString()} MXN`, 160, y);
                y += 10;
            }
        }

        y += 15;

        // Total
        doc.setFillColor(99, 102, 241);
        doc.rect(125, y - 5, pageWidth - 140, 14, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL:', 130, y + 4);
        doc.text(`$${(quote.total || 0).toLocaleString()} MXN`, 160, y + 4);

        // Footer
        const footerY = doc.internal.pageSize.getHeight() - 20;
        doc.setTextColor(113, 113, 122);
        doc.setFontSize(9);
        doc.text('GRAVITA Marketing | www.gravita.mx', pageWidth / 2, footerY, { align: 'center' });

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        console.log('PDF generated, sending email...');

        const result = await sendQuoteEmail({
            to: email,
            leadName,
            quote,
            pdfBuffer,
        });

        if (result.success) {
            console.log('Email sent successfully:', result.id);
            return NextResponse.json({
                success: true,
                emailId: result.id,
                message: 'Cotización enviada por email'
            });
        } else {
            console.log('Email send failed:', result.error);
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error sending quote email:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send quote email' },
            { status: 500 }
        );
    }
}
