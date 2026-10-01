import { CreditCard, Users, Building2, CheckCircle2 } from "lucide-react";

export function PlansTab({ plansData }: { plansData?: any[] }) {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Planos e Preços</h2>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie os planos de assinatura disponíveis no sistema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plansData?.map((plan: any) => (
          <div key={plan.id} className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute -top-6 -right-6 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity rotate-12 scale-150">
              <CreditCard className="h-48 w-48 text-primary" />
            </div>
            
            <div className="mb-8 relative">
              <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-semibold text-muted-foreground">R$</span>
                <span className="text-4xl font-extrabold text-foreground tracking-tight">{plan.price}</span>
                <span className="text-sm text-muted-foreground font-medium">/mês</span>
              </div>
            </div>

            <div className="space-y-4 flex-1 relative">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Até {plan.maxUsers} usuários</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Até {plan.maxDepartments} departamentos</p>
                </div>
              </div>
              
              <div className="h-px bg-border w-full my-4" />
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">Suporte técnico em horário comercial</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">Relatórios básicos de ponto</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
