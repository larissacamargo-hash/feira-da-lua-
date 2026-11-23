import React, { useState } from 'react';
import { useFeira } from '../context/FeiraContext.tsx';
import {
  Store,
  Users,
  PieChart,
  LogOut,
  Wallet,
  ShieldCheck,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    users,
    setCurrentUser,
    resetToInitialData,
    logout,
  } = useFeira();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0c101c]/95 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Zone: Exactly like Screenshot 1 */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-amber-500/30 shadow-[0_0_15px_rgba(245,184,0,0.25)]">
            {/* Glowing moon symbol */}
            <div className="w-6 h-6 rounded-full bg-transparent border-t-2 border-r-2 border-amber-400 rotate-[-45deg] shadow-[0_0_8px_#f5b800]" />
            <div className="absolute top-2 right-2 w-1 h-1 bg-amber-300 rounded-full animate-ping opacity-75" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-lg md:text-xl tracking-tight text-white">
                FEIRA DA
              </span>
              <span className="font-extrabold text-lg md:text-xl tracking-tight text-[#f5b800] drop-shadow-[0_0_12px_rgba(245,184,0,0.4)]">
                LUA
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5b800]" />
              <span>Controle Cósmico de Feiras</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1.5 md:gap-3 overflow-x-auto py-1 scrollbar-none">
          {/* 1. Feiras */}
          <button
            onClick={() => setActiveTab('feiras')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'feiras'
                ? 'bg-[#f5b800] text-slate-950 shadow-[0_0_15px_rgba(245,184,0,0.35)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Feiras & Matriz</span>
          </button>

          {/* 2. Feirantes */}
          <button
            onClick={() => setActiveTab('feirantes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'feirantes'
                ? 'bg-[#f5b800] text-slate-950 shadow-[0_0_15px_rgba(245,184,0,0.35)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Feirantes</span>
          </button>

          {/* 3. Relatórios (Active in Screenshot 1!) */}
          <button
            onClick={() => setActiveTab('relatorios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'relatorios'
                ? 'bg-[#f5b800] text-slate-950 shadow-[0_0_18px_rgba(245,184,0,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Relatórios</span>
          </button>

          {/* 4. Caixa em Tempo Real */}
          <button
            onClick={() => setActiveTab('caixa')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'caixa'
                ? 'bg-[#f5b800] text-slate-950 shadow-[0_0_15px_rgba(245,184,0,0.35)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">Caixa ao Vivo</span>
            <span className="sm:hidden">Caixa</span>
          </button>

          {/* 5. Adm de Usuários */}
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'usuarios'
                ? 'bg-[#f5b800] text-slate-950 shadow-[0_0_15px_rgba(245,184,0,0.35)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden md:inline">Usuários / Adm</span>
            <span className="md:hidden">Adm</span>
          </button>
        </nav>

        {/* Zone 3: User switcher & Sair (Logout button matching Screenshot 1) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* User selector */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 hover:border-amber-500/50 text-left transition-colors"
              title="Alternar Usuário / Papel"
            >
              <div
                className={`w-6 h-6 rounded-full bg-gradient-to-tr ${currentUser.avatarColor} flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm`}
              >
                {currentUser.nome.charAt(0)}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">
                  {currentUser.nome}
                </span>
                <span className="text-[10px] text-amber-400 leading-none">
                  {currentUser.cargo}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown for user selection */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#111827] border border-white/15 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Alternar Conta / Operador
                  </p>
                  <p className="text-xs text-slate-200 mt-0.5">
                    Logado como: <strong className="text-amber-400">{currentUser.nome}</strong>
                  </p>
                </div>
                <div className="space-y-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                        u.id === currentUser.id
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full bg-gradient-to-tr ${u.avatarColor} flex items-center justify-center text-[9px] font-bold text-white`}
                        >
                          {u.nome.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{u.nome}</div>
                          <div className="text-[10px] text-slate-400">{u.cargo}</div>
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-2 border-t border-white/10 space-y-1">
                  <button
                    onClick={() => {
                      setShowResetConfirm(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar dados dos prints</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair para tela de entrada</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sair Button (Matching Screenshot 1 style: dark red outline pill button) */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-900/60 bg-red-950/40 hover:bg-red-900/40 text-red-300 hover:text-red-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Sair do Sistema"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Confirmation Modal Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12192c] border border-white/10 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Sair do Sistema?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Você está conectado como <strong>{currentUser.nome}</strong> ({currentUser.cargo}). Ao sair, você poderá escolher outra conta e por onde deseja entrar.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="w-full px-4 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                Sair e Escolher por Onde Entrar
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 border border-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  Permanecer
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    setShowUserMenu(true);
                  }}
                  className="flex-1 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 rounded-lg transition-colors cursor-pointer"
                >
                  Trocar Operador
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12192c] border border-white/10 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Restaurar Dados Originais?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Isso recarregará os dados idênticos aos prints da Feira da Lua (Cachorro Quente com 4 feiras pendentes totalizando R$ 197,00 e a planilha histórica).
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 border border-white/10 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetToInitialData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 px-4 py-2 text-xs font-semibold bg-[#f5b800] hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors"
              >
                Restaurar Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
