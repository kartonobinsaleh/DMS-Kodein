"use client";

import { useEffect, useState } from "react";
import { useDeviceStore } from "@/store/use-device-store";
import { Plus, Search, Smartphone, Laptop, Trash2, Database, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { ActionBar } from "@/components/ui/action-bar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DevicesPage() {
  const { devices, isLoading, fetchDevices, addDevice, deleteDevice } = useDeviceStore();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const filteredDevices = Array.isArray(devices) ? devices.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;
    setSubmitLoading(true);
    try {
      await useDeviceStore.getState().addDevice(newDeviceName);
      setNewDeviceName("");
      setShowAddModal(false);
      toast.success("Catatan perangkat berhasil ditambahkan");
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan perangkat");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim() || !activeDeviceId) return;
    setSubmitLoading(true);
    try {
      await useDeviceStore.getState().updateDevice(activeDeviceId, newDeviceName);
      setNewDeviceName("");
      setActiveDeviceId(null);
      setShowEditModal(false);
      toast.success("Catatan perangkat berhasil diperbarui");
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui perangkat");
    } finally {
      setSubmitLoading(false);
    }
  };

  const openEditModal = (device: any) => {
    setNewDeviceName(device.name);
    setActiveDeviceId(device.id);
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (deviceToDelete) {
      setSubmitLoading(true);
      try {
        await useDeviceStore.getState().deleteDevice(deviceToDelete);
        toast.success("Perangkat berhasil dihapus");
      } catch (error: any) {
        toast.error(error.message || "Gagal menghapus perangkat");
      } finally {
        setSubmitLoading(false);
        setDeviceToDelete(null);
      }
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Data Perangkat"
        subtitle="Daftar seluruh unit perangkat dalam sistem dan status siaganya."
      />

      <ActionBar>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Cari perangkat berdasarkan nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-primary outline-none shadow-sm transition-all placeholder:text-gray-400"
          />
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto h-12 px-6 rounded-xl text-xs font-bold uppercase tracking-widest shrink-0 shadow-sm"
          leftIcon={<Plus size={16} />}
        >
          Registrasi Perangkat Baru
        </Button>
      </ActionBar>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && devices.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </Card>
          ))
        ) : filteredDevices.length > 0 ? (
          filteredDevices.map((device) => (
            <Card key={device.id} className="p-4 flex flex-col justify-between group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                    {device.name.toLowerCase().includes('laptop') ? <Laptop size={18} /> : <Smartphone size={18} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 leading-none mb-1">{device.name}</h3>
                    <p className="text-[10px] text-gray-400 font-medium">ID: {device.id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(device)}
                    className="p-1 h-auto text-gray-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={14} />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeviceToDelete(device.id)}
                    className="p-1 h-auto text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <StatusBadge status={device.status} />
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-sm text-gray-400 italic">Perangkat tidak ditemukan.</div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!deviceToDelete}
        onClose={() => setDeviceToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Perangkat"
        description="Hapus permanen perangkat ini dari catatan sistem."
      />

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/20 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-xl border border-gray-200 animate-in zoom-in-95 duration-150">
             <h2 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="p-1.5 bg-primary-light text-primary rounded-lg"><Database size={16} /></div>
              Registrasi Perangkat Baru
            </h2>
            <form onSubmit={handleAddDevice} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama / Label Unit</label>
                <input
                  autoFocus
                  type="text"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="e.g. Laptop 05"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowAddModal(false)} variant="ghost" className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest border border-gray-200">Batal</Button>
                <Button type="submit" loading={submitLoading} disabled={!newDeviceName.trim() || submitLoading} className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest">Simpan Perangkat</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/20 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-xl border border-gray-200 animate-in zoom-in-95 duration-150">
             <h2 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="p-1.5 bg-primary-light text-primary rounded-lg"><Edit2 size={16} /></div>
              Perbaiki Data Perangkat
            </h2>
            <form onSubmit={handleEditDevice} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama / Label Unit</label>
                <input
                  autoFocus
                  type="text"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="e.g. Laptop 05"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowEditModal(false)} variant="ghost" className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest border border-gray-200">Batal</Button>
                <Button type="submit" loading={submitLoading} disabled={!newDeviceName.trim() || submitLoading} className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest">Simpan Perubahan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
