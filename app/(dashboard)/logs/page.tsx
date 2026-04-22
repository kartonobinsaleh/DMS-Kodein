"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Edit2,
  X,
  Filter,
  Calendar,
  ClipboardList,
  Clock,
  User,
  Smartphone,
  Laptop
} from "lucide-react";
import { toast } from "sonner";
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
      toast.error("Sync failed.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterDate, filterClass]);

  const handleOverride = async () => {
    if (!editingLog) return;
    if (overrideReason.length < 5) return toast.error("Note too short.");

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
      
      toast.success("Corrected.");
      setEditingLog(null);
      fetchData();
    } catch (error) {
      toast.error("Sync error.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-xs font-semibold text-gray-400 uppercase tracking-widest animate-pulse">Syncing Daily Activity Logs...</div>;

  const displayLogs = Array.isArray(logs) ? logs.filter(l => l.student.name.toLowerCase().includes(search.toLowerCase())) : [];

  return (
    <div className="space-y-4 page-fade-in pb-20">
      <PageHeader 
        title="Daily Activity Logs"
        subtitle="Comprehensive database of daily student device activity."
      />

      {/* Sticky Combined Filter Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col gap-3 shadow-sm sticky top-0 z-10 transition-shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search student name..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:border-indigo-600 outline-none transition-all placeholder:text-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-gray-500">
            <Calendar size={14} />
            <input 
              type="date" 
              className="bg-transparent text-xs font-bold outline-none cursor-pointer w-full"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-gray-500">
             <Filter size={14} />
             <select 
               className="bg-transparent text-xs font-bold outline-none cursor-pointer w-full"
               value={filterClass}
               onChange={(e) => setFilterClass(e.target.value)}
             >
               <option value="">All Classes</option>
               {["10-A", "10-B", "11-A", "11-B", "12-A", "12-B", "12-C"].map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {displayLogs.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-gray-200">
             <ClipboardList size={32} className="mx-auto mb-2 text-gray-200" />
             <p className="text-xs font-medium text-gray-400 italic">No historical records for this date.</p>
          </div>
        ) : (
          displayLogs.map((log) => (
            <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col hover:border-indigo-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-none mb-1">{log.student.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{log.student.class}</p>
                  </div>
                </div>
                <StatusBadge status={log.dailyStatus} className="scale-90" />
              </div>

              <div className="space-y-3 bg-gray-50/50 p-3 rounded-lg border border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  {log.device.type === "LAPTOP" ? <Laptop size={14} className="text-gray-400" /> : <Smartphone size={14} className="text-gray-400" />}
                  <span className="text-xs font-bold text-gray-700">{log.device.name}</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock size={12} className="text-gray-300" />
                    <span>In: {new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-indigo-600 font-bold">
                    Out: {log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "PENDING"}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2">
                 <div className="flex-1">
                    {log.reason && (
                       <p className="text-[10px] text-gray-500 italic truncate pr-4">Note: {log.reason}</p>
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
                    className="h-10 w-10 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-xl"
                  >
                    <Edit2 size={18} />
                  </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {editingLog && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/20 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 p-6 animate-in zoom-in-95 duration-150">
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-sm font-bold text-gray-800 leading-none mb-1">Correction Record</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{editingLog.student.name}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditingLog(null)} className="p-0 h-auto text-gray-400">
                    <X size={18} />
                  </Button>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Manual Status</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-sm font-bold focus:border-indigo-600 outline-none cursor-pointer"
                      value={overrideStatus}
                      onChange={(e) => setOverrideStatus(e.target.value)}
                    >
                      <option value="NOT_RETURNED">NOT_RETURNED</option>
                      <option value="ON_TIME">ON_TIME</option>
                      <option value="LATE">LATE</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Operational Note</label>
                    <textarea 
                      placeholder="Rationale for manual correction..."
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
                    Save Correction
                  </Button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
