import React, { useState } from 'react';
import { useFeira } from '../context/FeiraContext.tsx';
import { UserAccount, UserRole } from '../types.ts';
import {
  PieChart,
  Store,
  Users,
  Wallet,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Shield,
  Eye,
  Mail,
  AlertCircle,
  LogIn,
  UserPlus,
  User,
} from 'lucide-react';

type TargetTab = 'relatorios' | 'feiras' | 'feirantes' | 'caixa' | 'usuarios';

interface DestinationOption {
  id: TargetTab;
  titulo: string;
  subtitulo: string;
  icon: React.ReactNode;
}

const DESTINOS: DestinationOption[] = [
  {
    id: 'relatorios',
    titulo: 'Relatórios & Pendentes',
    subtitulo: 'Saldos Pix/Dinheiro e cobranças',
    icon: <PieChart className="w-5 h-5" />,
  },
  {
    id: 'feiras',
    titulo: 'Feiras & Planilha Matriz',
    subtitulo: 'Planilha semanal colorida de pagamentos',
    icon: <Store className="w-5 h-5" />,
  },
  {
    id: 'feirantes',
    titulo: 'Feirantes & Barracas',
    subtitulo: 'Cachorro Quente, Doces, Pastel e taxas',
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: 'caixa',
    titulo: 'Caixa ao Vivo',
    subtitulo: 'Controle de dinheiro em espécie, Pix e gastos',
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    id: 'usuarios',
    titulo: 'Usuários / Adm',
    subtitulo: 'Gerenciar operadores e permissões',
    icon: <ShieldCheck className="w-5 h-5" />,
  },
];

