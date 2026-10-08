import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { LogOut, MapPin, Clock, Play, Square, Loader2, CheckCircle2, Activity } from "lucide-react";
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

  const { data: punches = [], isLoading: isLoadingPunches } = useQuery<Punch[]>({
    queryKey: ["punches", "today"],
    queryFn: async () => {
      const res = await api.get("/punches/today");
      return res.data;
    },
  });

  const punchMutation = useMutation({
    mutationFn: async (coords?: { latitude: number; longitude: number }) => {
      return api.post("/punches", {
        locationLat: coords?.latitude,
        locationLng: coords?.longitude,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["punches", "today"] });
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

  // Cálculo de horas trabalhadas
  const workedSeconds = useMemo(() => {
    let seconds = 0;
    const now = currentTime;
    
    const entry = punches.find(p => p.type === "ENTRY");
    const breakStart = punches.find(p => p.type === "BREAK_START");
    const breakEnd = punches.find(p => p.type === "BREAK_END");
    const exit = punches.find(p => p.type === "EXIT");

    if (entry) {
      const start1 = new Date(entry.timestamp);
      const end1 = breakStart ? new Date(breakStart.timestamp) : now;
      seconds += Math.max(0, end1.getTime() - start1.getTime()) / 1000;
    }

    if (breakEnd) {
      const start2 = new Date(breakEnd.timestamp);
      const end2 = exit ? new Date(exit.timestamp) : now;
      seconds += Math.max(0, end2.getTime() - start2.getTime()) / 1000;
    }

    return Math.floor(seconds);
  }, [punches, currentTime]);

  const workedHoursStr = String(Math.floor(workedSeconds / 3600)).padStart(2, '0');
  const workedMinutesStr = String(Math.floor((workedSeconds % 3600) / 60)).padStart(2, '0');
  
  const totalExpectedSeconds = 8 * 3600;
  const progressPercent = Math.min(100, (workedSeconds / totalExpectedSeconds) * 100);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="min-h-screen bg-background pb-12 font-sans selection:bg-indigo-500/30">
      <header className="bg-card/50 backdrop-blur-md border-b border-border/50 sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <Logo text="Ponto." />
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-foreground">{userEmail}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold uppercase text-xs border border-indigo-500/20">
                {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8 ml-1" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Bloco 1: Relógio */}
        <div className="bg-card/40 backdrop-blur-sm rounded-[20px] border border-border/50 p-8 text-center space-y-4">
          <p className="text-indigo-400/80 font-semibold text-[11px] uppercase tracking-widest">
            {format(currentTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <div className="text-6xl sm:text-7xl font-bold text-foreground tracking-tight tabular-nums leading-none">
            {format(currentTime, "HH:mm:ss")}
          </div>
          <div className="flex justify-center pt-2">
            <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 rounded-full py-1.5 px-4 text-xs font-medium border border-indigo-500/10">
              <MapPin className="h-3 w-3" />
              Sua localização será registrada
            </div>
          </div>
        </div>

        {/* Bloco 2: Ações */}
        <div className="bg-card/40 backdrop-blur-sm rounded-[20px] border border-border/50 p-6 sm:p-8">
          {isLoadingPunches ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mb-3 text-indigo-500" />
              <p className="text-sm">Carregando batidas...</p>
            </div>
          ) : (
            <div className="w-full">
              <h3 className="text-sm font-medium text-muted-foreground mb-5 flex items-center justify-center gap-2">
                Próxima Batida: 
                <strong className="text-foreground font-semibold">
                  {punchCount === 0 ? "Entrada" :
                   punchCount === 1 ? "Início da Pausa" :
                   punchCount === 2 ? "Fim da Pausa" :
                   punchCount === 3 ? "Saída" : "Expediente Encerrado"}
                </strong>
              </h3>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
                <Button 
                  onClick={handlePunch} 
                  disabled={isPunching || punchCount !== 0}
                  variant="outline"
                  className={`h-24 sm:h-28 rounded-xl text-sm sm:text-base font-normal transition-all flex flex-col items-center justify-center gap-2 ${punchCount === 0 ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500' : 'border-border/50 bg-card/30 text-muted-foreground/50 opacity-60'}`}
                >
                  {isPunching && punchCount === 0 ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} /> : <Play className="h-5 w-5" strokeWidth={1.5} />}
                  Entrada
                </Button>

                <Button 
                  onClick={handlePunch} 
                  disabled={isPunching || punchCount !== 1}
                  variant="outline"
                  className={`h-24 sm:h-28 rounded-xl text-sm sm:text-base font-normal transition-all flex flex-col items-center justify-center gap-2 ${punchCount === 1 ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500' : 'border-border/50 bg-card/30 text-muted-foreground/50 opacity-60'}`}
                >
                  {isPunching && punchCount === 1 ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} /> : <Clock className="h-5 w-5" strokeWidth={1.5} />}
                  Início Pausa
                </Button>

                <Button 
                  onClick={handlePunch} 
                  disabled={isPunching || punchCount !== 2}
                  variant="outline"
                  className={`h-24 sm:h-28 rounded-xl text-sm sm:text-base font-normal transition-all flex flex-col items-center justify-center gap-2 ${punchCount === 2 ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500' : 'border-border/50 bg-card/30 text-muted-foreground/50 opacity-60'}`}
                >
                  {isPunching && punchCount === 2 ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} /> : <CheckCircle2 className="h-5 w-5" strokeWidth={1.5} />}
                  Retorno
                </Button>

                <Button 
                  onClick={handlePunch} 
                  disabled={isPunching || punchCount !== 3}
                  variant="outline"
                  className={`h-24 sm:h-28 rounded-xl text-sm sm:text-base font-normal transition-all flex flex-col items-center justify-center gap-2 ${punchCount === 3 ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500' : 'border-border/50 bg-card/30 text-muted-foreground/50 opacity-60'}`}
                >
                  {isPunching && punchCount === 3 ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} /> : <Square className="h-5 w-5" strokeWidth={1.5} />}
                  Saída
                </Button>
              </div>

              {isFinished && (
                <div className="max-w-2xl mx-auto mt-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                  <Square className="h-4 w-4" strokeWidth={2} />
                  <span className="font-medium">Expediente Encerrado! Bom descanso.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bloco 3 e 4: Registros e Horas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Minhas Batidas */}
          <div className="bg-card/40 backdrop-blur-sm rounded-[20px] border border-border/50 p-6 sm:p-8 flex flex-col">
            <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-400" strokeWidth={2} />
              Minhas Batidas
            </h3>
            
            <div className="space-y-3 flex-1">
              {isLoadingPunches ? (
                 <p className="text-muted-foreground text-xs text-center py-8">Carregando...</p>
              ) : punches.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-xs text-muted-foreground/60 border border-dashed border-border/50 rounded-xl p-8">
                   Nenhuma batida hoje
                 </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {punches.map((p, idx) => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-card/30 border border-border/40 rounded-lg">
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {p.type === "ENTRY" ? "Entrada" : 
                           p.type === "BREAK_START" ? "Início Pausa" : 
                           p.type === "BREAK_END" ? "Retorno" : "Saída"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Batida {idx + 1}</p>
                      </div>
                      <div className="text-sm font-bold tabular-nums text-indigo-400">
                        {format(new Date(p.timestamp), "HH:mm")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Horas Trabalhadas */}
          <div className="bg-card/40 backdrop-blur-sm rounded-[20px] border border-border/50 p-6 sm:p-8 flex flex-col">
            <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" strokeWidth={2} />
              Horas Trabalhadas
            </h3>
            
            <div className="flex-1 flex flex-col justify-center items-center py-4">
              <div className="relative flex items-center justify-center mb-6">
                <svg width="120" height="120" className="-rotate-90">
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-muted/20"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground tracking-tight tabular-nums">
                    {workedHoursStr}<span className="text-muted-foreground text-sm font-medium">h</span> {workedMinutesStr}<span className="text-muted-foreground text-sm font-medium">m</span>
                  </span>
                </div>
              </div>

              <div className="w-full space-y-2">
                <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                  <span>Progresso Diário</span>
                  <span>08:00 Previsto</span>
                </div>
                <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
