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
import { PageContainer } from "@/components/ui/page-container";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";

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
    { name: "Total Perangkat", value: stats?.totalDevices || 0, icon: Laptop, color: "text-gray-400" },
    { name: "Unit Masuk", value: stats?.availableDevices || 0, icon: CheckCircle, color: "text-green-600" },
    { name: "Unit Keluar", value: stats?.borrowedDevices || 0, icon: Clock, color: "text-primary" },
    { name: "Terlambat Kembali", value: stats?.overdueDevices || 0, icon: AlertTriangle, color: "text-amber-500" },
    { name: "Total Siswa", value: stats?.totalStudents || 0, icon: Users, color: "text-gray-400" },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Beranda Operasional"
        subtitle="Metrik operasional untuk inventaris dan aktivitas siswa."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <StatCard 
            key={card.name} 
            label={card.name} 
            value={loading ? "..." : card.value} 
            icon={card.icon} 
            iconColorClass={card.color} 
            className="min-w-0" 
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Akses Cepat</h2>
          <div className="space-y-2">
            {[
              { label: "Konter Keluar / Masuk", href: "/attendance", icon: Activity },
              { label: "Monitoring Harian", href: "/daily-monitoring", icon: ClipboardList },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-primary-light hover:border-indigo-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <link.icon size={18} className="text-gray-400 group-hover:text-primary" />
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-dark">{link.label}</span>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-indigo-400" />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-gray-50 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Pemberitahuan Sistem</h2>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Pastikan semua pengembalian perangkat diverifikasi dan dicatat sebelum shift berakhir pada pukul 17:00 WIB. Ketidaksesuaian data harus segera dilaporkan.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DMS Node v2.0.4</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-green-600 uppercase">Sistem Online</span>
              <span className="h-2 w-2 rounded-full bg-green-600" />
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
