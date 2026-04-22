"use client";

import { useEffect, useState } from "react";
import { 
  RefreshCcw,
  LayoutGrid,
} from "lucide-react";
import { DeviceCard } from "@/components/ui/device-card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

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
      setError("Gagal mengambil data monitoring");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-12 page-fade-in pb-32">
      <PageHeader
        title="Status Siswa"
        subtitle="Pantau status harian pengambilan dan pengembalian perangkat."
      />

      <div className="flex justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aktif Hari Ini</span>
        </div>
        <Button
          onClick={fetchLogs}
          variant="outline"
          loading={loading}
          size="sm"
          leftIcon={<RefreshCcw size={16} />}
          className="border-slate-200"
        >
          Perbarui
        </Button>
      </div>

      {error && (
        <div className="p-5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading && logs.length === 0 ? (
          Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-44 bg-white border border-slate-50 animate-pulse rounded-card" />
          ))
        ) : logs.length === 0 ? (
          <div className="col-span-full py-40 flex flex-col items-center justify-center text-slate-100 bg-white border border-slate-100 rounded-container">
            <LayoutGrid size={64} className="mb-4 opacity-50" />
            <p className="font-bold uppercase tracking-widest text-xs text-slate-300">Belum ada aktivitas hari ini</p>
          </div>
        ) : (
          logs.map((log) => (
            <DeviceCard
              key={log.id}
              studentName={log.student.name}
              studentClass={log.student.class}
              deviceName={log.device.name}
              deviceType={log.device.type}
              status={log.dailyStatus}
              checkOutTime={log.checkOutTime}
              checkInTime={log.checkInTime}
            />
          ))
        )}
      </div>
    </div>
  );
}
