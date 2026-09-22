import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, MapPin, Clock, Coffee, Play } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AppDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Meu Ponto</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">João Silva</p>
                <p className="text-xs text-gray-500">Desenvolvedor Front-end</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                JS
              </div>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-600">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Relógio Principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
          <p className="text-gray-500 font-medium">
            {format(currentTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <div className="text-6xl sm:text-8xl font-black text-gray-900 tracking-tighter tabular-nums">
            {format(currentTime, "HH:mm:ss")}
          </div>
          
          <div className="flex items-center justify-center text-sm text-gray-500 gap-2 pt-4">
            <MapPin className="h-4 w-4" />
            <span>São Paulo, SP (Precisão: 15m)</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-4">
          <Button className="h-24 flex flex-col gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
            <Play className="h-6 w-6" />
            <span className="font-semibold text-lg">Entrada</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl" disabled>
            <Coffee className="h-6 w-6" />
            <span className="font-semibold text-lg">Pausa</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl" disabled>
            <Play className="h-6 w-6" />
            <span className="font-semibold text-lg">Retorno</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2 border-gray-200 text-gray-400 rounded-xl" disabled>
            <LogOut className="h-6 w-6" />
            <span className="font-semibold text-lg">Saída</span>
          </Button>
        </div>

        {/* Resumo do Dia */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            Resumo de Hoje
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Horas Trabalhadas</span>
              <span className="font-medium text-gray-900">00h 00m</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '0%' }}></div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-500">
              <span>0% da carga diária (8h)</span>
              <span>Faltam 08h 00m</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
