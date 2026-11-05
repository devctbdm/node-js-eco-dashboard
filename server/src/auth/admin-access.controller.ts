import { CurrentUser } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import type { User } from '../users/user.js';
import { UsersRepository } from '../users/users.repository.js';
import {
  AccountStatusDto,
  AssignRolesDto,
  CreateRoleDto,
  RolePermissionsDto,
} from './auth.dto.js';
import { PermissionPolicy } from './permission.policy.js';

@Controller('admin')
export class AdminAccessController {
  constructor(private readonly usersRepository: UsersRepository) {}

  @Get('access/roles')
  @Can(PermissionPolicy, 'has', () => ['roles.read'] as const)
  listRoles() {
    return this.usersRepository.listRoles();
  }

  @Post('access/roles')
  @Can(PermissionPolicy, 'has', () => ['roles.manage'] as const)
  createRole(@Body() body: CreateRoleDto, @CurrentUser() actor: User) {
    return this.usersRepository.createRole(
      body.key,
      body.description,
      body.permissions,
      actor,
    );
  }

  @Put('access/roles/:key/permissions')
  @Can(PermissionPolicy, 'has', () => ['roles.manage'] as const)
  updatePermissions(
    @Param('key') key: string,
    @Body() body: RolePermissionsDto,
    @CurrentUser() actor: User,
  ) {
    return this.usersRepository.updateRolePermissions(
      key,
      body.permissions,
      actor,
    );
  }

  @Delete('access/roles/:key')
  @HttpCode(204)
  @Can(PermissionPolicy, 'has', () => ['roles.manage'] as const)
  deleteRole(@Param('key') key: string) {
    return this.usersRepository.deleteRole(key);
  }

  @Get('users')
  @Can(PermissionPolicy, 'has', () => ['customers.read'] as const)
  listUsers() {
    return this.usersRepository.listManagedUsers();
  }

  @Patch('users/:id/roles')
  @Can(PermissionPolicy, 'has', () => ['roles.manage'] as const)
  assignRoles(
    @Param('id') userId: string,
    @Body() body: AssignRolesDto,
    @CurrentUser() actor: User,
  ) {
    return this.usersRepository.assignUserRoles(userId, body.roles, actor);
  }

  @Patch('users/:id/status')
  @Can(PermissionPolicy, 'has', () => ['customers.suspend'] as const)
  updateStatus(
    @Param('id') userId: string,
    @Body() body: AccountStatusDto,
    @CurrentUser() actor: User,
  ) {
    return this.usersRepository.updateAccountStatus(userId, body.status, actor);
  }
}
