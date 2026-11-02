"use client";

import {
  ArrowLeft,
  Check,
  ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* ----------------------------- dummy data ----------------------------- */

const parents = [
  { value: "none", label: "No parent (top level)" },
  { value: "Clothing", label: "Clothing" },
  { value: "Electronics", label: "Electronics" },
  { value: "Home & living", label: "Home & living" },
  { value: "Shoes", label: "Shoes" },
];

const MAX_IMAGE_MB = 2;
const STORE_URL = "yourstore.com/categories";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/* ------------------------------- page -------------------------------- */

export default function NewCategoryPage() {
  const reduce = useReducedMotion();
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [description, setDescription] = React.useState("");
  const [parent, setParent] = React.useState("none");
  const [visible, setVisible] = React.useState(true);
  const [metaTitle, setMetaTitle] = React.useState("");
  const [metaDesc, setMetaDesc] = React.useState("");

  const [image, setImage] = React.useState<{
    url: string;
    name: string;
    size: number;
  } | null>(null);
  const [imageError, setImageError] = React.useState("");
  const [dragging, setDragging] = React.useState(false);

  const [previewTab, setPreviewTab] = React.useState<"store" | "search">(
    "store",
  );
  const [touched, setTouched] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "saving" | "saved">(
    "idle",
  );

  const nameError = touched && !name.trim() ? "Enter a category name." : "";

  // revoke object URL when it changes or on unmount
  React.useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image.url);
    };
  }, [image]);

  function onNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function pickFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Upload a PNG, JPG, WebP or SVG image.");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setImageError(`Image is too large. Keep it under ${MAX_IMAGE_MB} MB.`);
      return;
    }
    setImageError("");
    setImage({
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!name.trim()) return;
    setStatus("saving");
    // replace with your real API call / server action
    await new Promise((r) => setTimeout(r, 900));
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2200);
  }

  const finalSlug = slug || "category-name";
  const searchTitle =
    metaTitle || (name ? `${name} | Your Store` : "Category name | Your Store");
  const searchDesc =
    metaDesc ||
    description ||
    "Your category description will appear here for search engines.";

  return (
    <motion.form
      onSubmit={onSubmit}
      noValidate
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto flex w-full  flex-col gap-6 p-4 md:p-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Back to categories"
            render={<Link href="/dashboard/categories" />}
            nativeButton={false}
          >
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              New category
            </h1>
            <p className="text-sm text-muted-foreground">
              Group products so customers can find them faster.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            render={<Link href="/dashboard/categories" />}
            nativeButton={false}
          >
            Discard
          </Button>
          <Button
            type="submit"
            disabled={status === "saving"}
            className="min-w-36"
          >
            {status === "saving" ? (
              <>
                <Loader2 className="animate-spin" /> Saving
              </>
            ) : status === "saved" ? (
              <>
                <Check /> Category saved
              </>
            ) : (
              "Save category"
            )}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ------------------------- form column ------------------------- */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>
                The name and description customers see.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="e.g. Running shoes"
                  aria-invalid={!!nameError}
                  aria-describedby={nameError ? "name-error" : undefined}
                />
                {nameError && (
                  <p id="name-error" className="text-xs text-destructive">
                    {nameError}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="slug">URL slug</Label>
                <div className="flex items-center rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring/50">
                  <span className="border-r bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                    /categories/
                  </span>
                  <input
                    id="slug"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(slugify(e.target.value));
                    }}
                    placeholder="running-shoes"
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Created from the name. You can edit it.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">
                  Description{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={240}
                  placeholder="Describe what customers will find in this category."
                />
                <p className="text-right text-xs tabular-nums text-muted-foreground">
                  {description.length}/240
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image</CardTitle>
              <CardDescription>
                Optional. Shown on the storefront and in menus. Without one, we
                show a clean placeholder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="sr-only"
                onChange={(e) => {
                  pickFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />

              <AnimatePresence mode="wait" initial={false}>
                {image ? (
                  <motion.div
                    key="has-image"
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-4 rounded-lg border p-3"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt=""
                      className="size-20 rounded-md border object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {image.name}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {(image.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileRef.current?.click()}
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove image"
                      onClick={() => setImage(null)}
                    >
                      <Trash2 />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="dropzone"
                    type="button"
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      pickFile(e.dataTransfer.files?.[0]);
                    }}
                    className={cn(
                      "flex w-full flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      dragging
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <UploadCloud className="size-5" aria-hidden />
                    </span>
                    <span className="text-sm font-medium">
                      Drop an image here, or browse
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, WebP or SVG. Up to {MAX_IMAGE_MB} MB. 4:3 works
                      best.
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
              {imageError && (
                <p className="mt-2 text-xs text-destructive">{imageError}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>
                Where this category sits and whether it is live.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label>Parent category</Label>
                <Select
                  value={parent}
                  onValueChange={(v) => setParent(v as string)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a parent" />
                  </SelectTrigger>
                  <SelectContent>
                    {parents.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div>
                  <Label htmlFor="visible">Visible in store</Label>
                  <p className="text-xs text-muted-foreground">
                    Turn off to keep this category hidden while you add
                    products.
                  </p>
                </div>
                <Switch
                  id="visible"
                  checked={visible}
                  onCheckedChange={setVisible}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search appearance</CardTitle>
              <CardDescription>
                Optional. Leave blank to use the name and description.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="meta-title">Page title</Label>
                <Input
                  id="meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  maxLength={70}
                  placeholder={
                    name ? `${name} | Your Store` : "Category name | Your Store"
                  }
                />
                <p className="text-right text-xs tabular-nums text-muted-foreground">
                  {metaTitle.length}/70
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="meta-desc">Meta description</Label>
                <Textarea
                  id="meta-desc"
                  rows={3}
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  maxLength={160}
                />
                <p className="text-right text-xs tabular-nums text-muted-foreground">
                  {metaDesc.length}/160
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ------------------------ preview column ----------------------- */}
        <aside
          className="flex flex-col gap-4 lg:sticky lg:top-6"
          aria-label="Live preview"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Live preview</h2>
            <Tabs
              value={previewTab}
              onValueChange={(v) => setPreviewTab(v as typeof previewTab)}
            >
              <TabsList>
                <TabsTrigger value="store">Storefront</TabsTrigger>
                <TabsTrigger value="search">Search</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {previewTab === "store" ? (
              <motion.div
                key="store"
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <Card className="overflow-hidden p-0">
                  <div className="relative aspect-4/3 bg-muted">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.url}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center gap-2 bg-linear-to-br from-muted to-muted/40 text-muted-foreground">
                        <span className="text-5xl font-semibold tracking-tight text-foreground/15">
                          {name.trim() ? (
                            name.trim()[0].toUpperCase()
                          ) : (
                            <ImageIcon className="size-10" aria-hidden />
                          )}
                        </span>
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                    {!visible && (
                      <Badge
                        variant="secondary"
                        className="absolute left-3 top-3 bg-background/90"
                      >
                        Hidden
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 p-4">
                    {parent !== "none" && (
                      <p className="text-xs text-muted-foreground">{parent}</p>
                    )}
                    <h3 className="text-lg font-semibold leading-tight tracking-tight">
                      {name.trim() || "Category name"}
                    </h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {description.trim() ||
                        "Your category description will appear here."}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      0 products
                    </p>
                  </div>
                </Card>
                <p className="mt-3 text-xs text-muted-foreground">
                  This is how the category tile looks on your storefront.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="search"
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <Card>
                  <CardContent className="flex flex-col gap-1">
                    <p className="truncate text-xs text-muted-foreground">
                      {STORE_URL}/{finalSlug}
                    </p>
                    <p className="line-clamp-1 text-lg text-blue-700 dark:text-blue-400">
                      {searchTitle}
                    </p>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {searchDesc}
                    </p>
                  </CardContent>
                </Card>
                <p className="mt-3 text-xs text-muted-foreground">
                  A sample of how this category may appear in search results.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </motion.form>
  );
}
