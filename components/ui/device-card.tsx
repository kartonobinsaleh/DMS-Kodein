import { Laptop, Smartphone, Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

interface DeviceCardProps {
  studentName: string;
  studentClass: string;
  deviceName: string;
  deviceType: "LAPTOP" | "PHONE" | string;
  status: string;
  checkOutTime?: string | null;
  checkInTime?: string | null;
  className?: string;
}

export function DeviceCard({
  studentName,
  studentClass,
  deviceName,
  deviceType,
  status,
  checkOutTime,
  checkInTime,
  className
}: DeviceCardProps) {
  return (
    <div className={cn(
      "p-6 bg-white border border-slate-100 rounded-card shadow-card hover:border-indigo-100 transition-all duration-300",
      className
    )}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
            {deviceType.toUpperCase() === "LAPTOP" ? <Laptop size={20} /> : <Smartphone size={20} />}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 tracking-tight text-lg leading-none">{studentName}</h3>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">{studentClass}</p>
          </div>
        </div>
        <StatusBadge status={status} className="scale-90 origin-right" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">{deviceName}</span>
        </div>

        <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-slate-200" />
            <span>Keluar: {checkOutTime ? new Date(checkOutTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : "--:--"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-slate-200" />
            <span>Masuk: {checkInTime ? new Date(checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : "--:--"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
