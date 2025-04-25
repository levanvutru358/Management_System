// src/integrations/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  text: string;
}

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', //không phải là email cụ thể 
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendMail(options: MailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: '"Management System" <no-reply@yourdomain.com>',
        ...options,
      });
      console.log(`Email sent to ${options.to}`);
    } catch (error) {
      console.error('Failed to send email:', error.message);
      throw new Error('Could not send email');
    }
  }
}