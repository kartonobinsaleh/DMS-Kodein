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
import { StatusBadge } from "@/components/ui/status-badge";

interface DailyLog {
  id: string;
  date: string;
  dailyStatus: "ON_TIME" | "LATE" | "NOT_RETURNED";
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
      const res = await fetch(`/api/daily-logs?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      } else {
        setLogs([]);
      }
    } catch (error) {
      toast.error("Failed to load audit logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterDate, filterClass]);

  // PROBLEM GROUPING LOGIC (Grouped by Student)
  const problemSiswa = useMemo(() => {
    if (!Array.isArray(logs)) return [];
    
    const now = new Date();
    const currentHour = now.getHours();
    const isToday = filterDate === new Date().toISOString().split('T')[0];
    
    const groups: Record<string, { student: any, logs: DailyLog[], lateness: string }> = {};

    logs.forEach(log => {
      // New Enum check: NOT_RETURNED means hasn't checked in
      const isNotReturned = log.dailyStatus === "NOT_RETURNED";
      const isOverdue = isToday && currentHour >= SYSTEM_CONFIG.RETURN_DEADLINE_HOUR;

      if (isNotReturned && isOverdue) {
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

  const displayLogs = Array.isArray(logs) ? logs.filter(l => l.student.name.toLowerCase().includes(search.toLowerCase())) : [];

  return (
    <div className="space-y-8 pb-20">
      {/* 1. STICKY FILTER BAR */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 -mx-6 px-6 py-4 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400">
          <ShieldAlert size={14} className="text-indigo-600" />
          Audit Monitoring
        </div>
        
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Quick search student..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 items-center">
          <input 
            type="date" 
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <select 
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
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
          <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] text-center">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
            <p className="text-emerald-700 font-bold">No violations detected for this day.</p>
            <p className="text-emerald-600 text-[10px] uppercase font-bold tracking-widest mt-1">All rewards safe or deadline not yet passed</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {problemSiswa.map(p => (
              <div key={p.student.id} className="bg-white p-6 rounded-[2rem] border border-rose-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 p-4">
                   <div className="px-2.5 py-1 bg-rose-600 text-white text-[9px] font-black rounded-lg uppercase tracking-widest">
                    {p.lateness}
                   </div>
                </div>
                
                <h4 className="font-black text-slate-800 pr-12 text-lg tracking-tight">{p.student.name}</h4>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-6">{p.student.class}</p>
                
                <div className="space-y-2">
                  {p.logs.map(log => (
                    <div key={log.id} className="flex justify-between items-center bg-rose-50/50 p-3 rounded-xl border border-rose-100/30">
                      <span className="text-[10px] font-black text-rose-900 uppercase tracking-widest">
                        {log.device.name}
                      </span>
                      <StatusBadge status="NOT_RETURNED" className="scale-75 origin-right" />
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-rose-50 flex justify-between items-center">
                   <button className="text-[10px] text-rose-600 font-black uppercase tracking-widest hover:underline">Siswa Ditegur</button>
                   <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Last Out: {new Date(p.logs[0].checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. LOG TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/20 flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Audit Transparency</h3>
          <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full text-slate-500 uppercase tracking-widest">{displayLogs.length} Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-100 tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Siswa</th>
                <th className="px-8 py-5">Perangkat</th>
                <th className="px-8 py-5">Status Log</th>
                <th className="px-8 py-5">Audit Staf</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 group transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-900 tracking-tight mb-0.5">{log.student.name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{log.student.class}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{log.device.name}</p>
                    <div className="flex gap-3 text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-tighter">
                       <span className="flex items-center gap-1"><Clock size={10} /> Out: {new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       {log.checkInTime && <span className="flex items-center gap-1"><Clock size={10} /> In: {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1.5">
                      <StatusBadge status={log.dailyStatus} />
                      {log.reason && <p className="text-[10px] text-rose-500 font-bold italic truncate max-w-[150px]">Alasan: {log.reason}</p>}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                   <div className="flex items-center gap-2">
                      <div className="p-1 px-2 border border-slate-100 rounded-lg bg-slate-50">
                        <span className="text-[10px] font-black text-slate-400 tracking-widest">ID: {log.staffId?.slice(-6) || "AUTO"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => {
                        setEditingLog(log);
                        setOverrideStatus(log.dailyStatus);
                        setOverrideReason("");
                      }}
                      className="p-2.5 hover:bg-white hover:shadow-md hover:border-slate-200 border border-transparent rounded-xl text-slate-400 transition-all group-hover:text-indigo-600"
                    >
                      <Edit2 size={16} />
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
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 animate-in zoom-in-95 duration-200">
               <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Koreksi Log</h2>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em] mt-1">{editingLog.student.name} • {editingLog.device.name}</p>
                  </div>
                  <button onClick={() => setEditingLog(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                    <X size={24} />
                  </button>
               </div>

               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Override Status</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                      value={overrideStatus}
                      onChange={(e) => setOverrideStatus(e.target.value)}
                    >
                      <option value="NOT_RETURNED">BELUM KEMBALI (NOT RETURNED)</option>
                      <option value="ON_TIME">TEPAT WAKTU (ON TIME)</option>
                      <option value="LATE">TERLAMBAT (LATE)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Alasan Audit (Wajib)</label>
                    <textarea 
                      placeholder="Contoh: Perangkat tertinggal di tas, atau koreksi manual karena kesalahan input staf"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium min-h-[120px] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none transition-all"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                    />
                  </div>

                  <button 
                    disabled={isSaving}
                    onClick={handleOverride}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                    SIMPAN KOREKSI
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
