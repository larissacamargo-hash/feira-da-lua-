import React, { useState } from 'react';
import { useFeira } from '../context/FeiraContext.tsx';
import { UserAccount, UserRole } from '../types.ts';
import {
  ShieldCheck,
  UserPlus,
  Lock,
  CheckCircle,
  XCircle,
  Edit2,
  Key,
  UserCheck,
  Shield,
  Eye,
  Wallet,
  Sparkles,
} from 'lucide-react';

export const UsuariosView: React.FC = () => {
  const { users, currentUser, setCurrentUser, addUser, updateUser, toggleUserStatus } = useFeira();

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form state
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('operador');
  const [cargo, setCargo] = useState('Fiscal de Caixa e Cobrança');

  const openAddModal = () => {
    setNome('');
    setEmail('');
    setRole('operador');
    setCargo('Fiscal de Caixa e Cobrança');
    setIsAddUserModalOpen(true);
  };

  const openEditModal = (u: UserAccount) => {
    setEditingUser(u);
    setNome(u.nome);
    setEmail(u.email);
    setRole(u.role);
    setCargo(u.cargo);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) return;

    const colors = [
      'from-amber-400 to-yellow-600',
      'from-blue-500 to-cyan-600',
      'from-emerald-500 to-teal-600',
      'from-purple-500 to-indigo-600',
      'from-rose-500 to-pink-600',
    ];

    if (editingUser) {
      updateUser({
        ...editingUser,
        nome: nome.trim(),
        email: email.trim(),
        role,
        cargo: cargo.trim(),
      });
      setEditingUser(null);
    } else {
      addUser({
        nome: nome.trim(),
        email: email.trim(),
        role,
        cargo: cargo.trim(),
        ativo: true,
        avatarColor: colors[Math.floor(Math.random() * colors.length)],
      });
      setIsAddUserModalOpen(false);
    }
  };

  const getRoleBadge = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Shield className="w-3 h-3" />
            Administrador Geral
          </span>
        );
      case 'operador':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Wallet className="w-3 h-3" />
            Fiscal / Operador
          </span>
        );
      case 'visualizador':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Eye className="w-3 h-3" />
            Auditor / Visualizador
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#f5b800]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Administração de Usuários & Acessos
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Gerencie administradores, fiscais de caixa de campo e permissões de cobrança da Feira da Lua.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#f5b800] hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(245,184,0,0.3)] transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4 stroke-[3]" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Permissions Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#12192c] border border-amber-500/20 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
            <Shield className="w-4 h-4" />
            <span>Nível Administrador</span>
          </div>
          <p className="text-xs text-slate-300">
            Acesso irrestrito a todas as funções, relatórios financeiros, configuração de barracas, controle de caixa e cadastro de operadores.
          </p>
        </div>

        <div className="bg-[#12192c] border border-cyan-500/20 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase">
            <Wallet className="w-4 h-4" />
            <span>Nível Fiscal / Caixa</span>
          </div>
          <p className="text-xs text-slate-300">
            Pode registrar recebimentos em Pix e dinheiro, marcar presença e pagamentos na matriz da feira e enviar cobranças no WhatsApp.
          </p>
        </div>

        <div className="bg-[#12192c] border border-purple-500/20 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase">
            <Eye className="w-4 h-4" />
            <span>Nível Auditor / Visualizador</span>
          </div>
          <p className="text-xs text-slate-300">
            Visualização de relatórios consolidados e extratos para prestação de contas à associação de moradores e prefeitura.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#12192c] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-white text-base">
            Equipe Cadastrada ({users.length} Usuários)
          </h3>
          <span className="text-xs text-slate-400">
            Logado atualmente como: <strong className="text-amber-400">{currentUser.nome}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e1422] text-slate-400 uppercase font-semibold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-6">USUÁRIO</th>
                <th className="py-3.5 px-6">CARGO / FUNÇÃO</th>
                <th className="py-3.5 px-6">NÍVEL DE ACESSO</th>
                <th className="py-3.5 px-6">STATUS</th>
                <th className="py-3.5 px-6">ÚLTIMO ACESSO</th>
                <th className="py-3.5 px-6 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;

                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      isCurrent ? 'bg-amber-500/[0.03]' : ''
                    }`}
                  >
                    {/* User */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full bg-gradient-to-tr ${u.avatarColor} flex items-center justify-center text-xs font-bold text-white uppercase shadow-md`}
                        >
                          {u.nome.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <span>{u.nome}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-sans">
                                Você
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Cargo */}
                    <td className="py-4 px-6 font-medium text-slate-300 whitespace-nowrap">
                      {u.cargo}
                    </td>

                    {/* Role */}
                    <td className="py-4 px-6 whitespace-nowrap">{getRoleBadge(u.role)}</td>

                    {/* Status */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                          u.ativo
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        }`}
                        title="Clique para alternar status ativo/inativo"
                      >
                        {u.ativo ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Ativo</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Inativo</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Último Acesso */}
                    <td className="py-4 px-6 text-slate-400 font-mono whitespace-nowrap">
                      {u.ultimoAcesso}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {!isCurrent && (
                          <button
                            onClick={() => setCurrentUser(u)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                            title="Alternar sessão para este usuário"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Alternar Sessão</span>
                          </button>
                        )}

                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          title="Editar Usuário"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add or Edit User */}
      {(isAddUserModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12192c] border border-white/15 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-400" />
              {editingUser ? 'Editar Dados do Usuário' : 'Cadastrar Novo Operador / Administrador'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Defina as credenciais e nível de autorização no sistema da Feira da Lua.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  E-mail de Login *
                </label>
                <input
                  type="email"
                  required
                  placeholder="carlos@feiradalua.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Cargo / Título Oficial
                </label>
                <input
                  type="text"
                  placeholder="Ex: Fiscal de Caixa e Cobrança"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nível de Acesso (Papel)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="admin">Administrador Geral (Total Acesso)</option>
                  <option value="operador">Fiscal de Caixa / Cobrador de Campo</option>
                  <option value="visualizador">Auditor / Somente Visualização</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddUserModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5 border border-white/10 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-[#f5b800] hover:bg-amber-400 text-slate-950 rounded-lg"
                >
                  {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
