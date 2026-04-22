"use client";

import { useEffect, useState } from "react";
import { useDeviceStore } from "@/store/use-device-store";
import { Plus, Search, Smartphone, MoreVertical } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export default function DevicesPage() {
  const { devices, isLoading, fetchDevices, addDevice } = useDeviceStore();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const filteredDevices = devices.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;
    await addDevice(newDeviceName);
    setNewDeviceName("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
          <p className="text-muted-foreground">Manage your hardware inventory.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
        >
          <Plus size={18} />
          <span>Add Device</span>
        </button>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search devices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Grid View */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && devices.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />
          ))
        ) : filteredDevices.length > 0 ? (
          filteredDevices.map((device) => (
            <div
              key={device.id}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                  <Smartphone size={24} />
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreVertical size={18} />
                </button>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold">{device.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">ID: {device.id}</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <StatusBadge status={device.status} />
                <span className="text-[10px] text-muted-foreground">
                  Added {new Date(device.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Smartphone size={48} className="mb-4 opacity-20" />
            <p>No devices found.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md scale-in rounded-2xl border border-border bg-card p-8 shadow-2xl">
            <h2 className="text-xl font-bold">Add New Device</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter the name of the new hardware unit.</p>
            
            <form onSubmit={handleAddDevice} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Device Name</label>
                <input
                  autoFocus
                  type="text"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="e.g. Chromebook 42"
                  className="mt-1 w-full rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newDeviceName.trim()}
                  className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Save Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
