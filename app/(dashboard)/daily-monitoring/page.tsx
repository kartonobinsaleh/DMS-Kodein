"use client";

import { useEffect, useState } from "react";
import { 
  RefreshCcw,
  Clock,
  Smartphone,
  Laptop,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
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
    <div className="space-y-4 page-fade-in pb-20">
      <PageHeader
        title="Daily Monitoring"
        subtitle="Real-time status of daily student device activity."
      />

      {/* Summary Strip - Mobile Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { label: "Total", value: stats.total, icon: Activity, color: "text-gray-400" },
          { label: "On Time", value: stats.onTime, icon: CheckCircle, color: "text-green-600" },
          { label: "Late", value: stats.late, icon: AlertTriangle, color: "text-amber-500" },
          { label: "Missing", value: stats.missing, icon: XCircle, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="flex-shrink-0 bg-white border border-gray-200 rounded-xl p-3 min-w-[110px] shadow-sm">
            <div className="flex items-center justify-between mb-1">
               <s.icon size={14} className={s.color} />
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Live Active Operations</span>
        </div>
        <Button
          onClick={fetchLogs}
          variant="ghost"
          loading={loading}
          size="sm"
          className="bg-gray-50"
          leftIcon={<RefreshCcw size={14} />}
        >
          Sync
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-tight">
          {error}
        </div>
      )}

      {/* Main List - Mobile Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && logs.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse bg-gray-100 rounded-xl border border-gray-200" />
          ))
        ) : logs.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-gray-200">
             <Clock size={32} className="mx-auto mb-2 text-gray-200" />
             <p className="text-xs font-medium text-gray-400 italic">No activity detected for today.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between hover:border-indigo-200 transition-colors group">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors">{log.student.name}</h3>
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
                  <span className="text-gray-300 uppercase font-bold tracking-tighter">Check-Out</span>
                  <span className="text-gray-600 font-bold">{log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-gray-300 uppercase font-bold tracking-tighter">Check-In</span>
                  <span className={log.checkInTime ? "text-indigo-600 font-bold" : "text-amber-500 font-bold"}>
                    {log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "PENDING"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
