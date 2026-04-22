"use client";

import { useEffect, useState } from "react";
import { useDeviceStore } from "@/store/use-device-store";
import { Plus, Search, Smartphone, Laptop, Trash2, Smartphone as MobileIcon, LayoutGrid } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { cn } from "@/lib/utils";

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
    <div className="p-4 md:p-8 space-y-10 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-[10px]">
            <Smartphone size={14} />
            <span>Inventaris Perangkat</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Devices</h1>
          <p className="text-sm font-medium text-slate-500">Kelola unit perangkat keras dan status ketersediaan.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95 uppercase tracking-widest"
        >
          <Plus size={20} />
          <span>Tambah Unit</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative group max-w-2xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Cari nama perangkat atau ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[2rem] border border-slate-200 bg-white pl-14 pr-6 py-5 text-sm font-bold focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none outline-none transition-all shadow-sm"
        />
      </div>

      {/* Grid View */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && devices.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-[2rem] bg-slate-100" />
          ))
        ) : filteredDevices.length > 0 ? (
          filteredDevices.map((device) => (
            <div
              key={device.id}
              className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 transition-all hover:shadow-2xl hover:border-indigo-100 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  {device.name.toLowerCase().includes('laptop') || device.name.toLowerCase().includes('book') ? <Laptop size={24} /> : <MobileIcon size={24} />}
                </div>
                <button 
                  onClick={() => setDeviceToDelete(device.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="mt-8 relative z-10">
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{device.name}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">ID: {device.id}</p>
              </div>

              <div className="mt-8 flex items-center justify-between relative z-10 pt-4 border-t border-slate-50">
                <StatusBadge status={device.status} />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                  Sejak {new Date(device.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="absolute -right-6 -bottom-6 text-slate-50 opacity-20 transition-all group-hover:scale-125 group-hover:text-indigo-50">
                {device.name.toLowerCase().includes('laptop') ? <Laptop size={140} /> : <MobileIcon size={140} />}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-200 bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
            <LayoutGrid size={64} className="mb-4 opacity-10" />
            <p className="font-black uppercase tracking-widest text-xs">Belum ada perangkat terdaftar</p>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!deviceToDelete}
        onClose={() => setDeviceToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Unit Perangkat"
        description="Apakah Anda yakin ingin menghapus unit perangkat ini dari inventaris? Aksi ini tidak dapat dibatalkan."
      />

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md scale-in rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Tambah Perangkat</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Daftarkan unit perangkat keras baru.</p>
            
            <form onSubmit={handleAddDevice} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Perangkat</label>
                <input
                  autoFocus
                  type="text"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="Contoh: Chromebook 01 atau Tablet 18"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none outline-none transition-all"
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-2xl border border-slate-200 py-4 text-sm font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newDeviceName.trim()}
                  className="flex-1 rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest active:scale-95 disabled:opacity-50"
                >
                  Simpan Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
