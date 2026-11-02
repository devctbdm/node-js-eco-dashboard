"use client";

import {
  Lock,
  MailPlus,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/* ----------------------------- dummy data ----------------------------- */

const actions = ["view", "create", "edit", "delete"] as const;
type Action = (typeof actions)[number];
const resources = [
  "Products",
  "Categories",
  "Orders",
  "Customers",
  "Administrators",
  "Settings",
] as const;
type Perms = Record<string, Action[]>;
type Role = { id: string; name: string; description: string; system?: boolean };
type Status = "Active" | "Invited" | "Deactivated";
type Admin = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: Status;
  last: string;
};

// compact helper: "vced" -> ["view","create","edit","delete"]
const letters: Record<string, Action> = {
  v: "view",
  c: "create",
  e: "edit",
  d: "delete",
};
const p = (spec: Partial<Record<(typeof resources)[number], string>>): Perms =>
  Object.fromEntries(
    resources.map((r) => [r, [...(spec[r] ?? "")].map((l) => letters[l])]),
  );

const initialRoles: Role[] = [
  {
    id: "super",
    name: "Super Admin",
    description: "Full access to everything. Cannot be changed.",
    system: true,
  },
  {
    id: "admin",
    name: "Admin",
    description:
      "Runs the store day to day, without billing or settings control.",
  },
  {
    id: "manager",
    name: "Manager",
    description: "Manages the catalog and fulfills orders.",
  },
  {
    id: "support",
    name: "Support",
    description: "Helps customers and handles order issues.",
  },
  {
    id: "editor",
    name: "Content Editor",
    description: "Creates and edits products and categories.",
  },
];
const initialPerms: Record<string, Perms> = {
  super: p({
    Products: "vced",
    Categories: "vced",
    Orders: "vced",
    Customers: "vced",
    Administrators: "vced",
    Settings: "vced",
  }),
  admin: p({
    Products: "vced",
    Categories: "vced",
    Orders: "vced",
    Customers: "vced",
    Administrators: "v",
    Settings: "v",
  }),
  manager: p({
    Products: "vced",
    Categories: "vced",
    Orders: "vce",
    Customers: "v",
  }),
  support: p({ Products: "v", Orders: "ve", Customers: "ve" }),
  editor: p({ Products: "vce", Categories: "vce" }),
};
const initialAdmins: Admin[] = [
  {
    id: "a1",
    name: "Jane Cooper",
    email: "jane@yourstore.com",
    roleId: "super",
    status: "Active",
    last: "Just now",
  },
  {
    id: "a2",
    name: "Marcus Lee",
    email: "marcus@yourstore.com",
    roleId: "admin",
    status: "Active",
    last: "2 hours ago",
  },
  {
    id: "a3",
    name: "Priya Shah",
    email: "priya@yourstore.com",
    roleId: "manager",
    status: "Active",
    last: "Yesterday",
  },
  {
    id: "a4",
    name: "Tom Becker",
    email: "tom@yourstore.com",
    roleId: "support",
    status: "Active",
    last: "3 days ago",
  },
  {
    id: "a5",
    name: "Elena Rossi",
    email: "elena@yourstore.com",
    roleId: "editor",
    status: "Invited",
    last: "Not yet",
  },
  {
    id: "a6",
    name: "Omar Haddad",
    email: "omar@yourstore.com",
    roleId: "support",
    status: "Deactivated",
    last: "Sep 14",
  },
];

const statusStyle: Record<Status, string> = {
  Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Invited: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Deactivated: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
};
const initials = (n: string) =>
  n
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2);
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

/* ------------------------------- page -------------------------------- */

