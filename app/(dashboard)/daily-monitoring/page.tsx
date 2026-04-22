"use client";

import { useEffect, useState } from "react";
import { 
  RefreshCcw,
  Clock,
  Smartphone,
  Laptop
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

  return (
    <div className="space-y-4 page-fade-in pb-10">
      <PageHeader
        title="Daily Monitoring"
        subtitle="Real-time status of daily student device activity."
      />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-gray-500">Live Status Active</span>
        </div>
        <Button
          onClick={fetchLogs}
          variant="ghost"
          loading={loading}
          size="sm"
          className="bg-gray-50 border border-gray-100"
          leftIcon={<RefreshCcw size={14} />}
        >
          Refresh Sync
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight">Student</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight">Device</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight text-center">Check-Out</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight text-center">Check-In</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-sans">
              {loading && logs.length === 0 ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4"><div className="h-5 bg-gray-50 rounded" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400 italic">No activity detected for today.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800 leading-none mb-1">{log.student.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">{log.student.class}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {log.device.type === "LAPTOP" ? <Laptop size={14} className="text-gray-400" /> : <Smartphone size={14} className="text-gray-400" />}
                        <span className="text-xs font-medium text-gray-600">{log.device.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-[11px] text-gray-500">
                      {log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-[11px] text-gray-500">
                      {log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "PENDING"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <StatusBadge status={log.dailyStatus} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
