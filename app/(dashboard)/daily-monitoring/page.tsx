"use client";

import { useEffect, useState } from "react";
import { 
  RefreshCcw,
  Clock,
  Smartphone,
  Laptop,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { Card } from "@/components/ui/card";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface DailyLog {
  id: string;
  date: string;
  checkOutTime: string | null;
  checkInTime: string | null;
  dailyStatus: "ON_TIME" | "LATE" | "NOT_RETURNED";
  student: {
    name: string;
    class: string;
  };
  device: {
    name: string;
    type: string;
  };
}

export default function DailyMonitoringPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/daily-logs");
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError("Sync failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const stats = {
    total: logs.length,
    onTime: logs.filter(l => l.dailyStatus === "ON_TIME").length,
    late: logs.filter(l => l.dailyStatus === "LATE").length,
    missing: logs.filter(l => l.dailyStatus === "NOT_RETURNED").length,
  };

  return (
    <PageContainer>
      <PageHeader
        title="Monitoring Harian"
        subtitle="Status aktivitas harian perangkat siswa secara real-time."
      />

      {/* Summary Strip - Mobile Horizontal Scroll */}
      <SummaryStrip>
        {[
          { label: "Total Unit", value: stats.total, icon: Laptop, color: "text-gray-400" },
          { label: "Tepat Waktu", value: stats.onTime, icon: CheckCircle, color: "text-green-600" },
          { label: "Terlambat", value: stats.late, icon: AlertTriangle, color: "text-amber-500" },
          { label: "Belum Kembali", value: stats.missing, icon: XCircle, color: "text-red-600" },
        ].map((s) => (
          loading && logs.length === 0 ? (
            <div key={s.label} className="min-w-[140px] flex-1 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-2">
               <Skeleton className="h-3 w-16" />
               <Skeleton className="h-6 w-10" />
            </div>
          ) : (
            <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} iconColorClass={s.color} />
          )
        ))}
      </SummaryStrip>

      <Card className="p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Operasional Sedang Berjalan</span>
        </div>
        <Button
          onClick={fetchLogs}
          variant="ghost"
          loading={loading}
          size="sm"
          className="bg-gray-50"
          leftIcon={<RefreshCcw size={14} />}
        >
          Perbarui
        </Button>
      </Card>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-tight">
          {error}
        </div>
      )}

      {/* Main List - Mobile Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && logs.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-4">
               <div className="flex justify-between items-start">
                 <div className="space-y-2">
                   <Skeleton className="h-4 w-32" />
                   <Skeleton className="h-3 w-20" />
                 </div>
                 <Skeleton className="h-5 w-16 rounded-full" />
               </div>
               <div className="py-3 border-y border-gray-50 flex items-center gap-2">
                 <Skeleton className="h-4 w-4 rounded" />
                 <Skeleton className="h-3 w-24" />
               </div>
               <div className="flex justify-between">
                 <Skeleton className="h-3 w-10" />
                 <Skeleton className="h-3 w-10" />
               </div>
            </Card>
          ))
        ) : logs.length === 0 ? (
          <EmptyState 
            icon={Clock}
            title="Belum ada aktivitas"
            description="Aktivitas harian perangkat akan muncul di sini."
          />
        ) : (
          logs.map((log) => (
            <Card key={log.id} className="p-4 flex flex-col justify-between hover:border-indigo-200 transition-colors group">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-none mb-1 group-hover:text-primary transition-colors">{log.student.name}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{log.student.class}</p>
                </div>
                <StatusBadge status={log.dailyStatus} className="scale-90 origin-right" />
              </div>

              <div className="space-y-2 py-3 border-y border-gray-50 my-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {log.device.type === "LAPTOP" ? <Laptop size={14} className="text-gray-400" /> : <Smartphone size={14} className="text-gray-400" />}
                    <span className="text-xs font-semibold text-gray-600">{log.device.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">#{log.id.slice(-4).toUpperCase()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1 font-mono text-[10px]">
                <div className="flex flex-col">
                  <span className="text-gray-300 uppercase font-bold tracking-tighter">Keluar</span>
                  <span className="text-gray-600 font-bold">{log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : "--:--"}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-gray-300 uppercase font-bold tracking-tighter">Kembali</span>
                  <span className={log.checkInTime ? "text-primary font-bold" : "text-amber-500 font-bold"}>
                    {log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : "BELUM KEMBALI"}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </PageContainer>
  );
}
