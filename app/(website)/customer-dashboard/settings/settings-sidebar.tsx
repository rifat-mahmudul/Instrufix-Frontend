"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Shield, Bell, Settings } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function SettingsSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const session = useSession();
  const role = session?.data?.user?.userType;

  const links = [
    {
      href: "/customer-dashboard/settings/account",
      label: "Account settings",
      description: "Edit your account info here",
      icon: User,
    },
    {
      href: "/customer-dashboard/settings/security",
      label: "Security",
      description: "Manage your security settings",
      icon: Shield,
    },
    {
      href: `${
        role === "user"
          ? "/customer-dashboard/settings/notifications"
          : role === "businessMan"
          ? "/business-dashboard/settings/notifications"
          : "/admin-dashboard/settings/notifications"
      }`,
      label: "Notifications",
      description: "Manage your notification settings",
      icon: Bell,
    },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="absolute top-[152px] left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-muted sm:hidden"
        onClick={() => setOpen(!open)}
      >
        <Settings className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-80 bg-background p-4 transition-transform duration-300 ease-in-out sm:relative sm:translate-x-0 sm:w-full sm:p-0",
          open ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        )}
      >
        <div className="space-y-3">
          {links.map(({ href, label, description, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)} // Close sidebar on mobile link click
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-muted/50 border border-muted"
                    : "hover:bg-muted/20"
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">{label}</h4>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Overlay when sidebar is open on mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
