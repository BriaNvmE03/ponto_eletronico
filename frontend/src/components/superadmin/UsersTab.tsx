import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, User, Pencil, Trash2, Phone, Shield, Building2, Calendar, Settings, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { z } from "zod";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

const createUserFormSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().refine((v) => !v || phoneRegex.test(v), "Telefone inválido. Use (99) 99999-9999").optional(),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  role: z.string().min(1),
  tenantId: z.string().optional(),
});

const editUserFormSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().refine((v) => !v || phoneRegex.test(v), "Telefone inválido. Use (99) 99999-9999").optional(),
});

type CreateFormErrors = Partial<Record<keyof z.infer<typeof createUserFormSchema>, string>>;
type EditFormErrors = Partial<Record<keyof z.infer<typeof editUserFormSchema>, string>>;


export function UsersTab({ tenantsData }: { tenantsData?: any[] }) {
  const queryClient = useQueryClient();

  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("EMPLOYEE");
  const [newUserTenantId, setNewUserTenantId] = useState(tenantsData?.[0]?.id || "");
  const [isTemporaryPassword, setIsTemporaryPassword] = useState(false);
  const [createErrors, setCreateErrors] = useState<CreateFormErrors>({});

  const formatPhone = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    if (raw.length === 0) return '';
    if (raw.length <= 2) return `(${raw}`;
    if (raw.length <= 7) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserPhone(formatPhone(e.target.value));
    if (createErrors.phone) setCreateErrors((p) => ({ ...p, phone: undefined }));
  };

  const handleEditPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditPhone(formatPhone(e.target.value));
    if (editErrors.phone) setEditErrors((p) => ({ ...p, phone: undefined }));
  };


  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        fullName: newUserName,
        email: newUserEmail,
        phone: newUserPhone,
        password: newUserPassword,
        role: newUserRole,
        tenantId: newUserTenantId || null,
        isFirstLogin: isTemporaryPassword
      };
      await api.post('/users', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setIsCreateUserModalOpen(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPhone("");
      setNewUserPassword("");
      setNewUserRole("EMPLOYEE");
      setIsTemporaryPassword(false);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || "Erro ao criar usuário.";
      if (msg.toLowerCase().includes("e-mail") || msg.toLowerCase().includes("email")) {
        setCreateErrors(prev => ({ ...prev, email: msg }));
      } else {
        alert(msg);
      }
    }
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("EMPLOYEE");
  const [editTenantId, setEditTenantId] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editErrors, setEditErrors] = useState<EditFormErrors>({});

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const openEditModal = (user: any) => {
    setUserToEdit(user);
    setEditName(user.fullName);
    setEditEmail(user.email);
    setEditPhone(user.phone || "");
    setEditRole(user.role);
    setEditTenantId(user.tenantId || user.tenant?.id || "");
    setEditIsActive(user.isActive);
    setShowChangePassword(false);
    setNewPassword("");
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = () => {
    const result = editUserFormSchema.safeParse({ fullName: editName, email: editEmail, phone: editPhone || undefined });
    if (!result.success) {
      const errs: EditFormErrors = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as keyof EditFormErrors] = i.message; });
      setEditErrors(errs);
      return;
    }
    setEditErrors({});
    updateUserMutation.mutate();
  };

  const handleSubmitCreate = () => {
    const result = createUserFormSchema.safeParse({
      fullName: newUserName, email: newUserEmail, phone: newUserPhone || undefined,
      password: newUserPassword, role: newUserRole, tenantId: newUserTenantId || undefined,
    });
    if (!result.success) {
      const errs: CreateFormErrors = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as keyof CreateFormErrors] = i.message; });
      setCreateErrors(errs);
      return;
    }
    setCreateErrors({});
    createUserMutation.mutate();
  };

  const updateUserMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/users/${userToEdit.id}`, {
        fullName: editName,
        email: editEmail,
        phone: editPhone || null,
        role: editRole,
        tenantId: editTenantId || null,
        isActive: editIsActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setIsEditModalOpen(false);
      setUserToEdit(null);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || "Erro ao atualizar usuário.";
      if (msg.toLowerCase().includes("e-mail") || msg.toLowerCase().includes("email")) {
        setEditErrors(prev => ({ ...prev, email: msg }));
      } else {
        alert(msg);
      }
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/users/${userToEdit.id}/password`, { newPassword });
    },
    onSuccess: () => {
      setShowChangePassword(false);
      setNewPassword("");
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Gerenciamento de Usuários</h2>
          <p className="text-muted-foreground mt-1 text-sm">Visualize e gerencie todos os usuários cadastrados na plataforma.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar usuário..."
              className="w-full pl-11 pr-4 h-10 bg-secondary/30 rounded-lg border border-border text-sm focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            onClick={() => setIsCreateUserModalOpen(true)}
            className="ml-auto"
          >
            <User className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        {isLoadingUsers ? (
          <div className="p-16 text-center text-muted-foreground">Carregando usuários...</div>
        ) : !usersData || usersData.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Nenhum usuário encontrado</h3>
            <p className="text-muted-foreground">Não há usuários registrados no sistema ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-secondary/50 text-muted-foreground border-b border-border font-medium">
                <tr>
                  <th className="px-8 py-5">
                    <div className="flex items-center gap-2"><User className="h-4 w-4" /> Nome / Email</div>
                  </th>
                  <th className="px-8 py-5">
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> Telefone</div>
                  </th>
                  <th className="px-8 py-5">
                    <div className="flex items-center gap-2"><Shield className="h-4 w-4" /> Role</div>
                  </th>
                  <th className="px-8 py-5">
                    <div className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Tenant</div>
                  </th>
                  <th className="px-8 py-5">
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Data</div>
                  </th>
                  <th className="px-8 py-5">
                    <div className="flex items-center gap-2"><Shield className="h-4 w-4" /> Status</div>
                  </th>
                  <th className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2"><Settings className="h-4 w-4" /> Ações</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersData.map((user: any) => (
                  <tr key={user.id} className="hover:bg-accent/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">{user.fullName}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-muted-foreground font-medium">
                      {user.phone || '-'}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'SUPERADMIN' ? 'bg-purple-500/10 text-purple-500' :
                        user.role === 'ADMIN' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-slate-500/10 text-slate-500'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-muted-foreground font-medium">
                      {user.tenant ? user.tenant.name : 'Nenhuma'}
                    </td>
                    <td className="px-8 py-5 text-muted-foreground font-medium">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                        {user.isActive ? 'Ativo' : 'Desativado'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => openEditModal(user)}
                          title="Editar Usuário"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setUserToDelete(user);
                            setDeleteConfirmationText("");
                            setDeleteModalOpen(true);
                          }}
                          title="Excluir Usuário"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && userToEdit && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg my-8 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">Editar Usuário</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{userToEdit.email}</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsEditModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => { setEditName(e.target.value); if (editErrors.fullName) setEditErrors(p => ({ ...p, fullName: undefined })); }}
                  className={`w-full px-4 py-2.5 bg-secondary/30 rounded-lg border focus:bg-background focus:ring-1 outline-none transition-all text-sm text-foreground ${editErrors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'}`}
                />
                {editErrors.fullName && <p className="text-xs text-red-500 mt-1">{editErrors.fullName}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">E-mail</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => { setEditEmail(e.target.value); if (editErrors.email) setEditErrors(p => ({ ...p, email: undefined })); }}
                    className={`w-full px-4 py-2.5 bg-secondary/30 rounded-lg border focus:bg-background focus:ring-1 outline-none transition-all text-sm text-foreground ${editErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'}`}
                  />
                  {editErrors.email && <p className="text-xs text-red-500 mt-1">{editErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Telefone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={handleEditPhoneChange}
                    placeholder="(11) 99999-9999"
                    className={`w-full px-4 py-2.5 bg-secondary/30 rounded-lg border focus:bg-background focus:ring-1 outline-none transition-all text-sm text-foreground ${editErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'}`}
                  />
                  {editErrors.phone && <p className="text-xs text-red-500 mt-1">{editErrors.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Cargo / Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-foreground appearance-none"
                  >
                    <option value="EMPLOYEE">Funcionário Normal</option>
                    <option value="ADMIN">Administrador (RH)</option>
                    <option value="SUPERADMIN">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Tenant / Organização</label>
                  <select
                    value={editTenantId}
                    onChange={(e) => setEditTenantId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-foreground appearance-none"
                  >
                    <option value="">Nenhum tenant</option>
                    {tenantsData?.map((tenant: any) => (
                      <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status + Senha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Status toggle compacto */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Acesso ao Sistema</label>
                  <div
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-secondary/30 cursor-pointer select-none w-full hover:bg-secondary/50 transition-colors"
                    onClick={() => setEditIsActive(!editIsActive)}
                  >
                    <button
                      type="button"
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none shrink-0 ${editIsActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${editIsActive ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                    </button>
                    <div className="flex flex-col justify-center">
                      <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider leading-none mb-0.5">Status</p>
                      <p className={`text-[13px] font-bold leading-none ${editIsActive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {editIsActive ? 'Ativo' : 'Desativado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botão trocar senha */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Segurança</label>
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-primary bg-transparent hover:bg-primary/10 transition-colors text-[13px] font-bold text-primary w-full shadow-sm"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                    </svg>
                    Trocar Senha
                  </button>
                </div>
              </div>

              {/* Campo senha (condicional) */}
              {showChangePassword && (
                <div className="flex items-end gap-2 p-3 rounded-lg bg-secondary/20 border border-border animate-in slide-in-from-top-2 duration-200">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-foreground mb-1">Nova Senha</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full px-3 py-2 bg-background rounded-md border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-foreground"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => changePasswordMutation.mutate()}
                    disabled={newPassword.length < 8 || changePasswordMutation.isPending}
                    className="shrink-0"
                  >
                    {changePasswordMutation.isPending ? '...' : 'Salvar'}
                  </Button>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-border bg-secondary/10 flex justify-end gap-3 rounded-b-2xl">
              <Button
                variant="ghost"
                onClick={() => setIsEditModalOpen(false)}
                className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitEdit}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isCreateUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg my-8 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-bold text-foreground">Criar Novo Usuário</h3>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => { setNewUserName(e.target.value); if (createErrors.fullName) setCreateErrors(p => ({ ...p, fullName: undefined })); }}
                  placeholder="Ex: João da Silva"
                  className={`w-full px-4 py-2.5 bg-secondary/30 rounded-lg border focus:bg-background focus:ring-1 outline-none transition-all text-sm text-foreground ${createErrors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'}`}
                />
                {createErrors.fullName && <p className="text-xs text-red-500 mt-1">{createErrors.fullName}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">E-mail</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => { setNewUserEmail(e.target.value); if (createErrors.email) setCreateErrors(p => ({ ...p, email: undefined })); }}
                    placeholder="joao@empresa.com"
                    className={`w-full px-4 py-2.5 bg-secondary/30 rounded-lg border focus:bg-background focus:ring-1 outline-none transition-all text-sm text-foreground ${createErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'}`}
                  />
                  {createErrors.email && <p className="text-xs text-red-500 mt-1">{createErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Telefone <span className="text-muted-foreground font-normal">(Opcional)</span></label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    className={`w-full px-4 py-2.5 bg-secondary/30 rounded-lg border focus:bg-background focus:ring-1 outline-none transition-all text-sm text-foreground ${createErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'}`}
                  />
                  {createErrors.phone && <p className="text-xs text-red-500 mt-1">{createErrors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Senha</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => { setNewUserPassword(e.target.value); if (createErrors.password) setCreateErrors(p => ({ ...p, password: undefined })); }}
                  placeholder="Mínimo 8 caracteres"
                  className={`w-full px-4 py-2.5 bg-secondary/30 rounded-lg border focus:bg-background focus:ring-1 outline-none transition-all text-sm text-foreground ${createErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'}`}
                />
                {createErrors.password && <p className="text-xs text-red-500 mt-1">{createErrors.password}</p>}

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isTemporary"
                    checked={isTemporaryPassword}
                    onChange={(e) => setIsTemporaryPassword(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isTemporary" className="text-sm text-foreground font-medium cursor-pointer">
                    Senha temporária?
                  </label>
                </div>

                {isTemporaryPassword && (
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 font-medium">O usuário deverá trocar essa senha no primeiro acesso.</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Cargo / Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-foreground appearance-none"
                  >
                    <option value="EMPLOYEE">Funcionário Normal</option>
                    <option value="ADMIN">Administrador (RH)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Vincular ao Tenant</label>
                  <select
                    value={newUserTenantId}
                    onChange={(e) => setNewUserTenantId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-foreground appearance-none"
                  >
                    {tenantsData?.map((tenant: any) => (
                      <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border bg-secondary/10 flex justify-end gap-3 rounded-b-2xl">
              <Button
                variant="ghost"
                onClick={() => setIsCreateUserModalOpen(false)}
                className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitCreate}
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? 'Salvando...' : 'Criar Usuário'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200 overflow-hidden relative border border-border/50 flex flex-col">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-full h-8 w-8"
              onClick={() => { setDeleteModalOpen(false); setUserToDelete(null); setDeleteConfirmationText(""); }}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="p-6 pb-5">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center shrink-0"
                  style={isDark
                    ? { backgroundColor: 'rgba(153,27,27,0.5)', color: '#ef4444' }
                    : { backgroundColor: 'rgba(239,68,68,0.12)', color: '#dc2626' }
                  }
                >
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground tracking-tight">Excluir Usuário</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Esta ação é irreversível.</p>
                </div>
              </div>

              <div
                className="rounded-2xl p-5"
                style={isDark
                  ? { backgroundColor: 'rgba(153,27,27,0.4)', border: '1px solid rgba(153,27,27,0.6)' }
                  : { backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }
                }
              >
                <p
                  className="text-[13px] mb-4 leading-relaxed"
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                >
                  Você está prestes a excluir o usuário{' '}
                  <strong className="font-bold text-red-500">{userToDelete.fullName}</strong>. Todos os dados
                  associados a ele serão{' '}
                  <strong className="font-bold text-red-500">permanentemente apagados</strong> do sistema.
                </p>
                <div>
                  <label
                    className="text-[11px] font-bold mb-2 block uppercase tracking-wider"
                    style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#0f172a' }}
                  >
                    Para confirmar, digite <strong className="font-bold text-red-500">CONFIRMAR</strong>:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder="CONFIRMAR"
                    style={isDark
                      ? { backgroundColor: 'rgba(248,250,252,1)', color: '#0f172a', borderColor: 'transparent' }
                      : { backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#fca5a5' }
                    }
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-red-500 transition-all text-sm font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div
              className="px-6 py-4 border-t border-border/50 flex justify-end gap-3"
              style={{ backgroundColor: isDark ? 'transparent' : '#ffffff' }}
            >
              <Button
                variant="ghost"
                className="font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 uppercase text-[11px] tracking-wider px-4"
                onClick={() => { setDeleteModalOpen(false); setUserToDelete(null); setDeleteConfirmationText(""); }}
              >
                CANCELAR
              </Button>
              <Button
                variant="destructive"
                className="rounded-full font-bold uppercase text-[11px] tracking-wider px-6 bg-red-600 hover:bg-red-700 text-white shadow-md"
                onClick={() => deleteUserMutation.mutate(userToDelete.id)}
                disabled={deleteConfirmationText !== 'CONFIRMAR' || deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? 'EXCLUINDO...' : 'EXCLUIR'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
