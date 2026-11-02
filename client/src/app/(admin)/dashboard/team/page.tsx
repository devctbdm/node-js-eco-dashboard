"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  MoreHorizontal,
  Plus,
  Search,
  SearchX,
  Trash2,
  Upload,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* ----------------------------- dummy data ----------------------------- */

type Member = {
  id: string;
  name: string;
  title: string;
  dept: string;
  bio: string;
  linkedin: string;
  x: string;
  visible: boolean;
  photo?: string;
};

const deptHue: Record<string, number> = {
  Leadership: 265,
  Design: 345,
  Engineering: 235,
  Support: 150,
  Marketing: 30,
};
const depts = Object.keys(deptHue);
const deptItems = depts.map((d) => ({ value: d, label: d }));
const MAX_MB = 2;

const initial: Member[] = [
  {
    id: "m1",
    name: "Jane Cooper",
    title: "Founder & CEO",
    dept: "Leadership",
    bio: "Started the store in a garage and still reads every customer review.",
    linkedin: "https://linkedin.com/in/jane",
    x: "",
    visible: true,
  },
  {
    id: "m2",
    name: "Marcus Lee",
    title: "Head of Operations",
    dept: "Leadership",
    bio: "Keeps orders moving from warehouse to doorstep.",
    linkedin: "https://linkedin.com/in/marcus",
    x: "",
    visible: true,
  },
  {
    id: "m3",
    name: "Priya Shah",
    title: "Lead Designer",
    dept: "Design",
    bio: "Shapes how every product looks, feels and unboxes.",
    linkedin: "",
    x: "https://x.com/priya",
    visible: true,
  },
  {
    id: "m4",
    name: "Tom Becker",
    title: "Senior Engineer",
    dept: "Engineering",
    bio: "Builds the tools that keep the store fast and reliable.",
    linkedin: "https://linkedin.com/in/tom",
    x: "",
    visible: true,
  },
  {
    id: "m5",
    name: "Elena Rossi",
    title: "Support Lead",
    dept: "Support",
    bio: "Turns tricky delivery problems into happy customers.",
    linkedin: "",
    x: "",
    visible: true,
  },
  {
    id: "m6",
    name: "Omar Haddad",
    title: "Growth Marketer",
    dept: "Marketing",
    bio: "Finds new people who will love what we make.",
    linkedin: "https://linkedin.com/in/omar",
    x: "",
    visible: false,
  },
];

const blank: Omit<Member, "id"> = {
  name: "",
  title: "",
  dept: "Leadership",
  bio: "",
  linkedin: "",
  x: "",
  visible: true,
};
const initials = (n: string) =>
  n
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

/* ----------------------------- small parts ---------------------------- */

function Portrait({
  m,
  className,
}: {
  m: Pick<Member, "name" | "dept" | "photo">;
  className?: string;
}) {
  const h = deptHue[m.dept] ?? 250;
  return m.photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={m.photo}
      alt=""
      className={cn("rounded-full border object-cover", className)}
    />
  ) : (
    <span
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-full border font-semibold",
        className,
      )}
      style={{
        background: `oklch(0.95 0.03 ${h})`,
        color: `oklch(0.45 0.12 ${h})`,
      }}
    >
      {initials(m.name)}
    </span>
  );
}

/* ------------------------------- page -------------------------------- */

