import {
  Authenticate,
  CurrentUser,
  MfaService,
  Public,
  SignInService,
} from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '../users/user.js';
import { PermissionPolicy } from './permission.policy.js';

@Controller('auth/mfa')
export class MfaController {
  constructor(
    private readonly mfaService: MfaService,
    private readonly signInService: SignInService,
  ) {}

  // Returns the otpauth:// URI for the web app to show as a QR code,
  // and the secret for people who type it in instead.
  @Post('enroll')
  @Can(PermissionPolicy, 'has', () => ['account.update'] as const)
  enroll(@CurrentUser() user: User) {
    return this.mfaService.enroll(user.id, user.email);
  }

  // A new phone. The current authenticator keeps working until /confirm
  // receives a code from the new one.
  @Authenticate({ mfa: true })
  @Post('replace')
  @Can(PermissionPolicy, 'has', () => ['account.update'] as const)
  replace(@CurrentUser() user: User) {
    return this.mfaService.enroll(user.id, user.email, { replace: true });
  }

  // The first code proves the authenticator works, and that this browser has
  // it: the session passes the second factor from here on, under a new cookie.
  // Recovery codes are shown once.
  @Post('confirm')
  @HttpCode(200)
  @Can(PermissionPolicy, 'has', () => ['account.update'] as const)
  async confirm(@CurrentUser('id') userId: string, @Body('code') code: string) {
    if (!(await this.signInService.confirmMfa(userId, code))) {
      throw new UnauthorizedException('Invalid code');
    }
    return {
      recoveryCodes: await this.mfaService.generateRecoveryCodes(userId),
    };
  }

  // Second step of signing in. A pending session counts as signed in
  // nowhere, so the route is public: completeMfa() reads the session cookie.
  @Public()
  @Post('verify')
  @HttpCode(200)
  async verify(
    @Body('code') code: string | undefined,
    @Body('recoveryCode') recoveryCode: string | undefined,
  ) {
    const issued = await this.signInService.completeMfa({ code, recoveryCode });
    if (!issued) {
      throw new UnauthorizedException('Invalid code');
    }
    return { mfa: issued.session.mfa };
  }
}
