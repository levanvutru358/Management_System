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
      service: 'cao101361@donga.edu.vn', 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendMail(options: MailOptions) {
    await this.transporter.sendMail({
      from: '"Management System" <cao101361@donga.edu.vn>',
      ...options,
    });
  }
}