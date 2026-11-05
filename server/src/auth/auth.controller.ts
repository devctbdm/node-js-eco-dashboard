import {
  EmailVerificationService,
  Public,
  SignInService,
} from '@nestjs/authentication';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { UsersRepository } from '../users/users.repository.js';
import { SignInDto, SignUpDto } from './auth.dto.js';
import { CredentialsService } from './credentials.service.js';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly signInService: SignInService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly usersRepository: UsersRepository,
  ) {}

  @Post(['sign-up', 'register'])
  async signUp(@Body() body: SignUpDto) {
    const user = await this.credentialsService.register(
      body.email,
      body.password,
      body.fullName,
      body.marketingOptIn,
    );
    await this.emailVerificationService.send(user);
    return { verificationRequired: true };
  }

  @Post('sign-in')
  @HttpCode(200)
  signIn(@Body() body: SignInDto, @Req() request: Request) {
    return this.login(body, request, 'any');
  }

  @Post('customer/login')
  @HttpCode(200)
  signInCustomer(@Body() body: SignInDto, @Req() request: Request) {
    return this.login(body, request, 'customer');
  }

  @Post('login')
  @HttpCode(200)
  signInAdmin(@Body() body: SignInDto, @Req() request: Request) {
    return this.login(body, request, 'admin');
  }

  @Post('logout')
  @HttpCode(200)
  async signOut() {
    await this.signInService.signOut();
    return { signedOut: true };
  }

  private async login(
    body: SignInDto,
    request: Request,
    portal: 'any' | 'customer' | 'admin',
  ) {
    const user = await this.credentialsService.verify(
      body.email,
      body.password,
    );
    const allowed =
      !!user &&
      (portal === 'any' ||
        (portal === 'customer'
          ? user.roles.includes('customer')
          : user.roles.some((role) =>
              ['staff', 'admin', 'superadmin'].includes(role),
            )));
    if (!allowed || !user) {
      await this.usersRepository.recordLoginAttempt({
        email: body.email,
        user,
        ipAddress: request.ip,
        userAgent: request.get('user-agent'),
        successful: false,
      });
      throw new UnauthorizedException('Invalid email or password');
    }
    const { session } = await this.signInService.signIn(user.id, {
      method: 'password',
    });
    await this.usersRepository.recordLoginAttempt({
      email: body.email,
      user,
      ipAddress: request.ip,
      userAgent: request.get('user-agent'),
      successful: true,
    });
    return { mfaRequired: session.mfa === 'pending' };
  }
}
