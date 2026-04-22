import { create } from "zustand";

interface Device {
  id: string;
  name: string;
  type: "LAPTOP" | "PHONE";
  ownerId?: string;
  status: "AVAILABLE" | "BORROWED" | "MAINTENANCE";
  createdAt: string;
}

interface DeviceState {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  fetchDevices: () => Promise<void>;
  addDevice: (data: { name: string; type: string; ownerId?: string }) => Promise<void>;
  updateDevice: (id: string, name: string) => Promise<void>;
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

  addDevice: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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

  updateDevice: async (id: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/devices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const errorText = await response.text();
      if (!response.ok) throw new Error(errorText || "Failed to update device");
      
      let updatedData = { name };
      try { updatedData = JSON.parse(errorText).data || JSON.parse(errorText); } catch(e) {}

      set((state) => ({
        devices: state.devices.map(d => d.id === id ? { ...d, ...updatedData } : d),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteDevice: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/devices?id=${id}`, {
        method: "DELETE",
      });
      const errorText = await response.text();
      if (!response.ok) throw new Error(errorText || "Failed to delete device");
      set((state) => ({
        devices: state.devices.filter((d) => d.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));
