"use client";

import { useEffect, useState } from "react";

import {
  ADMIN_PERMISSIONS,
  DEFAULT_USER_PERMISSIONS,
  getEffectivePermissions,
  USER_PERMISSION_OPTIONS,
  type UserPermissionKey,
  type UserPermissions,
} from "@/lib/permissions";

interface Usuario extends UserPermissions {
  id: string;
  username: string;
  nome: string;
  isAdmin: boolean;
  createdAt: string;
}

type UserForm = {
  username: string;
  password: string;
  nome: string;
  isAdmin: boolean;
  permissions: UserPermissions;
};

function clonePermissions(permissions: UserPermissions): UserPermissions {
  return { ...permissions };
}

function createEmptyForm(): UserForm {
  return {
    username: "",
    password: "",
    nome: "",
    isAdmin: false,
    permissions: clonePermissions(DEFAULT_USER_PERMISSIONS),
  };
}

function getUserPermissions(user: Usuario) {
  return getEffectivePermissions(user);
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [form, setForm] = useState<UserForm>(() => createEmptyForm());

  useEffect(() => {
    void fetchUsuarios();
  }, []);

  async function fetchUsuarios() {
    try {
      const res = await fetch("/api/usuario");

      if (res.status === 403) {
        throw new Error("Voce nao tem permissao para gerenciar usuarios.");
      }

      if (!res.ok) {
        throw new Error("Nao foi possivel carregar os usuarios.");
      }

      const data = (await res.json()) as Usuario[];
      setUsuarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar usuarios");
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditingUser(null);
    setForm(createEmptyForm());
    setError("");
    setShowModal(true);
  }

  function openEdit(user: Usuario) {
    setEditingUser(user);
    setForm({
      username: user.username,
      password: "",
      nome: user.nome,
      isAdmin: user.isAdmin,
      permissions: getUserPermissions(user),
    });
    setError("");
    setShowModal(true);
  }

  function updatePermission(permission: UserPermissionKey, checked: boolean) {
    setForm((current) => ({
      ...current,
      permissions: {
        ...current.permissions,
        [permission]: checked,
      },
    }));
  }

  function updateAdmin(checked: boolean) {
    setForm((current) => ({
      ...current,
      isAdmin: checked,
      permissions: checked ? clonePermissions(ADMIN_PERMISSIONS) : current.permissions,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const permissions = form.isAdmin ? ADMIN_PERMISSIONS : form.permissions;
    const body: Record<string, unknown> = {
      nome: form.nome,
      isAdmin: form.isAdmin,
      ...permissions,
    };

    if (form.password.trim()) {
      body.password = form.password;
    }

    if (!editingUser) {
      body.username = form.username;
      body.password = form.password;
    }

    const url = editingUser ? `/api/usuario/${editingUser.id}` : "/api/usuario";
    const method = editingUser ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error || "Erro ao salvar usuario");
      }

      setShowModal(false);
      await fetchUsuarios();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar usuario");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: Usuario) {
    if (!confirm(`Excluir usuario "${user.nome}"?`)) return;

    try {
      const res = await fetch(`/api/usuario/${user.id}`, { method: "DELETE" });

      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error || "Erro ao excluir usuario");
      }

      await fetchUsuarios();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir usuario");
    }
  }

  const admins = usuarios.filter((user) => user.isAdmin).length;
  const managers = usuarios.filter((user) => getUserPermissions(user).canManageUsers).length;
  const displayedPermissions = form.isAdmin ? ADMIN_PERMISSIONS : form.permissions;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          Carregando usuarios...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_55%,#ffffff_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Administracao</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Gerenciar Usuarios</h1>
              <p className="text-sm text-slate-600">
                Controle acessos por perfil e por permissao operacional.
              </p>
            </div>

            <button
              onClick={openNew}
              className="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              + Novo Usuario
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Usuarios</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{usuarios.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Administradores</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{admins}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Gerenciam usuarios</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{managers}</p>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">Usuario</th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">Perfil</th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">Permissoes</th>
                  <th className="px-5 py-4 text-right text-sm font-semibold text-slate-700">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((user) => {
                  const permissions = getUserPermissions(user);
                  const activePermissions = USER_PERMISSION_OPTIONS.filter((option) => permissions[option.key]);
                  const visiblePermissions = activePermissions.slice(0, 4);
                  const hiddenCount = activePermissions.length - visiblePermissions.length;

                  return (
                    <tr key={user.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950">{user.nome}</p>
                        <p className="mt-1 text-sm text-slate-500">@{user.username}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                            user.isAdmin
                              ? "border-sky-200 bg-sky-50 text-sky-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {user.isAdmin ? "Admin" : "Operador"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {visiblePermissions.map((permission) => (
                            <span
                              key={permission.key}
                              className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                            >
                              {permission.label}
                            </span>
                          ))}
                          {hiddenCount > 0 && (
                            <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                              +{hiddenCount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => openEdit(user)}
                          className="rounded-xl px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="rounded-xl px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {usuarios.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Nenhum usuario cadastrado.
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[1.5rem] bg-white p-6 shadow-[0_30px_100px_rgba(15,23,42,0.22)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">
                  {editingUser ? "Editar Usuario" : "Novo Usuario"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingUser ? editingUser.username : "Defina os dados de acesso"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                {!editingUser && (
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Username</span>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      required
                    />
                  </label>
                )}

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Nome</span>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    required
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Senha {editingUser && "(deixe vazio para manter)"}
                  </span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    required={!editingUser}
                  />
                </label>
              </div>

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="flex items-start gap-3 border-b border-slate-200 pb-4">
                  <input
                    type="checkbox"
                    checked={form.isAdmin}
                    onChange={(e) => updateAdmin(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">Administrador geral</span>
                    <span className="mt-1 block text-sm text-slate-500">Acesso total ao sistema.</span>
                  </span>
                </label>

                <div className="divide-y divide-slate-200">
                  {USER_PERMISSION_OPTIONS.map((permission) => (
                    <label key={permission.key} className="flex items-start gap-3 py-4">
                      <input
                        type="checkbox"
                        checked={displayedPermissions[permission.key]}
                        disabled={form.isAdmin}
                        onChange={(e) => updatePermission(permission.key, e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950 disabled:opacity-60"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">{permission.label}</span>
                        <span className="mt-1 block text-sm text-slate-500">{permission.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
