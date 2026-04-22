"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Edit2,
  X
} from "lucide-react";
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
          let duration = "Terlambat";
          if (isToday) {
            const latenessHours = currentHour - SYSTEM_CONFIG.RETURN_DEADLINE_HOUR;
            duration = `${latenessHours}j ${now.getMinutes()}m`;
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

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-300 font-bold uppercase tracking-widest text-[10px]">Memuat Riwayat...</div>;

  const displayLogs = Array.isArray(logs) ? logs.filter(l => l.student.name.toLowerCase().includes(search.toLowerCase())) : [];

  return (
    <div className="space-y-12 page-fade-in pb-32">
      <PageHeader 
        title="Riwayat"
        subtitle="Aktivitas pengambilan dan riwayat kepatuhan perangkat."
      />

      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-4 md:-mx-8 px-4 md:px-8 py-6 flex flex-wrap items-center gap-6 border-b border-slate-50">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari nama siswa..."
            className="w-full pl-10 pr-6 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-3 items-center">
          <input 
            type="date" 
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none cursor-pointer focus:border-indigo-500 shadow-sm"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <select 
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none cursor-pointer focus:border-indigo-500 shadow-sm"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {["10-A", "10-B", "11-A", "11-B", "12-A", "12-B", "12-C"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <section className="space-y-6">
        <h3 className="text-[10px] font-black uppercase text-rose-500 tracking-[0.2em] flex items-center gap-2 ml-1">
          <AlertTriangle size={14} />
          Pelanggaran Kritis
        </h3>
        
        {problemSiswa.length === 0 ? (
          <div className="bg-white border border-slate-100 p-12 rounded-container text-center shadow-sm">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3" />
            <p className="text-slate-900 text-lg font-bold tracking-tight leading-none">Tidak ada pelanggaran.</p>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-3">Semua perangkat aman hari ini</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {problemSiswa.map(p => (
              <div key={p.student.id} className="bg-white p-8 rounded-card border border-rose-100 shadow-card relative group hover:border-rose-200 transition-all">
                <div className="absolute top-4 right-4">
                   <div className="px-2.5 py-1 bg-rose-50 text-rose-600 text-[9px] font-black rounded-lg uppercase tracking-widest">
                    {p.lateness}
                   </div>
                </div>
                
                <h4 className="font-bold text-slate-900 pr-12 text-lg tracking-tight leading-none mb-2">{p.student.name}</h4>
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mb-8">{p.student.class}</p>
                
                <div className="space-y-2">
                  {p.logs.map(log => (
                    <div key={log.id} className="flex justify-between items-center bg-rose-50/30 p-4 rounded-2xl border border-rose-50">
                      <span className="text-[10px] font-black text-rose-900 uppercase tracking-widest">
                        {log.device.name}
                      </span>
                      <StatusBadge status="NOT_RETURNED" className="scale-75 origin-right" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="rounded-container border border-slate-100 bg-white shadow-card overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/10 flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tabel Transparansi</h3>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{displayLogs.length} Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/30 text-[10px] uppercase font-black text-slate-300 border-b border-slate-50 tracking-widest">
              <tr>
                <th className="px-10 py-6">Siswa</th>
                <th className="px-10 py-6">Perangkat</th>
                <th className="px-10 py-6">Status Log</th>
                <th className="px-10 py-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-10 py-8">
                    <p className="font-bold text-slate-900 text-lg leading-none mb-2">{log.student.name}</p>
                    <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">{log.student.class}</p>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-xs font-bold text-slate-600 mb-2">{log.device.name}</p>
                    <div className="flex gap-4 text-[10px] text-slate-300 font-black uppercase tracking-tighter opacity-60">
                       <span className="flex items-center gap-1"><Clock size={10} /> OUT: {new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       {log.checkInTime && <span className="flex items-center gap-1"><Clock size={10} /> IN: {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-2">
                      <StatusBadge status={log.dailyStatus} className="scale-90 origin-left" />
                      {log.reason && <p className="text-[10px] text-rose-400 font-bold italic truncate max-w-[150px]">Alasan: {log.reason}</p>}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingLog(log);
                        setOverrideStatus(log.dailyStatus);
                        setOverrideReason("");
                      }}
                      className="text-slate-200 hover:text-indigo-600 hover:bg-indigo-50"
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

      {editingLog && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-container shadow-2xl border border-slate-100 p-10 animate-in zoom-in-95 duration-200">
               <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-2">Koreksi Log</h2>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{editingLog.student.name} • {editingLog.device.name}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditingLog(null)} className="p-0 text-slate-300">
                    <X size={24} />
                  </Button>
               </div>

               <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Status Koreksi</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none appearance-none cursor-pointer transition-all"
                      value={overrideStatus}
                      onChange={(e) => setOverrideStatus(e.target.value)}
                    >
                      <option value="NOT_RETURNED">BELUM KEMBALI</option>
                      <option value="ON_TIME">TEPAT WAKTU</option>
                      <option value="LATE">TERLAMBAT</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Alasan Audit</label>
                    <textarea 
                      placeholder="Masukkan alasan koreksi..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-semibold min-h-[120px] focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none resize-none transition-all"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                    />
                  </div>

                  <Button 
                    disabled={isSaving}
                    loading={isSaving}
                    onClick={handleOverride}
                    className="w-full py-4 text-sm font-bold shadow-xl shadow-indigo-50"
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
