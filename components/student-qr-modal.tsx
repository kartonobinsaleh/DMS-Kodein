"use client";

import { QRCodeSVG } from "qrcode.react";
import { X, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    name: string;
    class: string;
  } | null;
}

export function StudentQRModal({ isOpen, onClose, student }: StudentQRModalProps) {
  if (!isOpen || !student) return null;

  const handleDownload = () => {
    const svg = document.getElementById("student-qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${student.name}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm print:bg-white print:p-0">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 print:shadow-none print:max-w-none">
        
        {/* Header - Hidden on Print */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 print:hidden">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Identitas Digital Siswa</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center">
          <div className="bg-white p-6 rounded-3xl shadow-inner border border-gray-100 mb-6 group transition-all">
            <QRCodeSVG 
              id="student-qr-code"
              value={student.id} 
              size={200} 
              level="H"
              includeMargin={true}
              className="print:w-[300px] print:h-[300px]"
            />
          </div>

          <div className="space-y-1 mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">{student.name}</h2>
            <p className="text-xs font-bold text-primary uppercase tracking-[0.2em]">{student.class}</p>
            <p className="text-[10px] font-mono text-gray-300 mt-2">ID: {student.id}</p>
          </div>

          {/* Actions - Hidden on Print */}
          <div className="flex gap-3 w-full print:hidden">
            <Button 
              variant="ghost" 
              className="flex-1 h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest"
              leftIcon={<Printer size={16} />}
              onClick={handlePrint}
            >
              Cetak
            </Button>
            <Button 
              className="flex-1 h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest"
              leftIcon={<Download size={16} />}
              onClick={handleDownload}
            >
              Simpan
            </Button>
          </div>
        </div>

        {/* Footer info - Only on print */}
        <div className="hidden print:block p-4 text-center border-t border-gray-100">
          <p className="text-[8px] font-bold text-gray-400 uppercase">DMS-Kodein Student Pass • Gunakan untuk Check-In/Out Perangkat</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed, .fixed * {
            visibility: visible;
          }
          .fixed {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .print\\:hidden {
             display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
