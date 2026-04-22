"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Smartphone,
  Users,
  ArrowRightLeft,
  LogOut,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Attendance", href: "/attendance", icon: Clock },
  { name: "Devices", href: "/devices", icon: Smartphone },
  { name: "Students", href: "/students", icon: Users },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <div className="flex h-full w-64 flex-col border-r border-border bg-card">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary">
            <Monitor size={24} />
            <span>DMS KODEIN</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon
                  size={20}
                  className={cn(isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-4 flex items-center gap-3 px-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              {session?.user?.name?.[0].toUpperCase() || "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate max-w-[120px]">
                {session?.user?.name || "User"}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                {session?.user?.role || "Staff"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => signOut({ callbackUrl: "/login" })}
        title="Sign Out"
        description="Are you sure you want to log out from the system?"
        confirmText="Sign Out"
        variant="danger"
      />
    </>
  );
}
