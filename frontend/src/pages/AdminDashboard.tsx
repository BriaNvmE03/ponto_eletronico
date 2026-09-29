import { Button } from "@/components/ui/button";
import { LogOut, Users, Settings, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('@ponto:token');
    localStorage.removeItem('@ponto:user');
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (Admin Menu) */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2 bg-blue-50 text-blue-700">
            <Activity className="h-5 w-5" />
            Visão Geral
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-gray-600">
            <Users className="h-5 w-5" />
            Funcionários
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-gray-600">
            <Settings className="h-5 w-5" />
            Configurações
          </Button>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Button variant="outline" className="w-full justify-center gap-2 text-gray-600" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between md:justify-end">
          <h1 className="text-xl font-bold text-gray-900 md:hidden">Admin Panel</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Gestor</span>
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Visão Geral de Hoje</h2>
            <p className="text-gray-500">Acompanhe as batidas de ponto da sua equipe.</p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center text-emerald-600 mb-2">
                <Users className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Trabalhando</h3>
              </div>
              <p className="text-3xl font-black text-gray-900">0</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center text-orange-500 mb-2">
                <Activity className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Em Pausa</h3>
              </div>
              <p className="text-3xl font-black text-gray-900">0</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center text-gray-500 mb-2">
                <LogOut className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Ausentes</h3>
              </div>
              <p className="text-3xl font-black text-gray-900">0</p>
            </div>
          </div>
          
          {/* Recent Activity Table Placeholder */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Últimas Batidas</h3>
            </div>
            <div className="p-6 text-center text-gray-500 text-sm">
              Nenhuma atividade registrada hoje.
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
