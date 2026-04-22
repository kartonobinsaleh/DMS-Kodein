"use client";

import { useEffect, useState } from "react";
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

export default function StudentStatusPage({ params }: { params: { token: string } }) {
  const [data, setData] = useState<StudentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchStatus = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsSyncing(true);

    try {
      const res = await fetch(`/api/attendance/${params.token}`);
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
  }, [params.token]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <div className="flex flex-col items-center">
        <LoaderPulse />
        <p className="mt-8 text-xs font-black tracking-[0.3em] opacity-40 uppercase animate-pulse">Initializing Security Sync</p>
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
      "min-h-screen flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 ease-in-out",
      isSafe ? "bg-emerald-600" : (noActivity ? "bg-slate-900" : "bg-amber-500")
    )}>
      {/* 1. STUDENT IDENTITY HEADER */}
      <div className="fixed top-10 left-0 right-0 flex flex-col items-center z-10 pointer-events-none">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 text-white mb-1">Student Identity Card</span>
        <h2 className="text-3xl font-black text-white drop-shadow-md tracking-tighter">{data.name}</h2>
        <span className="bg-white/20 px-3 py-0.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest mt-1">
          Class {data.class}
        </span>
      </div>

      {/* 2. MAIN STATUS CORE */}
      <div className="flex flex-col items-center text-white animate-in zoom-in-90 duration-700">
        <div className="relative mb-8">
           {isSafe ? (
             <CheckCircle2 size={180} className="drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]" strokeWidth={2.5} />
           ) : noActivity ? (
             <Clock size={180} className="opacity-20 drop-shadow-2xl" strokeWidth={2.5} />
           ) : (
             <AlertCircle size={180} className="drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]" strokeWidth={2.5} />
           )}
           {isSyncing && (
             <div className="absolute -top-4 -right-4 bg-white/20 p-2 rounded-full animate-spin">
               <RefreshCcw size={16} />
             </div>
           )}
        </div>

        <h1 className="text-8xl font-black drop-shadow-2xl tracking-tighter mb-4">
          {isSafe ? "AMAN" : (noActivity ? "STANDBY" : "BELUM AMAN")}
        </h1>
        
        <p className="text-xl font-bold uppercase tracking-tight opacity-90 max-w-sm leading-snug">
          {isSafe 
            ? "Semua perangkat harian sudah berada di kantor." 
            : (noActivity ? "Belum ada aktivitas pengambilan hari ini." : "Segera kembalikan perangkat Anda ke kantor.")}
        </p>
      </div>

      {/* 3. DYNAMIC DEVICE LIST */}
      {!noActivity && (
        <div className="mt-12 w-full max-w-[340px] space-y-3">
          {data.devices.map(device => (
            <div 
              key={device.id} 
              className={cn(
                "flex items-center justify-between p-5 rounded-[2rem] border-2 backdrop-blur-xl transition-all duration-500",
                device.isReturned 
                  ? "bg-white/20 border-white/20 text-white shadow-lg" 
                  : "bg-black/10 border-white/5 text-white/40"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-xl">
                  {device.type === "LAPTOP" ? <Laptop size={24} /> : <Smartphone size={24} />}
                </div>
                <span className="text-lg font-black uppercase tracking-tighter">{device.name}</span>
              </div>
              <div className="flex items-center">
                {device.isReturned ? (
                  <CheckCircle2 size={24} className="text-white fill-white/20" />
                ) : (
                  <AlertCircle size={24} className="text-white/20" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. METADATA FOOTER */}
      <div className="fixed bottom-12 left-0 right-0 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 px-6 py-3 bg-black/40 backdrop-blur-md rounded-full text-white/70 font-black uppercase tracking-widest text-[10px] border border-white/5">
          <Clock size={14} />
          Batas: {SYSTEM_CONFIG.RETURN_DEADLINE_HOUR}:00 WIB
        </div>
        
        <div className="mt-2 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-white/30">
          <RefreshCcw size={8} className={cn(isSyncing && "animate-spin")} />
          Sync: {new Date(data.lastSync).toLocaleTimeString()}
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
