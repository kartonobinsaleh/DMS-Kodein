"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/use-user-store";
import { useSession } from "next-auth/react";
import { Plus, Search, Trash2, ShieldCheck, UserCog, Edit2, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { ActionBar } from "@/components/ui/action-bar";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function UsersPage() {
  const { users, isLoading, error, fetchUsers, addUser, updateUser, deleteUser } = useUserStore();
  const { data: session } = useSession();
  
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "STAFF" });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = Array.isArray(users) ? users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || formData.password.length < 6) return;
    setSubmitLoading(true);
    try {
      await addUser(formData);
      setFormData({ name: "", email: "", password: "", role: "STAFF" });
      setShowAddModal(false);
      toast.success("Pengguna sistem berhasil ditambahkan");
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan akun");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !activeUserId) return;
    setSubmitLoading(true);
    try {
      await updateUser(activeUserId, formData);
      setFormData({ name: "", email: "", password: "", role: "STAFF" });
      setActiveUserId(null);
      setShowEditModal(false);
      toast.success("Pengguna sistem berhasil diperbarui");
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui akun");
    } finally {
      setSubmitLoading(false);
    }
  };

  const openEditModal = (user: any) => {
    setFormData({ name: user.name, email: user.email, password: "", role: user.role });
    setActiveUserId(user.id);
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (userToDelete) {
      setSubmitLoading(true);
      try {
        await deleteUser(userToDelete);
        toast.success("Pengguna berhasil dihapus");
      } catch (err: any) {
        toast.error(err.message || "Gagal menghapus akun");
      } finally {
        setSubmitLoading(false);
        setUserToDelete(null);
      }
    }
  };

  const toggleStatus = async (user: any) => {
     try {
       await updateUser(user.id, { isActive: !user.isActive });
       toast.success(`Akun berhasil di-${user.isActive ? 'nonaktifkan' : 'aktifkan'}`);
     } catch(err: any) {
       toast.error(err.message || "Gagal mengubah status akun");
     }
  };

  if (error && error.includes("Ditolak")) {
     return <div className="p-20 text-center font-bold text-red-500 uppercase tracking-widest">{error}</div>;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Manajemen Staf & Akses"
        subtitle="Kelola kendali akses staf dan administrator ke dalam Sistem Manajemen Perangkat."
      />

      <ActionBar>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Cari asisten operasional atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-primary outline-none shadow-sm transition-all placeholder:text-gray-400"
          />
        </div>
        <Button
          onClick={() => {
            setFormData({ name: "", email: "", password: "", role: "STAFF" });
            setShowAddModal(true);
          }}
          className="w-full sm:w-auto h-12 px-6 rounded-xl text-xs font-bold uppercase tracking-widest shrink-0 shadow-sm"
          leftIcon={<Plus size={16} />}
        >
          Buat Akses Staf
        </Button>
      </ActionBar>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && users.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-0 overflow-hidden">
               <div className="bg-gray-50/50 p-3 border-b border-gray-100 flex justify-between">
                 <Skeleton className="h-3 w-16" />
                 <Skeleton className="h-3 w-10" />
               </div>
               <div className="p-4 space-y-4">
                 <div className="space-y-2">
                   <Skeleton className="h-4 w-32" />
                   <Skeleton className="h-3 w-40" />
                 </div>
                 <div className="flex justify-end gap-1 pt-2 border-t border-gray-50">
                    <Skeleton className="h-7 w-7 rounded" />
                    <Skeleton className="h-7 w-7 rounded" />
                    <Skeleton className="h-7 w-7 rounded" />
                 </div>
               </div>
            </Card>
          ))
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card key={user.id} className="p-1 group overflow-hidden">
             {/* Security Role Strip */}
             <div className="bg-gray-50/50 p-3 flex justify-between items-center border-b border-gray-100">
               <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-gray-400">
                 {user.role === 'ADMIN' ? <ShieldCheck size={14} className="text-primary" /> : <UserCog size={14} />}
                 {user.role}
               </span>
               <div className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                 {user.isActive ? "Aktif" : "Nonaktif"}
               </div>
             </div>

              <div className="p-3">
                 <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-800 leading-none mb-1">{user.name}</h3>
                  <p className="text-[11px] font-medium text-gray-500">{user.email}</p>
                 </div>

                 <div className="flex gap-1 justify-end pt-2 border-t border-gray-50">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStatus(user)}
                    disabled={session?.user?.id === user.id}
                    className="p-1 h-auto text-gray-400 hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                    title={user.isActive ? "Deactivate" : "Activate"}
                  >
                    {user.isActive ? <Pause size={14} /> : <Play size={14} />}
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(user)}
                    className="p-1 h-auto text-gray-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={14} />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => setUserToDelete(user.id)}
                    disabled={session?.user?.id === user.id}
                    className="p-1 h-auto text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                  >
                    <Trash2 size={14} />
                  </Button>
                 </div>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState 
            icon={UserCog}
            title="Staf tidak ditemukan"
            description="Belum ada akun operasional yang terdaftar untuk filter ini."
          />
        )}
      </div>

      <ConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Akun Staf"
        description="Perhatian: Menghapus akun yang memiliki riwayat log akan dilarang oleh sistem demi audit yang ketat. Sebaiknya gunakan fitur Nonaktifkan (Pause)."
      />

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/20 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-xl border border-gray-200 animate-in zoom-in-95 duration-150">
             <h2 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="p-1.5 bg-primary-light text-primary rounded-lg"><UserCog size={16} /></div>
              Registrasi Akses Baru
            </h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input
                  autoFocus
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Bp. Ahmad"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Sekolah</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="staff@dms.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Posisi / Role</label>
                <select 
                   value={formData.role} 
                   onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                   className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-primary outline-none transition-all font-bold"
                >
                  <option value="STAFF">STAFF / OPERATOR</option>
                  <option value="ADMIN">ADMIN / PENGENDALI</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => setShowAddModal(false)} variant="ghost" className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest">Batal</Button>
                <Button type="submit" loading={submitLoading} disabled={!formData.name.trim() || !formData.email.trim() || formData.password.length < 6 || submitLoading} className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest">Berikan Akses</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/20 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-xl border border-gray-200 animate-in zoom-in-95 duration-150">
             <h2 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="p-1.5 bg-primary-light text-primary rounded-lg"><Edit2 size={16} /></div>
              Ubah Data Staf
            </h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input
                  autoFocus
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Baru</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest ml-1">Reset Password</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Kosongkan jika tidak mau Reset"
                  className="w-full bg-gray-50 border border-amber-200 rounded-lg px-4 py-3 text-sm focus:border-amber-600 outline-none transition-all placeholder:text-gray-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ubah Role</label>
                <select 
                   value={formData.role} 
                   onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                   disabled={activeUserId === session?.user?.id}
                   className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-primary outline-none transition-all font-bold disabled:opacity-50"
                >
                  <option value="STAFF">STAFF / OPERATOR</option>
                  <option value="ADMIN">ADMIN / PENGENDALI</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => setShowEditModal(false)} variant="ghost" className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest">Batal</Button>
                <Button type="submit" loading={submitLoading} disabled={!formData.name.trim() || !formData.email.trim() || (formData.password.length > 0 && formData.password.length < 6) || submitLoading} className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest">Simpan Data</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
