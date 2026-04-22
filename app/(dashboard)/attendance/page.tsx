"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Smartphone, 
  Laptop, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DailyLog {
  id: string;
  dailyStatus: "PENDING" | "RETURNED_ON_TIME" | "RETURNED_LATE" | "VIOLATION";
  checkOutTime: string | null;
  checkInTime: string | null;
}

interface Device {
  id: string;
  name: string;
  type: "LAPTOP" | "PHONE";
  status: "AVAILABLE" | "BORROWED" | "MAINTENANCE";
  todayLog: DailyLog | null;
}

interface Student {
  id: string;
  name: string;
  class: string;
  devices: Device[];
}

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const res = await fetch("/api/attendance");
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      toast.error("Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.class.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  // Overall Status Logic
  const getOverallStatus = (devices: Device[]) => {
    if (devices.length === 0) return { label: "NO DEVICES", color: "bg-slate-100 text-slate-500", icon: AlertCircle };
    
    const isAnyPending = devices.some(d => d.todayLog?.dailyStatus === "PENDING" || d.status === "BORROWED");
    if (isAnyPending) return { label: "PENDING", color: "bg-amber-100 text-amber-700", icon: Clock };

    const isAnyLate = devices.some(d => d.todayLog?.dailyStatus === "RETURNED_LATE" || d.todayLog?.dailyStatus === "VIOLATION");
    if (isAnyLate) return { label: "RETURNED LATE", color: "bg-rose-100 text-rose-700", icon: AlertCircle };

    const allReturned = devices.every(d => d.todayLog?.dailyStatus === "RETURNED_ON_TIME");
    if (allReturned) return { label: "RETURNED", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 };

    return { label: "NOT STARTED", color: "bg-slate-100 text-slate-500", icon: Clock };
  };

  // Action Handlers
  const handleAction = async (studentId: string, deviceId: string, type: "check-out" | "check-in") => {
    setProcessingId(deviceId);
    try {
      const res = await fetch(`/api/logs/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, deviceId })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Action failed");

      toast.success(`${type === 'check-out' ? 'Check-out' : 'Check-in'} successful!`);
      await fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-lg mb-8" />
        <div className="h-12 w-full bg-muted animate-pulse rounded-xl" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 w-full bg-muted animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (students.length === 0 && !loading && !search) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="p-4 bg-muted rounded-full mb-4">
          <Smartphone size={48} className="text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">No Students Registered</h2>
        <p className="text-muted-foreground max-w-xs mx-auto mt-2">
          Start by adding students and devices in the management pages.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pt-2 pb-4">
        <h1 className="text-2xl font-bold mb-4">Daily Attendance</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search student or class..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed flex flex-col items-center">
            <Search size={32} className="text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No students match your search.</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const status = getOverallStatus(student.devices);
            return (
              <div key={student.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all hover:shadow-md">
                <div className="p-4 border-b border-border bg-muted/5 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{student.name}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">{student.class}</p>
                  </div>
                  <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight", status.color)}>
                    <status.icon size={12} />
                    {status.label}
                  </div>
                </div>

                <div className="p-2 space-y-1.5">
                  {student.devices.length === 0 ? (
                    <p className="text-xs text-center py-6 text-muted-foreground italic">No devices assigned to this student</p>
                  ) : (
                    student.devices.map((device) => {
                      const isBorrowed = device.status === "BORROWED";
                      const isProcessing = processingId === device.id;
                      
                      return (
                        <div key={device.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-transparent hover:border-border transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-background rounded-lg text-muted-foreground shadow-sm border border-border">
                              {device.type === "LAPTOP" ? <Laptop size={20} /> : <Smartphone size={20} />}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{device.name}</p>
                              {device.todayLog?.checkOutTime && (
                                <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                  <Clock size={10} />
                                  Check-out at {new Date(device.todayLog.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            disabled={isProcessing || device.status === "MAINTENANCE"}
                            onClick={() => handleAction(student.id, device.id, isBorrowed ? "check-in" : "check-out")}
                            className={cn(
                              "relative h-10 min-w-28 inline-flex items-center justify-center px-4 py-2 text-xs font-black uppercase tracking-tighter transition-all rounded-lg active:scale-95 disabled:opacity-50 shadow-sm",
                              isBorrowed 
                                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20" 
                                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                            )}
                          >
                            {isProcessing ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : (
                              isBorrowed ? "CHECK-IN" : "CHECK-OUT"
                            )}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