export default function TeamPage() {
  const reduce = useReducedMotion();
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [tab, setTab] = React.useState<"members" | "page">("members");
  const [members, setMembers] = React.useState<Member[]>(initial);
  const [query, setQuery] = React.useState("");
  const [deptFilter, setDeptFilter] = React.useState("all");

  const [sheet, setSheet] = React.useState<null | { id?: string }>(null);
  const [form, setForm] = React.useState<Omit<Member, "id">>(blank);
  const [errors, setErrors] = React.useState<{
    name?: string;
    title?: string;
    photo?: string;
  }>({});
  const [toDelete, setToDelete] = React.useState<Member | null>(null);

  const [pageForm, setPageForm] = React.useState({
    title: "Meet the team",
    intro: "The people behind the products you love.",
    layout: "grid-3",
    showDept: true,
  });
  const [saved, setSaved] = React.useState(false);

  const filtering = query.trim() !== "" || deptFilter !== "all";
  const shown = members.filter((m) => {
    const q = query.trim().toLowerCase();
    return (
      (deptFilter === "all" || m.dept === deptFilter) &&
      (!q ||
        m.name.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q))
    );
  });

  function openSheet(m?: Member) {
    setErrors({});
    if (m) {
      const { id, ...rest } = m;
      setForm(rest);
      setSheet({ id });
    } else {
      setForm(blank);
      setSheet({});
    }
  }

  function pickPhoto(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return setErrors((e) => ({
        ...e,
        photo: "Upload a PNG, JPG or WebP image.",
      }));
    if (file.size > MAX_MB * 1024 * 1024)
      return setErrors((e) => ({
        ...e,
        photo: `Keep the photo under ${MAX_MB} MB.`,
      }));
    setErrors((e) => ({ ...e, photo: undefined }));
    if (form.photo) URL.revokeObjectURL(form.photo);
    setForm((f) => ({ ...f, photo: URL.createObjectURL(file) }));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const next = {
      name: form.name.trim() ? undefined : "Enter a name.",
      title: form.title.trim() ? undefined : "Enter a job title.",
    };
    setErrors(next);
    if (next.name || next.title) return;
    if (sheet?.id)
      setMembers((l) =>
        l.map((m) => (m.id === sheet.id ? { ...form, id: m.id } : m)),
      );
    else setMembers((l) => [...l, { ...form, id: `m${Date.now()}` }]);
    setSheet(null);
  }

  function move(id: string, dir: -1 | 1) {
    setMembers((l) => {
      const i = l.findIndex((m) => m.id === id);
      const j = i + dir;
      if (j < 0 || j >= l.length) return l;
      const n = [...l];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  }

  function savePage(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const visibleCount = members.filter((m) => m.visible).length;

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
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">
            Choose who appears on your public “Meet the team” page.
          </p>
        </div>
        <Button onClick={() => openSheet()}>
          <Plus /> Add team member
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="members">
              Members{" "}
              <span className="ml-1.5 text-xs tabular-nums text-muted-foreground">
                {members.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="page">Page content</TabsTrigger>
          </TabsList>
        </Tabs>
        {tab === "members" && (
          <p className="hidden text-xs text-muted-foreground tabular-nums sm:block">
            {visibleCount} visible on website
          </p>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {tab === "members" ? (
          <motion.div
            key="members"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-52 flex-1 sm:max-w-xs">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name or title"
                  aria-label="Search team"
                  className="pl-9"
                />
              </div>
              <Select
                value={deptFilter}
                onValueChange={(v) => setDeptFilter(v as string)}
                items={[
                  { value: "all", label: "All departments" },
                  ...deptItems,
                ]}
              >
                <SelectTrigger
                  className="w-48"
                  aria-label="Filter by department"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {deptItems.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filtering && (
                <p className="text-xs text-muted-foreground">
                  Clear filters to reorder members.
                </p>
              )}
            </div>

            {shown.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((m) => {
                  const idx = members.findIndex((x) => x.id === m.id);
                  return (
                    <Card
                      key={m.id}
                      className={cn(
                        "gap-4 transition-opacity",
                        !m.visible && "opacity-70",
                      )}
                    >
                      <CardContent className="flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                          <Portrait
                            m={m}
                            className="size-14 shrink-0 text-base"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{m.name}</p>
                            <p className="truncate text-sm text-muted-foreground">
                              {m.title}
                            </p>
                            <Badge variant="secondary" className="mt-1.5">
                              {m.dept}
                            </Badge>
                          </div>
                          {/* Base UI: `render` instead of Radix `asChild` */}
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Actions for ${m.name}`}
                                />
                              }
                            >
                              <MoreHorizontal />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openSheet(m)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={filtering || idx === 0}
                                onClick={() => move(m.id, -1)}
                              >
                                <ArrowLeft /> Move earlier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={
                                  filtering || idx === members.length - 1
                                }
                                onClick={() => move(m.id, 1)}
                              >
                                <ArrowRight /> Move later
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setToDelete(m)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
                          {m.bio || "No bio yet."}
                        </p>

                        <div className="flex items-center justify-between border-t pt-3">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="tabular-nums">#{idx + 1}</span>
                            {m.linkedin && (
                              <a
                                href={m.linkedin}
                                target="_blank"
                                rel="noreferrer"
                                className="underline-offset-4 hover:text-foreground hover:underline"
                              >
                                LinkedIn
                              </a>
                            )}
                            {m.x && (
                              <a
                                href={m.x}
                                target="_blank"
                                rel="noreferrer"
                                className="underline-offset-4 hover:text-foreground hover:underline"
                              >
                                X
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`vis-${m.id}`}
                              className="text-xs font-normal text-muted-foreground"
                            >
                              {m.visible ? "Visible" : "Hidden"}
                            </Label>
                            <Switch
                              id={`vis-${m.id}`}
                              checked={m.visible}
                              onCheckedChange={(v) =>
                                setMembers((l) =>
                                  l.map((x) =>
                                    x.id === m.id ? { ...x, visible: v } : x,
                                  ),
                                )
                              }
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-16 text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <SearchX className="size-5" aria-hidden />
                </span>
                <p className="text-sm font-medium">No team members found</p>
                <p className="text-xs text-muted-foreground">
                  Try a different search or add someone new.
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.form
            key="page"
            onSubmit={savePage}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="max-w-2xl"
          >
            <Card>
              <CardHeader>
                <CardTitle>Page content</CardTitle>
                <CardDescription>
                  The heading and layout of your public team page.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="pg-title">Page title</Label>
                  <Input
                    id="pg-title"
                    value={pageForm.title}
                    onChange={(e) =>
                      setPageForm({ ...pageForm, title: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="pg-intro">Intro text</Label>
                  <Textarea
                    id="pg-intro"
                    rows={3}
                    value={pageForm.intro}
                    onChange={(e) =>
                      setPageForm({ ...pageForm, intro: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Layout</Label>
                  <Select
                    value={pageForm.layout}
                    onValueChange={(v) =>
                      setPageForm({ ...pageForm, layout: v as string })
                    }
                    items={[
                      { value: "grid-3", label: "Grid, 3 columns" },
                      { value: "grid-4", label: "Grid, 4 columns" },
                      { value: "list", label: "List" },
                    ]}
                  >
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid-3">Grid, 3 columns</SelectItem>
                      <SelectItem value="grid-4">Grid, 4 columns</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                  <div>
                    <Label htmlFor="pg-dept">Show department labels</Label>
                    <p className="text-xs text-muted-foreground">
                      Display each person’s department under their name.
                    </p>
                  </div>
                  <Switch
                    id="pg-dept"
                    checked={pageForm.showDept}
                    onCheckedChange={(v) =>
                      setPageForm({ ...pageForm, showDept: v })
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="min-w-32">
                    {saved ? (
                      <>
                        <Check /> Saved
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Add / edit member */}
      <Sheet open={!!sheet} onOpenChange={(v) => !v && setSheet(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <form onSubmit={save} noValidate className="flex min-h-full flex-col">
            <SheetHeader>
              <SheetTitle>
                {sheet?.id ? "Edit team member" : "Add team member"}
              </SheetTitle>
              <SheetDescription>
                Details shown on your public team page.
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 px-4">
              {/* live preview */}
              <div
                className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3"
                aria-label="Preview"
              >
                <Portrait m={form} className="size-12 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {form.name.trim() || "Full name"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {form.title.trim() || "Job title"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>
                  Photo{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    pickPhoto(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload /> {form.photo ? "Replace photo" : "Upload photo"}
                  </Button>
                  {form.photo && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setForm({ ...form, photo: undefined })}
                    >
                      <Trash2 /> Remove
                    </Button>
                  )}
                </div>
                {errors.photo ? (
                  <p className="text-xs text-destructive">{errors.photo}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Square images work best. Up to {MAX_MB} MB.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="tm-name">Full name</Label>
                <Input
                  id="tm-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  aria-invalid={!!errors.name}
                  placeholder="Jane Cooper"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="tm-title">Job title</Label>
                <Input
                  id="tm-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  aria-invalid={!!errors.title}
                  placeholder="Head of Design"
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>Department</Label>
                <Select
                  value={form.dept}
                  onValueChange={(v) => setForm({ ...form, dept: v as string })}
                  items={deptItems}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deptItems.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="tm-bio">
                  Short bio{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="tm-bio"
                  rows={3}
                  maxLength={160}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
                <p className="text-right text-xs tabular-nums text-muted-foreground">
                  {form.bio.length}/160
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="tm-li">LinkedIn URL</Label>
                  <Input
                    id="tm-li"
                    type="url"
                    value={form.linkedin}
                    onChange={(e) =>
                      setForm({ ...form, linkedin: e.target.value })
                    }
                    placeholder="https://linkedin.com/in/…"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="tm-x">X URL</Label>
                  <Input
                    id="tm-x"
                    type="url"
                    value={form.x}
                    onChange={(e) => setForm({ ...form, x: e.target.value })}
                    placeholder="https://x.com/…"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div>
                  <Label htmlFor="tm-vis">Show on website</Label>
                  <p className="text-xs text-muted-foreground">
                    Turn off to hide without deleting.
                  </p>
                </div>
                <Switch
                  id="tm-vis"
                  checked={form.visible}
                  onCheckedChange={(v) => setForm({ ...form, visible: v })}
                />
              </div>
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
                {sheet?.id ? "Save changes" : "Add member"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this team member?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.name} will be removed from your team page. If you only
              want to hide them, use the Visible switch instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep member</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setMembers((l) => l.filter((m) => m.id !== toDelete?.id));
                setToDelete(null);
              }}
            >
              Delete member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
