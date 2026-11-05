export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export type AuthenticatedUser = {
  id: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
  roles: string[];
  permissions: string[];
  status: "active" | "suspended" | "blocked";
};

export const hasPermission = (
  permissions: string[],
  permission: string,
) => permissions.includes("*") || permissions.includes(permission);
