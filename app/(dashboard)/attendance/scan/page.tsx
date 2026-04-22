"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { 
  Camera, 
  X, 
  Search, 
  ArrowLeft,
  Smartphone,
  Laptop,
  CheckCircle2,
  Zap,
  Loader2
} from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckInButton, CheckOutButton } from "@/components/daily-log-actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

function ScannerContent() {
  const searchParams = useSearchParams();
  const targetType = searchParams.get("target") || "DEVICE"; // LAPTOP | PHONE | DEVICE
  const [operationalMode, setOperationalMode] = useState<"checkin" | "checkout">("checkout");

  const [scannedId, setScannedId] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAutoPilot, setIsAutoPilot] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<{msg: string, type: 'info' | 'success' | 'error'}[]>([]);
  const [lastProcessedId, setLastProcessedId] = useState<string | null>(null);
  
  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [{ msg, type }, ...prev].slice(0, 5));
  };
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Fungsi Inisialisasi Kamera
  const startScanner = async () => {
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("reader");
      }
      
      setIsScanning(true);
      addLog("Kamera diaktifkan", "info");
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (isProcessing) return;
          
          // Normalize: remove prefix if exists
          let cleanId = decodedText;
          let type: 'STUDENT' | 'DEVICE' = 'STUDENT';

          if (decodedText.startsWith("STUDENT_")) {
            cleanId = decodedText.replace("STUDENT_", "");
          } else if (decodedText.startsWith("DEVICE_")) {
            cleanId = decodedText.replace("DEVICE_", "");
            type = 'DEVICE';
          }
          
          handleScannedData(cleanId, type);
        },
        () => {} // Silent scan error
      );
      logger.info("Scanner started successfully");
    } catch (err) {
      logger.error("Camera start failed", err);
      toast.error("Gagal menyalakan kamera. Pastikan izin kamera diberikan.");
      addLog("Gagal menyalakan kamera", "error");
      setIsScanning(false);
    }
  };

  // Fungsi Matikan Kamera (Definitif)
  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        logger.info("Scanner stopped");
        setIsScanning(false);
      } catch (err) {
        // Abaikan error jika memang sudah berhenti
        logger.debug("Scanner already stopped", err);
        setIsScanning(false);
      }
    } else {
      setIsScanning(false);
    }
  };

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {
          // Silent catch for unmount
        });
      }
    };
  }, []);

  const handleScannedData = async (id: string, type: 'STUDENT' | 'DEVICE') => {
    if (isProcessing) return;
    setIsProcessing(true);
    await stopScanner();
    setIsLoading(true);
    
    try {
      if (type === 'STUDENT') {
        const res = await fetch(`/api/students`); 
        const json = await res.json();
        if (json.success) {
          const found = json.data.find((s: any) => s.id === id || s.statusToken === id);
          if (found) {
            addLog(`Siswa: ${found.name}`, 'success');
            if (isAutoPilot) {
              await executeAutoProcess(found);
            } else {
              setStudentData(found);
            }
          } else {
            addLog(`ID Siswa tidak dikenal: ${id}`, 'error');
            resetScanner();
            setTimeout(startScanner, 1000);
          }
        }
      } else {
        // DEVICE SPECIFIC SCAN
        addLog(`Memproses Unit: ${id}`, 'info');
        const res = await fetch(`/api/students`);
        const json = await res.json();
        const student = json.data.find((s: any) => s.ownedDevices.some((d: any) => d.id === id));
        
        if (student) {
          const device = student.ownedDevices.find((d: any) => d.id === id);
          
          // STRICT FILTER: Check if device type matches the station target
          if (targetType !== "DEVICE" && device.type !== targetType) {
             const targetLabel = device.type === 'LAPTOP' ? 'LAPTOP' : 'HP';
             addLog(`Salah Jenis! Khusus ${targetLabel}`, 'error');
             toast.error(`KHUSUS ${targetLabel}!`, {
               description: `Pindah ke Station ${targetLabel}`,
               duration: 2000
             });
             resetScanner();
             setTimeout(startScanner, 1200);
             return;
          }

          const endpoint = operationalMode === "checkin" ? "/api/check-in" : "/api/check-out";
          
          const procRes = await fetch(endpoint, {
            method: "POST",
            body: JSON.stringify({ studentId: student.id, deviceId: device.id }),
          });
          const procJson = await procRes.json();
          
          if (procJson.success) {
            const deviceLabel = device.type === 'LAPTOP' ? 'LAPTOP' : 'HP';
            toast.success(`${deviceLabel} SUKSES!`, { duration: 1000 });
            addLog(`${device.name} Sukses!`, 'success');
            
            if (isAutoPilot) {
               // In Lightning mode, don't show info card, just go back to camera
               resetScanner();
               setTimeout(startScanner, 800);
            } else {
               setStudentData(student);
            }
          }
        } else {
          addLog(`Device tidak terdaftar`, 'error');
          resetScanner();
          setTimeout(startScanner, 1000);
        }
      }
    } catch (error) {
      addLog("Gagal Sinkronisasi Server", 'error');
      resetScanner();
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const executeAutoProcess = async (student: any) => {
    if (!student.ownedDevices || student.ownedDevices.length === 0) {
      toast.error("Tidak ada perangkat");
      setTimeout(() => {
         startScanner();
         resetScanner();
      }, 2000);
      return;
    }

    setIsProcessing(true);
    
    // Filter devices based on station target
    const devices = targetType === "DEVICE" 
      ? student.ownedDevices 
      : student.ownedDevices.filter((d: any) => d.type === targetType);

    if (devices.length === 0) {
      addLog(`Siswa tidak punya unit ${targetType}`, 'error');
      toast.error(`Siswa ini tidak memiliki unit ${targetType}`);
      setTimeout(() => {
        startScanner();
        resetScanner();
      }, 2000);
      return;
    }

    const isToReturn = operationalMode === "checkin";
    const endpoint = isToReturn ? "/api/check-in" : "/api/check-out";
    const actionLabel = isToReturn ? "MASUK" : "KELUAR";

    try {
      const promises = devices.map((d: any) => 
        fetch(endpoint, {
          method: "POST",
          body: JSON.stringify({ studentId: student.id, deviceId: d.id }),
        }).then(r => r.json())
      );

      const results = await Promise.all(promises);
      const allSuccess = results.every(r => r.success);
      if (allSuccess) {
        toast.success(`${student.name}: ${actionLabel} Berhasil`, { duration: 1500 });
        addLog(`${student.name}: ${actionLabel} Berhasil`, 'success');
        logger.info(`Batch process success for ${student.name}`);
        setLastProcessedId(student.id);
        if (isAutoPilot) {
          setTimeout(() => {
            startScanner();
            resetScanner();
          }, 1500);
        } else {
          setTimeout(resetScanner, 1500);
        }
      } else {
        logger.warn(`Batch process partial failure for ${student.name}`);
        toast.error("Gagal memproses perangkat.");
        addLog("Gagal memproses perangkat", 'error');
        setTimeout(resetScanner, 3000);
      }
    } catch (error) {
      logger.error("System error during batch process", error);
      toast.error("Error Sistem.");
      addLog("Error Sistem", 'error');
      setTimeout(() => {
        startScanner();
        resetScanner();
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setScannedId(null);
    setStudentData(null);
  };

  const handleBatchProcess = async () => {
    if (!studentData) return;
    executeAutoProcess(studentData);
  };

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-4">
        <Link href="/attendance">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight uppercase">
          Scan {targetType === 'LAPTOP' ? 'Laptop' : (targetType === 'PHONE' ? 'Handphone' : 'Perangkat')}
        </h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-4 mb-6">
         {/* Mode Selector - POS Style */}
         <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setOperationalMode("checkout")}
              className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                operationalMode === "checkout" ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Zap size={14} fill={operationalMode === "checkout" ? "currentColor" : "none"} />
              PENYERAHAN (KELUAR)
            </button>
            <button
              onClick={() => setOperationalMode("checkin")}
              className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                operationalMode === "checkin" ? "bg-success text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <CheckCircle2 size={14} />
              PENGEMBALIAN (MASUK)
            </button>
         </div>

         <Card 
            className={`p-4 border-2 transition-all cursor-pointer ${isAutoPilot ? 'border-amber-500 bg-amber-50' : 'border-gray-100 bg-white'}`}
            onClick={() => {
              setIsAutoPilot(!isAutoPilot);
              toast.info(isAutoPilot ? "Mode Manual" : "Mode Lightning Aktif");
            }}
          >
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isAutoPilot ? 'bg-amber-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                    <Zap size={20} fill={isAutoPilot ? "currentColor" : "none"} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-none mb-1">Mode Lightning (Berantai)</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                       {isAutoPilot ? "Proses otomatis aktif" : "Klik untuk aktifkan proses cepat"}
                    </p>
                  </div>
               </div>
               <div className={`w-12 h-6 rounded-full relative transition-colors ${isAutoPilot ? 'bg-amber-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isAutoPilot ? 'left-7' : 'left-1'}`} />
               </div>
            </div>
         </Card>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Scanner Body */}
        {!studentData && (
          <Card className="overflow-hidden border-2 border-primary/10 bg-white">
            <div id="reader" className="w-full bg-slate-900 aspect-square flex items-center justify-center text-white text-xs" />
            <div className="p-8 text-center">
              {!isScanning ? (
                <Button 
                  onClick={startScanner} 
                  className="w-full h-16 rounded-2xl text-md font-black uppercase tracking-widest shadow-xl shadow-primary/10"
                  leftIcon={<Camera size={24} />}
                >
                  Nyalakan Kamera & Scan
                </Button>
              ) : (
                <Button 
                  onClick={stopScanner} 
                  variant="ghost"
                  className="w-full h-12 text-red-500 font-bold uppercase tracking-widest text-xs"
                  leftIcon={<X size={18} />}
                >
                  Matikan Kamera
                </Button>
              )}
               <p className="text-[10px] text-gray-400 font-bold uppercase mt-6 tracking-widest">Arahkan Kamera ke QR Pass Siswa</p>
            </div>
          </Card>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center gap-4 animate-pulse">
            <Search size={48} className="text-indigo-400 animate-bounce" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Memvalidasi QR...</span>
          </div>
        )}

        {/* Result UI */}
        {studentData && (
          <div className="animate-in slide-in-from-bottom-5 duration-300 space-y-4">
            <Card className="p-6">
               <div className="flex items-center gap-4 mb-6">
                 <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                   {studentData.name[0]}
                 </div>
                 <div>
                   <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none mb-1">{studentData.name}</h3>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kelas {studentData.class}</span>
                 </div>
               </div>

               {studentData.ownedDevices?.length > 1 && (
                 <div className="mb-6 p-4 bg-primary rounded-2xl text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap size={20} className="text-amber-400" fill="currentColor" />
                      <p className="text-xs font-bold uppercase tracking-tight">Proses {studentData.ownedDevices.length} Unit Sekaligus</p>
                    </div>
                    <Button 
                      onClick={handleBatchProcess}
                      disabled={isProcessing}
                      className="bg-white text-primary h-10 px-4 rounded-xl text-[10px] font-black uppercase"
                      leftIcon={isProcessing ? <Loader2 size={14} className="animate-spin" /> : null}
                    >
                      Eksekusi
                    </Button>
                 </div>
               )}

                <div className="space-y-3 pt-6 border-t border-gray-100">
                  {studentData.ownedDevices
                    .filter((d: any) => targetType === "DEVICE" || d.type === targetType)
                    .map((device: any) => {
                      const isBorrowed = device.status === 'BORROWED';
                   return (
                     <div key={device.id} className="p-4 border border-gray-100 rounded-xl flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-3">
                           {device.type === 'LAPTOP' ? <Laptop size={20} className="text-gray-400" /> : <Smartphone size={20} className="text-gray-400" />}
                           <p className="text-sm font-bold text-gray-700">{device.name}</p>
                        </div>
                         <div className="flex gap-2">
                           {operationalMode === "checkin" ? (
                              <CheckInButton 
                                studentId={studentData.id} 
                                deviceId={device.id} 
                                onSuccess={resetScanner}
                                className="h-10 px-4 rounded-lg text-[9px]"
                              />
                           ) : (
                              <CheckOutButton 
                                studentId={studentData.id} 
                                deviceId={device.id} 
                                onSuccess={resetScanner}
                                className="h-10 px-4 rounded-lg text-[9px]"
                              />
                           )}
                        </div>
                     </div>
                   );
                 })}
               </div>

               <Button 
                variant="ghost" 
                onClick={resetScanner}
                className="w-full mt-6 h-10 text-gray-400 text-[10px] font-bold uppercase"
                leftIcon={<X size={14} />}
               >
                 Batal / Kembali ke Scan
               </Button>
            </Card>
          </div>
        )}

        {/* Live Debug Panel */}
        <div className="mt-8 rounded-2xl bg-gray-950 p-4 border-2 border-gray-900 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Terminal Debug</span>
            </div>
            <div className="text-[10px] font-mono text-gray-700">DMS_VER: 1.0.0-PRO</div>
          </div>
          <div className="space-y-2 font-mono text-[11px]">
            {logs.length === 0 && (
              <div className="text-gray-800 italic">Menunggu aktivitas pemindaian...</div>
            )}
            {logs.map((log, i) => (
              <div key={i} className={cn(
                "flex gap-2 border-l-2 pl-2 transition-all animate-in slide-in-from-left-2 duration-300",
                log.type === 'success' ? "border-emerald-500 text-emerald-400" :
                log.type === 'error' ? "border-rose-500 text-rose-400" :
                "border-primary text-primary-light"
              )}>
                <span className="opacity-30 whitespace-nowrap">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                <span className="font-bold">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default function QRScannerPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center animate-pulse">Loading Scanner Engine...</div>}>
      <ScannerContent />
    </Suspense>
  );
}
