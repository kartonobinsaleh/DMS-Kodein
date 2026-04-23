"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { PageContainer } from "@/components/ui/page-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Clock, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [deadline, setDeadline] = useState("17:00");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.success) {
        const deadlineSetting = json.data.find((s: any) => s.key === "check_in_deadline");
        if (deadlineSetting) setDeadline(deadlineSetting.value);
      }
    } catch (error) {
      toast.error("Gagal memuat pengaturan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "check_in_deadline",
          value: deadline
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Pengaturan berhasil disimpan");
      } else {
        throw new Error(json.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan pengaturan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Pengaturan Sistem"
        subtitle="Konfigurasi parameter operasional dan kebijakan otomatis aplikasi."
      />

      <div className="max-w-2xl space-y-6">
        <Card className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-primary-light text-primary rounded-xl">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Kebijakan Waktu Operasional</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Batas Akhir Pengembalian (Check-In)</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Jam Deadline Sore
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="time"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-xl font-black text-primary focus:border-primary focus:bg-white outline-none transition-all shadow-inner"
                />
                <div className="hidden sm:block text-xs text-gray-400 font-medium max-w-[200px]">
                  Siswa yang melakukan check-in setelah jam ini akan otomatis ditandai sebagai <span className="text-red-500 font-bold">Terlambat</span>.
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Button
                onClick={handleSave}
                loading={isSaving}
                className="w-full sm:w-auto h-12 px-10 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
                leftIcon={<Save size={16} />}
              >
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gray-50/50 border-dashed border-2 border-gray-200">
          <div className="flex gap-4">
            <div className="mt-1 text-gray-400">
              <ShieldCheck size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-tight">Keamanan Konfigurasi</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Pengaturan ini berdampak langsung pada seluruh laporan monitoring harian. Hanya akun dengan level akses <span className="font-bold text-primary">ADMIN</span> yang dapat melakukan perubahan ini.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
