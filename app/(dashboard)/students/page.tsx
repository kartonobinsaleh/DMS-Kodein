"use client";

import { useEffect, useState } from "react";
import { useStudentStore } from "@/store/use-student-store";
import { Plus, Search, Users, Trash2, LayoutGrid } from "lucide-react";
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
    <div className="p-4 md:p-8 space-y-10 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Siswa"
        subtitle="Kelola identitas dan kepemilikan perangkat siswa."
        category="Manajemen Data"
        icon={<Users size={14} />}
        action={
          <Button
            onClick={() => setShowAddModal(true)}
            size="xl"
            leftIcon={<Plus size={20} />}
            className="w-full md:w-auto"
          >
            Tambah Siswa
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="relative group max-w-2xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Cari nama atau kelas siswa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-container border border-slate-200 bg-white pl-14 pr-6 py-5 text-sm font-bold focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none outline-none transition-all shadow-sm"
        />
      </div>

      {/* List View */}
      <div className="rounded-container border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-100 tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Profil Siswa</th>
                <th className="px-10 py-6 text-center">Kelas</th>
                <th className="px-10 py-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && students.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={3} className="px-10 py-8">
                      <div className="h-8 animate-pulse rounded-xl bg-slate-100 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl shadow-inner border border-indigo-100 group-hover:scale-110 transition-transform">
                          {student.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg tracking-tight leading-tight">{student.name}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">ID: {student.id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="rounded-xl bg-slate-100 px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {student.class}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => setStudentToDelete(student.id)}
                        className="text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 size={20} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-10 py-24 text-center text-slate-300">
                    <div className="flex flex-col items-center justify-center">
                      <LayoutGrid size={64} className="mb-4 opacity-5" />
                      <p className="font-black uppercase tracking-widest text-xs">Data siswa tidak ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Data Siswa"
        description="Apakah Anda yakin ingin menghapus data siswa ini? Seluruh data riwayat yang terkait mungkin ikut terdampak."
      />

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-container border border-slate-100 bg-white p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Registrasi Siswa</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Masukkan identitas lengkap siswa baru.</p>
            
            <form onSubmit={handleAddStudent} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Lengkap</label>
                <input
                  autoFocus
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Siti Aminah"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Kelas</label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  placeholder="Contoh: 10-A atau XI-IPS-1"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none outline-none transition-all"
                />
              </div>
              <div className="flex gap-4 pt-6">
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="outline"
                  size="xl"
                  className="flex-1 text-slate-400"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.name.trim() || !formData.class.trim()}
                  size="xl"
                  className="flex-1"
                >
                  Daftarkan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
