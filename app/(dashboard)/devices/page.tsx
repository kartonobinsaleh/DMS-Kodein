"use client";

import { useEffect, useState } from "react";
import { useDeviceStore } from "@/store/use-device-store";
import { Plus, Search, Smartphone, Laptop, Trash2, Database } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

export default function DevicesPage() {
  const { devices, isLoading, fetchDevices, addDevice, deleteDevice } = useDeviceStore();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const filteredDevices = Array.isArray(devices) ? devices.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;
    await addDevice(newDeviceName);
    setNewDeviceName("");
    setShowAddModal(false);
  };

  const handleDelete = async () => {
    if (deviceToDelete) {
      await deleteDevice(deviceToDelete);
      setDeviceToDelete(null);
    }
  };

  return (
    <div className="space-y-4 page-fade-in pb-10">
      <PageHeader
        title="Manajemen Perangkat"
        subtitle="Kelola inventaris perangkat siswa dan status operasional harian."
      />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Cari perangkat berdasarkan nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:border-indigo-600 outline-none transition-all placeholder:text-gray-400"
          />
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          size="sm"
          leftIcon={<Plus size={14} />}
        >
          Tambah Perangkat
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && devices.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-white border border-gray-200" />
          ))
        ) : filteredDevices.length > 0 ? (
          filteredDevices.map((device) => (
            <div key={device.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between group">
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
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeviceToDelete(device.id)}
                  className="p-1 h-auto text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <StatusBadge status={device.status} />
              </div>
            </div>
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
             <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Database size={16} className="text-indigo-600" />
              Registrasi Perangkat Baru
            </h2>
            <form onSubmit={handleAddDevice} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 ml-1">Label Perangkat</label>
                <input
                  autoFocus
                  type="text"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="e.g. Laptop 05"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none transition-all"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => setShowAddModal(false)} variant="ghost" className="flex-1">Batal</Button>
                <Button type="submit" disabled={!newDeviceName.trim()} className="flex-1">Simpan Perangkat</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
