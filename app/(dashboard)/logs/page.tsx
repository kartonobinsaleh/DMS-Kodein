"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Edit2,
  X,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SYSTEM_CONFIG } from "@/lib/config";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

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
      const isNotReturned = log.dailyStatus === "NOT_RETURNED";
      const isOverdue = isToday && currentHour >= SYSTEM_CONFIG.RETURN_DEADLINE_HOUR;

      if (isNotReturned && isOverdue) {
        if (!groups[log.student.id]) {
          let duration = "Overdue";
          if (isToday) {
            const latenessHours = currentHour - SYSTEM_CONFIG.RETURN_DEADLINE_HOUR;
            duration = `${latenessHours}j ${now.getMinutes()}m terlambat`;
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

  const handleOverride = async () => {
    if (!editingLog) return;
    if (overrideReason.length < 5) return toast.error("Alasan minimal 5 karakter");

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
      
      toast.success("Log berhasil dikoreksi");
      setEditingLog(null);
      fetchData();
    } catch (error) {
      toast.error("Gagal melakukan koreksi");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-black uppercase tracking-widest text-slate-300">Memindai Log...</div>;

  const displayLogs = Array.isArray(logs) ? logs.filter(l => l.student.name.toLowerCase().includes(search.toLowerCase())) : [];

  return (
    <div className="p-4 md:p-8 space-y-10 bg-slate-50/50 min-h-screen pb-32">
      <PageHeader 
        title="Audit Log"
        subtitle="Riwayat aktivitas dan pemantauan pelanggaran perangkat."
        category="Audit Monitoring"
        icon={<ShieldAlert size={14} />}
      />

      {/* STICKY FILTER BAR - Standardized with design tokens */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 -mx-4 md:-mx-8 px-4 md:px-8 py-4 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari nama siswa..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 items-center">
          <input 
            type="date" 
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer focus:border-indigo-500"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <select 
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer focus:border-indigo-500"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {["10-A", "10-B", "11-A", "11-B", "12-A", "12-B", "12-C"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* 2. PROBLEM SECTION (GROUPED) */}
      <section>
        <h3 className="text-xs font-black uppercase text-rose-600 mb-6 tracking-widest flex items-center gap-2">
          <AlertTriangle size={14} />
          Pelanggaran Kritis
        </h3>
        
        {problemSiswa.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-100 p-12 rounded-container text-center">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3" />
            <p className="text-emerald-700 text-lg font-black tracking-tight">Tidak ada pelanggaran hari ini.</p>
            <p className="text-emerald-600 text-[10px] uppercase font-black tracking-[0.2em] mt-2">Semua perangkat aman atau batas waktu belum terlewati</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {problemSiswa.map(p => (
              <div key={p.student.id} className="bg-white p-8 rounded-card border border-rose-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <div className="absolute top-0 right-0 p-4">
                   <div className="px-3 py-1.5 bg-rose-600 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-rose-200">
                    {p.lateness}
                   </div>
                </div>
                
                <h4 className="font-black text-slate-800 pr-12 text-xl tracking-tighter leading-none mb-1">{p.student.name}</h4>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-8">{p.student.class}</p>
                
                <div className="space-y-3">
                  {p.logs.map(log => (
                    <div key={log.id} className="flex justify-between items-center bg-rose-50/50 p-4 rounded-2xl border border-rose-100/30">
                      <span className="text-[10px] font-black text-rose-900 uppercase tracking-[0.15em]">
                        {log.device.name}
                      </span>
                      <StatusBadge status="NOT_RETURNED" className="scale-75 origin-right" />
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-6 border-t border-rose-50 flex justify-between items-center">
                   <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 p-0 h-auto">Siswa Ditegur</Button>
                   <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={10} /> {new Date(p.logs[0].checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. LOG TABLE */}
      <div className="bg-white rounded-container border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Audit Transparansi</h3>
          <span className="text-[10px] font-black bg-white border border-slate-100 px-4 py-1.5 rounded-full text-slate-500 uppercase tracking-widest shadow-sm">{displayLogs.length} Entri</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-100 tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Siswa</th>
                <th className="px-10 py-6">Perangkat</th>
                <th className="px-10 py-6">Status Log</th>
                <th className="px-10 py-6">Audit Staf</th>
                <th className="px-10 py-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-10 py-6">
                    <p className="font-bold text-slate-900 tracking-tight text-base mb-0.5">{log.student.name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{log.student.class}</p>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{log.device.name}</p>
                    <div className="flex gap-4 text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">
                       <span className="flex items-center gap-1.5 opacity-60"><Clock size={10} /> OUT: {new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       {log.checkInTime && <span className="flex items-center gap-1.5 text-emerald-600"><Clock size={10} /> IN: {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-2">
                      <StatusBadge status={log.dailyStatus} />
                      {log.reason && <p className="text-[10px] text-rose-500 font-black italic truncate max-w-[150px] uppercase tracking-tighter">Alasan: {log.reason}</p>}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="p-1 px-3 border border-slate-100 rounded-xl bg-slate-50/50 inline-block">
                      <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">ID: {log.staffId?.slice(-6) || "SISTEM"}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingLog(log);
                        setOverrideStatus(log.dailyStatus);
                        setOverrideReason("");
                      }}
                      className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <Edit2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. OVERRIDE DIALOG */}
      {editingLog && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all">
            <div className="bg-white w-full max-w-md rounded-container shadow-2xl border border-slate-100 p-10 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Koreksi Riwayat</h2>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-3">{editingLog.student.name} • {editingLog.device.name}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditingLog(null)} className="p-0 text-slate-300 hover:text-slate-900">
                    <X size={28} />
                  </Button>
               </div>

               <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Status Pengganti</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                      value={overrideStatus}
                      onChange={(e) => setOverrideStatus(e.target.value)}
                    >
                      <option value="NOT_RETURNED">BELUM KEMBALI</option>
                      <option value="ON_TIME">TEPAT WAKTU</option>
                      <option value="LATE">TERLAMBAT</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Alasan Audit (Wajib)</label>
                    <textarea 
                      placeholder="Contoh: Perangkat ditemukan tertinggal di laci kelas, atau koreksi manual atas kesalahan input staf."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold min-h-[140px] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none resize-none transition-all"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                    />
                  </div>

                  <Button 
                    disabled={isSaving}
                    onClick={handleOverride}
                    loading={isSaving}
                    size="xl"
                    className="w-full shadow-xl shadow-indigo-100"
                  >
                    SIMPAN KOREKSI
                  </Button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
