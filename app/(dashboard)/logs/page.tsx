"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Calendar as CalendarIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User,
  ShieldAlert,
  Edit2,
  X,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SYSTEM_CONFIG } from "@/lib/config";

interface DailyLog {
  id: string;
  date: string;
  dailyStatus: "PENDING" | "RETURNED_ON_TIME" | "RETURNED_LATE" | "VIOLATION";
  checkOutTime: string;
  checkInTime: string | null;
  staffId: string | null;
  reason: string | null;
  student: { id: string; name: string; class: string };
  device: { name: string; type: string };
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState("");
  
  // Correction Modal State
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<any>("");
  const [overrideReason, setOverrideReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        date: filterDate,
        ...(filterClass && { class: filterClass })
      });
      const res = await fetch(`/api/logs?${params.toString()}`);
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterDate, filterClass]);

  // PROBLEM GROUPING LOGIC (Grouped by Student)
  const problemSiswa = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const isToday = filterDate === new Date().toISOString().split('T')[0];
    
    const groups: Record<string, { student: any, logs: DailyLog[], lateness: string }> = {};

    logs.forEach(log => {
      const isPending = log.dailyStatus === "PENDING";
      const isOverdue = isToday && currentHour >= SYSTEM_CONFIG.RETURN_DEADLINE_HOUR;
      const isViolation = log.dailyStatus === "VIOLATION";

      if ((isPending && isOverdue) || isViolation) {
        if (!groups[log.student.id]) {
          // Calculate lateness duration
          let duration = "Overdue";
          if (isToday) {
            const latenessHours = currentHour - SYSTEM_CONFIG.RETURN_DEADLINE_HOUR;
            duration = `${latenessHours}h ${now.getMinutes()}m late`;
          }

          groups[log.student.id] = {
            student: log.student,
            logs: [],
            lateness: duration
          };
        }
        groups[log.student.id].logs.push(log);
      }
    });

    return Object.values(groups).sort((a, b) => b.logs.length - a.logs.length);
  }, [logs, filterDate]);

  // Handle Override
  const handleOverride = async () => {
    if (!editingLog) return;
    if (overrideReason.length < 5) return toast.error("Reason must be at least 5 characters");

    setIsSaving(true);
    try {
      const res = await fetch(`/api/logs/${editingLog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyStatus: overrideStatus,
          reason: overrideReason
        })
      });

      if (!res.ok) throw new Error("Correction failed");
      
      toast.success("Log corrected successfully");
      setEditingLog(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to apply correction");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Scanning Logs...</div>;

  return (
    <div className="space-y-8 pb-20">
      {/* 1. STICKY FILTER BAR */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border -mx-6 px-6 py-4 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400">
          <ShieldAlert size={14} className="text-primary" />
          Audit Monitoring
        </div>
        
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Quick search student..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 items-center">
          <input 
            type="date" 
            className="bg-card border rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <select 
            className="bg-card border rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {["10-A", "10-B", "11-A", "11-B", "12-A", "12-B", "12-C"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* 2. PROBLEM SECTION (GROUPED) */}
      <section>
        <h3 className="text-xs font-black uppercase text-rose-600 mb-4 tracking-widest flex items-center gap-2">
          <AlertTriangle size={14} />
          Critical Violations
        </h3>
        
        {problemSiswa.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-2xl text-center">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
            <p className="text-emerald-700 font-bold">No violations detected for this day.</p>
            <p className="text-emerald-600 text-xs mt-1">All devices returned or deadline not yet passed.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {problemSiswa.map(p => (
              <div key={p.student.id} className="bg-white p-4 rounded-2xl border-2 border-rose-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3">
                   <div className="px-2 py-1 bg-rose-600 text-white text-[9px] font-black rounded-lg">
                    {p.lateness}
                   </div>
                </div>
                
                <h4 className="font-black text-slate-800 pr-12">{p.student.name}</h4>
                <p className="text-[10px] text-muted-foreground font-bold uppercase mb-4">{p.student.class}</p>
                
                <div className="space-y-2">
                  {p.logs.map(log => (
                    <div key={log.id} className="flex justify-between items-center bg-rose-50 p-2 rounded-lg border border-rose-100/50">
                      <span className="text-[10px] font-bold text-rose-700 uppercase tracking-tighter">
                        {log.device.name}
                      </span>
                      <span className="text-[10px] text-rose-500 font-medium">PENDING</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-3 border-t flex justify-between items-center">
                   <button className="text-[10px] text-rose-600 font-bold hover:underline">Notify Student</button>
                   <span className="text-[9px] text-slate-300">Last seen: {new Date(p.logs[0].checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. LOG TABLE */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">Audit Transparency</h3>
          <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">{logs.length} Transactions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/30 text-[9px] uppercase font-black text-muted-foreground border-b tracking-widest">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Device</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Staff Audit</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.filter(l => l.student.name.toLowerCase().includes(search.toLowerCase())).map((log) => (
                <tr key={log.id} className="hover:bg-muted/5 group transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 leading-none mb-1">{log.student.name}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">{log.student.class}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[11px] font-bold text-slate-700 uppercase">{log.device.name}</p>
                    <div className="flex gap-2 text-[9px] text-muted-foreground font-medium mt-1">
                       <span>Out: {new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       {log.checkInTime && <span>In: {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className={cn(
                        "inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm",
                        log.dailyStatus === "RETURNED_ON_TIME" ? "bg-emerald-500 text-white" :
                        log.dailyStatus === "PENDING" ? "bg-amber-500 text-white" :
                        "bg-rose-500 text-white"
                      )}>
                        {log.dailyStatus.replace('_', ' ')}
                      </div>
                      {log.reason && <p className="text-[9px] text-rose-500 font-bold italic truncate max-w-[120px]">Reason: {log.reason}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                      <User size={12} className="text-muted-foreground" />
                      <span className="text-[10px] font-bold text-slate-400">ID: {log.staffId?.slice(-6) || "AUTO"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setEditingLog(log);
                        setOverrideStatus(log.dailyStatus);
                        setOverrideReason("");
                      }}
                      className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors group-hover:text-primary"
                    >
                      <Edit2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. OVERRIDE DIALOG */}
      {editingLog && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border p-6 animate-in slide-in-from-bottom-4 duration-200">
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-800 ring-offset-background">Log Correction</h2>
                    <p className="text-xs text-muted-foreground uppercase font-bold">{editingLog.student.name} • {editingLog.device.name}</p>
                  </div>
                  <button onClick={() => setEditingLog(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                    <X size={20} />
                  </button>
               </div>

               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Override Status</label>
                    <select 
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={overrideStatus}
                      onChange={(e) => setOverrideStatus(e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="RETURNED_ON_TIME">RETURNED ON TIME</option>
                      <option value="RETURNED_LATE">RETURNED LATE</option>
                      <option value="VIOLATION">VIOLATION</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Audit Reason (Required)</label>
                    <textarea 
                      placeholder="e.g., Device reported found in backpack, or manual correction for mis-input"
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm min-h-[100px] focus:ring-2 focus:ring-primary outline-none resize-none"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                    />
                  </div>

                  <button 
                    disabled={isSaving}
                    onClick={handleOverride}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-black text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : "SAVE CORRECTION"}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
