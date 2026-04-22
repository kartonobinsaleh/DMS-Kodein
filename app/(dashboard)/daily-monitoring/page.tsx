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
    <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Aktivitas Harian"
        subtitle="Memantau status pengambilan dan pengembalian perangkat hari ini."
        category="Sistem Monitoring"
        icon={<LayoutGrid size={14} />}
        action={
          <Button
            onClick={fetchLogs}
            variant="outline"
            loading={loading}
            leftIcon={<RefreshCcw size={16} />}
          >
            Perbarui Data
          </Button>
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && logs.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-white border border-slate-100 animate-pulse rounded-card" />
          ))
        ) : logs.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-card">
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
