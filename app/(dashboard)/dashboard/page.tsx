"use client";

import { useEffect, useState } from "react";
import { 
  Smartphone, 
  Users, 
  ArrowRightLeft, 
  Clock, 
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  totalDevices: number;
  availableDevices: number;
  borrowedDevices: number;
  activeTransactions: number;
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
      name: "Total Devices",
      value: stats?.totalDevices || 0,
      icon: Smartphone,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      name: "Available Now",
      value: stats?.availableDevices || 0,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      name: "In Use",
      value: stats?.borrowedDevices || 0,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      name: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      name: "Overdue",
      value: stats?.overdueDevices || 0,
      icon: AlertCircle,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your hardware today.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.name}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className={cn("rounded-lg p-2.5", card.bg, card.color)}>
                <card.icon size={24} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">
                {card.name}
              </p>
              <h3 className="text-3xl font-bold">
                {loading ? (
                  <div className="h-9 w-16 animate-pulse rounded bg-muted" />
                ) : (
                  card.value
                )}
              </h3>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] transition-all group-hover:scale-110 group-hover:opacity-[0.05]">
              <card.icon size={120} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <div className="mt-6 grid gap-4">
            <button className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-4 transition-colors hover:bg-muted">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary p-2 text-primary-foreground">
                  <ArrowRightLeft size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Lend a Device</p>
                  <p className="text-xs text-muted-foreground">Assign hardware to a student</p>
                </div>
              </div>
              <ArrowRightLeft size={16} className="text-muted-foreground" />
            </button>
            <button className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-4 transition-colors hover:bg-muted">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500 p-2 text-white">
                  <TrendingUp size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Return Device</p>
                  <p className="text-xs text-muted-foreground">Mark hardware as returned</p>
                </div>
              </div>
              <ArrowRightLeft size={16} className="rotate-180 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
