import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { Building2, Users, Search, LogOut, CreditCard, DollarSign, Activity, Home, Settings, ChevronLeft, ChevronRight, Bell, Shield, User, MoreVertical, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
type Organization = {
  id: string;
  name: string;
  created_at: string; status?: 'Ativo' | 'Desativado' | 'Pendente' | 'Cancelado'; plan?: string; email?: string;
};

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeTabTitle = {
    overview: "Dashboard",
    users: "Users",
    organizations: "Tenants",
    plans: "Planos",
    settings: "Settings",
  }[activeTab];

  useEffect(() => {
    if (activeTab === "organizations") {
      fetchOrganizations();
    }
  }, [activeTab]);

  const fetchOrganizations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrganizations(data);
    }
    setLoading(false);
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim() || !adminEmail.trim() || !adminPassword.trim() || !adminName.trim()) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    // Chamamos a função RPC no banco para criar tudo numa transação segura
    const { data, error } = await supabase.rpc('create_tenant_with_admin', {
      org_name: newOrgName,
      admin_email: adminEmail,
      admin_password: adminPassword,
      admin_full_name: adminName
    });

    if (!error && data) {
      // Sucesso! Vamos recarregar as empresas
      fetchOrganizations();
      
      // Limpar formulário
      setNewOrgName("");
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
      setIsCreating(false);
    } else {
      alert("Erro ao criar empresa e administrador: " + error?.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground font-sans">
      {/* Sidebar - Inspirado na imagem 2 (Painel Geral) */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-card border-r border-border hidden md:flex flex-col fixed h-full z-20 shadow-sm`}>
        {/* Toggle Button na borda direita, centralizado verticalmente */}
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 rounded-full bg-card border border-border h-6 w-6 shadow-sm text-muted-foreground hover:text-foreground flex items-center justify-center"
        >
          {isSidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>

        <div className="h-20 flex items-center justify-center px-6 mt-2">
          <div className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-full opacity-100' : 'w-0 opacity-0'}`}>
            <Logo text="SuperAdmin." />
          </div>
          {!isSidebarOpen && (
            <div className="mx-auto shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 shadow-[0_8px_16px_-6px_rgba(220,38,38,0.6)]">
              <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
          )}
        </div>

        <div className="px-6 mb-4">
          <div className="h-px bg-border w-full"></div>
        </div>

        <nav className="flex-1 py-2 space-y-1 overflow-y-auto font-medium text-sm">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-12 rounded-none px-6 transition-all relative ${activeTab === "overview" ? "text-primary hover:text-primary hover:bg-transparent" : "text-muted-foreground hover:text-foreground"} ${!isSidebarOpen && 'justify-center px-0'}`}
            onClick={() => setActiveTab("overview")}
            title={!isSidebarOpen ? "Dashboard" : undefined}
          >
            {activeTab === "overview" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-primary rounded-r-md" />
            )}
            <Home className="h-5 w-5 shrink-0" />
            <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Dashboard</span>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-12 rounded-none px-6 transition-all relative ${activeTab === "users" ? "text-primary hover:text-primary hover:bg-transparent" : "text-muted-foreground hover:text-foreground"} ${!isSidebarOpen && 'justify-center px-0'}`}
            onClick={() => setActiveTab("users")}
            title={!isSidebarOpen ? "Users" : undefined}
          >
            {activeTab === "users" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-primary rounded-r-md" />
            )}
            <Users className="h-5 w-5 shrink-0" />
            <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Users</span>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-12 rounded-none px-6 transition-all relative ${activeTab === "organizations" ? "text-primary hover:text-primary hover:bg-transparent" : "text-muted-foreground hover:text-foreground"} ${!isSidebarOpen && 'justify-center px-0'}`}
            onClick={() => setActiveTab("organizations")}
            title={!isSidebarOpen ? "Tenants" : undefined}
          >
            {activeTab === "organizations" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-primary rounded-r-md" />
            )}
            <Building2 className="h-5 w-5 shrink-0" />
            <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Tenants</span>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-12 rounded-none px-6 transition-all relative ${activeTab === "plans" ? "text-primary hover:text-primary hover:bg-transparent" : "text-muted-foreground hover:text-foreground"} ${!isSidebarOpen && 'justify-center px-0'}`}
            onClick={() => setActiveTab("plans")}
            title={!isSidebarOpen ? "Planos" : undefined}
          >
            {activeTab === "plans" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-primary rounded-r-md" />
            )}
            <CreditCard className="h-5 w-5 shrink-0" />
            <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Planos</span>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-12 rounded-none px-6 transition-all relative ${activeTab === "settings" ? "text-primary hover:text-primary hover:bg-transparent" : "text-muted-foreground hover:text-foreground"} ${!isSidebarOpen && 'justify-center px-0'}`}
            onClick={() => setActiveTab("settings")}
            title={!isSidebarOpen ? "Settings" : undefined}
          >
            {activeTab === "settings" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-primary rounded-r-md" />
            )}
            <Settings className="h-5 w-5 shrink-0" />
            <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Settings</span>
          </Button>
        </nav>

        <div className="p-4 mt-auto mb-4 flex flex-col gap-2">
          <Button variant="ghost" className={`w-full justify-start gap-3 h-12 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 ${!isSidebarOpen && 'justify-center px-0'}`} onClick={handleLogout} title={!isSidebarOpen ? "Sair" : undefined}>
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Sair</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'} flex flex-col min-h-screen overflow-x-hidden`}>
        {/* Top Header */}
        <header className="h-20 border-b border-border bg-background/95 backdrop-blur-sm px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{activeTabTitle}</h2>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block mr-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search for something" 
                className="bg-secondary/50 rounded-full pl-12 pr-4 py-2.5 text-sm border-none focus:ring-1 focus:ring-primary w-[300px] text-foreground placeholder:text-muted-foreground transition-shadow" 
              />
            </div>
            
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full bg-secondary/30 hidden sm:flex">
              <Settings className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full bg-secondary/30 hidden sm:flex relative">
              <Bell className="h-5 w-5 text-red-500" />
            </Button>
            
            <div className="bg-secondary/30 rounded-full p-1">
              <ThemeToggle />
            </div>
            
            <div className="h-10 w-10 rounded-full ml-2 border-2 border-border overflow-hidden bg-secondary/50 flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 md:p-10 w-full mx-auto max-w-[1600px]">

          {activeTab === "overview" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              {/* Header Título (Removed since it is now in Top Header) */}
              <div className="mb-6">
                <p className="text-muted-foreground">Visão consolidada do crescimento e faturamento</p>
              </div>

              {/* KPI Cards (4 colunas) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1 */}
                <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <p className="text-sm font-medium">Total de Tenants</p>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-1">{organizations.length}</h3>
                    <p className="text-xs text-muted-foreground">{organizations.length} ativos (100%)</p>
                  </div>
                </div>
                {/* Card 2 */}
                <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <p className="text-sm font-medium">Admins de Tenant</p>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-1">0</h3>
                    <p className="text-xs text-muted-foreground">Administradores cadastrados</p>
                  </div>
                </div>
                {/* Card 3 */}
                <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <p className="text-sm font-medium">Faturamento Mensal</p>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-1">R$ 0,00</h3>
                    <p className="text-xs text-muted-foreground">Baseado nos planos ativos</p>
                  </div>
                </div>
                {/* Card 4 */}
                <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <p className="text-sm font-medium">Taxa de Churn</p>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-1">0.0%</h3>
                    <p className="text-xs text-muted-foreground">Baseada em tenants inativos</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === "organizations" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground tracking-tight">Tenants</h2>
                  <p className="text-muted-foreground mt-1">Gerencie as organizações que utilizam o sistema.</p>
                </div>
                <Button 
                  onClick={() => setIsCreating(true)} 
                  variant="primary"
                  size="md"
                >
                  <span className="text-lg mr-1 font-normal leading-none">+</span>
                  Criar Tenant
                </Button>
              </div>

              <div className="bg-card border border-border rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar por nome..."
                      className="w-full pl-11 pr-4 h-12 bg-secondary/30 rounded-xl border border-border text-sm focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="p-16 text-center text-muted-foreground">Carregando...</div>
                ) : organizations.length === 0 ? (
                  <div className="p-16 text-center flex flex-col items-center">
                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Building2 className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Nenhum Tenant Cadastrado</h3>
                    <p className="text-muted-foreground max-w-sm mt-2 mb-6">Comece adicionando seu primeiro cliente ao sistema.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-foreground">
  <thead className="bg-secondary/50 text-muted-foreground border-b border-border font-medium">
    <tr>
      <th className="px-8 py-5"><div className="flex items-center gap-2"><Building2 className="h-4 w-4"/>Cliente</div></th>
      <th className="px-8 py-5"><div className="flex items-center gap-2"><Calendar className="h-4 w-4"/>Data de Cadastro</div></th>
      <th className="px-8 py-5"><div className="flex items-center gap-2"><Activity className="h-4 w-4"/>Status</div></th>
      <th className="px-8 py-5"><div className="flex items-center gap-2"><CreditCard className="h-4 w-4"/>Plano</div></th>
      <th className="px-8 py-5 text-right"></th>
    </tr>
  </thead>
  <tbody className="divide-y divide-border">
    {organizations.map((org) => {
      const mockEmail = org.email || `contato@${org.name.toLowerCase().replace(/\s+/g, '')}.com`;
      const mockStatus = org.status || 'Ativo';
      const mockPlan = org.plan || 'Plano Básico';
      
      return (
        <tr key={org.id} className="hover:bg-accent/50 transition-colors group">
          <td className="px-8 py-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {org.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-foreground block text-base">{org.name}</span>
                <span className="text-xs text-muted-foreground">{mockEmail}</span>
              </div>
            </div>
          </td>
          <td className="px-8 py-5 text-muted-foreground font-medium">
            {new Date(org.created_at).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' })}
          </td>
          <td className="px-8 py-5">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              mockStatus === 'Ativo' ? 'bg-emerald-500/10 text-emerald-500' :
              mockStatus === 'Desativado' ? 'bg-red-500/10 text-red-500' :
              mockStatus === 'Cancelado' ? 'bg-slate-500/10 text-slate-500' :
              'bg-orange-500/10 text-orange-500'
            }`}>
              {mockStatus}
            </span>
          </td>
          <td className="px-8 py-5 text-muted-foreground font-medium">
            {mockPlan}
          </td>
          <td className="px-8 py-5 text-right">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

                  </div>
                )}
              </div>
            </div>
          )}

          {/* Abas Vazias */}
          {activeTab === "users" && (
            <div className="animate-in fade-in duration-500 flex flex-col items-center justify-center h-96 border-2 border-dashed border-border rounded-3xl bg-card">
              <Users className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-foreground">Users</h3>
              <p className="text-muted-foreground mt-2">Visão geral dos usuários e gestores do sistema.</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="animate-in fade-in duration-500 flex flex-col items-center justify-center h-96 border-2 border-dashed border-border rounded-3xl bg-card">
              <Settings className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-foreground">Settings</h3>
              <p className="text-muted-foreground mt-2">Configurações globais do sistema.</p>
            </div>
          )}

          {activeTab === "plans" && (
            <div className="animate-in fade-in duration-500 flex flex-col items-center justify-center h-96 border-2 border-dashed border-border rounded-3xl bg-card">
              <CreditCard className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-foreground">Planos</h3>
              <p className="text-muted-foreground mt-2">Gerenciamento de assinaturas e billing.</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Criar Tenant */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-border">
              <h3 className="text-xl font-bold text-foreground">Criar Novo Tenant</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="text-muted-foreground hover:text-foreground">
                <span className="text-2xl leading-none">&times;</span>
              </Button>
            </div>
            
            <form onSubmit={handleCreateOrg} className="p-6">
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nome do Tenant *
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="Ex: Empresa ABC"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-card rounded-lg border border-slate-300 focus:border-[#2D60FF] focus:ring-1 focus:ring-[#2D60FF] outline-none transition-all text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Plano de Assinatura
                    </label>
                    <select
                      disabled
                      className="w-full px-4 py-2.5 bg-accent text-muted-foreground rounded-lg border border-slate-300 outline-none cursor-not-allowed text-sm appearance-none"
                    >
                      <option>Plano Padrão (Fixo temporariamente)</option>
                    </select>
                  </div>
                </div>

                <hr className="border-border" />

                <div>
                  <h4 className="text-lg font-bold text-foreground mb-4">Administrador do Tenant</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Nome do Admin *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: João Silva"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-card rounded-lg border border-slate-300 focus:border-[#2D60FF] focus:ring-1 focus:ring-[#2D60FF] outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email do Admin *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Ex: admin@empresa.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-card rounded-lg border border-slate-300 focus:border-[#2D60FF] focus:ring-1 focus:ring-[#2D60FF] outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Senha do Admin *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Senha temporária"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-card rounded-lg border border-slate-300 focus:border-[#2D60FF] focus:ring-1 focus:ring-[#2D60FF] outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="mt-8 pt-4 border-t border-border flex justify-end gap-3">
                <Button type="button" variant="outline" size="md" className="hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-colors" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="md">
                  Criar Tenant
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
