"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Smartphone,
  Users,
  LogOut,
  ShieldCheck,
  History,
  Activity,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Beranda", href: "/dashboard", icon: LayoutDashboard },
  { name: "Check In / Out", href: "/attendance", icon: Activity },
  { name: "Status Siswa", href: "/daily-monitoring", icon: ShieldCheck },
  { name: "Perangkat", href: "/devices", icon: Smartphone },
  { name: "Data Siswa", href: "/students", icon: Users },
  { name: "Riwayat", href: "/logs", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full w-full flex-col bg-white border-r border-slate-100">
      <div className="p-8 pb-12 flex items-center gap-3">
        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 tracking-tight leading-none text-lg">DMS Kodein</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Management</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "group flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon
                size={20}
                className={cn(isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-50">
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
            {session?.user?.name?.[0].toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">
              {session?.user?.name || "Admin"}
            </p>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Administrator
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowLogoutModal(true)}
          variant="ghost"
          className="w-full justify-start text-rose-500 hover:bg-rose-50 hover:text-rose-600 px-2"
          leftIcon={<LogOut size={18} />}
        >
          Keluar Sistem
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/80 backdrop-blur"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Main Sidebar Desktop */}
      <aside className="hidden lg:flex h-full w-72 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={cn(
        "lg:hidden fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out bg-white",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </div>

      <ConfirmationModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => signOut({ callbackUrl: "/login" })}
        title="Keluar"
        description="Apakah Anda yakin ingin keluar dari sistem manajemen perangkat?"
        confirmText="Keluar Sekarang"
        variant="danger"
      />
    </>
  );
}
