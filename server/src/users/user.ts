export type Role = string;
export type AccountStatus = 'active' | 'suspended' | 'blocked';

export interface User {
  id: string;
  email: string;
  fullName: string;
  marketingOptIn: boolean;
  /** Whether the owner proved the address to us, e.g. by using a magic link. */
  emailVerified: boolean;
  roles: Role[];
  permissions: string[];
  status: AccountStatus;
}
