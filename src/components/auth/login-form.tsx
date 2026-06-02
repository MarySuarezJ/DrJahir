"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, User, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "@/components/providers/session-provider";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";
import { roleCredentials, type AppRole } from "@/lib/types/roles";

export function LoginForm() {
  const router = useRouter();
  const { authenticated, ready, login } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && authenticated) {
      router.replace("/dashboard");
    }
  }, [authenticated, ready, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const userInput = username.trim().toLowerCase();

    if (hasSupabaseBrowserConfig()) {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: userInput,
        password
      });

      if (signInError || !data.user) {
        setError("Usuario o contraseña incorrectos.");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("perfiles")
        .select("full_name, role")
        .eq("id", data.user.id)
        .single();

      login({
        role: (profile?.role ?? "secretaria") as AppRole,
        displayName: profile?.full_name ?? data.user.email ?? "Usuario"
      });
      router.push("/dashboard");
      return;
    }

    const match = roleCredentials.find((c) => c.username === userInput && c.password === password);

    if (!match) {
      setError("Usuario o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    login({ role: match.role as AppRole, displayName: match.displayName });
    router.push("/dashboard");
  }

  return (
    <Card className="overflow-hidden border-brand-line bg-white/86">
      <CardHeader className="space-y-4 border-b border-brand-line bg-brand-cream/80 px-7 py-6">
        <div className="flex items-center justify-between gap-4">
          <Badge variant="gold">Acceso seguro</Badge>
          <Badge variant="neutral">Supabase Auth</Badge>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-brand-muted">Acceso privado</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-brand-ink">Entrar al comando territorial</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-brand-ink/70">
            Ingresa con tu correo o usuario autorizado. El rol define qué módulos y acciones puedes usar.
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-7 py-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.24em] text-brand-muted">Correo o usuario</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-11"
                placeholder="correo@dominio.com"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.24em] text-brand-muted">Contraseña</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 pr-11"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted transition hover:text-brand-ink"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-brand-ink/58">
              {hasSupabaseBrowserConfig() ? "Autenticación conectada a Supabase" : "Acceso temporal de revisión local"}
            </span>
            <Button variant="gold" size="lg" type="submit" className="w-full sm:w-auto" disabled={loading}>
              {loading ? "Validando..." : "Ingresar al dashboard"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
