import { Laptop, Smartphone, User, Clock } from "lucide-react";
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
      "group relative p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300",
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-50 text-slate-500 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
            {deviceType.toUpperCase() === "LAPTOP" ? <Laptop size={22} /> : <Smartphone size={22} />}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 leading-tight">{studentName}</h3>
            <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{studentClass}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-slate-700">{deviceName}</span>
        </div>

        <div className="pt-3 border-t border-slate-50 flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-slate-300" />
            <span>Out: {checkOutTime ? new Date(checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-slate-300" />
            <span>In: {checkInTime ? new Date(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
