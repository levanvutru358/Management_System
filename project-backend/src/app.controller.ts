import { Controller } from "@nestjs/common/decorators/core";
import { Get } from "@nestjs/common/decorators/http";

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello from Task Management Backend!';
  }
}
