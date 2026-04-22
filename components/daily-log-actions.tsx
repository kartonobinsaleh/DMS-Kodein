"use client";

import { useState } from "react";
import { LogOut, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface DailyLogActionsProps {
  studentId: string;
  deviceId: string;
  onSuccess?: () => void;
  className?: string;
  disabled?: boolean;
}

export function CheckOutButton({ studentId, deviceId, onSuccess, className, disabled }: DailyLogActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCheckOut = async () => {
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
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        loading={loading}
        disabled={disabled}
        variant="primary"
        size="md"
        leftIcon={<LogOut size={18} />}
        className={className}
      >
        CHECK-OUT
      </Button>

      <ConfirmationModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleCheckOut}
        variant="info"
        title="Konfirmasi Check-Out"
        description="Apakah Anda yakin ingin memproses pengeluaran perangkat untuk siswa ini?"
        confirmText="Ya, Keluarkan"
        cancelText="Batal"
      />
    </>
  );
}

export function CheckInButton({ studentId, deviceId, onSuccess, className, disabled }: DailyLogActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCheckIn = async () => {
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
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        loading={loading}
        disabled={disabled}
        variant="success"
        size="md"
        leftIcon={<LogIn size={18} />}
        className={className}
      >
        CHECK-IN
      </Button>

      <ConfirmationModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleCheckIn}
        variant="info"
        title="Konfirmasi Check-In"
        description="Apakah Anda yakin perangkat sudah kembali dalam kondisi baik?"
        confirmText="Ya, Sudah Kembali"
        cancelText="Batal"
      />
    </>
  );
}
