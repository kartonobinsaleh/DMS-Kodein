"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { 
  Camera, 
  X, 
  User, 
  Search, 
  ArrowLeft,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Zap,
  Loader2
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PageContainer } from "@/components/ui/page-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckInButton, CheckOutButton } from "@/components/daily-log-actions";
import Link from "next/link";
import { toast } from "sonner";

export default function QRScannerPage() {
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [isAutoPilot, setIsAutoPilot] = useState(false);
  const [lastProcessedId, setLastProcessedId] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const resetScanner = () => {
    setScannedId(null);
    setStudentData(null);
    setIsScanning(true);
    setIsProcessingBatch(false);
  };

  useEffect(() => {
    // Jalankan hanya jika dalam mode scanning
    if (isScanning && !scannedId) {
      // Pastikan scanner sebelumnya benar-benar bersih sebelum buat baru
      const scannerId = "reader";
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      const scanner = new Html5QrcodeScanner(scannerId, config, false);

      scanner.render((decodedText) => {
        setScannedId(decodedText);
        scanner.clear().catch(e => console.warn("Scanner clear failed", e));
        setIsScanning(false);
      }, (error) => {
        // Silent error for scanning frames
      });

      scannerRef.current = scanner;
    }

    // Cleanup function saat komponen unmount atau status berubah
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => {
          // Abaikan error jika sudah dibersihkan sebelumnya
          console.log("Cleanup scanner info:", e);
        });
        scannerRef.current = null;
      }
    };
  }, [isScanning, scannedId]);

  useEffect(() => {
    if (scannedId) {
      fetchStudent(scannedId);
    }
  }, [scannedId]);

  const fetchStudent = async (id: string) => {
    // Cegah proses berulang untuk ID yang baru saja diproses (de-bounce)
    if (isAutoPilot && id === lastProcessedId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/students`); 
      const json = await res.json();
      if (json.success) {
        const found = json.data.find((s: any) => s.id === id);
        if (found) {
          setStudentData(found);
          // Jika Auto-Pilot aktif, langsung eksekusi tanpa nunggu klik
          if (isAutoPilot) {
             executeAutoProcess(found);
          }
        } else {
          toast.error("QR Code tidak valid");
          resetScanner();
        }
      }
    } catch (error) {
      toast.error("Gagal mengambil data siswa");
      resetScanner();
    } finally {
      setIsLoading(false);
    }
  };

  const executeAutoProcess = async (student: any) => {
    if (!student.ownedDevices || student.ownedDevices.length === 0) {
      toast.error(`${student.name} tidak memiliki perangkat terdaftar`);
      setTimeout(resetScanner, 2000);
      return;
    }

    setIsProcessingBatch(true);
    const devices = student.ownedDevices;
    const isToReturn = devices[0].status === "BORROWED";
    const endpoint = isToReturn ? "/api/check-in" : "/api/check-out";
    const actionLabel = isToReturn ? "MASUK" : "KELUAR";

    try {
      const promises = devices.map(d => 
        fetch(endpoint, {
          method: "POST",
          body: JSON.stringify({ studentId: student.id, deviceId: d.id }),
        }).then(r => r.json())
      );

      const results = await Promise.all(promises);
      if (results.every(r => r.success)) {
        toast.success(`${student.name}: ${devices.length} Unit Berhasil ${actionLabel}`, {
          duration: 1500
        });
        setLastProcessedId(student.id);
        // Tunggu sebentar agar user bisa lihat konfirmasi, lalu reset untuk orang berikutnya
        setTimeout(resetScanner, 1500);
      } else {
        toast.error("Ada perangkat yang gagal diproses. Cek manual.");
        setTimeout(resetScanner, 3000);
      }
    } catch (error) {
      toast.error("Error Sistem. Silakan coba lagi.");
      setTimeout(resetScanner, 3000);
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleBatchProcess = async () => {
    if (!studentData || studentData.ownedDevices.length === 0) return;
    
    setIsProcessingBatch(true);
    const devices = studentData.ownedDevices;
    
    // Tentukan aksi berdasarkan status perangkat pertama (untuk menyederhanakan)
    // Jika perangkat pertama BORROWED, kita asumsikan ingin masukan semua.
    const isToReturn = devices[0].status === "BORROWED";
    const endpoint = isToReturn ? "/api/check-in" : "/api/check-out";
    const actionLabel = isToReturn ? "Pemasukan" : "Pengeluaran";

    try {
      const promises = devices.map(d => 
        fetch(endpoint, {
          method: "POST",
          body: JSON.stringify({ studentId: studentData.id, deviceId: d.id }),
        }).then(r => r.json())
      );

      const results = await Promise.all(promises);
      const allSuccess = results.every(r => r.success);

      if (allSuccess) {
        toast.success(`Berhasil memproses ${devices.length} perangkat (${actionLabel} Massal)`);
        resetScanner();
      } else {
        const errorCount = results.filter(r => !r.success).length;
        toast.warning(`${errorCount} perangkat gagal diproses. Silakan cek manual.`);
        resetScanner();
      }
    } catch (error) {
      toast.error("Gagal melakukan proses massal");
    } finally {
      setIsProcessingBatch(false);
    }
  };

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-4">
        <Link href="/attendance">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Scanner Kehadiran Pro</h1>
      </div>

      {/* Lightning Mode Toggle */}
      <div className="max-w-2xl mx-auto mb-6">
         <Card 
            className={`p-4 border-2 transition-all cursor-pointer ${isAutoPilot ? 'border-amber-500 bg-amber-50' : 'border-gray-100 bg-white'}`}
            onClick={() => {
              setIsAutoPilot(!isAutoPilot);
              toast.info(isAutoPilot ? "Mode Manual Aktif" : "Mode Lightning Aktif (Tanpa Klik!)");
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
                       {isAutoPilot ? "Sistem akan memproses otomatis tanpa klik" : "Klik untuk aktifkan proses super cepat"}
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
        {isScanning && (
          <Card className="overflow-hidden border-2 border-dashed border-indigo-200 bg-indigo-50/10">
            <div id="reader" className="w-full" />
            <div className="p-8 text-center bg-white border-t border-gray-100">
               <div className="flex justify-center mb-4">
                 <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full animate-pulse">
                   <Camera size={32} />
                 </div>
               </div>
               <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2">Arahkan Kamera ke QR Pass</h2>
               <p className="text-xs text-gray-400 font-medium max-w-[240px] mx-auto">Pastikan pencahayaan cukup untuk proses identitas digital yang cepat.</p>
            </div>
          </Card>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center gap-4 animate-pulse">
            <Search size={48} className="text-indigo-400 animate-bounce" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Mengidentifikasi Siswa...</span>
          </div>
        )}

        {/* Result UI */}
        {studentData && (
          <div className="animate-in slide-in-from-bottom-5 duration-300 space-y-4">
            <Card className="p-6 overflow-hidden">
               {/* Quick Info */}
               <div className="flex items-center gap-4 mb-6">
                 <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                   {studentData.name[0]}
                 </div>
                 <div>
                   <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none mb-1">{studentData.name}</h3>
                   <span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-gray-200">
                    Kelas {studentData.class}
                   </span>
                 </div>
               </div>

               {/* Smart Batch Action */}
               {studentData.ownedDevices?.length > 1 && (
                 <div className="mb-6 p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-white/20 rounded-lg text-white">
                            <Zap size={20} fill="currentColor" />
                         </div>
                         <div className="text-left">
                            <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest leading-none mb-1">Aksi Massal Terdeteksi</p>
                            <p className="text-sm font-black text-white leading-tight">Proses {studentData.ownedDevices.length} Unit Sekaligus</p>
                         </div>
                      </div>
                      <Button 
                        onClick={handleBatchProcess}
                        disabled={isProcessingBatch}
                        className="bg-white text-indigo-600 hover:bg-indigo-50 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shrink-0"
                        leftIcon={isProcessingBatch ? <Loader2 size={14} className="animate-spin" /> : null}
                      >
                        {isProcessingBatch ? "Processing..." : "Eksekusi"}
                      </Button>
                    </div>
                 </div>
               )}

               {/* Action Area */}
               <div className="space-y-4 pt-6 border-t border-gray-100">
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Daftar Perangkat Terdaftar</h4>
                 
                 {studentData.ownedDevices?.length > 0 ? (
                   studentData.ownedDevices.map((device: any) => {
                     const isBorrowed = device.status === 'BORROWED';
                     return (
                       <div key={device.id} className="p-1 border border-gray-200 rounded-2xl bg-gray-50/50">
                          <div className="p-4 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${isBorrowed ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                   {device.type === 'LAPTOP' ? <Laptop size={24} /> : <Smartphone size={24} />}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900 underline decoration-gray-200 underline-offset-4">{device.name}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    {isBorrowed ? <AlertCircle size={10} className="text-amber-500" /> : <CheckCircle2 size={10} className="text-green-500" />}
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                      {isBorrowed ? "Sedang Keluar" : "Ada di Kantor"}
                                    </span>
                                  </div>
                                </div>
                             </div>
                          </div>
                          
                          <div className="p-4 bg-white rounded-xl border-t border-gray-200">
                            {isBorrowed ? (
                              <CheckInButton 
                                studentId={studentData.id} 
                                deviceId={device.id} 
                                onSuccess={() => {
                                  resetScanner();
                                  toast.success("Sesi Pengembalian Berhasil");
                                }}
                                className="w-full h-14 rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg"
                              />
                            ) : (
                              <CheckOutButton 
                                studentId={studentData.id} 
                                deviceId={device.id} 
                                onSuccess={() => {
                                  resetScanner();
                                  toast.success("Sesi Peminjaman Berhasil");
                                }}
                                className="w-full h-14 rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg"
                              />
                            )}
                          </div>
                       </div>
                     );
                   })
                 ) : (
                   <p className="text-xs text-center text-gray-400 italic py-4">Tidak ada perangkat yang terdaftar.</p>
                 )}
               </div>

               {/* Cancel */}
               <Button 
                variant="ghost" 
                onClick={resetScanner}
                className="w-full mt-6 h-12 text-gray-400 hover:text-red-600 font-bold uppercase tracking-widest text-[10px]"
                leftIcon={<X size={14} />}
               >
                 Batalkan / Reset Scan
               </Button>
            </Card>
          </div>
        )}
      </div>

      {/* Global CSS for Scanner UI customization to match theme */}
      <style jsx global>{`
        #reader {
          border: none !important;
        }
        #reader__scan_region {
           background: transparent !important;
        }
        #reader__dashboard {
          padding: 20px !important;
          background: #f8fafc !important;
          border-top: 1px solid #e2e8f0 !important;
        }
        #reader__dashboard_section_csr button {
           background: #4f46e5 !important;
           color: white !important;
           border: none !important;
           padding: 10px 20px !important;
           border-radius: 12px !important;
           font-weight: 700 !important;
           text-transform: uppercase !important;
           font-size: 10px !important;
           letter-spacing: 0.1em !important;
           box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
        }
      `}</style>
    </PageContainer>
  );
}
