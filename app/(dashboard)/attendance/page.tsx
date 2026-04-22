"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Smartphone, 
  Laptop, 
  AlertCircle,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckOutButton, CheckInButton } from "@/components/daily-log-actions";

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
  dailyLogs: DailyLog[]; // Matches the expected new API return
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
      const res = await fetch("/api/students"); // Use standard students listing
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
    return students.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.class.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto p-4 md:p-8">
        <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-lg" />
        <div className="h-14 w-full bg-slate-200 animate-pulse rounded-2xl" />
        {[1, 2].map((i) => (
          <div key={i} className="h-44 w-full bg-slate-200 animate-pulse rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 md:p-8 pb-32">
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-[10px]">
            <AlertCircle size={14} />
            <span>Operasional Harian</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">
            Check-In / Out
          </h1>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Cari nama siswa atau kelas..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-6">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center">
            <LayoutGrid size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Siswa tidak ditemukan</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:border-indigo-100">
              <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl text-slate-900 leading-tight">{student.name}</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-1">{student.class}</p>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {student.ownedDevices.length === 0 ? (
                  <p className="text-xs text-center py-6 text-slate-400 italic">Tidak ada perangkat terdaftar</p>
                ) : (
                  student.ownedDevices.map((device) => {
                    const isBorrowed = device.status === "BORROWED";
                    return (
                      <div key={device.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:border-slate-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-xl text-slate-400 shadow-sm border border-slate-100">
                            {device.type === "LAPTOP" ? <Laptop size={20} /> : <Smartphone size={20} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{device.name}</p>
                            <StatusBadge status={device.status} className="mt-1" />
                          </div>
                        </div>

                        <div className="flex gap-2">
                           {isBorrowed ? (
                              <CheckInButton 
                                studentId={student.id} 
                                deviceId={device.id} 
                                onSuccess={fetchData}
                                className="sm:w-32"
                              />
                           ) : (
                              <CheckOutButton 
                                studentId={student.id} 
                                deviceId={device.id} 
                                onSuccess={fetchData}
                                className="sm:w-32"
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
