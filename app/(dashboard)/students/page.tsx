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
    <div className="space-y-12 page-fade-in pb-32">
      <PageHeader
        title="Data Siswa"
        subtitle="Kelola identitas dan kepemilikan perangkat siswa."
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative group w-full max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Cari nama atau kelas siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-6 py-4 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          size="lg"
          variant="primary"
          leftIcon={<Plus size={20} />}
          className="w-full md:w-auto shadow-indigo-100"
        >
          Daftarkan Siswa
        </Button>
      </div>

      <div className="rounded-container border border-slate-100 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 tracking-widest">
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
                    <td colSpan={3} className="px-10 py-10">
                      <div className="h-6 animate-pulse rounded-lg bg-slate-50 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                          {student.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg leading-none mb-1.5">{student.name}</p>
                          <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest leading-none">ID: {student.id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className="rounded-full bg-slate-100 px-4 py-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {student.class}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => setStudentToDelete(student.id)}
                        className="text-slate-200 hover:text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-10 py-40 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <LayoutGrid size={64} className="mb-4" />
                      <p className="font-bold uppercase tracking-widest text-xs leading-none">Daftar siswa kosong</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Data Siswa"
        description="Aksi ini akan menghapus data siswa secara permanen dari sistem."
      />

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-container border border-slate-100 bg-white p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-2">Siswa Baru</h2>
            <p className="text-sm text-slate-400 font-medium mb-10">Daftarkan identitas siswa baru ke dalam sistem.</p>
            
            <form onSubmit={handleAddStudent} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Lengkap</label>
                <input
                  autoFocus
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama Lengkap"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Kelas</label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  placeholder="Contoh: 10-A"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="flex gap-4 pt-6">
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="ghost"
                  className="flex-1 text-slate-400"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.name.trim() || !formData.class.trim()}
                  className="flex-1 py-4"
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
