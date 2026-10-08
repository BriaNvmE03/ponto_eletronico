import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
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
  const [userName, setUserName] = useState<string>("Usuário");
  const [userInitials, setUserInitials] = useState<string>("U");
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const userStr = localStorage.getItem("@ponto:user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const fullName = user.fullName || user.email || "Usuário";
      const parts = fullName.trim().split(" ");
      if (parts.length > 1) {
        setUserName(parts[0] + " " + parts[1]);
        setUserInitials(parts[0][0] + parts[1][0]);
      } else {
        setUserName(parts[0]);
        setUserInitials(parts[0].substring(0, 2));
      }
    } else {
      navigate("/login");
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    // O snap altera o scrollLeft. Arredondamos para descobrir qual slide está visível.
    const slide = Math.round(scrollLeft / clientWidth);
    setCurrentSlide(slide);
  };

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

    return Number.isNaN(seconds) ? 0 : Math.floor(seconds);
  }, [punches, currentTime]);

  const workedHoursStr = String(Math.floor(workedSeconds / 3600)).padStart(2, '0');
  const workedMinutesStr = String(Math.floor((workedSeconds % 3600) / 60)).padStart(2, '0');
  
  const totalExpectedSeconds = 8 * 3600;
  const progressPercent = Number.isNaN(workedSeconds) ? 0 : Math.min(100, (workedSeconds / totalExpectedSeconds) * 100);
  
  // Arch SVG calculations (radius 40, pi = 3.14159)
  const archLength = 40 * Math.PI; // approx 125.66
  const strokeDashoffset = archLength - (progressPercent / 100) * archLength;

  return (
    <div className="min-h-screen bg-background pb-12 font-sans selection:bg-indigo-500/30">
      <header className="bg-card/50 backdrop-blur-md border-b border-border/50 sticky top-0 z-10">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            
            {/* Esquerda: Foto e Nome */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold uppercase text-sm border border-indigo-500/20 overflow-hidden">
                {userInitials}
              </div>
              <span className="text-sm font-semibold text-foreground">
                {userName}
              </span>
            </div>
            
            {/* Direita: Ações */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8 ml-1" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-0 lg:px-8 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Container Híbrido: Scroll Horizontal (Mobile) | Grid 2-Colunas (Desktop) */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex lg:grid lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[1.5fr_1fr] gap-4 lg:gap-8 overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory lg:snap-none px-4 lg:px-0 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          
          {/* SLIDE 1 (Esquerda no Desktop): Relógio e Ações */}
          <div className="flex-shrink-0 w-[88vw] sm:w-[450px] lg:w-auto snap-center flex flex-col gap-6 lg:gap-8">
            
            {/* Bloco 1: Relógio */}
            <div className="bg-card/40 backdrop-blur-sm rounded-[20px] border border-border/50 p-8 text-center space-y-4">
              <p className="text-indigo-400/80 font-semibold text-[11px] uppercase tracking-widest">
                {format(currentTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <div className="text-6xl sm:text-7xl font-bold text-foreground tracking-tight tabular-nums leading-none drop-shadow-sm">
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
            <div className="bg-card/40 backdrop-blur-sm rounded-[20px] border border-border/50 p-6 sm:p-8 flex-1">
              {isLoadingPunches ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mb-3 text-indigo-500" />
                  <p className="text-sm">Carregando batidas...</p>
                </div>
              ) : (
                <div className="w-full flex flex-col h-full justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground mb-6 flex items-center justify-center gap-2">
                    Próxima Batida: 
                    <strong className="text-foreground font-semibold">
                      {punchCount === 0 ? "Entrada" :
                       punchCount === 1 ? "Início da Pausa" :
                       punchCount === 2 ? "Fim da Pausa" :
                       punchCount === 3 ? "Saída" : "Expediente Encerrado"}
                    </strong>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto w-full">
                    <Button 
                      onClick={handlePunch} 
                      disabled={isPunching || punchCount !== 0}
                      variant="outline"
                      className={`h-24 sm:h-28 rounded-xl text-sm sm:text-base font-normal transition-all flex flex-col items-center justify-center gap-2 ${punchCount === 0 ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-border/50 bg-card/30 text-muted-foreground/50 opacity-60'}`}
                    >
                      {isPunching && punchCount === 0 ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} /> : <Play className="h-5 w-5" strokeWidth={1.5} />}
                      Entrada
                    </Button>

                    <Button 
                      onClick={handlePunch} 
                      disabled={isPunching || punchCount !== 1}
                      variant="outline"
                      className={`h-24 sm:h-28 rounded-xl text-sm sm:text-base font-normal transition-all flex flex-col items-center justify-center gap-2 ${punchCount === 1 ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-border/50 bg-card/30 text-muted-foreground/50 opacity-60'}`}
                    >
                      {isPunching && punchCount === 1 ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} /> : <Clock className="h-5 w-5" strokeWidth={1.5} />}
                      Início Pausa
                    </Button>

                    <Button 
                      onClick={handlePunch} 
                      disabled={isPunching || punchCount !== 2}
                      variant="outline"
                      className={`h-24 sm:h-28 rounded-xl text-sm sm:text-base font-normal transition-all flex flex-col items-center justify-center gap-2 ${punchCount === 2 ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-border/50 bg-card/30 text-muted-foreground/50 opacity-60'}`}
                    >
                      {isPunching && punchCount === 2 ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} /> : <CheckCircle2 className="h-5 w-5" strokeWidth={1.5} />}
                      Retorno
                    </Button>

                    <Button 
                      onClick={handlePunch} 
                      disabled={isPunching || punchCount !== 3}
                      variant="outline"
                      className={`h-24 sm:h-28 rounded-xl text-sm sm:text-base font-normal transition-all flex flex-col items-center justify-center gap-2 ${punchCount === 3 ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-border/50 bg-card/30 text-muted-foreground/50 opacity-60'}`}
                    >
                      {isPunching && punchCount === 3 ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} /> : <Square className="h-5 w-5" strokeWidth={1.5} />}
                      Saída
                    </Button>
                  </div>

                  {isFinished && (
                    <div className="max-w-2xl mx-auto mt-6 w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                      <Square className="h-4 w-4" strokeWidth={2} />
                      <span className="font-medium">Expediente Encerrado! Bom descanso.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SLIDE 2 (Direita no Desktop): Registros e Horas */}
          <div className="flex-shrink-0 w-[88vw] sm:w-[450px] lg:w-auto snap-center flex flex-col gap-6 lg:gap-8">
            
            {/* Bloco 3: Minhas Batidas (Vertical Layout) */}
            <div className="bg-card/40 backdrop-blur-sm rounded-[20px] border border-border/50 p-6 sm:p-8 flex flex-col">
              <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" strokeWidth={2} />
                Minhas Batidas
              </h3>
              
              <div className="flex-1">
                {isLoadingPunches ? (
                   <p className="text-muted-foreground text-xs text-center py-8">Carregando...</p>
                ) : punches.length === 0 ? (
                   <div className="h-[120px] flex items-center justify-center text-xs text-muted-foreground/60 border border-dashed border-border/50 rounded-xl p-8">
                     Nenhuma batida hoje
                   </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    
                    {/* Bloco Entrada e Início Pausa */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-[13px] text-muted-foreground font-medium">Entrada</span>
                        <span className="text-sm text-indigo-400 font-semibold tabular-nums">
                          {punches.find(p => p.type === 'ENTRY') 
                            ? format(new Date(punches.find(p => p.type === 'ENTRY')!.timestamp), "HH:mm") 
                            : "--:--"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <span className="text-[13px] text-muted-foreground font-medium">Início Pausa</span>
                        <span className="text-sm text-indigo-400 font-semibold tabular-nums">
                          {punches.find(p => p.type === 'BREAK_START') 
                            ? format(new Date(punches.find(p => p.type === 'BREAK_START')!.timestamp), "HH:mm") 
                            : "--:--"}
                        </span>
                      </div>
                    </div>

                    <hr className="border-border/30" />

                    {/* Bloco Retorno e Saída */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-[13px] text-muted-foreground font-medium">Retorno</span>
                        <span className="text-sm text-indigo-400 font-semibold tabular-nums">
                          {punches.find(p => p.type === 'BREAK_END') 
                            ? format(new Date(punches.find(p => p.type === 'BREAK_END')!.timestamp), "HH:mm") 
                            : "--:--"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <span className="text-[13px] text-muted-foreground font-medium">Saída</span>
                        <span className="text-sm text-indigo-400 font-semibold tabular-nums">
                          {punches.find(p => p.type === 'EXIT') 
                            ? format(new Date(punches.find(p => p.type === 'EXIT')!.timestamp), "HH:mm") 
                            : "--:--"}
                        </span>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* Bloco 4: Horas Trabalhadas com Arco SVG */}
            <div className="bg-card/40 backdrop-blur-sm rounded-[20px] border border-border/50 p-6 sm:p-8 flex flex-col flex-1">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" strokeWidth={2} />
                Horas Trabalhadas
              </h3>
              
              <div className="flex-1 flex flex-col justify-center items-center">
                <div className="relative flex flex-col items-center justify-center mt-2 w-full max-w-[200px]">
                  {/* Gauge Arc SVG (180 degrees) */}
                  <svg viewBox="0 0 100 55" className="w-full overflow-visible drop-shadow-md">
                    {/* Fundo do Arco */}
                    <path 
                      d="M 10 50 A 40 40 0 0 1 90 50" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      className="text-muted/20" 
                    />
                    {/* Preenchimento do Arco Animado */}
                    <path 
                      d="M 10 50 A 40 40 0 0 1 90 50" 
                      fill="none" 
                      stroke="url(#gradient)" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      className="transition-all duration-1000 ease-out" 
                      strokeDasharray={archLength}
                      strokeDashoffset={strokeDashoffset}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" /> {/* emerald-500 */}
                        <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 */}
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Texto dentro do Arco */}
                  <div className="absolute bottom-1 flex flex-col items-center justify-center">
                    <span className="text-2xl font-semibold text-foreground tracking-tight tabular-nums">
                      {workedHoursStr}h {workedMinutesStr}m
                    </span>
                  </div>
                </div>

                <div className="w-full flex justify-between mt-8">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Carga diária</span>
                    <span className="text-sm font-medium text-foreground">08h 00m</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Total de hoje</span>
                    <span className="text-sm font-medium text-foreground">{workedHoursStr}h {workedMinutesStr}m</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Spacer extra apenas no mobile para revelar uma "espiada" no scroll se quisermos, 
              mas o snap-x com overflow natural já permite um pequeno peek se o container passar. */}
          <div className="flex-shrink-0 w-2 lg:hidden snap-center" aria-hidden="true" />
        </div>

        {/* Paginação Mobile (Pontinhos) */}
        <div className="flex justify-center items-center gap-2 mt-4 lg:hidden">
          <div className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === 0 ? 'bg-indigo-500 w-4' : 'bg-muted-foreground/30 w-1.5'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === 1 ? 'bg-indigo-500 w-4' : 'bg-muted-foreground/30 w-1.5'}`} />
        </div>
      </main>
    </div>
  );
}
