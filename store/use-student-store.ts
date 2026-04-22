import { create } from "zustand";

interface Student {
  id: string;
  name: string;
  class: string;
  createdAt: string;
}

interface StudentState {
  students: Student[];
  isLoading: boolean;
  error: string | null;
  fetchStudents: () => Promise<void>;
  addStudent: (data: { name: string; class: string }) => Promise<void>;
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
      const data = await response.json();
      set({ students: data, isLoading: false });
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
      const newStudent = await response.json();
      set((state) => ({
        students: [newStudent, ...state.students],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteStudent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/students?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete student");
      set((state) => ({
        students: state.students.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
