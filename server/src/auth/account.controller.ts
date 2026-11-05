import type { SessionRecord } from '@nestjs/authentication';
import {
  Authenticate,
  CurrentSession,
  CurrentUser,
  PasswordHasher,
  SessionService,
  SignInService,
} from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '../users/user.js';
import { UsersRepository } from '../users/users.repository.js';
import { ChangePasswordDto } from './auth.dto.js';
import { CredentialsService } from './credentials.service.js';
import { PermissionPolicy } from './permission.policy.js';

@Controller('auth')
export class AccountController {
  constructor(
    private readonly sessions: SessionService,
    private readonly signInService: SignInService,
    private readonly credentialsService: CredentialsService,
    private readonly passwordHasher: PasswordHasher,
    private readonly usersRepository: UsersRepository,
  ) {}

  @Get('me')
  @Can(PermissionPolicy, 'has', () => ['account.read'] as const)
  currentUser(@CurrentUser() user: User) {
    return user;
  }

  @Get('sessions')
  @Can(PermissionPolicy, 'has', () => ['account.read'] as const)
  listSessions(@CurrentUser('id') userId: string) {
    return this.sessions.list(userId);
  }

  @Delete('sessions/:id')
  @HttpCode(204)
  @Can(PermissionPolicy, 'has', () => ['account.update'] as const)
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
  ) {
    if (!(await this.sessions.revoke(sessionId, { userId }))) {
      throw new UnauthorizedException('Session not found');
    }
  }

  @Post('logout/everywhere')
  @HttpCode(204)
  @Can(PermissionPolicy, 'has', () => ['account.update'] as const)
  signOutEverywhere(@CurrentUser('id') userId: string) {
    return this.signInService.signOutEverywhere(userId);
  }

  @Post('password/change')
  @HttpCode(204)
  @Can(PermissionPolicy, 'has', () => ['account.update'] as const)
  async changePassword(
    @CurrentUser() user: User,
    @Body() body: ChangePasswordDto,
  ) {
    if (!(await this.credentialsService.verify(user.email, body.oldPassword))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.usersRepository.updatePasswordHash(
      user.id,
      await this.passwordHasher.hash(body.newPassword),
    );
    await this.signInService.signOutEverywhere(user.id);
  }

  @Get('login-history')
  @Can(PermissionPolicy, 'has', () => ['account.read'] as const)
  getLoginHistory(@CurrentUser('id') userId: string) {
    return this.usersRepository.listLoginHistory(userId);
  }

  @Get('current-session')
  @Authenticate()
  @Can(PermissionPolicy, 'has', () => ['account.read'] as const)
  currentSession(@CurrentSession() session: SessionRecord) {
    return session;
  }
}
