import { PasswordHasher } from '@nestjs/authentication';
import { ConflictException, Injectable } from '@nestjs/common';
import type { User } from '../users/user.js';
import { UsersRepository } from '../users/users.repository.js';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async register(
    email: string,
    password: string,
    fullName: string,
    marketingOptIn = false,
  ): Promise<User> {
    if (await this.usersRepository.findByEmail(email)) {
      throw new ConflictException('Email already registered');
    }
    // The address is unverified: anyone can type any email into a sign-up form.
    return this.usersRepository.create(email, {
      passwordHash: await this.passwordHasher.hash(password),
      fullName,
      marketingOptIn,
    });
  }

  async registerFirstSuperAdmin(
    email: string,
    password: string,
    fullName: string,
  ) {
    if (await this.usersRepository.hasSuperAdmin()) {
      throw new ConflictException('Initial administrator already exists');
    }
    return this.usersRepository.createInitialSuperAdmin(
      email,
      await this.passwordHasher.hash(password),
      fullName,
    );
  }

  /** The user, or `null` when the email or the password is wrong. */
  async verify(email: string, password: string): Promise<User | null> {
    const found = await this.usersRepository.findCredentials(email);
    // With no account (or no password), verify() checks a dummy hash, so the
    // response time does not reveal which emails are registered.
    const valid = await this.passwordHasher.verify(
      password,
      found?.passwordHash,
    );
    if (
      !valid ||
      !found?.passwordHash ||
      found.user.status !== 'active' ||
      (found.lockedUntil && found.lockedUntil.getTime() > Date.now())
    ) {
      return null;
    }
    // The cost settings changed since this hash was stored: upgrade it now,
    // while we have the plaintext.
    if (this.passwordHasher.needsRehash(found.passwordHash)) {
      await this.usersRepository.updatePasswordHash(
        found.user.id,
        await this.passwordHasher.hash(password),
      );
    }
    return found.user;
  }
}
