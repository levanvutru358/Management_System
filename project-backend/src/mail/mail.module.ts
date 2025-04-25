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
        const mailHost = config.get<string>('MAIL_HOST');
        const mailPort = config.get<number>('MAIL_PORT', 465);
        const mailSecure = config.get<string>('MAIL_SECURE') === 'true'; // Sửa để parse đúng thành boolean

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