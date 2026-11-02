import { Policy, type PolicyBefore } from '@nestjs/authorization';
import type { User } from '../users/user.js';
import type { Product } from './product.js';

const isStaff = (user: User | null) => !!user?.roles.includes('staff');

@Policy()
export class ProductPolicy implements PolicyBefore<User> {
  // Admins pass every check below, including abilities added later.
  before(user: User | null) {
    if (user?.roles.includes('admin')) {
      return true;
    }
  }

  // `null` is a guest. Everyone sees published products; staff also see drafts.
  view(user: User | null, product: Product) {
    return product.published || isStaff(user);
  }

  viewDrafts(user: User | null) {
    return isStaff(user);
  }

  create(user: User | null) {
    return isStaff(user);
  }

  update(user: User | null) {
    return isStaff(user);
  }

  // Nobody but admins, who get through in before().
  delete(_user: User | null) {
    return false;
  }
}
