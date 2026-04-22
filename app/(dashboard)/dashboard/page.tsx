"use client";

import { useEffect, useState } from "react";
import { 
  Smartphone, 
  Users, 
  CheckCircle2,
  Clock, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
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
    { name: "Total Inventory", value: stats?.totalDevices || 0, icon: Smartphone, color: "text-gray-400" },
    { name: "Available Assets", value: stats?.availableDevices || 0, icon: CheckCircle2, color: "text-green-600" },
    { name: "Currently In-Use", value: stats?.borrowedDevices || 0, icon: Clock, color: "text-indigo-600" },
    { name: "Overdue Items", value: stats?.overdueDevices || 0, icon: AlertCircle, color: "text-red-600" },
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
          <div key={card.name} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-tight">{card.name}</span>
              <card.icon size={16} className={card.color} />
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {loading ? "..." : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-medium text-gray-600 mb-4">Operational Shortcuts</h2>
          <div className="space-y-2">
            {[
              { label: "Asset Attendance", href: "/attendance", icon: Activity },
              { label: "Live Monitoring", href: "/daily-monitoring", icon: ShieldCheck },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-50 bg-gray-50/50 hover:bg-gray-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <link.icon size={16} className="text-gray-400 group-hover:text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">{link.label}</span>
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500" />
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-600 mb-2">Security Note</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Ensure all device check-ins are verified and logged before the shift ends at 17:00 WIB. Discrepancies must be reported to the supervisor.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">System Version 2.0.4</span>
            <span className="h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
