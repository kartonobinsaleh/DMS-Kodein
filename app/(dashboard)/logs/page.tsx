"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  AlertTriangle, 
  Edit2,
  X,
  Filter,
  Calendar
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
      toast.error("Audit log failed.");
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
    <div className="space-y-4 page-fade-in pb-10">
      <PageHeader 
        title="Daily Activity Logs"
        subtitle="Comprehensive database of daily student device activity."
      />

      <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Filter daily records..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-gray-100 bg-gray-50 text-sm focus:border-indigo-600 outline-none transition-all placeholder:text-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg text-gray-500">
            <Calendar size={14} />
            <input 
              type="date" 
              className="bg-transparent text-xs font-medium outline-none cursor-pointer"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg text-gray-500">
             <Filter size={14} />
             <select 
               className="bg-transparent text-xs font-medium outline-none cursor-pointer"
               value={filterClass}
               onChange={(e) => setFilterClass(e.target.value)}
             >
               <option value="">All</option>
               {["10-A", "10-B", "11-A", "11-B", "12-A", "12-B", "12-C"].map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight">Student / Asset</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight text-center">Timeline</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight text-center">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400 italic">No records available.</td>
                </tr>
              ) : (
                displayLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800 leading-none mb-1">{log.student.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">{log.device.name}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-[11px] text-gray-500">
                       <span className="opacity-40">O:</span> {new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       {log.checkInTime && <span className="ml-2 text-indigo-400"><span className="opacity-40 text-gray-400">I:</span> {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <StatusBadge status={log.dailyStatus} className="scale-90" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingLog(log);
                          setOverrideStatus(log.dailyStatus);
                          setOverrideReason(log.reason || "");
                        }}
                        className="p-1 h-auto text-gray-300 hover:text-indigo-600"
                      >
                        <Edit2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingLog && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/20 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl border border-gray-100 p-6 animate-in zoom-in-95 duration-150">
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-sm font-bold text-gray-800 leading-none mb-1">Override Record</h2>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">{editingLog.student.name}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditingLog(null)} className="p-0 h-auto text-gray-400">
                    <X size={18} />
                  </Button>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 ml-1">Manual Status</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm font-medium focus:border-indigo-600 outline-none cursor-pointer"
                      value={overrideStatus}
                      onChange={(e) => setOverrideStatus(e.target.value)}
                    >
                      <option value="NOT_RETURNED">NOT_RETURNED</option>
                      <option value="ON_TIME">ON_TIME</option>
                      <option value="LATE">LATE</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 ml-1">Operational Note</label>
                    <textarea 
                      placeholder="Correction rationale..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none resize-none min-h-[80px]"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                    />
                  </div>

                  <Button 
                    disabled={isSaving}
                    loading={isSaving}
                    onClick={handleOverride}
                    className="w-full"
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
