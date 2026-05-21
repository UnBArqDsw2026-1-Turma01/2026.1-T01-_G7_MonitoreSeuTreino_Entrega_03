import { EmailService } from '@domain/services/email.service';
import { ExternalServiceException } from '@infrastructure/exceptions/infrastructure-exceptions';
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NodemailerEmailService implements EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'localhost',
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Redefinição de senha — MonitoreSeuTreino',
        text: `Clique no link abaixo para redefinir sua senha (válido por 15 minutos):\n\n${resetLink}\n\nSe você não solicitou isso, ignore este e-mail.`,
        html: `
          <p>Clique no link abaixo para redefinir sua senha (válido por <strong>15 minutos</strong>):</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>Se você não solicitou isso, ignore este e-mail.</p>
        `,
      });
    } catch (err) {
      throw new ExternalServiceException('SMTP', err, { to });
    }
  }
}
