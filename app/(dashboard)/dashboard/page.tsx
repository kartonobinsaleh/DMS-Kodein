"use client";

import { useEffect, useState } from "react";
import { 
  Laptop, 
  Users, 
  CheckCircle,
  Clock, 
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Activity
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";

interface Stats {
  totalDevices: number;
  availableDevices: number;
  borrowedDevices: number;
  activeTransactions: number;
  overdueDevices: number;
  totalStudents: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  const cards = [
    { name: "Total Inventory", value: stats?.totalDevices || 0, icon: Laptop, color: "text-gray-400" },
    { name: "Available Assets", value: stats?.availableDevices || 0, icon: CheckCircle, color: "text-green-600" },
    { name: "Currently In-Use", value: stats?.borrowedDevices || 0, icon: Clock, color: "text-indigo-600" },
    { name: "Overdue Items", value: stats?.overdueDevices || 0, icon: AlertTriangle, color: "text-amber-500" },
    { name: "Total Students", value: stats?.totalStudents || 0, icon: Users, color: "text-gray-400" },
  ];

  return (
    <div className="space-y-4 page-fade-in">
      <PageHeader 
        title="Dashboard Overview"
        subtitle="Operational metrics for inventory and student activity."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.name} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-tight">{card.name}</span>
              <card.icon size={18} className={card.color} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "..." : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Operational Shortcuts</h2>
          <div className="space-y-2">
            {[
              { label: "Check-In / Out Counter", href: "/attendance", icon: Activity },
              { label: "Daily Monitoring", href: "/daily-monitoring", icon: ClipboardList },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <link.icon size={18} className="text-gray-400 group-hover:text-indigo-600" />
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-700">{link.label}</span>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-indigo-400" />
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">System Notice</h2>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Ensure all device check-ins are verified and logged before the shift ends at 17:00 WIB. Discrepancies must be reported to the supervisor immediately.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DMS Node v2.0.4</span>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-green-600 uppercase">System Online</span>
               <span className="h-2 w-2 rounded-full bg-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
