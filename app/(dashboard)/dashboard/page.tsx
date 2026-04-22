"use client";

import { useEffect, useState } from "react";
import { 
  Smartphone, 
  Users, 
  CheckCircle2,
  Clock, 
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ArrowRightLeft
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

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
    {
      name: "Total Perangkat",
      value: stats?.totalDevices || 0,
      icon: Smartphone,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      name: "Tersedia",
      value: stats?.availableDevices || 0,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      name: "Dipakai",
      value: stats?.borrowedDevices || 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      name: "Total Siswa",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      name: "Terlambat",
      value: stats?.overdueDevices || 0,
      icon: AlertCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-10 bg-slate-50/30 min-h-screen">
      <PageHeader 
        title="Dashboard"
        subtitle="Pantau kesehatan operasional perangkat DMS hari ini."
        category="Statistik Real-time"
        icon={<TrendingUp size={14} />}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.name}
            className="group relative overflow-hidden rounded-card border border-slate-200 bg-white p-8 transition-all hover:shadow-2xl hover:border-indigo-100 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between relative z-10">
              <div className={cn("rounded-2xl p-4 transition-transform group-hover:scale-110 duration-500", card.bg, card.color)}>
                <card.icon size={28} />
              </div>
            </div>
            <div className="mt-8 relative z-10">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                {card.name}
              </p>
              <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">
                {loading ? (
                  <div className="h-10 w-20 animate-pulse rounded-lg bg-slate-100" />
                ) : (
                  card.value
                )}
              </h3>
            </div>
            <div className="absolute -right-6 -bottom-6 text-slate-100 opacity-20 transition-all group-hover:scale-125 group-hover:text-indigo-100">
              <card.icon size={140} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-container border border-slate-200 bg-white p-10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-2xl font-black tracking-tighter text-slate-900">Aksi Cepat</h3>
             <div className="w-12 h-1 bg-indigo-100 rounded-full" />
          </div>
          
          <div className="grid gap-4">
            <Link 
              href="/attendance"
              className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-6 transition-all hover:bg-indigo-50 hover:border-indigo-100"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                  <ArrowRightLeft size={24} />
                </div>
                <div className="text-left">
                  <p className="text-lg font-black tracking-tight text-slate-800">Check-Out / In</p>
                  <p className="text-xs font-medium text-slate-400">Kelola pengambilan harian siswa</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link 
              href="/daily-monitoring"
              className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-6 transition-all hover:bg-emerald-50 hover:border-emerald-100"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                  <TrendingUp size={24} />
                </div>
                <div className="text-left">
                  <p className="text-lg font-black tracking-tight text-slate-800">Monitoring</p>
                  <p className="text-xs font-medium text-slate-400">Lihat kepatuhan pengembalian</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        <div className="rounded-container border border-slate-200 bg-indigo-600 p-10 text-white shadow-2xl shadow-indigo-200 overflow-hidden relative">
           <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-black tracking-tighter mb-2">Update Harian</h3>
                <p className="text-indigo-200 font-medium">Jangan lupa untuk memastikan semua perangkat kembali sebelum jam 17:00 WIB hari ini.</p>
              </div>
              <Link href="/logs">
                <Button variant="outline" size="lg" rightIcon={<ArrowRight size={16} />} className="bg-white border-none text-indigo-600 hover:bg-indigo-50 mt-8">
                  Lihat Log Riwayat
                </Button>
              </Link>
           </div>
           <Clock size={240} className="absolute -right-20 -bottom-20 text-indigo-500 opacity-30 rotate-12" />
        </div>
      </div>
    </div>
  );
}
