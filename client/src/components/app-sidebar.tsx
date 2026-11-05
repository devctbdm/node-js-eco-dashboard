"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  CircleUserRound,
  GalleryVerticalEndIcon,
  LockKeyhole,
  TerminalSquareIcon,
} from "lucide-react";
import { hasPermission, type AuthenticatedUser } from "@/lib/api";

const data = {
  teams: [
    {
      name: "DevCT Inc",
      logo: <GalleryVerticalEndIcon />,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: <TerminalSquareIcon />,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
          permission: "dashboard.read",
        },
        {
          title: "Products",
          url: "/dashboard/products",
          permission: "products.read",
        },
        {
          title: "Categories",
          url: "/dashboard/categories",
          permission: "products.read",
        },
        {
          title: "Orders",
          url: "/dashboard/orders",
          permission: "orders.read",
        },
      ],
    },
    {
      title: "Users",
      url: "#",
      icon: <CircleUserRound />,
      items: [
        {
          title: "Customers",
          url: "/dashboard/customers",
          permission: "customers.read",
        },
      ],
    },
    {
      title: "Administrator",
      url: "/dashboard/administrator",
      icon: <LockKeyhole />,
      items: [
        {
          title: "Overviews",
          url: "/dashboard/administrator",
          permission: "roles.read",
        },
        {
          title: "Team",
          url: "/dashboard/team",
          permission: "staff.read",
        },
      ],
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: AuthenticatedUser }) {
  const navMain = data.navMain
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        hasPermission(user.permissions, item.permission),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user.fullName || user.email,
            email: user.email,
            avatar: "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
