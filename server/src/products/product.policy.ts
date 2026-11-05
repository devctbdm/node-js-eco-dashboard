import { Policy, type PolicyBefore } from '@nestjs/authorization';
import type { User } from '../users/user.js';
import type { Product } from './product.js';

const can = (user: User | null, permission: string) =>
  !!user &&
  (user.permissions.includes('*') ||
    user.permissions.includes(permission));

@Policy()
export class ProductPolicy implements PolicyBefore<User> {
  before(user: User | null) {
    if (user?.permissions.includes('*')) {
      return true;
    }
  }

  // `null` is a guest. Everyone sees published products; staff also see drafts.
  view(user: User | null, product: Product) {
    return product.published || can(user, 'products.read');
  }

  viewDrafts(user: User | null) {
    return can(user, 'products.read');
  }

  create(user: User | null) {
    return can(user, 'products.create');
  }

  update(user: User | null) {
    return can(user, 'products.update');
  }

  delete(user: User | null) {
    return can(user, 'products.delete');
  }
}
