"use client";

import { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCcw,
  Search,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

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
      setError("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ON_TIME": return <CheckCircle2 className="text-green-500" size={20} />;
      case "LATE": return <Clock className="text-amber-500" size={20} />;
      default: return <AlertCircle className="text-red-500" size={20} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ON_TIME": return "On Time";
      case "LATE": return "Returned Late";
      default: return "Not Returned";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Monitoring</h1>
          <p className="text-sm text-muted-foreground">
            Track student device activity for today.
          </p>
        </div>
        <button 
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <RefreshCcw size={16} className={cn(loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && logs.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
          ))
        ) : logs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No activity recorded for today.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{log.student.name}</h3>
                    <p className="text-xs text-muted-foreground">{log.student.class}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {getStatusIcon(log.dailyStatus)}
                  <span className="text-[10px] font-bold uppercase mt-1">
                    {getStatusLabel(log.dailyStatus)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">{log.device.name}</span>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>OUT: {log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</span>
                  <span>IN: {log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
