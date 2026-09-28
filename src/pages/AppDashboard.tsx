import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { LogOut, MapPin, Clock, Coffee, Play, Square } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export function AppDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email || null);
      } else {
        navigate("/login");
      }
    });

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-12 font-sans">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_10px_-4px_rgba(0,0,0,0.2)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 justify-between items-center">
            <Logo text="Ponto." />
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-foreground">{userEmail}</p>
                <p className="text-xs font-medium text-muted-foreground">Funcionário</p>
              </div>
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase text-lg border border-primary/20">
                {userEmail ? userEmail.charAt(0) : "U"}
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive ml-2" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Relógio Principal */}
        <div className="bg-card rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-border p-8 sm:p-10 text-center space-y-4">
          <p className="text-muted-foreground font-medium text-sm sm:text-base uppercase tracking-wider">
            {format(currentTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <div className="text-6xl sm:text-[88px] font-black text-foreground tracking-tighter tabular-nums leading-none my-6">
            {format(currentTime, "HH:mm:ss")}
          </div>
          
          <div className="flex items-center justify-center text-sm font-medium text-primary gap-2 pt-4 bg-primary/10 w-max mx-auto px-4 py-2 rounded-full">
            <MapPin className="h-4 w-4" />
            <span>São Paulo, SP (Precisão: 15m)</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <Button variant="primary" ripple className="h-28 flex flex-col gap-3 rounded-[20px] shadow-[0_8px_20px_-6px_rgba(0,136,255,0.5)] group">
            <Play className="h-7 w-7 fill-white/20 group-hover:fill-white/40 transition-all" strokeWidth={2} />
            <span className="font-bold text-lg">Entrada</span>
          </Button>
          
          <Button variant="outline" className="h-28 flex flex-col gap-3 rounded-[20px] text-muted-foreground disabled:opacity-50" disabled>
            <Coffee className="h-7 w-7" strokeWidth={2} />
            <span className="font-bold text-lg">Pausa</span>
          </Button>
          
          <Button variant="outline" className="h-28 flex flex-col gap-3 rounded-[20px] text-muted-foreground disabled:opacity-50" disabled>
            <Play className="h-7 w-7" strokeWidth={2} />
            <span className="font-bold text-lg">Retorno</span>
          </Button>
          
          <Button variant="outline" className="h-28 flex flex-col gap-3 rounded-[20px] text-muted-foreground disabled:opacity-50" disabled>
            <Square className="h-7 w-7" strokeWidth={2} />
            <span className="font-bold text-lg">Saída</span>
          </Button>
        </div>

        {/* Resumo do Dia */}
        <div className="bg-card rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-border p-8">
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Clock className="h-5 w-5" />
            </div>
            Resumo de Hoje
          </h3>
          
          <div className="space-y-5">
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-muted-foreground font-medium">Horas Trabalhadas</span>
              <span className="font-bold text-foreground">00h 00m</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-background rounded-full h-3 overflow-hidden">
              <div className="bg-primary h-full rounded-full w-[5%]" />
            </div>
            
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground font-medium">
              <span>0% da carga diária (8h)</span>
              <span>Faltam 08h 00m</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
