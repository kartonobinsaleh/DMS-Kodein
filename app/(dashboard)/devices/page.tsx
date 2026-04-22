"use client";

import { useEffect, useState } from "react";
import { useDeviceStore } from "@/store/use-device-store";
import { Plus, Search, Smartphone, Laptop, Trash2, Smartphone as MobileIcon, LayoutGrid } from "lucide-react";
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
    <div className="space-y-12 page-fade-in pb-32">
      <PageHeader
        title="Perangkat"
        subtitle="Kelola inventaris dan unit perangkat DMS."
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative group w-full max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Cari perangkat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-6 py-4 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          size="lg"
          leftIcon={<Plus size={20} />}
          className="w-full md:w-auto"
        >
          Tambah Perangkat
        </Button>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && devices.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-card bg-white border border-slate-50" />
          ))
        ) : filteredDevices.length > 0 ? (
          filteredDevices.map((device) => (
            <div
              key={device.id}
              className="group relative rounded-card border border-slate-100 bg-white p-8 shadow-card hover:border-indigo-100 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-2xl bg-slate-50 p-4 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300">
                  {device.name.toLowerCase().includes('laptop') || device.name.toLowerCase().includes('book') ? <Laptop size={24} /> : <MobileIcon size={24} />}
                </div>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeviceToDelete(device.id)}
                  className="text-slate-100 hover:text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 size={18} />
                </Button>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-2">{device.name}</h3>
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">ID: {device.id}</p>
              </div>

              <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50">
                <StatusBadge status={device.status} className="scale-90 origin-left" />
                <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest">
                  {new Date(device.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-40 flex flex-col items-center justify-center text-slate-200 bg-white border border-slate-100 rounded-container">
            <LayoutGrid size={64} className="mb-4 opacity-50" />
            <p className="font-bold uppercase tracking-widest text-xs">Belum ada perangkat</p>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!deviceToDelete}
        onClose={() => setDeviceToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Perangkat"
        description="Aksi ini akan menghapus perangkat dari sistem inventaris."
      />

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-container border border-slate-100 bg-white p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-2">Perangkat Baru</h2>
            <p className="text-sm text-slate-400 font-medium mb-10">Masukkan nama perangkat untuk didaftarkan.</p>
            
            <form onSubmit={handleAddDevice} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Perangkat</label>
                <input
                  autoFocus
                  type="text"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="Contoh: Laptop 01"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="flex gap-4 pt-6">
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="ghost"
                  className="flex-1 text-slate-400"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={!newDeviceName.trim()}
                  className="flex-1"
                >
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
