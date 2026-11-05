import {
  AuthenticationRegistry,
  SessionCookieProvider,
  type SessionRecord,
} from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import type { User } from '../users/user.js';
import { UsersRepository } from '../users/users.repository.js';

@Injectable()
export class SessionAuth extends SessionCookieProvider<User> {
  constructor(
    private readonly usersRepository: UsersRepository,
    registry: AuthenticationRegistry,
  ) {
    super();
    // Adds this provider to the chain the guard runs for every request.
    registry.registerProvider(this);
  }

  // Called for every request with a live session cookie.
  // Returning null (the user was deleted) ends the session.
  async validate(session: SessionRecord) {
    const user = await this.usersRepository.findById(session.userId);
    return user?.status === 'active' ? user : null;
  }
}
