"use client";

import { useEffect, useState } from "react";
import { useStudentStore } from "@/store/use-student-store";
import { Plus, Search, Trash2, User, GraduationCap } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

export default function StudentsPage() {
  const { students, isLoading, fetchStudents, addStudent, deleteStudent } = useStudentStore();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", class: "" });
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

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
    await addStudent(formData);
    setFormData({ name: "", class: "" });
    setShowAddModal(false);
  };

  const handleDelete = async () => {
    if (studentToDelete) {
      await deleteStudent(studentToDelete);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-4 page-fade-in pb-20">
      <PageHeader
        title="Manajemen Siswa"
        subtitle="Basis data operasional siswa terdaftar untuk aktivitas perangkat harian."
      />

      <div className="sticky top-0 z-10 space-y-3 bg-gray-50/80 backdrop-blur-md pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Cari nama atau grup kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-indigo-600 outline-none shadow-sm placeholder:text-gray-400 transition-all"
          />
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest"
          leftIcon={<Plus size={16} />}
        >
          Registrasi Siswa Baru
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && students.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse bg-white rounded-xl border border-gray-200" />
          ))
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div key={student.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between group hover:border-indigo-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-50 transition-colors">
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
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setStudentToDelete(student.id)}
                className="h-10 w-10 p-0 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-gray-200">
             <User size={32} className="mx-auto mb-2 text-gray-200" />
             <p className="text-xs font-medium text-gray-400 italic">Siswa tidak ditemukan.</p>
          </div>
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
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Plus size={16} /></div>
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-600 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Grup Kelas</label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  placeholder="e.g. 10-A"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-600 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowAddModal(false)} variant="ghost" className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest border border-gray-200">Batal</Button>
                <Button type="submit" disabled={!formData.name.trim() || !formData.class.trim()} className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest">Simpan Catatan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
