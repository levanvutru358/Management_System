import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => {
        const emailUser = config.get<string>('EMAIL_USER');
        const emailPass = config.get<string>('EMAIL_PASS');
        const mailHost = config.get<string>('MAIL_HOST', '74.125.24.108'); // Static IP fallback
        const mailPort = config.get<number>('MAIL_PORT', 465);
        const mailSecure = config.get<boolean>('MAIL_SECURE', true);

        if (!emailUser || !emailPass) {
          throw new Error('EMAIL_USER và EMAIL_PASS phải được định nghĩa trong .env');
        }

        return {
          transport: {
            host: mailHost,
            port: mailPort,
            secure: mailSecure,
            auth: {
              user: emailUser,
              pass: emailPass,
            },
            connectionTimeout: 10000,
            socketTimeout: 20000,
          },
          defaults: {
            from: `"Task Manager" <${emailUser}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}