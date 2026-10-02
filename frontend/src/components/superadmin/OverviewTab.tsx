import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Building2, Users, UserPlus, DollarSign, Activity } from "lucide-react";
import { AnimatedNumber } from "@/components/motion/animated-number";

export function OverviewTab({ tenantsData, plansData }: { tenantsData?: any[], plansData?: any[] }) {
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    }
  });

  const totalTenants = tenantsData?.length || 0;
  const activeTenants = tenantsData?.filter((t: any) => t.status === 'Ativo').length || 0;
  
  const totalUsers = usersData?.length || 0;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsers = usersData?.filter((u: any) => new Date(u.createdAt) >= thirtyDaysAgo).length || 0;

  // Calculando receita baseada nos planos dos tenants ativos
  const totalRevenue = tenantsData?.reduce((acc: number, tenant: any) => {
    if (tenant.status === 'Ativo' && tenant.planId) {
      const plan = plansData?.find((p: any) => p.id === tenant.planId);
      if (plan) {
        return acc + Number(plan.price);
      }
    }
    return acc;
  }, 0) || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Visão Geral</h2>
          <p className="text-muted-foreground mt-1 text-sm">Acompanhe as principais métricas do sistema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        
        {/* Total Tenants */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground mt-1">Total de Tenants</h3>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div>
            <AnimatedNumber value={totalTenants} className="text-4xl font-extrabold text-foreground" />
          </div>
        </div>

        {/* Active Tenants */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground mt-1">Tenants Ativos</h3>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Activity className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div>
            <AnimatedNumber value={activeTenants} className="text-4xl font-extrabold text-foreground" />
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground mt-1">Total de Usuários</h3>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <div>
            {isLoadingUsers ? <p className="text-4xl font-extrabold text-foreground">...</p> : <AnimatedNumber value={totalUsers} className="text-4xl font-extrabold text-foreground" />}
          </div>
        </div>

        {/* New Users */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground leading-tight mt-1">Novos Usuários<br/><span className="text-[11px] font-normal opacity-70">Últimos 30 dias</span></h3>
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <UserPlus className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <div>
            {isLoadingUsers ? <p className="text-4xl font-extrabold text-foreground">...</p> : <AnimatedNumber value={newUsers} className="text-4xl font-extrabold text-foreground" />}
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground leading-tight mt-1">Receita Mensal<br/><span className="text-[11px] font-normal opacity-70">Estimada</span></h3>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div>
            <AnimatedNumber value={totalRevenue} format={(n) => formatCurrency(n)} className="text-2xl font-extrabold text-emerald-500" />
          </div>
        </div>

      </div>
    </div>
  );
}
