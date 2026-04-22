"use client";

import { useState } from "react";
import { LogOut, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is used based on typical premium setup, if not we fall back to alert

interface DailyLogActionsProps {
  studentId: string;
  deviceId: string;
  onSuccess?: () => void;
}

export function CheckOutButton({ studentId, deviceId, onSuccess }: DailyLogActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/check-out", {
        method: "POST",
        body: JSON.stringify({ studentId, deviceId }),
      });
      const json = await res.json();
      
      if (json.success) {
        toast?.success?.("Device checked out successfully") || alert("Success: Device checked out");
        onSuccess?.();
      } else {
        toast?.error?.(json.message) || alert(`Error: ${json.message}`);
      }
    } catch (error) {
      toast?.error?.("System error during check-out") || alert("Failed to check out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckOut}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-medium text-sm shadow-sm"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
      Check Out Device
    </button>
  );
}

export function CheckInButton({ studentId, deviceId, onSuccess }: DailyLogActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        body: JSON.stringify({ studentId, deviceId }),
      });
      const json = await res.json();
      
      if (json.success) {
        toast?.success?.("Device checked in successfully") || alert("Success: Device checked in");
        onSuccess?.();
      } else {
        toast?.error?.(json.message) || alert(`Error: ${json.message}`);
      }
    } catch (error) {
      toast?.error?.("System error during check-in") || alert("Failed to check in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckIn}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all font-medium text-sm shadow-sm"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
      Check In Device
    </button>
  );
}
