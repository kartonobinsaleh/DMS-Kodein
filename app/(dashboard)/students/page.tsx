"use client";

import { useEffect, useState } from "react";
import { useStudentStore } from "@/store/use-student-store";
import { Plus, Search, Trash2, User } from "lucide-react";
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
    <div className="space-y-4 page-fade-in pb-10">
      <PageHeader
        title="Student Management"
        subtitle="Operational database of registered students for daily device activity."
      />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search by name or class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-9 pr-4 py-2 text-sm focus:border-indigo-600 outline-none transition-all placeholder:text-gray-400"
          />
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          size="sm"
          leftIcon={<Plus size={14} />}
        >
          Add Student
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight">Class</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 italic-table-empty">
              {isLoading && students.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={3} className="px-6 py-4"><div className="h-5 bg-gray-50 rounded" /></td>
                  </tr>
                ))
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{student.class}</td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => setStudentToDelete(student.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-sm text-gray-400 italic">No records found.</td>
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
        title="Delete Record"
        description="Permanently remove this student record from the system."
      />

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/20 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User size={16} className="text-indigo-600" />
              Register New Student
            </h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 ml-1">Full Name</label>
                <input
                  autoFocus
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 ml-1">Class Group</label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  placeholder="e.g. 10-A"
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none transition-all"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => setShowAddModal(false)} variant="ghost" className="flex-1">Cancel</Button>
                <Button type="submit" disabled={!formData.name.trim() || !formData.class.trim()} className="flex-1">Save Student</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
