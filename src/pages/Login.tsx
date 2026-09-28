import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setErrorMsg(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Busca o perfil do usuário para saber a role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profile) {
        if (profile.role === "superadmin") {
          navigate("/superadmin");
        } else if (profile.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/app");
        }
      } else {
        // Fallback caso não ache o profile
        navigate("/app");
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-8 shadow-lg border border-border">
        <div className="text-center flex flex-col items-center">
          <Logo text="" className="mb-2" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            Ponto Eletrônico
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Faça login para registrar seu ponto
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {errorMsg && (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              {errorMsg}
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-md border-0 py-2.5 px-3 text-foreground bg-background ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-md border-0 py-2.5 px-3 text-foreground bg-background ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              className="flex w-full justify-center"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar no Sistema"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
