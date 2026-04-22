import { create } from "zustand";

interface Device {
  id: string;
  name: string;
  status: "AVAILABLE" | "BORROWED" | "MAINTENANCE";
  createdAt: string;
}

interface DeviceState {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  fetchDevices: () => Promise<void>;
  addDevice: (name: string) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [],
  isLoading: false,
  error: null,

  fetchDevices: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/devices");
      if (!response.ok) throw new Error("Failed to fetch devices");
      const json = await response.json();
      // Handle the { success: boolean, data: array } format
      set({ devices: Array.isArray(json.data) ? json.data : [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addDevice: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Failed to add device");
      const json = await response.json();
      // Handle { success: true, data: device }
      const newDevice = json.data || json;
      set((state) => ({
        devices: [newDevice, ...state.devices],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteDevice: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/devices?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete device");
      set((state) => ({
        devices: state.devices.filter((d) => d.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