export default function AdministratorsPage() {
  const reduce = useReducedMotion();
  const [tab, setTab] = React.useState<"admins" | "roles">("admins");

  const [roles, setRoles] = React.useState<Role[]>(initialRoles);
  const [perms, setPerms] = React.useState<Record<string, Perms>>(initialPerms);
  const [savedPerms, setSavedPerms] =
    React.useState<Record<string, Perms>>(initialPerms);
  const [admins, setAdmins] = React.useState<Admin[]>(initialAdmins);

  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [activeRole, setActiveRole] = React.useState("admin");

  const [sheet, setSheet] = React.useState<
    null | { mode: "invite" } | { mode: "edit"; admin: Admin }
  >(null);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    roleId: "manager",
  });
  const [formError, setFormError] = React.useState("");
  const [toRemove, setToRemove] = React.useState<Admin | null>(null);

  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? id;
  const dirty = JSON.stringify(perms) !== JSON.stringify(savedPerms);

  const filtered = admins.filter((a) => {
    const q = query.trim().toLowerCase();
    return (
      (roleFilter === "all" || a.roleId === roleFilter) &&
      (!q || a.name.toLowerCase().includes(q) || a.email.includes(q))
    );
  });

  /* ---- permissions ---- */
  function toggle(roleId: string, res: string, act: Action, on: boolean) {
    setPerms((prev) => {
      let list = new Set(prev[roleId][res]);
      if (on) {
        list.add(act);
        if (act !== "view") list.add("view"); // any write access needs view
      } else {
        list.delete(act);
        if (act === "view") list = new Set(); // no view, no access
      }
      return {
        ...prev,
        [roleId]: {
          ...prev[roleId],
          [res]: actions.filter((a) => list.has(a)),
        },
      };
    });
  }
  function toggleRow(roleId: string, res: string, on: boolean) {
    setPerms((prev) => ({
      ...prev,
      [roleId]: { ...prev[roleId], [res]: on ? [...actions] : [] },
    }));
  }
  function newRole() {
    const id = `custom-${Date.now()}`;
    setRoles((r) => [
      ...r,
      {
        id,
        name: `Custom role ${r.length - 4}`,
        description: "Choose what this role can do.",
      },
    ]);
    const empty = p({});
    setPerms((x) => ({ ...x, [id]: empty }));
    setSavedPerms((x) => ({ ...x, [id]: empty }));
    setActiveRole(id);
  }

  /* ---- administrators ---- */
  function openInvite() {
    setForm({ name: "", email: "", roleId: "manager" });
    setFormError("");
    setSheet({ mode: "invite" });
  }
  function openEdit(a: Admin) {
    setForm({ name: a.name, email: a.email, roleId: a.roleId });
    setFormError("");
    setSheet({ mode: "edit", admin: a });
  }
  function submitSheet(e: React.FormEvent) {
    e.preventDefault();
    if (!sheet) return;
    if (sheet.mode === "invite") {
      if (form.name.trim().length < 2)
        return setFormError("Enter the person’s full name.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        return setFormError("Enter a valid email address.");
      if (
        admins.some((a) => a.email.toLowerCase() === form.email.toLowerCase())
      )
        return setFormError("An administrator with this email already exists.");
      setAdmins((l) => [
        ...l,
        {
          id: `a${Date.now()}`,
          name: form.name.trim(),
          email: form.email.trim(),
          roleId: form.roleId,
          status: "Invited",
          last: "Not yet",
        },
      ]);
    } else {
      setAdmins((l) =>
        l.map((a) =>
          a.id === sheet.admin.id ? { ...a, roleId: form.roleId } : a,
        ),
      );
    }
    setSheet(null);
  }
  const setStatus = (id: string, status: Status) =>
    setAdmins((l) => l.map((a) => (a.id === id ? { ...a, status } : a)));

  const roleItems = roles.map((r) => ({ value: r.id, label: r.name }));
  const assignable = roleItems.filter((r) => r.value !== "super");
  const current = roles.find((r) => r.id === activeRole)!;
  const locked = !!current.system;
  const formRole = roles.find((r) => r.id === form.roleId);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto flex w-full  flex-col gap-6 p-4 md:p-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Administrators
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage who can sign in and what each person can do.
          </p>
        </div>
        <Button onClick={openInvite}>
          <MailPlus /> Invite administrator
        </Button>
      </div>

      {/* Summary */}
      <Card className="py-0">
        <CardContent className="grid grid-cols-2 divide-x divide-y p-0 md:grid-cols-4 md:divide-y-0">
          {[
            ["Administrators", String(admins.length)],
            [
              "Active",
              String(admins.filter((a) => a.status === "Active").length),
            ],
            [
              "Pending invites",
              String(admins.filter((a) => a.status === "Invited").length),
            ],
            ["Roles", String(roles.length)],
          ].map(([label, value]) => (
            <div key={label} className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
                {value}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="admins">Administrators</TabsTrigger>
          <TabsTrigger value="roles">Roles &amp; permissions</TabsTrigger>
        </TabsList>
      </Tabs>

      <AnimatePresence mode="wait" initial={false}>
        {tab === "admins" ? (
          <motion.div
            key="admins"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Card className="gap-0 py-0">
              <div className="flex flex-wrap items-center gap-2 border-b p-4">
                <div className="relative min-w-52 flex-1 sm:max-w-xs">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search name or email"
                    aria-label="Search administrators"
                    className="pl-9"
                  />
                </div>
                <Select
                  value={roleFilter}
                  onValueChange={(v) => setRoleFilter(v as string)}
                  items={[{ value: "all", label: "All roles" }, ...roleItems]}
                >
                  <SelectTrigger className="w-44" aria-label="Filter by role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    {roleItems.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Administrator</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Last active
                    </TableHead>
                    <TableHead className="w-12 pr-4">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => {
                    const isSuper = a.roleId === "super";
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="pl-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="text-xs">
                                {initials(a.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {a.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {a.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-sm">
                            {isSuper && (
                              <ShieldCheck
                                className="size-4 text-primary"
                                aria-hidden
                              />
                            )}
                            {roleName(a.roleId)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={statusStyle[a.status]}
                          >
                            {a.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {a.last}
                        </TableCell>
                        <TableCell className="pr-4">
                          {isSuper ? (
                            <span
                              className="flex size-9 items-center justify-center text-muted-foreground"
                              title="Super admin is protected"
                            >
                              <Lock
                                className="size-4"
                                aria-label="Protected account"
                              />
                            </span>
                          ) : (
                            /* Base UI: `render` instead of Radix `asChild` */
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Actions for ${a.name}`}
                                  />
                                }
                              >
                                <MoreHorizontal />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(a)}>
                                  Change role
                                </DropdownMenuItem>
                                {a.status === "Invited" && (
                                  <DropdownMenuItem>
                                    Resend invitation
                                  </DropdownMenuItem>
                                )}
                                {a.status === "Deactivated" ? (
                                  <DropdownMenuItem
                                    onClick={() => setStatus(a.id, "Active")}
                                  >
                                    Reactivate
                                  </DropdownMenuItem>
                                ) : a.status === "Active" ? (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setStatus(a.id, "Deactivated")
                                    }
                                  >
                                    Deactivate
                                  </DropdownMenuItem>
                                ) : null}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => setToRemove(a)}
                                >
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filtered.length === 0 && (
                <p className="px-4 py-14 text-center text-sm text-muted-foreground">
                  No administrators match your search.
                </p>
              )}
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="roles"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]"
          >
            {/* role list */}
            <Card className="gap-0 py-0">
              <ul className="flex flex-col p-2">
                {roles.map((r) => {
                  const count = admins.filter((a) => a.roleId === r.id).length;
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => setActiveRole(r.id)}
                        aria-current={r.id === activeRole}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          r.id === activeRole && "bg-muted font-medium",
                        )}
                      >
                        <span className="flex items-center gap-2 truncate">
                          {r.system && (
                            <Lock
                              className="size-3.5 shrink-0 text-muted-foreground"
                              aria-hidden
                            />
                          )}
                          <span className="truncate">{r.name}</span>
                        </span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={newRole}
                >
                  <Plus /> New role
                </Button>
              </div>
            </Card>

            {/* permission matrix */}
            <Card className="gap-0 py-0">
              <CardHeader className="border-b py-4">
                {current.system || !current.id.startsWith("custom") ? (
                  <CardTitle>{current.name}</CardTitle>
                ) : (
                  <Input
                    aria-label="Role name"
                    value={current.name}
                    onChange={(e) =>
                      setRoles((l) =>
                        l.map((r) =>
                          r.id === current.id
                            ? { ...r, name: e.target.value }
                            : r,
                        ),
                      )
                    }
                    className="h-9 max-w-xs text-base font-semibold"
                  />
                )}
                <CardDescription>{current.description}</CardDescription>
              </CardHeader>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Area</TableHead>
                    {actions.map((a) => (
                      <TableHead key={a} className="text-center">
                        {cap(a)}
                      </TableHead>
                    ))}
                    <TableHead className="pr-6 text-center">All</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((res) => {
                    const list = perms[current.id][res];
                    return (
                      <TableRow key={res}>
                        <TableCell className="pl-6 font-medium">
                          {res}
                        </TableCell>
                        {actions.map((act) => (
                          <TableCell key={act} className="text-center">
                            <Checkbox
                              aria-label={`${cap(act)} ${res}`}
                              checked={list.includes(act)}
                              disabled={locked}
                              onCheckedChange={(v) =>
                                toggle(current.id, res, act, !!v)
                              }
                            />
                          </TableCell>
                        ))}
                        <TableCell className="pr-6 text-center">
                          <Checkbox
                            aria-label={`All permissions for ${res}`}
                            checked={list.length === actions.length}
                            indeterminate={
                              list.length > 0 && list.length < actions.length
                            }
                            disabled={locked}
                            onCheckedChange={(v) =>
                              toggleRow(current.id, res, !!v)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
                <p className="text-xs text-muted-foreground">
                  {locked
                    ? "The Super Admin role always has full access."
                    : "Create, edit and delete always include view access."}
                </p>
                {!locked && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      disabled={!dirty}
                      onClick={() => setPerms(savedPerms)}
                    >
                      Discard
                    </Button>
                    <Button
                      disabled={!dirty}
                      onClick={() => setSavedPerms(perms)}
                    >
                      Save changes
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite / change role */}
      <Sheet open={!!sheet} onOpenChange={(v) => !v && setSheet(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <form
            onSubmit={submitSheet}
            noValidate
            className="flex h-full flex-col"
          >
            <SheetHeader>
              <SheetTitle>
                {sheet?.mode === "edit"
                  ? "Change role"
                  : "Invite administrator"}
              </SheetTitle>
              <SheetDescription>
                {sheet?.mode === "edit"
                  ? `Update what ${form.name} can access.`
                  : "They’ll get an email with a link to set their password."}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 px-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="adm-name">Full name</Label>
                <Input
                  id="adm-name"
                  value={form.name}
                  disabled={sheet?.mode === "edit"}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Cooper"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="adm-email">Email</Label>
                <Input
                  id="adm-email"
                  type="email"
                  value={form.email}
                  disabled={sheet?.mode === "edit"}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Role</Label>
                <Select
                  value={form.roleId}
                  onValueChange={(v) =>
                    setForm({ ...form, roleId: v as string })
                  }
                  items={assignable}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assignable.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formRole && (
                  <p className="text-xs text-muted-foreground">
                    {formRole.description}
                  </p>
                )}
              </div>
              {formError && (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              )}
            </div>

            <SheetFooter className="flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setSheet(null)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {sheet?.mode === "edit" ? "Save role" : "Send invitation"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Remove confirmation */}
      <AlertDialog
        open={!!toRemove}
        onOpenChange={(v) => !v && setToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this administrator?</AlertDialogTitle>
            <AlertDialogDescription>
              {toRemove?.name} will lose access to the admin panel immediately.
              Their past activity stays in your logs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep access</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setAdmins((l) => l.filter((a) => a.id !== toRemove?.id));
                setToRemove(null);
              }}
            >
              Remove administrator
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
