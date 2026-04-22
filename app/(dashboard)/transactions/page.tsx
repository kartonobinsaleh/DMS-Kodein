"use client";

import { useEffect, useState } from "react";
import { useTransactionStore } from "@/store/use-transaction-store";
import { useDeviceStore } from "@/store/use-device-store";
import { useStudentStore } from "@/store/use-student-store";
import { 
  ArrowRightLeft, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  User,
  Smartphone,
  Plus,
  Search
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { checkIfOverdue } from "@/lib/business-logic";
import { CheckOutButton, CheckInButton } from "@/components/daily-log-actions";

export default function TransactionsPage() {
  const { transactions, borrowDevice, returnDevice } = useTransactionStore();
  const { devices, fetchDevices } = useDeviceStore();
  const { students, fetchStudents } = useStudentStore();
  
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string>("");
  
  const [borrowData, setBorrowData] = useState({ studentId: "", deviceId: "" });
  const [returnCondition, setReturnCondition] = useState("Normal");

  useEffect(() => {
    fetchDevices();
    fetchStudents();
    // In a real app we'd fetch transactions too, but let's assume they're loaded or we add a fetch
  }, [fetchDevices, fetchStudents]);

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await borrowDevice(borrowData);
      setShowBorrowModal(false);
      setBorrowData({ studentId: "", deviceId: "" });
      fetchDevices(); // Refresh availability
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to borrow");
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await returnDevice({ transactionId: selectedTransaction, condition: returnCondition });
      setShowReturnModal(false);
      setSelectedTransaction("");
      fetchDevices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to return");
    }
  };

  const activeTransactions = transactions.filter(t => t.status === "ACTIVE");
  const availableDevices = devices.filter(d => d.status === "AVAILABLE");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Track hardware borrow and return history.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowReturnModal(true)}
            className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-600 transition-all hover:bg-emerald-500/20 active:scale-95"
          >
            <ArrowDownLeft size={18} />
            <span>Return Device</span>
          </button>
          <button
            onClick={() => setShowBorrowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
          >
            <ArrowUpRight size={18} />
            <span>Borrow Device</span>
          </button>
        </div>
      </div>

      {/* Daily Operations Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50/50 border border-blue-100 rounded-2xl">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-blue-900">Daily Check-Out</h2>
          <p className="text-xs text-blue-700/70 mb-4">Assign device for today's session.</p>
          <div className="flex flex-wrap gap-4 items-end">
             <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-bold uppercase mb-1 text-blue-900/50">Student & Device</label>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    onChange={(e) => setBorrowData({ ...borrowData, studentId: e.target.value })}
                  >
                    <option value="">Select Student...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select 
                    className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    onChange={(e) => setBorrowData({ ...borrowData, deviceId: e.target.value })}
                  >
                    <option value="">Select Device...</option>
                    {availableDevices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <CheckOutButton 
                    studentId={borrowData.studentId} 
                    deviceId={borrowData.deviceId} 
                    onSuccess={() => fetchDevices()} 
                  />
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-green-900">Daily Check-In</h2>
          <p className="text-xs text-green-700/70 mb-4">Complete today's session.</p>
          <div className="flex flex-wrap gap-4 items-end">
             <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-bold uppercase mb-1 text-green-900/50">Student & Device</label>
                <div className="flex gap-2">
                  {/* For simplicity we reuse borrow fields to select student/device for return */}
                  <select 
                    className="flex-1 rounded-lg border border-green-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    onChange={(e) => setBorrowData({ ...borrowData, studentId: e.target.value })}
                  >
                    <option value="">Select Student...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select 
                    className="flex-1 rounded-lg border border-green-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    onChange={(e) => setBorrowData({ ...borrowData, deviceId: e.target.value })}
                  >
                    <option value="">Select Device...</option>
                    {devices.filter(d => d.status === "BORROWED").map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <CheckInButton 
                    studentId={borrowData.studentId} 
                    deviceId={borrowData.deviceId} 
                    onSuccess={() => fetchDevices()} 
                  />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <h3 className="font-semibold">Recent Activity</h3>
        </div>
        <div className="divide-y divide-border">
          {transactions.length > 0 ? (
            transactions.map((tx) => {
              const isOverdue = checkIfOverdue(tx.borrowTime, tx.status);

              return (
                <div
                  key={tx.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-muted/20 transition-colors gap-4"
                >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "rounded-full p-2.5",
                    tx.status === "ACTIVE" ? "bg-blue-500/10 text-blue-500" : "bg-slate-500/10 text-slate-500"
                  )}>
                    {tx.status === "ACTIVE" ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="font-semibold">Transaction #{tx.id.slice(-6)}</span>
                       <StatusBadge status={tx.status} />
                       {isOverdue && <StatusBadge status="MAINTENANCE" className="bg-rose-500 text-white border-none animate-pulse">OVERDUE</StatusBadge>}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User size={12}/> Student ID: {tx.studentId}</span>
                      <span className="flex items-center gap-1"><Smartphone size={12}/> Device ID: {tx.deviceId}</span>
                      <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(tx.borrowTime).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                {tx.returnTime && (
                    <div className="text-right text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg border border-border">
                      <p className="font-medium text-foreground">Returned At</p>
                      <p>{new Date(tx.returnTime).toLocaleString()}</p>
                      <p className="italic mt-1">&quot;{tx.condition}&quot;</p>
                    </div>
                )}
              </div>
            );
          })
        ) : (
            <div className="p-12 text-center text-muted-foreground">
              <ArrowRightLeft size={48} className="mx-auto mb-4 opacity-10" />
              No transaction history yet.
            </div>
          )}
        </div>
      </div>

      {/* Borrow Modal */}
      {showBorrowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl">
            <h2 className="text-xl font-bold">Borrow Device</h2>
            <p className="text-sm text-muted-foreground mt-1">Assign a device to a student.</p>
            
            <form onSubmit={handleBorrow} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Select Student</label>
                <select
                  value={borrowData.studentId}
                  onChange={(e) => setBorrowData({ ...borrowData, studentId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                >
                  <option value="">Choose a student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Select Available Device</label>
                <select
                  value={borrowData.deviceId}
                  onChange={(e) => setBorrowData({ ...borrowData, deviceId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                >
                  <option value="">Choose a device...</option>
                  {availableDevices.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowBorrowModal(false)} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted">Cancel</button>
                <button type="submit" disabled={!borrowData.studentId || !borrowData.deviceId} className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Confirm Borrow</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-emerald-600">Return Device</h2>
            <p className="text-sm text-muted-foreground mt-1">Mark an active loan as completed.</p>
            
            <form onSubmit={handleReturn} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Select Active Transaction</label>
                <select
                  value={selectedTransaction}
                  onChange={(e) => setSelectedTransaction(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                >
                  <option value="">Choose a transaction...</option>
                  {activeTransactions.map(t => (
                    <option key={t.id} value={t.id}>Device ID {t.deviceId} - Student {t.studentId}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Device Condition</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                >
                  <option value="Normal">Normal</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Missing Parts">Missing Parts</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowReturnModal(false)} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted">Cancel</button>
                <button type="submit" disabled={!selectedTransaction} className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700">Confirm Return</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
