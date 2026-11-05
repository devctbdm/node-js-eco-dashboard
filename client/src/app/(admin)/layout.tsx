import { AppSidebar } from "@/components/app-sidebar";
import { AdminPermissionGate } from "@/components/admin-permission-gate";
import DynamicBreadcrumb from "@/components/Breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL, hasPermission, type AuthenticatedUser } from "@/lib/api";

export const dynamic = "force-dynamic";

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie");
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: cookie ? { cookie } : undefined,
    cache: "no-store",
  });
  if (response.status === 401 || response.status === 403) {
    redirect("/adminlogin");
  }
  if (!response.ok) {
    throw new Error("Administrator session could not be verified.");
  }
  const user = (await response.json()) as AuthenticatedUser;
  if (!hasPermission(user.permissions, "dashboard.read")) {
    redirect("/adminlogin?forbidden=true");
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <DynamicBreadcrumb />
          </div>
        </header>
        <AdminPermissionGate permissions={user.permissions}>
          {children}
        </AdminPermissionGate>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
