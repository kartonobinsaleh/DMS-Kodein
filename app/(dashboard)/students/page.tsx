"use client";

import { useEffect, useState } from "react";
import { useStudentStore } from "@/store/use-student-store";
import { Plus, Search, Trash2, User, GraduationCap, Edit2, QrCode, Printer } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { StudentQRModal } from "@/components/student-qr-modal";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import Link from "next/link";
import { ActionBar } from "@/components/ui/action-bar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function StudentsPage() {
  const { students, isLoading, fetchStudents, addStudent, deleteStudent } = useStudentStore();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", class: "10" });
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [studentForQR, setStudentForQR] = useState<any | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = Array.isArray(students) ? students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.class.trim()) return;
    setSubmitLoading(true);
    try {
      await useStudentStore.getState().addStudent(formData);
      setFormData({ name: "", class: "10" });
      setShowAddModal(false);
      toast.success("Catatan siswa berhasil ditambahkan");
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan data");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.class.trim() || !activeStudentId) return;
    setSubmitLoading(true);
    try {
      await useStudentStore.getState().updateStudent(activeStudentId, formData);
      setFormData({ name: "", class: "" });
      setActiveStudentId(null);
      setShowEditModal(false);
      toast.success("Catatan siswa berhasil diperbarui");
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui data");
    } finally {
      setSubmitLoading(false);
    }
  };

  const openEditModal = (student: any) => {
    setFormData({ name: student.name, class: student.class });
    setActiveStudentId(student.id);
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (studentToDelete) {
      setSubmitLoading(true);
      try {
        await useStudentStore.getState().deleteStudent(studentToDelete);
        toast.success("Siswa berhasil dihapus");
      } catch (error: any) {
        toast.error(error.message || "Gagal menghapus siswa");
      } finally {
        setSubmitLoading(false);
        setStudentToDelete(null);
      }
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Data Siswa"
        subtitle="Basis data operasional siswa terdaftar untuk aktivitas perangkat harian."
      />

      <ActionBar>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Cari nama atau kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-primary outline-none shadow-sm placeholder:text-gray-400 transition-all"
          />
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <Link href="/students/print">
            <Button
              variant="ghost"
              className="h-12 px-4 rounded-xl text-xs font-bold uppercase tracking-widest border border-gray-200 hover:bg-gray-50 shrink-0"
              leftIcon={<Printer size={16} />}
            >
              Cetak Massal
            </Button>
          </Link>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-initial h-12 px-6 rounded-xl text-xs font-bold uppercase tracking-widest shrink-0 shadow-sm"
            leftIcon={<Plus size={16} />}
          >
            Registrasi Siswa
          </Button>
        </div>
      </ActionBar>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && students.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <Skeleton className="h-9 w-9 rounded-xl" />
                <Skeleton className="h-9 w-9 rounded-xl" />
              </div>
            </Card>
          ))
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <Card key={student.id} className="p-4 flex items-center justify-between group hover:border-indigo-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary-light transition-colors">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-none mb-1">{student.name}</h3>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <GraduationCap size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{student.class}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => setStudentForQR(student)}
                  className="h-10 w-10 p-0 text-gray-300 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                  title="Lihat QR Pass"
                >
                  <QrCode size={18} />
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(student)}
                  className="h-10 w-10 p-0 text-gray-300 hover:text-primary hover:bg-primary-light rounded-xl transition-all"
                >
                  <Edit2 size={16} />
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => setStudentToDelete(student.id)}
                  className="h-10 w-10 p-0 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState 
            icon={User}
            title="Siswa tidak ditemukan"
            description="Silakan periksa kembali nama atau filter yang digunakan."
          />
        )}
      </div>

      <ConfirmationModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Catatan"
        description="Hapus permanen catatan siswa ini dari sistem operasional."
      />

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/20 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150">
            <h2 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="p-1.5 bg-primary-light text-primary rounded-lg"><Plus size={16} /></div>
              Registrasi Siswa Baru
            </h2>
            <form onSubmit={handleAddStudent} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap Siswa</label>
                <input
                  autoFocus
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tingkat Kelas</label>
                <select 
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary outline-none transition-all"
                >
                  <option value="10">KELAS 10</option>
                  <option value="11">KELAS 11</option>
                  <option value="12">KELAS 12</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowAddModal(false)} variant="ghost" className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest border border-gray-200">Batal</Button>
                <Button type="submit" loading={submitLoading} disabled={!formData.name.trim() || !formData.class.trim() || submitLoading} className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest">Simpan Catatan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/20 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150">
            <h2 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="p-1.5 bg-primary-light text-primary rounded-lg"><Edit2 size={16} /></div>
              Perbaiki Data Siswa
            </h2>
            <form onSubmit={handleEditStudent} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap Siswa</label>
                <input
                  autoFocus
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tingkat Kelas</label>
                <select 
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary outline-none transition-all"
                >
                  <option value="10">KELAS 10</option>
                  <option value="11">KELAS 11</option>
                  <option value="12">KELAS 12</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowEditModal(false)} variant="ghost" className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest border border-gray-200">Batal</Button>
                <Button type="submit" loading={submitLoading} disabled={!formData.name.trim() || !formData.class.trim() || submitLoading} className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest">Simpan Perubahan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <StudentQRModal 
        isOpen={!!studentForQR}
        onClose={() => setStudentForQR(null)}
        student={studentForQR}
      />
    </PageContainer>
  );
}
