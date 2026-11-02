"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Plus,
  TriangleAlert,
} from "lucide-react";
import { motion, type Variants } from "motion/react";
import Link from "next/link";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ----------------------------- dummy data ----------------------------- */

const kpis = [
  {
    label: "Total revenue",
    value: "$84,230",
    delta: 12.4,
    note: "vs. last 30 days",
  },
  { label: "Orders", value: "1,284", delta: 8.1, note: "vs. last 30 days" },
  {
    label: "New customers",
    value: "436",
    delta: -2.3,
    note: "vs. last 30 days",
  },
  {
    label: "Conversion rate",
    value: "3.42%",
    delta: 0.6,
    note: "vs. last 30 days",
  },
];

const days = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date(2026, 9, 29 - (n - 1 - i));
    const wave = Math.sin(i / 2.2) * 900 + Math.cos(i / 5) * 600;
    const revenue = Math.round(
      2600 + i * (n > 20 ? 38 : 70) + wave + (i % 3) * 140,
    );
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue,
      orders: Math.round(revenue / 66),
    };
  });

const series = { "7d": days(7), "30d": days(30), "90d": days(90) } as const;

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  orders: { label: "Orders", color: "var(--chart-2)" },
} satisfies ChartConfig;

const orders = [
  {
    id: "#10482",
    customer: "Amelia Brooks",
    item: "Merino crew sweater",
    total: 128,
    status: "Delivered",
  },
  {
    id: "#10481",
    customer: "Noah Fischer",
    item: "Trail running shoes",
    total: 164.5,
    status: "Shipped",
  },
  {
    id: "#10480",
    customer: "Sofia Romero",
    item: "Ceramic pour-over set",
    total: 72,
    status: "Processing",
  },
  {
    id: "#10479",
    customer: "Liam Carter",
    item: "Wireless earbuds Pro",
    total: 189,
    status: "Delivered",
  },
  {
    id: "#10478",
    customer: "Maya Patel",
    item: "Canvas weekender bag",
    total: 98.9,
    status: "Refunded",
  },
  {
    id: "#10477",
    customer: "Ethan Walsh",
    item: "Linen duvet cover",
    total: 142,
    status: "Shipped",
  },
];

const statusStyle: Record<string, string> = {
  Delivered: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Shipped: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Processing: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Refunded: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

const topProducts = [
  { name: "Wireless earbuds Pro", sold: 412, revenue: 77868 },
  { name: "Merino crew sweater", sold: 356, revenue: 45568 },
  { name: "Trail running shoes", sold: 289, revenue: 47530 },
  { name: "Ceramic pour-over set", sold: 241, revenue: 17352 },
];

const channels = [
  { name: "Organic search", share: 38 },
  { name: "Direct", share: 27 },
  { name: "Email campaigns", share: 19 },
  { name: "Social", share: 11 },
  { name: "Referral", share: 5 },
];

const lowStock = [
  { name: "Canvas weekender bag", left: 6, of: 60 },
  { name: "Linen duvet cover (Queen)", left: 9, of: 80 },
  { name: "Trail running shoes, size 10", left: 12, of: 90 },
];

const money = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 ? 2 : 0,
  });

/* ------------------------------ motion ------------------------------- */

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function Delta({ value }: { value: number }) {
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium tabular-nums ${
        up
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400"
      }`}
    >
      <Icon className="size-3.5" aria-hidden />
      {Math.abs(value)}%
    </span>
  );
}

/* ------------------------------- page -------------------------------- */

export default function DashboardPage() {
  const [range, setRange] = React.useState<keyof typeof series>("30d");
  const [metric, setMetric] = React.useState<"revenue" | "orders">("revenue");
  const data = series[range];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full flex-col gap-6 p-4 md:p-6"
    >
      {/* Header */}
      <motion.div
        variants={item}
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Here is how your store performed over the last 30 days.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download /> Export
          </Button>
          {/* Base UI: use `render` instead of Radix `asChild` */}
          <Button
            render={<Link href="/dashboard/products/new" />}
            nativeButton={false}
          >
            <Plus /> Add product
          </Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div
        variants={item}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {kpis.map((k) => (
          <Card key={k.label} size="sm">
            <CardHeader>
              <CardDescription>{k.label}</CardDescription>
              <CardAction>
                <Delta value={k.delta} />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight tabular-nums">
                {k.value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{k.note}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Chart + channels */}
      <motion.div variants={item} className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales overview</CardTitle>
            <CardDescription>
              {metric === "revenue" ? "Daily revenue" : "Daily orders"},{" "}
              {range === "7d"
                ? "last 7 days"
                : range === "30d"
                  ? "last 30 days"
                  : "last 90 days"}
            </CardDescription>
            <CardAction className="flex items-center gap-2">
              <Tabs
                value={metric}
                onValueChange={(v) => setMetric(v as typeof metric)}
              >
                <TabsList>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                </TabsList>
              </Tabs>
              <Tabs
                value={range}
                onValueChange={(v) => setRange(v as typeof range)}
              >
                <TabsList>
                  <TabsTrigger value="7d">7D</TabsTrigger>
                  <TabsTrigger value="30d">30D</TabsTrigger>
                  <TabsTrigger value="90d">90D</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-72 w-full"
            >
              <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={`var(--color-${metric})`}
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="100%"
                      stopColor={`var(--color-${metric})`}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                />
                <YAxis
                  width={48}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    metric === "revenue" ? `$${v / 1000}k` : String(v)
                  }
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  key={`${metric}-${range}`}
                  dataKey={metric}
                  type="monotone"
                  stroke={`var(--color-${metric})`}
                  strokeWidth={2}
                  fill="url(#fill)"
                  animationDuration={600}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic sources</CardTitle>
            <CardDescription>
              Share of sessions that led to an order
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {channels.map((c, i) => (
              <div key={c.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{c.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {c.share}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.share / 38) * 100}%` }}
                    transition={{
                      duration: 0.7,
                      delay: 0.3 + i * 0.07,
                      ease: "easeOut",
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders + side lists */}
      <motion.div variants={item} className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>
              The latest purchases across all channels
            </CardDescription>
            <CardAction>
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/dashboard/orders" />}
                nativeButton={false}
              >
                View all
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Product
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium tabular-nums">
                      {o.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7">
                          <AvatarFallback className="text-xs">
                            {o.customer
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="whitespace-nowrap">{o.customer}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {o.item}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusStyle[o.status]}
                      >
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {money(o.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Best sellers</CardTitle>
              <CardDescription>By revenue this month</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3.5">
              {topProducts.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {p.sold} sold
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums">
                    {money(p.revenue)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TriangleAlert className="size-4 text-amber-500" aria-hidden />
                Low stock
              </CardTitle>
              <CardDescription>
                Restock these before they sell out
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {lowStock.map((s) => (
                <div key={s.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{s.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {s.left} left
                    </span>
                  </div>
                  <Progress value={(s.left / s.of) * 100} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
