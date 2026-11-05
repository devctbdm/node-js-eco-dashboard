import {
  CurrentUser,
  EmailVerificationService,
  Public,
} from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import type { User } from '../users/user.js';
import { PermissionPolicy } from './permission.policy.js';

@Controller('auth/email')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  // Called by the page the link opens, which POSTs the token from its URL.
  @Public()
  @Post('verify')
  @HttpCode(200)
  async verify(@Body('token') token: string) {
    const verified = await this.emailVerificationService.verify(token);
    if (!verified) {
      throw new BadRequestException('Invalid or expired link');
    }
    return { email: verified.email, emailVerified: true };
  }

  // "Send the link again", to the signed-in customer's current address.
  @Post('verification')
  @HttpCode(202)
  @Can(PermissionPolicy, 'has', () => ['account.update'] as const)
  async resend(@CurrentUser() user: User) {
    if (user.emailVerified) {
      throw new ConflictException('Email address already verified');
    }
    await this.emailVerificationService.send(user);
  }
}
