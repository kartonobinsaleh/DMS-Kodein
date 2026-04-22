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
    <div className="space-y-12 page-fade-in pb-32">
      <PageHeader 
        title="Ringkasan Hari Ini"
        subtitle="Pantau ketersediaan dan status pengambilan perangkat siswa."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.name}
            className="flex flex-col rounded-card bg-white border border-slate-100 p-6 shadow-card hover:border-indigo-100 transition-all"
          >
            <div className={cn("inline-flex w-fit rounded-xl p-3 mb-4", card.bg, card.color)}>
              <card.icon size={22} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {card.name}
            </p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">
              {loading ? "..." : card.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight ml-1">Menu Cepat</h3>
          
          <div className="grid gap-4">
            <Link href="/attendance">
              <div className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 hover:bg-slate-50 transition-all shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="rounded-2xl bg-indigo-600 p-4 text-white shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
                    <ArrowRightLeft size={20} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">Check In / Out</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Kelola pengambilan harian siswa</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/daily-monitoring">
              <div className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 hover:bg-slate-50 transition-all shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="rounded-2xl bg-emerald-600 p-4 text-white shadow-lg shadow-emerald-100 group-hover:scale-105 transition-transform">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">Status Siswa</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Lihat kepatuhan pengembalian hari ini</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        <section className="bg-indigo-600 rounded-container p-10 text-white relative overflow-hidden flex flex-col justify-center">
            <div className="relative z-10 space-y-6">
              <div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">Ingatkan Orang Tua</h3>
                <p className="text-indigo-100 text-sm max-w-[280px] leading-relaxed">
                  Pastikan semua perangkat kembali sebelum jam 17:00 WIB untuk menghindari status terlambat.
                </p>
              </div>
              <Link href="/logs">
                <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2.5 rounded-xl text-sm font-bold transition-all inline-flex items-center gap-2">
                  Lihat Riwayat <ArrowRight size={16} />
                </button>
              </Link>
            </div>
            <Clock size={180} className="absolute -right-10 -bottom-10 text-white/10 rotate-12" />
        </section>
      </div>
    </div>
  );
}
