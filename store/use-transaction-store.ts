import { create } from "zustand";

interface Transaction {
  id: string;
  studentId: string;
  deviceId: string;
  borrowTime: string;
  returnTime?: string | null;
  status: "ACTIVE" | "COMPLETED";
  condition?: string | null;
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  borrowDevice: (data: { studentId: string; deviceId: string }) => Promise<void>;
  returnDevice: (data: { transactionId: string; condition: string }) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,

  borrowDevice: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/transactions/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to borrow device");
      
      set((state) => ({
        transactions: [result.data, ...state.transactions],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  returnDevice: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/transactions/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to return device");

      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === data.transactionId ? result.data : t
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));
