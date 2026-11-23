import React from 'react';
import { FeiraProvider, useFeira } from './context/FeiraContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { RelatoriosView } from './views/RelatoriosView.tsx';
import { FeirasView } from './views/FeirasView.tsx';
import { FeirantesView } from './views/FeirantesView.tsx';
import { CaixaView } from './views/CaixaView.tsx';
import { UsuariosView } from './views/UsuariosView.tsx';
import { LoginPortalView } from './views/LoginPortalView.tsx';

import { ErrorBoundary } from './components/ErrorBoundary.tsx';

const AppContent: React.FC = () => {
  const { activeTab, isAuthenticated } = useFeira();

  if (!isAuthenticated) {
    return <LoginPortalView />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col cosmic-bg">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 md:py-8">
        {activeTab === 'relatorios' && <RelatoriosView />}
        {activeTab === 'feiras' && <FeirasView />}
        {activeTab === 'feirantes' && <FeirantesView />}
        {activeTab === 'caixa' && <CaixaView />}
        {activeTab === 'usuarios' && <UsuariosView />}
      </main>

      <footer className="border-t border-white/10 bg-[#0c101c]/80 py-4 px-4 md:px-8 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">FEIRA DA LUA</span>
            <span>·</span>
            <span>Controle Cósmico de Feiras & Arrecadação em Tempo Real</span>
          </div>
          <p>© 2026 Associação de Feirantes & Comércio Noturno. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <FeiraProvider>
        <AppContent />
      </FeiraProvider>
    </ErrorBoundary>
  );
}
