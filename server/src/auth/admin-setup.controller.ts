import { Public } from '@nestjs/authentication';
import { Body, ConflictException, Controller, Get, Post } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository.js';
import { SignUpDto } from './auth.dto.js';
import { CredentialsService } from './credentials.service.js';

@Public()
@Controller('auth/super-admin')
export class AdminSetupController {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly usersRepository: UsersRepository,
  ) {}

  @Get('status')
  async status() {
    return { exists: await this.usersRepository.hasSuperAdmin() };
  }

  @Post('register')
  async register(@Body() body: SignUpDto) {
    if (await this.usersRepository.hasSuperAdmin()) {
      throw new ConflictException('Initial administrator already exists');
    }
    await this.credentialsService.registerFirstSuperAdmin(
      body.email,
      body.password,
      body.fullName,
    );
    return { created: true };
  }
}
