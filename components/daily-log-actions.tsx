"use client";

import { useState } from "react";
import { LogOut, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DailyLogActionsProps {
  studentId: string;
  deviceId: string;
  onSuccess?: () => void;
  variant?: "primary" | "success";
  className?: string;
  disabled?: boolean;
}

export function CheckOutButton({ studentId, deviceId, onSuccess, className, disabled }: DailyLogActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckOut = async () => {
    if (!studentId || !deviceId) {
      toast.error("Pilih siswa dan perangkat terlebih dahulu");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/check-out", {
        method: "POST",
        body: JSON.stringify({ studentId, deviceId }),
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success("Check-out berhasil");
        onSuccess?.();
      } else {
        toast.error(json.message);
      }
    } catch (error) {
      toast.error("Gagal melakukan check-out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckOut}
      disabled={loading || disabled}
      className={cn(
        "flex w-full items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all font-bold text-sm shadow-md shadow-indigo-200",
        className
      )}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
      CHECK OUT
    </button>
  );
}

export function CheckInButton({ studentId, deviceId, onSuccess, className, disabled }: DailyLogActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (!studentId || !deviceId) {
      toast.error("Pilih siswa dan perangkat terlebih dahulu");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        body: JSON.stringify({ studentId, deviceId }),
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success("Check-in berhasil");
        onSuccess?.();
      } else {
        toast.error(json.message);
      }
    } catch (error) {
      toast.error("Gagal melakukan check-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckIn}
      disabled={loading || disabled}
      className={cn(
        "flex w-full items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 disabled:opacity-50 transition-all font-bold text-sm shadow-md shadow-emerald-200",
        className
      )}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
      CHECK IN
    </button>
  );
}
