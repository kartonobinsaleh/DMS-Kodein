"use client";

import { useState } from "react";
import { LogOut, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface DailyLogActionsProps {
  studentId: string;
  deviceId: string;
  onSuccess?: () => void;
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
    <Button
      onClick={handleCheckOut}
      loading={loading}
      disabled={disabled}
      variant="primary"
      size="md"
      leftIcon={<LogOut size={18} />}
      className={className}
    >
      CHECK-OUT DEVICE
    </Button>
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
    <Button
      onClick={handleCheckIn}
      loading={loading}
      disabled={disabled}
      variant="success"
      size="md"
      leftIcon={<LogIn size={18} />}
      className={className}
    >
      CHECK-IN DEVICE
    </Button>
  );
}
