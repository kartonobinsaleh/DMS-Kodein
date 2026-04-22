"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Smartphone, 
  Laptop, 
  Activity,
  LogOut,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckOutButton, CheckInButton } from "@/components/daily-log-actions";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DailyLog {
  id: string;
  dailyStatus: "ON_TIME" | "LATE" | "NOT_RETURNED";
  checkOutTime: string | null;
  checkInTime: string | null;
}

interface Device {
  id: string;
  name: string;
  type: "LAPTOP" | "PHONE";
  status: "AVAILABLE" | "BORROWED" | "MAINTENANCE";
  dailyLogs: DailyLog[];
}

interface Student {
  id: string;
  name: string;
  class: string;
  ownedDevices: Device[];
}

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/students");
      const json = await res.json();
      if (json.success) {
        setStudents(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch student data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = useMemo(() => {
    return Array.isArray(students) ? students.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.class.toLowerCase().includes(search.toLowerCase())
    ) : [];
  }, [students, search]);

  const stats = useMemo(() => {
    let totalItems = 0;
    let borrowed = 0;
    let late = 0;
    
    students.forEach(s => {
      s.ownedDevices.forEach(d => {
        totalItems++;
        if (d.status === "BORROWED") borrowed++;
        const lastLog = d.dailyLogs?.[0];
        if (lastLog?.dailyStatus === "LATE") late++;
      });
    });

    return { totalItems, borrowed, late };
  }, [students]);

  if (loading) return <div className="p-20 text-center text-xs font-semibold text-gray-400 uppercase tracking-widest animate-pulse">Syncing Operational Module...</div>;

  return (
    <div className="space-y-4 page-fade-in pb-20">
      <PageHeader
        title="Check-In / Out"
        subtitle="Manage daily student device activity."
      />

       {/* Summary Strip - Mobile Horizontal Scroll */}
       <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { label: "Total Assets", value: stats.totalItems, icon: Activity, color: "text-gray-400" },
          { label: "Active", value: stats.borrowed, icon: LogOut, color: "text-indigo-600" },
          { label: "Late Issues", value: stats.late, icon: AlertTriangle, color: "text-amber-500" },
          { label: "In-Office", value: stats.totalItems - stats.borrowed, icon: CheckCircle, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="flex-shrink-0 bg-white border border-gray-200 rounded-xl p-3 min-w-[110px] shadow-sm">
            <div className="flex items-center justify-between mb-1">
               <Activity size={14} className={s.color} />
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-md pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search student or class..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-indigo-600 outline-none shadow-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
            <Clock size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-xs font-medium text-gray-400">No active students matched.</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden group hover:border-indigo-100 transition-all">
              <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-200 flex justify-between items-center group-hover:bg-indigo-50/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-sm shadow-sm">
                    {student.name[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 leading-none mb-1 group-hover:text-indigo-600 transition-colors">
                      {student.name}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.class}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-300">ID: {student.id.slice(-6).toUpperCase()}</span>
              </div>

              <div className="p-3 space-y-2">
                {student.ownedDevices.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400 italic">No assets assigned.</div>
                ) : (
                  student.ownedDevices.map((device) => {
                    const isBorrowed = device.status === "BORROWED";
                    return (
                      <div key={device.id} className="flex flex-col p-4 rounded-xl border border-gray-100 bg-gray-50/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", isBorrowed ? "bg-red-50 text-red-600 shadow-inner" : "bg-white border border-gray-100 text-gray-400")}>
                              {device.type === "LAPTOP" ? <Laptop size={18} /> : <Smartphone size={18} />}
                            </div>
                            <div>
                               <p className="text-xs font-bold text-gray-700 leading-none mb-1.5">{device.name}</p>
                               <StatusBadge status={device.status} />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                           {isBorrowed ? (
                              <CheckInButton 
                                studentId={student.id} 
                                deviceId={device.id} 
                                onSuccess={fetchData}
                                className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md active:translate-y-0.5 transition-transform"
                              />
                           ) : (
                              <CheckOutButton 
                                studentId={student.id} 
                                deviceId={device.id} 
                                onSuccess={fetchData}
                                className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md active:translate-y-0.5 transition-transform"
                                disabled={device.status === "MAINTENANCE"}
                              />
                           )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
