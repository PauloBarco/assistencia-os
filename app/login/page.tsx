import { redirect } from "next/navigation";

import { getConfiguredUsername, getSessionFromCookies, isUsingPlaceholderAuthConfig } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await getSessionFromCookies();

  if (session) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e2e8f0_0%,#dbeafe_45%,#f8fafc_100%)] px-6 py-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur lg:grid lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="space-y-4">
          <span className="inline-flex rounded-full bg-sky-100 px-4 py-1 text-sm font-medium text-sky-800">
            Acesso protegido
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
            Entre para gerenciar a assistencia com seguranca.
          </h1>
          <p className="text-sm leading-7 text-slate-600">
            As acoes sensiveis agora exigem sessao autenticada, e as operacoes passam a deixar trilha de auditoria.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-950">Login</h2>
            <p className="mt-2 text-sm text-slate-600">
              Usuario padrao atual: <span className="font-semibold text-slate-900">{getConfiguredUsername()}</span>
            </p>
          </div>
          {isUsingPlaceholderAuthConfig() && (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Atualize `APP_ADMIN_PASSWORD` e `SESSION_SECRET` no `.env` antes de colocar este acesso em uso real.
            </div>
          )}
          <LoginForm defaultUsername={getConfiguredUsername()} />
        </div>
      </div>
    </main>
  );
}