export const LoginPortalView: React.FC = () => {
  const { users, currentUser, login, loginAsCustomPerson } = useFeira();

  const [selectedUserId, setSelectedUserId] = useState<string>(
    currentUser?.id || users[0]?.id || 'usr_1'
  );
  const [selectedDestination, setSelectedDestination] = useState<TargetTab>('relatorios');
  const [loginMode, setLoginMode] = useState<'qualquer' | 'perfil' | 'email'>('qualquer');

  // Custom person entry state (any person can enter as Admin / Operator / Auditor)
  const [customNome, setCustomNome] = useState('');
  const [customRole, setCustomRole] = useState<UserRole>('admin');
  const [customEmail, setCustomEmail] = useState('');

  // Email login state
  const [emailInput, setEmailInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedUser: UserAccount | undefined =
    users.find((u) => u.id === selectedUserId) || users.find((u) => u.ativo);

  const getRoleLabel = (role: UserAccount['role']) => {
    if (role === 'admin') return 'Administrador';
    if (role === 'operador') return 'Fiscal / Caixa';
    return 'Auditor';
  };

  const getRoleIcon = (role: UserAccount['role']) => {
    if (role === 'admin') return <Shield className="w-3.5 h-3.5 text-amber-400" />;
    if (role === 'operador') return <Wallet className="w-3.5 h-3.5 text-cyan-400" />;
    return <Eye className="w-3.5 h-3.5 text-purple-400" />;
  };

  const handleEnter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (loginMode === 'qualquer') {
      const trimmed = customNome.trim();
      if (!trimmed) {
        setErrorMsg('Digite seu nome para entrar (ex: Seu Nome ou Adm da Noite).');
        return;
      }
      loginAsCustomPerson(trimmed, customRole, selectedDestination, customEmail);
      return;
    }

    if (loginMode === 'email') {
      const normalized = emailInput.trim().toLowerCase();
      if (!normalized) {
        setErrorMsg('Digite um e-mail cadastrado para entrar.');
        return;
      }
      const matched = users.find((u) => u.email.toLowerCase() === normalized);
      if (!matched) {
        setErrorMsg('E-mail não encontrado. Use "Novo Acesso" ou "Contas" para entrar.');
        return;
      }
      if (!matched.ativo) {
        setErrorMsg('Este usuário está desativado. Contate o administrador.');
        return;
      }
      login(matched, selectedDestination);
      return;
    }

    if (!selectedUser) {
      setErrorMsg('Selecione um usuário ativo para continuar.');
      return;
    }

    if (!selectedUser.ativo) {
      setErrorMsg('Este usuário está inativo no momento. Selecione outro operador.');
      return;
    }

    login(selectedUser, selectedDestination);
  };

  const buttonLabel = (() => {
    const destTitle = DESTINOS.find((d) => d.id === selectedDestination)?.titulo || '';
    if (loginMode === 'qualquer') {
      const firstName = customNome.trim().split(' ')[0];
      const roleShort =
        customRole === 'admin' ? 'Adm' : customRole === 'operador' ? 'Fiscal' : 'Auditor';
      return firstName
        ? `Entrar como ${firstName} (${roleShort}) em ${destTitle}`
        : `Entrar como ${roleShort} em ${destTitle}`;
    }
    if (loginMode === 'perfil' && selectedUser) {
      return `Entrar como ${selectedUser.nome.split(' ')[0]} em ${destTitle}`;
    }
    return `Entrar em ${destTitle}`;
  })();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between cosmic-bg p-4 md:p-8">
      <div className="max-w-5xl w-full mx-auto my-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 border border-amber-500/40 shadow-[0_0_25px_rgba(245,184,0,0.3)] mx-auto">
            <div className="w-8 h-8 rounded-full bg-transparent border-t-2 border-r-2 border-amber-400 rotate-[-45deg] shadow-[0_0_10px_#f5b800]" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              FEIRA DA <span className="text-[#f5b800] drop-shadow-[0_0_14px_rgba(245,184,0,0.4)]">LUA</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Controle Cósmico de Feiras · Escolha quem vai entrar e qual área deseja abrir
            </p>
          </div>
        </div>

        {/* Main 2-column Selection Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Step 1: Escolher quem está entrando (Qualquer pessoa para Adm, Contas, ou E-mail) */}
          <div className="lg:col-span-6 bg-[#111827]/90 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h2 className="text-base font-bold text-white">
                  1. Quem está entrando?
                </h2>
                <p className="text-xs text-slate-400">
                  Identifique-se com seu nome ou escolha uma conta
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 border border-white/10 p-1 rounded-lg text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('qualquer');
                    setErrorMsg('');
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    loginMode === 'qualquer'
                      ? 'bg-[#f5b800] text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Novo Acesso
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('perfil');
                    setErrorMsg('');
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    loginMode === 'perfil'
                      ? 'bg-[#f5b800] text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Contas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('email');
                    setErrorMsg('');
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    loginMode === 'email'
                      ? 'bg-[#f5b800] text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  E-mail
                </button>
              </div>
            </div>

            {loginMode === 'qualquer' && (
              <form onSubmit={handleEnter} className="space-y-4 py-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Seu Nome (ou Nome do Responsável) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={customNome}
                      onChange={(e) => {
                        setCustomNome(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="Ex: Ana, Carlos, Coordenação..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#f5b800]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Escolha o Tipo de Acesso
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomRole('admin')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        customRole === 'admin'
                          ? 'bg-amber-500/15 border-[#f5b800] text-white'
                          : 'bg-slate-900/70 border-white/10 text-slate-400 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-amber-400 mb-0.5">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Administrador</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Acesso total (Adm)
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCustomRole('operador')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        customRole === 'operador'
                          ? 'bg-cyan-500/15 border-cyan-400 text-white'
                          : 'bg-slate-900/70 border-white/10 text-slate-400 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-400 mb-0.5">
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Fiscal / Caixa</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Receber e cobrar
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCustomRole('visualizador')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        customRole === 'visualizador'
                          ? 'bg-purple-500/15 border-purple-400 text-white'
                          : 'bg-slate-900/70 border-white/10 text-slate-400 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-purple-400 mb-0.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Auditor</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Relatórios e saldo
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    E-mail (opcional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="Opcional — deixe em branco se não quiser informar"
                      className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#f5b800]"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-200">
                  <UserPlus className="w-4 h-4 text-[#f5b800] shrink-0" />
                  <span>
                    Digite seu nome acima e escolha o tipo de acesso (<strong>Administrador</strong>, Fiscal ou Auditor) para entrar.
                  </span>
                </div>
              </form>
            )}

            {loginMode === 'perfil' && (
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {users.map((u) => {
                  const isSelected = u.id === selectedUserId;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      disabled={!u.ativo}
                      onClick={() => {
                        setSelectedUserId(u.id);
                        setErrorMsg('');
                      }}
                      className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        !u.ativo
                          ? 'bg-slate-900/40 border-white/5 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'bg-amber-500/15 border-[#f5b800] shadow-[0_0_15px_rgba(245,184,0,0.15)] cursor-pointer'
                          : 'bg-slate-900/70 border-white/10 hover:border-white/25 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-tr ${u.avatarColor} flex items-center justify-center text-sm font-bold text-white uppercase shrink-0`}
                        >
                          {u.nome.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-white truncate flex items-center gap-2">
                            <span>{u.nome}</span>
                            {!u.ativo && (
                              <span className="text-[10px] text-red-400 font-semibold">
                                (Inativo)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 truncate">{u.cargo}</div>
                          <div className="text-[11px] text-slate-500 font-mono truncate">
                            {u.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-white/5">
                          {getRoleIcon(u.role)}
                          <span>{getRoleLabel(u.role)}</span>
                        </span>
                        {isSelected && u.ativo && (
                          <CheckCircle2 className="w-5 h-5 text-[#f5b800]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {loginMode === 'email' && (
              <form onSubmit={handleEnter} className="space-y-4 py-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    E-mail do Operador / Administrador
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Ex: admin@feiradalua.com.br"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#f5b800]"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/70 border border-white/10 rounded-xl space-y-1.5">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">
                    Contas disponíveis:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {users
                      .filter((u) => u.ativo)
                      .map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setEmailInput(u.email)}
                          className="text-[11px] px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono transition-colors cursor-pointer"
                        >
                          {u.email}
                        </button>
                      ))}
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Step 2: Escolher por onde quer entrar */}
          <div className="lg:col-span-6 bg-[#111827]/90 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-white">
                  2. Por onde você quer entrar?
                </h2>
                <p className="text-xs text-slate-400">
                  Escolha a tela inicial que deseja abrir ao acessar o sistema
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DESTINOS.map((dest) => {
                  const isActive = selectedDestination === dest.id;
                  return (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => setSelectedDestination(dest.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/15 border-[#f5b800] shadow-[0_0_15px_rgba(245,184,0,0.15)]'
                          : 'bg-slate-900/70 border-white/10 hover:border-white/25'
                      } ${dest.id === 'relatorios' ? 'sm:col-span-2' : ''}`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-[#f5b800] text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {dest.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-white truncate">
                            {dest.titulo}
                          </span>
                          {isActive && (
                            <CheckCircle2 className="w-4 h-4 text-[#f5b800] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {dest.subtitulo}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleEnter()}
              className="w-full py-3.5 px-5 bg-[#f5b800] hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-[0_0_24px_rgba(245,184,0,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>{buttonLabel}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-slate-500 pt-6">
        FEIRA DA LUA · Sistema de Gestão de Feirantes e Caixa em Tempo Real
      </footer>
    </div>
  );
};
