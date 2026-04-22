"use client";

import { useEffect, useState } from "react";
import { 
  RefreshCcw,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DeviceCard } from "@/components/ui/device-card";

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
    <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-[10px]">
            <LayoutGrid size={14} />
            <span>Sistem Monitoring</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">
            Aktivitas Harian
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Memantau status pengambilan dan pengembalian perangkat hari ini.
          </p>
        </div>
        <button 
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-sm font-bold shadow-sm"
        >
          <RefreshCcw size={16} className={cn(loading && "animate-spin")} />
          Perbarui Data
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && logs.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-white border border-slate-100 animate-pulse rounded-2xl" />
          ))
        ) : logs.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-[2rem]">
            <LayoutGrid size={48} className="opacity-10 mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">Belum ada aktivitas terekam hari ini</p>
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
