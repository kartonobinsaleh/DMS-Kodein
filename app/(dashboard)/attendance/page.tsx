"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Smartphone, 
  Laptop, 
  AlertCircle,
  LayoutGrid
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckOutButton, CheckInButton } from "@/components/daily-log-actions";
import { PageHeader } from "@/components/ui/page-header";

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

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-lg" />
        <div className="h-14 w-full bg-slate-200 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 w-full bg-slate-200 animate-pulse rounded-container" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 p-4 md:p-8 pb-32 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Check-In / Out"
        subtitle="Kelola pengambilan harian siswa dan status perangkat secara real-time."
        category="Operasional Harian"
        icon={<AlertCircle size={14} />}
      />

      <div className="relative group max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Cari nama siswa atau kelas..."
          className="w-full rounded-container border border-slate-200 bg-white pl-12 pr-6 py-5 text-sm font-bold focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full text-center py-32 bg-white rounded-container border border-dashed border-slate-200 flex flex-col items-center">
            <LayoutGrid size={64} className="text-slate-100 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Siswa tidak ditemukan dalam sistem</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-container border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-2xl hover:border-indigo-100 flex flex-col">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-start">
                <div>
                  <h3 className="font-black text-2xl text-slate-900 tracking-tighter leading-none">{student.name}</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-3">Kelas {student.class}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 font-black shadow-sm">
                  {student.name[0]}
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1">
                {student.ownedDevices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-20">
                    <Smartphone size={40} className="mb-2" />
                    <p className="text-xs font-black uppercase tracking-widest">No Hardware</p>
                  </div>
                ) : (
                  student.ownedDevices.map((device) => {
                    const isBorrowed = device.status === "BORROWED";
                    return (
                      <div key={device.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 rounded-2xl bg-slate-50/50 border border-transparent hover:border-slate-100 transition-all group/item">
                        <div className="flex items-center gap-5">
                          <div className="p-4 bg-white rounded-2xl text-slate-400 shadow-sm border border-slate-100 group-hover/item:text-indigo-600 group-hover/item:scale-110 transition-all duration-300">
                            {device.type === "LAPTOP" ? <Laptop size={24} /> : <Smartphone size={24} />}
                          </div>
                          <div>
                            <p className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">{device.name}</p>
                            <StatusBadge status={device.status} className="scale-90 origin-left" />
                          </div>
                        </div>

                        <div className="shrink-0">
                           {isBorrowed ? (
                              <CheckInButton 
                                studentId={student.id} 
                                deviceId={device.id} 
                                onSuccess={fetchData}
                                className="w-full sm:w-40"
                              />
                           ) : (
                              <CheckOutButton 
                                studentId={student.id} 
                                deviceId={device.id} 
                                onSuccess={fetchData}
                                className="w-full sm:w-40"
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
