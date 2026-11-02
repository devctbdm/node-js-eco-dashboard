export type Role = 'customer' | 'staff' | 'admin' | 'superadmin' | 'editor';

export interface User {
  id: string;
  email: string;
  /** Whether the owner proved the address to us, e.g. by using a magic link. */
  emailVerified: boolean;
  roles: Role[];
}
