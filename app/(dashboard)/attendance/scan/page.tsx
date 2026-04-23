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
  const [cameraMode, setCameraMode] = useState<"environment" | "user">("environment");
  const [lastProcessedId, setLastProcessedId] = useState<string | null>(null);
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const playSound = (type: 'success' | 'error') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'success') {
        // iPhone-style "Note" / "Chime" synthesizer
        const playNote = (freq: number, start: number, duration: number) => {
          const osc = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          g.gain.setValueAtTime(0, start);
          g.gain.linearRampToValueAtTime(0.1, start + 0.01);
          g.gain.exponentialRampToValueAtTime(0.01, start + duration);
          osc.connect(g);
          g.connect(audioCtx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };

        const now = audioCtx.currentTime;
        playNote(1046.50, now, 0.15); // C6
        playNote(1318.51, now + 0.07, 0.15); // E6
        playNote(1567.98, now + 0.14, 0.2); // G6
      } else {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {
      console.error("Audio failed", e);
    }
  };

  // Fungsi Inisialisasi Kamera
  const startScanner = async () => {
    // "Wake up" audio context for macOS/Chrome/Safari
    try {
      const tempCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (tempCtx.state === 'suspended') {
        await tempCtx.resume();
      }
      // Play a tiny silent puff to officially unlock audio
      const oscillator = tempCtx.createOscillator();
      const gain = tempCtx.createGain();
      gain.gain.value = 0.0001; // Silent
      oscillator.connect(gain);
      gain.connect(tempCtx.destination);
      oscillator.start(0);
      oscillator.stop(0.01);
    } catch (e) {}

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("reader");
      }
      
      setIsScanning(true);
      await html5QrCodeRef.current.start(
        { facingMode: cameraMode },
        { 
          fps: 15, 
          qrbox: (viewfinderWidth, viewfinderHeight) => {
             const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
             const size = Math.floor(minEdge * 0.7);
             return { width: size, height: size };
          }
        },
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
    // Restart scanner if cameraMode changes while scanning
    if (isScanning) {
      stopScanner().then(() => startScanner());
    }
  }, [cameraMode]);

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
            playSound('success');
            if (isAutoPilot) {
              await executeAutoProcess(found);
            } else {
              setStudentData(found);
            }
          } else {
            playSound('error');
            resetScanner();
            setTimeout(startScanner, 1000);
          }
        }
      } else {
        // DEVICE SPECIFIC SCAN
        const res = await fetch(`/api/students`);
        const json = await res.json();
        const student = json.data.find((s: any) => s.ownedDevices.some((d: any) => d.id === id));
        
        if (student) {
          const device = student.ownedDevices.find((d: any) => d.id === id);
          
          // STRICT FILTER: Check if device type matches the station target
          if (targetType !== "DEVICE" && device.type !== targetType) {
             const targetLabel = device.type === 'LAPTOP' ? 'LAPTOP' : 'HP';
             playSound('error');
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
            playSound('success');
            toast.success(`${deviceLabel} SUKSES!`, { duration: 1000 });

            
            if (isAutoPilot) {
               // In Lightning mode, don't show info card, just go back to camera
               resetScanner();
               setTimeout(startScanner, 800);
            } else {
               setStudentData(student);
            }
          }
        } else {
          playSound('error');
          resetScanner();
          setTimeout(startScanner, 1000);
        }
      }
    } catch (error) {

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
        playSound('success');
        toast.success(`${student.name}: ${actionLabel} Berhasil`, { duration: 1500 });

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

        setTimeout(resetScanner, 3000);
      }
    } catch (error) {
      logger.error("System error during batch process", error);
      toast.error("Error Sistem.");

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
            <div 
              id="reader" 
              className="w-full bg-slate-900 flex items-center justify-center text-white text-xs" 
              style={{ aspectRatio: '1/1' }}
            />
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
                <div className="space-y-4 w-full">
                  <Button 
                    onClick={stopScanner} 
                    variant="ghost"
                    className="w-full h-12 text-red-500 font-bold uppercase tracking-widest text-xs"
                    leftIcon={<X size={18} />}
                  >
                    Matikan Kamera
                  </Button>
                  
                  <Button
                    onClick={() => setCameraMode(prev => prev === "environment" ? "user" : "environment")}
                    variant="ghost"
                    className="w-full h-10 text-primary font-bold uppercase tracking-widest text-[10px] border border-primary/10"
                    leftIcon={<Camera size={16} />}
                  >
                    Ganti ke Kamera {cameraMode === "environment" ? "Depan" : "Belakang"}
                  </Button>
                </div>
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
