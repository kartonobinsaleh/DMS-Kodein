"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Edit2,
  X,
  Filter,
  Calendar,
  ClipboardList,
  Smartphone,
  Laptop,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { ActionBar } from "@/components/ui/action-bar";
import { Card } from "@/components/ui/card";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { StatCard } from "@/components/ui/stat-card";

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
      toast.error("Gagal memuat data.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterDate, filterClass]);

  const stats = useMemo(() => {
    return {
      total: logs.length,
      onTime: logs.filter(l => l.dailyStatus === "ON_TIME").length,
      late: logs.filter(l => l.dailyStatus === "LATE").length,
      missing: logs.filter(l => l.dailyStatus === "NOT_RETURNED").length,
    };
  }, [logs]);

  const handleOverride = async () => {
    if (!editingLog) return;
    if (overrideReason.length < 5) return toast.error("Catatan terlalu pendek.");

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

      if (!res.ok) throw new Error("Gagal menyimpan perbaikan");
      
      toast.success("Catatan berhasil diperbaiki.");
      setEditingLog(null);
      fetchData();
    } catch (error) {
      toast.error("Gagal memperbarui catatan.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-xs font-semibold text-gray-400 uppercase tracking-widest animate-pulse">Memuat Catatan Aktivitas...</div>;

  const displayLogs = Array.isArray(logs) ? logs.filter(l => l.student.name.toLowerCase().includes(search.toLowerCase())) : [];

  return (
    <PageContainer>
      <PageHeader 
        title="Riwayat Aktivitas"
        subtitle="Database aktivitas harian perangkat siswa."
      />

       {/* Summary Strip - Unified Visual System */}
       <SummaryStrip>
        {[
          { label: "Total Log", value: stats.total, icon: Laptop, color: "text-gray-400" },
          { label: "Tepat Waktu", value: stats.onTime, icon: CheckCircle, color: "text-green-600" },
          { label: "Terlambat", value: stats.late, icon: AlertTriangle, color: "text-amber-500" },
          { label: "Belum Kembali", value: stats.missing, icon: XCircle, color: "text-red-600" },
        ].map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} iconColorClass={s.color} />
        ))}
      </SummaryStrip>

      {/* Sticky Combined Filter Controls */}
      <ActionBar>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Cari nama siswa..."
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:border-indigo-600 outline-none transition-all placeholder:text-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex w-full sm:w-auto gap-2 shrink-0">
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-3 py-3 rounded-xl text-gray-500">
            <Calendar size={14} />
            <input 
              type="date" 
              className="bg-transparent text-[11px] font-bold outline-none cursor-pointer w-full"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-3 py-3 rounded-xl text-gray-500">
             <Filter size={14} />
             <select 
               className="bg-transparent text-[11px] font-bold outline-none cursor-pointer w-full"
               value={filterClass}
               onChange={(e) => setFilterClass(e.target.value)}
             >
               <option value="">Semua Kelas</option>
               {["10-A", "10-B", "11-A", "11-B", "12-A", "12-B", "12-C"].map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
        </div>
      </ActionBar>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayLogs.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-gray-200">
             <ClipboardList size={32} className="mx-auto mb-2 text-gray-200" />
             <p className="text-xs font-medium text-gray-400 italic">Tidak ada catatan untuk tanggal ini.</p>
          </div>
        ) : (
          displayLogs.map((log) => (
            <Card key={log.id} className="flex flex-col group hover:border-indigo-100 transition-all">
              <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-200 flex justify-between items-center group-hover:bg-indigo-50/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs shadow-sm">
                    {log.student.name[0]}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-800 leading-none mb-1 group-hover:text-indigo-600 transition-colors">
                      {log.student.name}
                    </h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{log.student.class}</p>
                  </div>
                </div>
                <StatusBadge status={log.dailyStatus} className="scale-75 origin-right" />
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    {log.device.type === "LAPTOP" ? <Laptop size={14} className="text-gray-400" /> : <Smartphone size={14} className="text-gray-400" />}
                    <span className="text-[11px] font-bold text-gray-700">{log.device.name}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-300 uppercase font-bold tracking-tighter">Keluar</span>
                      <span className="text-[10px] text-gray-600 font-bold font-mono">{new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] text-gray-300 uppercase font-bold tracking-tighter">Kembali</span>
                      <span className={log.checkInTime ? "text-indigo-600 font-bold text-[10px] font-mono" : "text-amber-500 font-bold text-[10px] font-mono"}>
                        {log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-50 mt-auto">
                   <div className="flex-1 truncate">
                      {log.reason && (
                         <p className="text-[9px] text-gray-400 italic truncate pr-2">Log: {log.reason}</p>
                      )}
                   </div>
                   <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingLog(log);
                        setOverrideStatus(log.dailyStatus);
                        setOverrideReason(log.reason || "");
                      }}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all"
                    >
                      <Edit2 size={14} />
                    </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {editingLog && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/20 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 p-6 animate-in zoom-in-95 duration-150">
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-sm font-bold text-gray-800 leading-none mb-1">Perbaiki Catatan</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{editingLog.student.name}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditingLog(null)} className="p-0 h-auto text-gray-400">
                    <X size={18} />
                  </Button>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Status Operasional</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-sm font-bold focus:border-indigo-600 outline-none cursor-pointer"
                      value={overrideStatus}
                      onChange={(e) => setOverrideStatus(e.target.value)}
                    >
                      <option value="NOT_RETURNED">BELUM KEMBALI</option>
                      <option value="ON_TIME">TEPAT WAKTU</option>
                      <option value="LATE">TERLAMBAT</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Catatan Operasional</label>
                    <textarea 
                      placeholder="Alasan melakukan perbaikan data..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:border-indigo-600 outline-none resize-none min-h-[100px]"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                    />
                  </div>

                  <Button 
                    disabled={isSaving}
                    loading={isSaving}
                    onClick={handleOverride}
                    className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest"
                  >
                    Simpan Perbaikan
                  </Button>
               </div>
            </div>
         </div>
      )}
    </PageContainer>
  );
}
