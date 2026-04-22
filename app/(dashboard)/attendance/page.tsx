"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Smartphone, 
  Laptop, 
  Activity,
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

  if (loading) return <div className="p-20 text-center text-xs font-semibold text-gray-400 uppercase tracking-widest animate-pulse">Syncing Operational Module...</div>;

  return (
    <div className="space-y-4 page-fade-in pb-10">
      <PageHeader
        title="Device Check-In / Check-Out"
        subtitle="Manage daily student device activity and logistics."
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        <input
          type="text"
          placeholder="Filter students / class..."
          className="w-full bg-white border border-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-sm shadow-sm focus:border-indigo-600 outline-none transition-all placeholder:text-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
            <Activity size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-xs font-medium text-gray-400">No active students matched.</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
              <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 bg-white border border-gray-100 rounded flex items-center justify-center text-gray-400 text-xs font-bold uppercase">
                    {student.name[0]}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 leading-none">
                    {student.name} <span className="text-indigo-600 ml-1">({student.class})</span>
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-300">ID: {student.id.slice(-6).toUpperCase()}</span>
              </div>

              <div className="p-2 space-y-1">
                {student.ownedDevices.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400 italic">No assets.</div>
                ) : (
                  student.ownedDevices.map((device) => {
                    const isBorrowed = device.status === "BORROWED";
                    return (
                      <div key={device.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg text-gray-400", isBorrowed ? "bg-red-50 text-red-600" : "bg-gray-50")}>
                            {device.type === "LAPTOP" ? <Laptop size={16} /> : <Smartphone size={16} />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-700 leading-none mb-1">{device.name}</p>
                            <StatusBadge status={device.status} className="scale-90 origin-left" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                           {isBorrowed ? (
                              <CheckInButton 
                                studentId={student.id} 
                                deviceId={device.id} 
                                onSuccess={fetchData}
                                className="h-8 py-0 rounded-lg text-xs"
                              />
                           ) : (
                              <CheckOutButton 
                                studentId={student.id} 
                                deviceId={device.id} 
                                onSuccess={fetchData}
                                className="h-8 py-0 rounded-lg text-xs"
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
