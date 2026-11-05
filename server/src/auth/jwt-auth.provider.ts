import {
  AuthenticationRegistry,
  JwtBearerProvider,
  type JwtClaims,
} from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import type { User } from '../users/user.js';
import { UsersRepository } from '../users/users.repository.js';

@Injectable()
export class JwtAuth extends JwtBearerProvider<User> {
  constructor(
    private readonly usersRepository: UsersRepository,
    registry: AuthenticationRegistry,
  ) {
    // The key, issuer and audience come from the `accessToken` options.
    super({ realm: 'store' });
    // Second in the chain, after SessionAuth (order 0).
    registry.registerProvider(this, { order: 1 });
  }

  // Called after the signature and claims checked out.
  // Returning null (the user was deleted) rejects the token.
  async validate({ sub }: JwtClaims) {
    if (!sub) return null;
    const user = await this.usersRepository.findById(sub);
    return user?.status === 'active' ? user : null;
  }
}
