"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Smartphone, 
  Laptop, 
  LogOut,
  CheckCircle,
  AlertTriangle,
  Clock,
  QrCode,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckOutButton, CheckInButton } from "@/components/daily-log-actions";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PageContainer } from "@/components/ui/page-container";
import { ActionBar } from "@/components/ui/action-bar";
import { Card } from "@/components/ui/card";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
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
  const [classFilter, setClassFilter] = useState("");

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
    return Array.isArray(students) ? students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                           s.class.toLowerCase().includes(search.toLowerCase());
      const matchesClass = classFilter === "" || s.class === classFilter;
      return matchesSearch && matchesClass;
    }) : [];
  }, [students, search, classFilter]);

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

  if (loading) return (
    <PageContainer>
      <div className="animate-in fade-in duration-500 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-12 w-40 rounded-xl" />
            <Skeleton className="h-12 w-40 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    </PageContainer>
  );

  return (
    <PageContainer>
      <PageHeader
        title="Keluar / Masuk Perangkat"
        subtitle="Kelola aktivitas harian perangkat siswa."
      />

       {/* Summary Strip - Standardized Dashboard Style */}
       <SummaryStrip>
        {[
          { label: "Total Unit", value: stats.totalItems, icon: Laptop, color: "text-gray-400" },
          { label: "Unit Keluar", value: stats.borrowed, icon: LogOut, color: "text-primary" },
          { label: "Terlambat", value: stats.late, icon: AlertTriangle, color: "text-amber-500" },
          { label: "Unit Masuk", value: stats.totalItems - stats.borrowed, icon: CheckCircle, color: "text-green-600" },
        ].map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} iconColorClass={s.color} />
        ))}
      </SummaryStrip>

      <ActionBar>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Cari nama siswa atau kelas..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-primary outline-none shadow-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial min-w-[160px] flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-3 py-3 rounded-xl text-gray-400 group-focus-within:border-primary transition-all">
            <GraduationCap size={16} className="shrink-0 group-focus-within:text-primary transition-colors" />
            <select 
              className="bg-transparent text-[11px] font-bold outline-none cursor-pointer w-full text-gray-900"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="">SEMUA KELAS</option>
              <option value="10">KELAS 10</option>
              <option value="11">KELAS 11</option>
              <option value="12">KELAS 12</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/attendance/scan?target=LAPTOP" className="flex-1">
            <Button
              className="w-full h-12 px-6 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-sm"
              leftIcon={<Laptop size={16} />}
              variant="dark"
            >
              SCAN LAPTOP
            </Button>
          </Link>
          <Link href="/attendance/scan?target=PHONE" className="flex-1">
            <Button
              className="w-full h-12 px-6 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-sm"
              leftIcon={<Smartphone size={16} />}
              variant="indigo"
            >
              SCAN HP
            </Button>
          </Link>
        </div>
      </ActionBar>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStudents.length === 0 ? (
          <EmptyState 
            icon={Search}
            title="Tidak ada siswa"
            description="Coba gunakan nama siswa atau kelas lain."
          />
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.id} className="flex flex-col group hover:border-primary/10 transition-all">
              <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-200 flex justify-between items-center group-hover:bg-primary-light/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-primary font-bold text-sm shadow-sm">
                    {student.name[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 leading-none mb-1 group-hover:text-primary transition-colors">
                      {student.name}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.class}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-300">ID: {student.id.slice(-6).toUpperCase()}</span>
              </div>

              <div className="p-3 space-y-2">
                {student.ownedDevices.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400 italic">Tidak ada perangkat yang terdaftar.</div>
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
            </Card>
          ))
        )}
      </div>
    </PageContainer>
  );
}
