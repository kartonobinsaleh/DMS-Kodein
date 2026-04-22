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
  { name: "Beranda", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "STAFF"] },
  { name: "Keluar / Masuk", href: "/attendance", icon: Activity, roles: ["ADMIN", "STAFF"] },
  { name: "Monitoring Harian", href: "/daily-monitoring", icon: ShieldAlert, roles: ["ADMIN", "STAFF"] },
  { name: "Data Perangkat", href: "/devices", icon: Smartphone, roles: ["ADMIN", "STAFF"] },
  { name: "Data Siswa", href: "/students", icon: Users, roles: ["ADMIN", "STAFF"] },
  { name: "Riwayat Aktivitas", href: "/logs", icon: History, roles: ["ADMIN", "STAFF"] },
  { name: "Manajemen Staf", href: "/admin/users", icon: Users, roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full w-full flex-col bg-white border-r border-gray-200">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 bg-indigo-600 rounded-lg shadow-sm" />
          <h1 className="text-sm font-bold text-gray-800 tracking-tight">DMS System</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden h-8 w-8 p-0 text-gray-400"
          onClick={() => setIsOpen(false)}
        >
          <X size={18} />
        </Button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          if (item.roles && session?.user?.role && !item.roles.includes(session.user.role)) return null;
          
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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

      <div className="p-4 border-t border-gray-200">
        <div className="mb-4 flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold uppercase">
             {session?.user?.name?.[0] || 'A'}
          </div>
          <p className="text-xs font-semibold text-gray-700 truncate flex-1">{session?.user?.name || "Staf"}</p>
        </div>
        <Button
          onClick={() => setShowLogoutModal(true)}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          leftIcon={<LogOut size={16} />}
        >
          Keluar Aplikasi
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar - Standardized & Integrated */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-gray-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 hover:bg-gray-50 border border-transparent active:border-gray-100"
            onClick={() => setIsOpen(true)}
          >
            <Menu size={20} className="text-gray-600" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-indigo-600 rounded-md shadow-sm" />
            <span className="text-sm font-bold text-gray-800 tracking-tight">DMS System</span>
          </div>
        </div>
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 border border-gray-200">
           {session?.user?.name?.[0] || 'A'}
        </div>
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
        title="Konfirmasi Keluar"
        description="Apakah Anda yakin ingin keluar dari sistem operasional?"
        confirmText="Keluar"
      />
    </>
  );
}
