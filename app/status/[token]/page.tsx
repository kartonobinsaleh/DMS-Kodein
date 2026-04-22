"use client";

import { useEffect, useState, use } from "react";
import { CheckCircle2, AlertCircle, Laptop, Smartphone, Clock, RefreshCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SYSTEM_CONFIG } from "@/lib/config";

interface StudentStatus {
  name: string;
  class: string;
  overallStatus: "RETURNED" | "NOT_SAFE" | "NO_ACTIVITY";
  devices: {
    id: string;
    name: string;
    type: "LAPTOP" | "PHONE";
    isReturned: boolean;
    status: string;
  }[];
  hasActivity: boolean;
  lastSync: string;
}

export default function StudentStatusPage({ params }: { params: Promise<{ token: string }> }) {
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  
  const [data, setData] = useState<StudentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchStatus = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsSyncing(true);

    try {
      const res = await fetch(`/api/attendance/${resolvedParams.token}`);
      if (!res.ok) throw new Error("Sync failed");
      const json = await res.json();
      setData(json);
      setError(false);
    } catch (err) {
      if (!silent) setError(true);
      console.warn("Background sync failed, keeping stale data.");
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Silent auto refresh every 30 seconds
    const interval = setInterval(() => fetchStatus(true), 30000);
    return () => clearInterval(interval);
  }, [resolvedParams.token]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-slate-900">
      <div className="flex flex-col items-center">
        <LoaderPulse />
        <p className="mt-8 text-xs font-black tracking-[0.3em] opacity-40 uppercase animate-pulse text-primary">Initializing Security Sync</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-rose-700 flex items-center justify-center text-white p-10 text-center">
      <div className="max-w-md">
        <XCircle size={80} className="mx-auto mb-8 opacity-50" />
        <h1 className="text-5xl font-black uppercase leading-tight tracking-tighter">Access Denied / Invalid Token</h1>
        <p className="mt-6 text-lg opacity-80 font-bold uppercase tracking-tight">The requested status link is invalid or has expired.</p>
      </div>
    </div>
  );

  // Determine state
  const isSafe = data.overallStatus === "RETURNED";
  const noActivity = data.overallStatus === "NO_ACTIVITY";

  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 ease-in-out bg-background",
    )}>
      {/* 1. STUDENT IDENTITY HEADER */}
      <div className="fixed top-10 left-0 right-0 flex flex-col items-center z-10 pointer-events-none">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 text-slate-400 mb-2">Student Identity Card</span>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{data.name}</h2>
        <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 border border-slate-200">
          Class {data.class}
        </span>
      </div>

      {/* 2. MAIN STATUS CORE */}
      <div className="flex flex-col items-center animate-in zoom-in-90 duration-700">
        <div className="relative mb-8">
           {isSafe ? (
             <CheckCircle2 size={180} className="text-emerald-500 shadow-emerald-100 shadow-2xl rounded-full" strokeWidth={2.5} />
           ) : noActivity ? (
             <Clock size={180} className="text-slate-100" strokeWidth={2.5} />
           ) : (
             <AlertCircle size={180} className="text-amber-500 shadow-amber-100 shadow-2xl rounded-full" strokeWidth={2.5} />
           )}
           {isSyncing && (
             <div className="absolute -top-4 -right-4 bg-white/20 p-2 rounded-full animate-spin">
               <RefreshCcw size={16} />
             </div>
           )}
        </div>

        <h1 className={cn(
          "text-8xl font-black tracking-tighter mb-4",
          isSafe ? "text-emerald-600" : (noActivity ? "text-slate-200" : "text-amber-600")
        )}>
          {isSafe ? "AMAN" : (noActivity ? "STANDBY" : "BELUM AMAN")}
        </h1>
        
        <p className="text-xl font-bold uppercase tracking-tight text-slate-400 max-w-sm leading-snug">
          {isSafe 
            ? "Semua perangkat harian sudah berada di kantor." 
            : (noActivity ? "Belum ada aktivitas pengambilan hari ini." : "Segera kembalikan perangkat Anda ke kantor.")}
        </p>
      </div>

      {/* 3. DYNAMIC DEVICE LIST */}
      {!noActivity && (
        <div className="mt-12 w-full max-w-[340px] space-y-3">
          {data.devices.map((device, idx) => (
            <div 
              key={`${device.id}-${idx}`} 
              className={cn(
                "flex items-center justify-between p-5 rounded-card border-2 backdrop-blur-xl transition-all duration-500",
                device.isReturned 
                  ? "bg-emerald-50 border-emerald-100 text-emerald-900 shadow-sm" 
                  : "bg-slate-50 border-slate-100 text-slate-400"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-xl">
                  {device.type === "LAPTOP" ? <Laptop size={24} /> : <Smartphone size={24} />}
                </div>
                <span className="text-lg font-black uppercase tracking-tighter text-slate-800">{device.name}</span>
              </div>
              <div className="flex items-center">
                {device.isReturned ? (
                  <CheckCircle2 size={24} className="text-emerald-500" />
                ) : (
                  <AlertCircle size={24} className="text-slate-200" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. METADATA FOOTER */}
      <div className="fixed bottom-12 left-0 right-0 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-full text-slate-400 font-black uppercase tracking-widest text-[10px] shadow-sm">
          <Clock size={14} className="text-indigo-400" />
          Batas: {SYSTEM_CONFIG.RETURN_DEADLINE_HOUR}:00 WIB
        </div>
        
        <div className="mt-2 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">
          <RefreshCcw size={8} className={cn(isSyncing && "animate-spin")} />
          Sync: {new Date(data.lastSync).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>
      </div>
    </div>
  );
}

function LoaderPulse() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute h-32 w-32 rounded-full border-4 border-primary/20 animate-ping" />
      <div className="absolute h-24 w-24 rounded-full border-2 border-primary/30 animate-pulse" />
      <ShieldAlert size={48} className="text-primary animate-bounce" />
    </div>
  );
}

function ShieldAlert({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
