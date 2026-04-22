import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  isActive: boolean;
  createdAt: string;
}

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (data: any) => Promise<void>;
  updateUser: (id: string, data: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        if (response.status === 403) throw new Error("Akses Ditolak: Fitur Khusus Administrator");
        throw new Error("Gagal mengambil data user");
      }
      const json = await response.json();
      set({ users: Array.isArray(json.data) ? json.data : [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false, users: [] });
    }
  },

  addUser: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const errorText = await response.text();
      if (!response.ok) throw new Error(errorText || "Gagal menambah user");
      
      let parsedData;
      try { parsedData = JSON.parse(errorText).data; } catch(e) { parsedData = data; }

      set((state) => ({
        users: [parsedData, ...state.users],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateUser: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const errorText = await response.text();
      if (!response.ok) throw new Error(errorText || "Gagal memperbarui user");

      let parsedData;
      try { parsedData = JSON.parse(errorText).data; } catch(e) { parsedData = data; }

      set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, ...parsedData } : u)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const errorText = await response.text();
      if (!response.ok) throw new Error(errorText || "Gagal menghapus user");
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));
