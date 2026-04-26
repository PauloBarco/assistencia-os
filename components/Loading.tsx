"use client";

export function LoadingSpinner({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600"></div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="animate-pulse rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4">
        <div className="h-5 w-24 rounded bg-slate-200"></div>
        <div className="h-4 w-32 rounded bg-slate-200"></div>
        <div className="h-4 w-48 rounded bg-slate-200"></div>
      </div>
    </div>
  );
}

export function LoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center gap-4 rounded border border-slate-200 bg-white p-4">
          <div className="h-4 w-20 rounded bg-slate-200"></div>
          <div className="h-4 w-32 rounded bg-slate-200"></div>
          <div className="h-4 w-24 rounded bg-slate-200"></div>
          <div className="h-4 w-16 rounded bg-slate-200"></div>
        </div>
      ))}
    </div>
  );
}