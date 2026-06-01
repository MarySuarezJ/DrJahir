"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, User, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDemoSession } from "@/components/providers/demo-session-provider";
import { roleCredentials, roleMeta, type AppRole } from "@/lib/types/roles";

export function LoginForm() {
  const router = useRouter();
  const { authenticated, ready, login } = useDemoSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    if (ready && authenticated) {
      router.replace("/dashboard");
    }
  }, [authenticated, ready, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const match = roleCredentials.find(
      (c) => c.username === username.trim().toLowerCase() && c.password === password
    );

    if (!match) {
      setError("Usuario o contraseña incorrectos. Revisa la tabla de accesos.");
      return;
    }

    login({ role: match.role as AppRole, displayName: match.displayName });
    router.push("/dashboard");
  }

  function fillCredential(username: string, password: string) {
    setUsername(username);
    setPassword(password);
    setError("");
  }

  return (
    <Card className="overflow-hidden border-brand-line bg-white/86">
      <CardHeader className="space-y-4 border-b border-brand-line bg-brand-cream/80 px-7 py-6">
        <div className="flex items-center justify-between gap-4">
          <Badge variant="gold">Modo demo local</Badge>
          <Badge variant="neutral">Supabase-ready</Badge>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-white/65">Acceso premium</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">Entrar al comando territorial</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-white/78">
            Ingresa con las credenciales de tu rol para acceder al CRM político.
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-7 py-6">
        {/* Tabla de credenciales desplegable */}
        <div className="rounded-2xl border border-brand-gold/25 bg-brand-gold/8">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-left"
            onClick={() => setShowCredentials(!showCredentials)}
          >
            <span className="text-sm font-semibold text-brand-goldSoft">Ver credenciales de acceso por rol</span>
            {showCredentials ? (
              <ChevronUp className="h-4 w-4 text-brand-goldSoft" />
            ) : (
              <ChevronDown className="h-4 w-4 text-brand-goldSoft" />
            )}
          </button>

          {showCredentials && (
            <div className="border-t border-brand-gold/10 px-4 pb-4">
              <div className="mt-3 space-y-2">
                {roleCredentials.map((cred) => {
                  const meta = roleMeta.find((r) => r.value === cred.role);
                  return (
                    <button
                      key={cred.username}
                      type="button"
                      onClick={() => fillCredential(cred.username, cred.password)}
                      className="w-full rounded-xl border border-brand-line bg-white/72 p-3 text-left transition hover:border-brand-gold/25 hover:bg-brand-cream"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-white">{meta?.label}</p>
                          <p className="mt-0.5 text-xs text-white/50">
                            Usuario: <span className="text-white/80 font-mono">{cred.username}</span>
                            {" · "}
                            Clave: <span className="text-white/80 font-mono">{cred.password}</span>
                          </p>
                        </div>
                        <span className="text-xs text-brand-goldSoft">→ usar</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-white/52">Clic en cualquier rol para rellenar el formulario automáticamente.</p>
            </div>
          )}
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.24em] text-white/65">Usuario</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-11"
                placeholder="admin"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.24em] text-white/65">Contraseña</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/85 transition"
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
            <span className="text-sm text-white/58">Demo local — sin servidor externo</span>
            <Button variant="gold" size="lg" type="submit" className="w-full sm:w-auto">
              Ingresar al dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
