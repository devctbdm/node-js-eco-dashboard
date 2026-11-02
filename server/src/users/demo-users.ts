import type { User } from './user.js';

/**
 * The demo accounts. They all sign in with the password "catnip4all", and the
 * seeded orders refer to their ids.
 */
export const alice: User = {
  id: '1f794c55-472e-42b9-8913-4114964ed6fb',
  email: 'alice@example.com',
  emailVerified: true,
  roles: ['customer'],
};

export const bob: User = {
  id: 'fc27b5c1-62b5-494e-9924-28a66d387fd1',
  email: 'bob@example.com',
  emailVerified: true,
  roles: ['customer'],
};

export const sam: User = {
  id: '208a223b-3503-4255-83e7-22d290e331c3',
  email: 'sam@example.com',
  emailVerified: true,
  roles: ['staff'],
};

export const ada: User = {
  id: 'ae34ca97-f82b-49ab-b332-8808f3b0e240',
  email: 'ada@example.com',
  emailVerified: true,
  roles: ['staff', 'admin', 'superadmin'],
};

export const demoUsers = [alice, bob, sam, ada];
