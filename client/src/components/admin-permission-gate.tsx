"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasPermission } from "@/lib/api";

const routePermissions: Array<[string, string]> = [
  ["/dashboard/products", "products.read"],
  ["/dashboard/categories", "products.read"],
  ["/dashboard/orders", "orders.read"],
  ["/dashboard/customers", "customers.read"],
  ["/dashboard/team", "staff.read"],
  ["/dashboard/administrator", "roles.read"],
  ["/dashboard/adminprofile", "account.read"],
  ["/dashboard", "dashboard.read"],
];

export function AdminPermissionGate({
  permissions,
  children,
}: {
  permissions: string[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const required = routePermissions.find(
    ([path]) => pathname === path || pathname.startsWith(`${path}/`),
  )?.[1];
  const allowed = !required || hasPermission(permissions, required);

  React.useEffect(() => {
    if (!allowed) router.replace("/dashboard");
  }, [allowed, router]);

  return allowed ? children : null;
}
