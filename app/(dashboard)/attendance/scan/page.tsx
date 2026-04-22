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
  AlertCircle,
  Zap,
  Loader2
} from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckInButton, CheckOutButton } from "@/components/daily-log-actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

function ScannerContent() {
  const searchParams = useSearchParams();
  const forcedMode = searchParams.get("mode"); // 'checkin' | 'checkout' | null

  const [scannedId, setScannedId] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [isAutoPilot, setIsAutoPilot] = useState(false);
  const [lastProcessedId, setLastProcessedId] = useState<string | null>(null);
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Fungsi Inisialisasi Kamera
  const startScanner = async () => {
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("reader");
      }
      
      setIsScanning(true);
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setScannedId(decodedText);
          stopScanner();
        },
        () => {} // Silent scan error
      );
      logger.info("Scanner started successfully");
    } catch (err) {
      logger.error("Camera start failed", err);
      toast.error("Gagal menyalakan kamera. Pastikan izin kamera diberikan.");
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

  // Fetch Student 
  useEffect(() => {
    if (scannedId) {
      fetchStudent(scannedId);
    }
  }, [scannedId]);

  const fetchStudent = async (id: string) => {
    if (isAutoPilot && id === lastProcessedId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/students`); 
      const json = await res.json();
      if (json.success) {
        const found = json.data.find((s: any) => s.id === id);
        if (found) {
          setStudentData(found);
          if (isAutoPilot) executeAutoProcess(found);
        } else {
          toast.error("QR Code tidak valid");
          resetScanner();
        }
      }
    } catch (error) {
      toast.error("Gagal mengambil data");
      resetScanner();
    } finally {
      setIsLoading(false);
    }
  };

  const executeAutoProcess = async (student: any) => {
    if (!student.ownedDevices || student.ownedDevices.length === 0) {
      toast.error("Tidak ada perangkat terdaftar");
      setTimeout(resetScanner, 2000);
      return;
    }

    setIsProcessingBatch(true);
    const devices = student.ownedDevices;
    const isToReturn = forcedMode ? (forcedMode === "checkin") : (devices[0].status === "BORROWED");
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
        logger.info(`Batch process success for ${student.name}`);
        setLastProcessedId(student.id);
        setTimeout(resetScanner, 1500);
      } else {
        logger.warn(`Batch process partial failure for ${student.name}`);
        toast.error("Gagal memproses perangkat.");
        setTimeout(resetScanner, 3000);
      }
    } catch (error) {
      logger.error("System error during batch process", error);
      toast.error("Error Sistem.");
      setTimeout(resetScanner, 3000);
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const resetScanner = () => {
    setScannedId(null);
    setStudentData(null);
    setIsProcessingBatch(false);
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
          Scanner: {forcedMode === 'checkin' ? 'Check-In' : (forcedMode === 'checkout' ? 'Check-Out' : 'Identitas')}
        </h1>
      </div>

      <div className="max-w-2xl mx-auto mb-6">
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
                      disabled={isProcessingBatch}
                      className="bg-white text-primary h-10 px-4 rounded-xl text-[10px] font-black uppercase"
                      leftIcon={isProcessingBatch ? <Loader2 size={14} className="animate-spin" /> : null}
                    >
                      Eksekusi
                    </Button>
                 </div>
               )}

               <div className="space-y-3 pt-6 border-t border-gray-100">
                 {studentData.ownedDevices.map((device: any) => {
                   const isBorrowed = device.status === 'BORROWED';
                   return (
                     <div key={device.id} className="p-4 border border-gray-100 rounded-xl flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-3">
                           {device.type === 'LAPTOP' ? <Laptop size={20} className="text-gray-400" /> : <Smartphone size={20} className="text-gray-400" />}
                           <p className="text-sm font-bold text-gray-700">{device.name}</p>
                        </div>
                        <div className="flex gap-2">
                           {forcedMode === "checkin" || (forcedMode === null && isBorrowed) ? (
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
