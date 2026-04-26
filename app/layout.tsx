import type { Metadata } from "next";
import { getSessionFromCookies } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "Assistencia OS",
  description: "Gestao de ordens de servico e acompanhamento tecnico",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSessionFromCookies();

  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {/* Header is session-aware but remains lightweight to keep navigation simple. */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-950">Assistencia OS</p>
            </div>
            {session ? (
              <div className="flex items-center gap-4">
                <a href="/os" className="text-sm text-slate-600 hover:text-slate-900">
                  Ordens
                </a>
                <a href="/relatorios" className="text-sm text-slate-600 hover:text-slate-900">
                  Relatorios
                </a>
                {session.isAdmin && (
                  <a href="/usuarios" className="text-sm text-blue-600 hover:underline">
                    Usuarios
                  </a>
                )}
                <span className="text-sm text-slate-500">{session.username}</span>
                <LogoutButton />
              </div>
            ) : null}
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
