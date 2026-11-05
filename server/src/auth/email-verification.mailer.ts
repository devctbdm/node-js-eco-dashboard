import {
  AuthenticationRegistry,
  EmailVerificationHandler,
  type EmailVerificationLink,
} from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import { html, Mailer, type Mailable } from '@nestjs/mail';
import { UsersRepository } from '../users/users.repository.js';

@Injectable()
export class VerifyEmailMail implements Mailable<EmailVerificationLink> {
  render({ url }: EmailVerificationLink) {
    return {
      subject: 'Confirm your email address',
      html: html`<p>Confirm your email address:</p>
        <p><a href="${url}">Verify email</a></p>`,
    };
  }
}

@Injectable()
export class EmailVerificationMailer extends EmailVerificationHandler {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailer: Mailer,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerHandler('emailVerification', this);
  }

  async send(link: EmailVerificationLink) {
    await this.mailer.send(VerifyEmailMail, { to: link.email, data: link });
  }

  // Runs when the link is used. It verifies nothing if the address changed since.
  markVerified(userId: string, email: string) {
    return this.usersRepository.markEmailVerified(userId, email);
  }
}
