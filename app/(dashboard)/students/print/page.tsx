"use client";

import { useEffect, useState } from "react";
import { useStudentStore } from "@/store/use-student-store";
import { QRCodeSVG } from "qrcode.react";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BulkPrintPage() {
  const { students, fetchStudents } = useStudentStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetchStudents();
    setIsReady(true);
  }, [fetchStudents]);

  const handlePrint = () => {
    window.print();
  };

  if (!isReady) return <div className="p-20 text-center animate-pulse uppercase tracking-widest text-xs font-bold text-gray-400">Menyiapkan Lembar Cetak...</div>;

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white p-4 md:p-8">
      {/* Top Controls - Hidden on Print */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/students">
            <Button variant="ghost" size="sm" className="rounded-xl h-10 w-10 p-0 border border-gray-200">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Cetak Massal Kartu QR</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total: {students.length} Siswa Terdaftar</p>
          </div>
        </div>
        <Button 
          onClick={handlePrint}
          className="h-12 px-8 rounded-xl text-xs font-bold uppercase tracking-widest bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20"
          leftIcon={<Printer size={18} />}
        >
          Cetak Sekarang (A4)
        </Button>
      </div>

      {/* Print Context */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-3 print:gap-2">
          {students.map((student) => (
            <div 
              key={student.id} 
              className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm print:shadow-none print:border-gray-300 print:rounded-none pr-2"
            >
              <div className="mb-3">
                <QRCodeSVG 
                  value={student.statusToken} 
                  size={120} 
                  level="H" 
                  includeMargin={false}
                  className="w-full h-auto"
                />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-black text-gray-900 uppercase truncate max-w-[150px]">{student.name}</h3>
                <p className="text-[9px] font-bold text-primary uppercase tracking-wider">{student.class}</p>
                <div className="mt-2 pt-1 border-t border-gray-50">
                  <p className="text-[7px] font-mono text-gray-300 break-all">{student.statusToken}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            background: white !important;
          }
          .print-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
