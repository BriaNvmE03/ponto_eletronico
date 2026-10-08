import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { LogOut, MapPin, Clock, Play, Square, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Punch {
  id: string;
  type: "ENTRY" | "BREAK_START" | "BREAK_END" | "EXIT";
  timestamp: string;
}

export function AppDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const userStr = localStorage.getItem("@ponto:user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserEmail(user.email);
    } else {
      navigate("/login");
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("@ponto:token");
    localStorage.removeItem("@ponto:user");
    navigate("/login");
  };

  // Buscar batidas de hoje
  const { data: punches = [], isLoading: isLoadingPunches } = useQuery<Punch[]>({
    queryKey: ["punches", "today"],
    queryFn: async () => {
      const res = await api.get("/punches/today");
      return res.data;
    },
  });

  // Mutação para registrar ponto
  const punchMutation = useMutation({
    mutationFn: async (coords?: { latitude: number; longitude: number }) => {
      return api.post("/punches", {
        locationLat: coords?.latitude,
        locationLng: coords?.longitude,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["punches", "today"] });
      alert("Ponto registrado com sucesso!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Erro ao registrar o ponto");
    },
  });

  const handlePunch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          punchMutation.mutate(position.coords);
        },
        (error) => {
          console.warn("Geolocalização negada ou falhou", error);
          // Permite bater sem localização por enquanto
          punchMutation.mutate();
        }
      );
    } else {
      punchMutation.mutate();
    }
  };

  const punchCount = punches.length;
  const isFinished = punchCount >= 4;
  const isPunching = punchMutation.isPending;

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
                {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
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
            <span>Sua localização será registrada</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="bg-card rounded-[24px] shadow-sm border border-border p-6 flex flex-col items-center justify-center text-center">

          {isLoadingPunches ? (
            <div className="flex flex-col items-center text-muted-foreground py-8 w-full">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Carregando status do dia...</p>
            </div>
          ) : (
            <div className="w-full">
              <h3 className="text-xl font-medium text-muted-foreground mb-6">
                Próxima Batida: <strong className="text-foreground">{
                  punchCount === 0 ? "Entrada" :
                  punchCount === 1 ? "Início da Pausa" :
                  punchCount === 2 ? "Fim da Pausa" :
                  punchCount === 3 ? "Saída" : "Expediente Encerrado"
                }</strong>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={handlePunch} 
                  disabled={isPunching || punchCount !== 0}
                  variant={punchCount === 0 ? "default" : punchCount > 0 ? "outline" : "secondary"}
                  className={`h-28 rounded-2xl text-lg font-bold transition-all flex flex-col items-center justify-center gap-3 ${punchCount === 0 ? 'shadow-lg shadow-primary/25 scale-105 border-2 border-primary ring-4 ring-primary/10' : punchCount > 0 ? 'opacity-50 border-emerald-500 text-emerald-500 bg-emerald-500/10' : ''}`}
                >
                  {isPunching && punchCount === 0 ? <Loader2 className="h-8 w-8 animate-spin" /> : <Play className="h-8 w-8" />}
                  Entrada
                </Button>

                <Button 
                  onClick={handlePunch} 
                  disabled={isPunching || punchCount !== 1}
                  variant={punchCount === 1 ? "default" : punchCount > 1 ? "outline" : "secondary"}
                  className={`h-28 rounded-2xl text-lg font-bold transition-all flex flex-col items-center justify-center gap-3 ${punchCount === 1 ? 'shadow-lg shadow-primary/25 scale-105 border-2 border-primary ring-4 ring-primary/10' : punchCount > 1 ? 'opacity-50 border-emerald-500 text-emerald-500 bg-emerald-500/10' : ''}`}
                >
                  {isPunching && punchCount === 1 ? <Loader2 className="h-8 w-8 animate-spin" /> : <Clock className="h-8 w-8" />}
                  Início Pausa
                </Button>

                <Button 
                  onClick={handlePunch} 
                  disabled={isPunching || punchCount !== 2}
                  variant={punchCount === 2 ? "default" : punchCount > 2 ? "outline" : "secondary"}
                  className={`h-28 rounded-2xl text-lg font-bold transition-all flex flex-col items-center justify-center gap-3 ${punchCount === 2 ? 'shadow-lg shadow-primary/25 scale-105 border-2 border-primary ring-4 ring-primary/10' : punchCount > 2 ? 'opacity-50 border-emerald-500 text-emerald-500 bg-emerald-500/10' : ''}`}
                >
                  {isPunching && punchCount === 2 ? <Loader2 className="h-8 w-8 animate-spin" /> : <CheckCircle2 className="h-8 w-8" />}
                  Retorno
                </Button>

                <Button 
                  onClick={handlePunch} 
                  disabled={isPunching || punchCount !== 3}
                  variant={punchCount === 3 ? "default" : punchCount > 3 ? "outline" : "secondary"}
                  className={`h-28 rounded-2xl text-lg font-bold transition-all flex flex-col items-center justify-center gap-3 ${punchCount === 3 ? 'shadow-lg shadow-primary/25 scale-105 border-2 border-primary ring-4 ring-primary/10' : punchCount > 3 ? 'opacity-50 border-emerald-500 text-emerald-500 bg-emerald-500/10' : ''}`}
                >
                  {isPunching && punchCount === 3 ? <Loader2 className="h-8 w-8 animate-spin" /> : <Square className="h-8 w-8" />}
                  Saída
                </Button>
              </div>

              {isFinished && (
                <div className="mt-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 p-4 rounded-xl flex items-center justify-center gap-3">
                  <Square className="h-6 w-6" />
                  <span className="font-bold">Expediente Encerrado! Bom descanso.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resumo do Dia */}
        <div className="bg-card rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-border p-8">
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Clock className="h-5 w-5" />
            </div>
            Minhas Batidas
          </h3>
          
          <div className="space-y-4">
            {isLoadingPunches ? (
               <p className="text-muted-foreground text-center">Carregando...</p>
            ) : punches.length === 0 ? (
               <p className="text-muted-foreground text-center py-4 bg-muted/50 rounded-xl">Nenhum ponto registrado hoje.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {punches.map((p, idx) => (
                  <div key={p.id} className="flex justify-between items-center p-4 bg-background border border-border rounded-xl">
                    <div>
                      <p className="font-bold text-foreground">
                        {p.type === "ENTRY" ? "Entrada" : 
                         p.type === "BREAK_START" ? "Início Pausa" : 
                         p.type === "BREAK_END" ? "Retorno" : "Saída"}
                      </p>
                      <p className="text-xs text-muted-foreground">Batida {idx + 1}</p>
                    </div>
                    <div className="text-xl font-black tabular-nums text-primary">
                      {format(new Date(p.timestamp), "HH:mm")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
