import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NestMailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST') || 'smtp.gmail.com',
          port: configService.get('MAIL_PORT') || 587,
          secure: false,
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: '"Task Management System" <no-reply@yourdomain.com>',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService], // Đảm bảo export MailService
})
export class MailerModule {}