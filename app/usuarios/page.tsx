"use client";

import { useEffect, useState } from "react";

interface Usuario {
  id: string;
  username: string;
  nome: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [form, setForm] = useState({ username: "", password: "", nome: "", isAdmin: false });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  async function fetchUsuarios() {
    try {
      const res = await fetch("/api/usuario");
      if (!res.ok) throw new Error("Nao autorizado");
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      setError("Erro ao carregar usuarios");
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditingUser(null);
    setForm({ username: "", password: "", nome: "", isAdmin: false });
    setShowModal(true);
  }

  function openEdit(user: Usuario) {
    setEditingUser(user);
    setForm({ username: user.username, password: "", nome: user.nome, isAdmin: user.isAdmin });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const url = editingUser ? `/api/usuario/${editingUser.id}` : "/api/usuario";
    const method = editingUser ? "PUT" : "POST";

    const body: Record<string, string> = { nome: form.nome };
    if (form.password) body.password = form.password;
    if (form.isAdmin) body.isAdmin = "true";
    if (!editingUser) {
      body.username = form.username;
      body.password = form.password;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar");
      }

      setShowModal(false);
      fetchUsuarios();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    }
  }

  async function handleDelete(user: Usuario) {
    if (!confirm(`Excluir usuario "${user.nome}"?`)) return;

    try {
      const res = await fetch(`/api/usuario/${user.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao excluir");
      }
      fetchUsuarios();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir");
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Usuarios</h1>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Novo Usuario
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">Username</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Nome</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Admin</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{user.username}</td>
              <td className="border border-gray-300 px-4 py-2">{user.nome}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {user.isAdmin ? "Sim" : "Nao"}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <button onClick={() => openEdit(user)} className="text-blue-600 hover:underline mr-3">
                  Editar
                </button>
                <button onClick={() => handleDelete(user)} className="text-red-600 hover:underline">
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">{editingUser ? "Editar Usuario" : "Novo Usuario"}</h2>
            <form onSubmit={handleSubmit}>
              {!editingUser && (
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 rounded"
                    required
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Senha {editingUser && "(deixe vazio para manter)"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                  required={!editingUser}
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.isAdmin}
                    onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })}
                    className="mr-2"
                  />
                  Usuario administrador
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}