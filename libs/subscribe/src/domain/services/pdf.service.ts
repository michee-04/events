/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as PDFDocument from 'pdfkit';

export type UserInfos = {
  firstname: string;
  lastname: string;
  email: string;
};

export type EventInfos = {
  title: string;
  location: string;
  startDate: Date;
  isPaid: boolean;
  price: number | null;
};

@Injectable()
export class PdfService {
  private readonly pdfAuthor: string;
  constructor(private readonly configService: ConfigService) {
    this.pdfAuthor = this.configService.get('PDF_AUTHOR');
  }

  async generateTicket(user: UserInfos, event: EventInfos): Promise<Buffer> {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      doc.info.Title = `Ticket pour ${event.title}`;
      doc.info.Author = this.pdfAuthor;

      doc
        .fontSize(24)
        .fillColor('#34495e')
        .text(`Confirmation d'inscription`, { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(20)
        .fillColor('#2c3e50')
        .text(`${event.title}`, { align: 'center' })
        .moveDown(1.5);

      doc
        .fontSize(14)
        .fillColor('#34495e')
        .text('Détails du participant:', { underline: true })
        .moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor('#555')
        .text(
          `Nom: ${user.firstname || 'Non spécifié'} ${user.lastname || 'Non spécifié'}`,
        )
        .text(`Email: ${user.email}`)
        .moveDown(1.5);

      doc
        .fontSize(14)
        .fillColor('#34495e')
        .text("Détails de l'événement:", { underline: true })
        .moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor('#555')
        .text(`Lieu: ${event.location}`)
        .text(
          `Date: ${event.startDate.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`,
        )
        .moveDown(1);

      doc
        .fontSize(16)
        .fillColor(event.isPaid ? '#28a745' : '#6c757d')
        .text(
          `Prix: ${event.isPaid && event.price ? event.price + ' FCFA' : 'Gratuit'}`,
          { align: 'center' },
        )
        .moveDown(2);

      doc
        .fontSize(10)
        .fillColor('#999')
        .text("Ce ticket est votre preuve d'inscription.", { align: 'center' })
        .moveDown(0.2);

      doc
        .fontSize(10)
        .fillColor('#999')
        .text('Nous avons hâte de vous y voir !', { align: 'center' });

      // Appelé à la fin pour déclencher 'end'
      doc.end();
    });
  }
}
