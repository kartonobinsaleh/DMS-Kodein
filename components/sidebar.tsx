"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Smartphone,
  Users,
  LogOut,
  History,
  Activity,
  Menu,
  X,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Check-In / Out", href: "/attendance", icon: Activity },
  { name: "Daily Monitoring", href: "/daily-monitoring", icon: ShieldAlert },
  { name: "Device Management", href: "/devices", icon: Smartphone },
  { name: "Student Management", href: "/students", icon: Users },
  { name: "Daily Logs", href: "/logs", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full w-full flex-col bg-white border-r border-gray-200">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="h-7 w-7 bg-indigo-600 rounded-lg" />
        <h1 className="text-sm font-bold text-gray-800 tracking-tight">DMS System</h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all rounded-lg",
                isActive
                  ? "bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                size={18}
                className={cn(isActive ? "text-indigo-600" : "text-gray-400")}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="mb-4 flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold uppercase">
             {session?.user?.name?.[0] || 'A'}
          </div>
          <p className="text-xs font-semibold text-gray-700 truncate flex-1">{session?.user?.name || "Staff"}</p>
        </div>
        <Button
          onClick={() => setShowLogoutModal(true)}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          leftIcon={<LogOut size={16} />}
        >
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button
          variant="ghost"
          size="sm"
          className="bg-white/80 backdrop-blur border border-gray-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      <aside className="hidden lg:flex h-full w-56 flex-col shrink-0 overflow-y-auto">
        <SidebarContent />
      </aside>

      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-gray-950/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={cn(
        "lg:hidden fixed inset-y-0 left-0 z-40 w-56 transform transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </div>

      <ConfirmationModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => signOut({ callbackUrl: "/login" })}
        title="Confirm Logout"
        description="Are you sure you want to exit the operational system?"
        confirmText="Logout"
      />
    </>
  );
}
