import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Building2, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export function TenantsTab({ tenantsData, plansData }: { tenantsData?: any[], plansData?: any[] }) {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantStatus, setTenantStatus] = useState("Ativo");
  const [tenantPlanId, setTenantPlanId] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [tenantError, setTenantError] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<any>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const openCreateModal = () => {
    setIsEditing(false);
    setTenantName("");
    setTenantStatus("Ativo");
    setTenantPlanId(plansData?.[0]?.id || "");
    setAdminName("");
    setAdminEmail("");
    setAdminPassword("");
    setIsModalOpen(true);
  };

  const openEditModal = (tenant: any) => {
    setIsEditing(true);
    setEditingId(tenant.id);
    setTenantName(tenant.name);
    setTenantStatus(tenant.status || "Ativo");
    setTenantPlanId(tenant.planId || "");
    setIsModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/tenants/tenant', {
        tenantName,
        planId: tenantPlanId,
        adminFullName: adminName,
        adminEmail,
        adminPassword
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setIsModalOpen(false);
      setTenantError("");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || "Erro ao criar tenant.";
      if (msg.toLowerCase().includes("e-mail") || msg.toLowerCase().includes("email")) {
        setTenantError(msg);
      } else {
        alert(msg);
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/tenants/${editingId}`, {
        name: tenantName,
        status: tenantStatus,
        planId: tenantPlanId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tenants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setDeleteModalOpen(false);
        setTenantToDelete(null);
        setDeleteConfirmationText("");
      }
    });

  const handleSave = () => {
    if (isEditing) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Tenants</h2>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie as organizações que utilizam o sistema.</p>
        </div>
        <Button onClick={openCreateModal} className="h-12 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all">
          Criar Tenant
        </Button>
      </div>

      <div className="bg-card border border-border rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar tenant por nome..."
              className="w-full pl-11 pr-4 h-12 bg-secondary/30 rounded-xl border border-border text-sm focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {!tenantsData || tenantsData.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Nenhum Tenant encontrado</h3>
            <p className="text-muted-foreground">Você ainda não cadastrou nenhuma empresa.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-secondary/50 text-muted-foreground border-b border-border font-medium">
                <tr>
                  <th className="px-8 py-5">Cliente</th>
                  <th className="px-8 py-5">Data de Cadastro</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Plano</th>
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tenantsData.map((tenant: any) => (
                  <tr key={tenant.id} className="hover:bg-accent/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">{tenant.name}</div>
                          {tenant.users && tenant.users[0] && (
                            <div className="text-xs text-muted-foreground">{tenant.users[0].email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-muted-foreground font-medium">
                      {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tenant.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-500' :
                        tenant.status === 'Cancelado' ? 'bg-red-500/10 text-red-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {tenant.status || 'Ativo'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-muted-foreground font-medium">
                      {tenant.plan?.name || 'Nenhum plano'}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => openEditModal(tenant)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => { setTenantToDelete(tenant); setDeleteModalOpen(true); }}>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg my-8 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-bold text-foreground">{isEditing ? "Editar Tenant" : "Criar Novo Tenant"}</h3>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Nome da Organização</label>
                <input type="text" value={tenantName} onChange={(e) => setTenantName(e.target.value)} className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:bg-background focus:border-primary outline-none transition-all text-sm text-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Plano</label>
                  <select value={tenantPlanId} onChange={(e) => setTenantPlanId(e.target.value)} className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border outline-none transition-all text-sm text-foreground appearance-none">
                    <option value="">Selecione um plano</option>
                    {plansData?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} - R$ {p.price}</option>
                    ))}
                  </select>
                </div>
                {isEditing && (
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Status</label>
                    <select value={tenantStatus} onChange={(e) => setTenantStatus(e.target.value)} className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border outline-none transition-all text-sm text-foreground appearance-none">
                      <option value="Ativo">Ativo</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Desativado">Desativado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="mt-6 pt-6 border-t border-border space-y-5">
                  <h4 className="font-semibold text-foreground">Administrador Inicial</h4>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Nome Completo</label>
                    <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:border-primary outline-none text-sm text-foreground" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">E-mail Corporativo</label>
                    <input type="email" value={adminEmail} onChange={(e) => { setAdminEmail(e.target.value); setTenantError(""); }} className={`w-full px-4 py-2.5 bg-secondary/30 rounded-lg border focus:bg-background focus:ring-1 outline-none text-sm text-foreground ${tenantError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'}`} />
                    {tenantError && <p className="text-xs text-red-500 mt-1">{tenantError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Senha Provisória</label>
                    <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:border-primary outline-none text-sm text-foreground" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-border bg-secondary/10 flex justify-end gap-3 rounded-b-2xl">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                {isEditing ? 'Atualizar Tenant' : 'Criar Tenant'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteModalOpen && tenantToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-[2rem] shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200 overflow-hidden relative border border-border/50">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-full h-8 w-8"
              onClick={() => { setDeleteModalOpen(false); setTenantToDelete(null); setDeleteConfirmationText(""); }}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="p-6 pb-4">
              <div className="flex items-center gap-4 mb-5">
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground tracking-tight">Excluir Tenant</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Esta ação é irreversível.</p>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-5 mb-2">
                <p className="text-[13px] text-foreground mb-4 leading-relaxed">
                  Você está prestes a excluir a organização <strong className="font-bold">{tenantToDelete.name}</strong>. Todos os dados associados a ela serão <strong className="font-bold text-red-600 dark:text-red-400">permanentemente apagados</strong> do sistema.
                </p>
                <div>
                  <label className="text-[11px] font-semibold text-foreground mb-2 block uppercase tracking-wider">
                    Para confirmar, digite <strong className="font-bold text-red-600 dark:text-red-400">CONFIRMAR</strong>:
                  </label>
                  <input 
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder="CONFIRMAR"
                    className="w-full px-4 py-2.5 bg-background rounded-xl border border-border focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>
            
            <div className="px-6 pb-6 pt-2 flex justify-end gap-2">
              <Button 
                variant="ghost" 
                className="font-bold text-muted-foreground hover:text-foreground uppercase text-xs tracking-wider px-4 rounded-full"
                onClick={() => { setDeleteModalOpen(false); setTenantToDelete(null); setDeleteConfirmationText(""); }}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                className="rounded-full font-bold uppercase text-xs tracking-wider px-6 shadow-md"
                onClick={() => deleteMutation.mutate(tenantToDelete.id)}
                disabled={deleteConfirmationText !== 'CONFIRMAR' || deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
