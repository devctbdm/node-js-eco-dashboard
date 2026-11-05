import { PasswordResetService, Public } from '@nestjs/authentication';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { EmailDto, ResetPasswordDto } from './auth.dto.js';

@Public()
@Controller('auth/password')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  // The same answer, as fast, whether or not the address has an account:
  // request() returns before it looks the address up.
  @Post('forgot')
  @HttpCode(202)
  forgot(@Body() body: EmailDto) {
    return this.passwordResetService.request(body.email);
  }

  // Called by the page the link opens, with the token from its URL and the new password.
  @Post('reset')
  @HttpCode(200)
  async reset(@Body() body: ResetPasswordDto) {
    const result = await this.passwordResetService.reset(
      body.token,
      body.password,
      { signIn: false },
    );
    if (!result) {
      throw new BadRequestException('Invalid or expired link');
    }
    return { reset: true };
  }
}
