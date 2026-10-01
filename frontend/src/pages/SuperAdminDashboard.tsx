import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Building2, Users, Search, LogOut, CreditCard, Home, Settings, Bell, Shield, User, Menu, X, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

import { UsersTab } from "@/components/superadmin/UsersTab";
import { TenantsTab } from "@/components/superadmin/TenantsTab";
import { PlansTab } from "@/components/superadmin/PlansTab";

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeTabTitle = {
    overview: "Dashboard",
    users: "Users",
    tenants: "Tenants",
    plans: "Planos",
    settings: "Settings",
  }[activeTab as keyof typeof activeTabTitle];

  const { data: tenantsData } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const response = await api.get('/tenants');
      return response.data;
    }
  });

  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await api.get('/plans');
      return response.data;
    }
  });

  return (
    <div className="min-h-screen bg-background flex text-foreground font-sans">
      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-card border-r border-border flex flex-col fixed h-full z-30 shadow-sm ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 md:hidden text-muted-foreground"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Logo Area */}
        <div className="h-20 flex items-center justify-center relative">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shrink-0">
              <Shield className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            {isSidebarOpen && (
              <span className="text-2xl font-extrabold text-foreground tracking-tight">
                SuperAdmin.
              </span>
            )}
          </div>
        </div>

        {/* Sidebar Toggle Button */}
        
        <div className="mx-6 h-px bg-border/80" />

        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border border-border bg-secondary shadow-md hidden md:flex hover:bg-secondary/80 z-40 text-foreground"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>

        <nav className="flex-1 py-4 space-y-1 overflow-y-auto font-medium text-sm">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-12 rounded-none px-6 transition-all relative ${activeTab === "overview" ? "text-primary font-bold dark:text-blue-400 hover:text-primary dark:hover:text-blue-300 hover:bg-transparent" : "text-muted-foreground hover:text-foreground hover:bg-transparent"} ${!isSidebarOpen && 'justify-center px-0'}`}
            onClick={() => { setActiveTab("overview"); setIsMobileMenuOpen(false); }}
            title={!isSidebarOpen ? "Dashboard" : undefined}
          >
            {activeTab === "overview" && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-primary rounded-r-md" />}
            <Home className="h-5 w-5 shrink-0" />
            <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Dashboard</span>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-12 rounded-none px-6 transition-all relative ${activeTab === "users" ? "text-primary font-bold dark:text-blue-400 hover:text-primary dark:hover:text-blue-300 hover:bg-transparent" : "text-muted-foreground hover:text-foreground hover:bg-transparent"} ${!isSidebarOpen && 'justify-center px-0'}`}
            onClick={() => { setActiveTab("users"); setIsMobileMenuOpen(false); }}
            title={!isSidebarOpen ? "Users" : undefined}
          >
            {activeTab === "users" && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-primary rounded-r-md" />}
            <Users className="h-5 w-5 shrink-0" />
            <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Users</span>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-12 rounded-none px-6 transition-all relative ${activeTab === "tenants" ? "text-primary font-bold dark:text-blue-400 hover:text-primary dark:hover:text-blue-300 hover:bg-transparent" : "text-muted-foreground hover:text-foreground hover:bg-transparent"} ${!isSidebarOpen && 'justify-center px-0'}`}
            onClick={() => { setActiveTab("tenants"); setIsMobileMenuOpen(false); }}
            title={!isSidebarOpen ? "Tenants" : undefined}
          >
            {activeTab === "tenants" && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-primary rounded-r-md" />}
            <Building2 className="h-5 w-5 shrink-0" />
            <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Tenants</span>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-12 rounded-none px-6 transition-all relative ${activeTab === "plans" ? "text-primary font-bold dark:text-blue-400 hover:text-primary dark:hover:text-blue-300 hover:bg-transparent" : "text-muted-foreground hover:text-foreground hover:bg-transparent"} ${!isSidebarOpen && 'justify-center px-0'}`}
            onClick={() => { setActiveTab("plans"); setIsMobileMenuOpen(false); }}
            title={!isSidebarOpen ? "Planos" : undefined}
          >
            {activeTab === "plans" && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-primary rounded-r-md" />}
            <CreditCard className="h-5 w-5 shrink-0" />
            <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Planos</span>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-12 rounded-none px-6 transition-all relative ${activeTab === "settings" ? "text-primary font-bold dark:text-blue-400 hover:text-primary dark:hover:text-blue-300 hover:bg-transparent" : "text-muted-foreground hover:text-foreground hover:bg-transparent"} ${!isSidebarOpen && 'justify-center px-0'}`}
            onClick={() => { setActiveTab("settings"); setIsMobileMenuOpen(false); }}
            title={!isSidebarOpen ? "Settings" : undefined}
          >
            {activeTab === "settings" && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-primary rounded-r-md" />}
            <Settings className="h-5 w-5 shrink-0" />
            <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Settings</span>
          </Button>
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-12 rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-500/10 ${!isSidebarOpen && 'justify-center px-0'}`}
            onClick={() => {
              localStorage.removeItem('@ponto:token');
              localStorage.removeItem('@ponto:user');
              navigate('/login');
            }}
            title={!isSidebarOpen ? "Sair" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Sair</span>
          </Button>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'} flex flex-col min-h-screen overflow-x-hidden`}>
        <header className="h-20 border-b border-border bg-background/95 backdrop-blur-sm px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-muted-foreground" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{activeTabTitle}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block mr-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search for something" 
                className="bg-secondary/50 rounded-full pl-12 pr-4 py-2.5 text-sm border-none focus:ring-1 focus:ring-primary w-[300px] text-foreground placeholder:text-muted-foreground transition-shadow" 
              />
            </div>
            
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

        <div className="p-4 md:p-8 flex-1">
          <div className="max-w-7xl mx-auto">
            {activeTab === "overview" && (
              <div className="animate-in fade-in duration-500 flex flex-col items-center justify-center h-96 border-2 border-dashed border-border rounded-3xl bg-card">
                <Activity className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-foreground">Dashboard</h3>
                <p className="text-muted-foreground mt-2">Métricas gerais da plataforma em breve.</p>
              </div>
            )}

            {activeTab === "users" && <UsersTab tenantsData={tenantsData} />}
            {activeTab === "tenants" && <TenantsTab tenantsData={tenantsData} plansData={plansData} />}
            {activeTab === "plans" && <PlansTab plansData={plansData} />}

            {activeTab === "settings" && (
              <div className="animate-in fade-in duration-500 flex flex-col items-center justify-center h-96 border-2 border-dashed border-border rounded-3xl bg-card">
                <Settings className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-foreground">Settings</h3>
                <p className="text-muted-foreground mt-2">Configurações globais do sistema.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}