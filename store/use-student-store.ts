import { create } from "zustand";

interface Student {
  id: string;
  name: string;
  class: string;
  statusToken: string;
  createdAt: string;
}

interface StudentState {
  students: Student[];
  isLoading: boolean;
  error: string | null;
  fetchStudents: () => Promise<void>;
  addStudent: (data: { name: string; class: string }) => Promise<void>;
  updateStudent: (id: string, data: { name: string; class: string }) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
}

export const useStudentStore = create<StudentState>((set) => ({
  students: [],
  isLoading: false,
  error: null,

  fetchStudents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/students");
      if (!response.ok) throw new Error("Failed to fetch students");
      const json = await response.json();
      // Handle the { success: boolean, data: array } format
      set({ students: Array.isArray(json.data) ? json.data : [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addStudent: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add student");
      const json = await response.json();
      // Expecting { success: true, data: newStudent } or just newStudent based on API state
      const newStudent = json.data || json;
      set((state) => ({
        students: [newStudent, ...state.students],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateStudent: async (id: string, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const errorText = await response.text();
      if (!response.ok) throw new Error(errorText || "Failed to update student");
      
      let updatedData = null;
      try { updatedData = JSON.parse(errorText).data || JSON.parse(errorText); } catch(e) { updatedData = data; }

      set((state) => ({
        students: state.students.map(s => s.id === id ? { ...s, ...updatedData } : s),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteStudent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/students?id=${id}`, {
        method: "DELETE",
      });
      const errorText = await response.text();
      if (!response.ok) throw new Error(errorText || "Failed to delete student");
      set((state) => ({
        students: state.students.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));
