import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      const emailUser = this.configService.get<string>('EMAIL_USER');
      const emailPass = this.configService.get<string>('EMAIL_PASS');
      const mailHost = this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com');
      const mailPort = this.configService.get<number>('MAIL_PORT', 465);
      const mailSecure = this.configService.get<string>('MAIL_SECURE', 'true') === 'true';

      if (!emailUser || !emailPass) {
        this.logger.error('EMAIL_USER hoặc EMAIL_PASS không được định nghĩa');
        return;
      }

      this.logger.log(`Khởi tạo email: user=${emailUser}, host=${mailHost}, port=${mailPort}, secure=${mailSecure}`);

      this.transporter = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: mailSecure,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        connectionTimeout: 30000,
        socketTimeout: 30000,
      });

      this.verifyConnection();
    } catch (error) {
      this.logger.error(`Khởi tạo transporter thất bại: ${error.message}`);
    }
  }

  private async verifyConnection(): Promise<void> {
    if (!this.transporter) return;
    try {
      await this.transporter.verify();
      this.logger.log('Kết nối SMTP thành công');
    } catch (error) {
      this.logger.warn(`Kết nối SMTP thất bại: ${error.message}`);
    }
  }

  async sendMail(options: MailOptions): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.transporter) {
        return { success: false, message: 'Transporter chưa được khởi tạo' };
      }

      const emailFrom = this.configService.get<string>('EMAIL_FROM');
      if (!emailFrom) {
        return { success: false, message: 'EMAIL_FROM không được định nghĩa' };
      }

      // Kiểm tra email hợp lệ
      if (!options.to || !options.to.includes('@')) {
        return { success: false, message: `Email không hợp lệ: ${options.to}` };
      }

      const mailOptions = {
        from: `"Task Manager" <${emailFrom}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Gửi email thành công đến ${options.to}: ${info.messageId}`);
      return { success: true, message: 'Email gửi thành công' };
    } catch (error) {
      this.logger.error(`Lỗi gửi email đến ${options.to}: ${error.message}`);
      return { success: false, message: `Lỗi gửi email: ${error.message}` };
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.transporter) {
        return { success: false, message: 'Transporter chưa được khởi tạo' };
      }
      await this.transporter.verify();
      this.logger.log('Test kết nối SMTP thành công');
      return { success: true, message: 'Kết nối SMTP thành công' };
    } catch (error) {
      this.logger.error(`Test kết nối thất bại: ${error.message}`);
      return { success: false, message: `Lỗi kết nối: ${error.message}` };
    }
  }
}