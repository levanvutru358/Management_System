import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('test-smtp')
  async testSMTP() {
    return this.mailService.testConnection();
  }

  @Get('test-send')
  async testSend() {
    return this.mailService.sendMail({
      to: 'lequycaopt123@gmail.com',
      subject: 'Test Email from NestJS',
      text: 'This is a test email sent from your NestJS application',
    });
  }
}