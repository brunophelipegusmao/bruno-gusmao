"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShineBorder } from "@/components/ui/shine-border";
import { signIn } from "@/lib/auth-client";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    await signIn.social({
      provider: "google",
      callbackURL: "/ControlPanel",
    });
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData(e.currentTarget);
    const { error } = await signIn.email({
      email: data.get("email") as string,
      password: data.get("password") as string,
      callbackURL: "/ControlPanel",
    });

    if (error) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    router.push("/ControlPanel");
  };

  return (
    <main className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="relative w-full max-w-sm bg-secondary rounded-2xl overflow-hidden p-8 flex flex-col gap-6">
        <ShineBorder shineColor={["#e2e8f0", "#818cf8", "#c4b5fd"]} className="z-40" />

        <div className="flex flex-col gap-1">
          <h1 className="font-heading font-semibold text-primary text-4xl">
            LOGIN_
          </h1>
          <p className="text-sm text-muted-foreground">
            Acesse sua conta para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-heading uppercase text-xs font-bold tracking-wide text-muted-foreground">
              E-mail
            </label>
            <input
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-heading uppercase text-xs font-bold tracking-wide text-muted-foreground">
                Senha
              </label>
              <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Esqueceu a senha?
              </Link>
            </div>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors text-sm"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-foreground text-secondary font-heading uppercase text-sm px-4 py-3 rounded-xl hover:bg-foreground/80 transition-colors disabled:opacity-50"
          >
            {loading ? "Aguarde..." : "Entrar"}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 border border-border bg-background text-foreground font-heading uppercase text-sm px-4 py-3 rounded-xl hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Entrar com Google
          </button>
        </form>
      </div>
    </main>
  );
}
