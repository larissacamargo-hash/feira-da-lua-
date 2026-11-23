import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Feira da Lua:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      // Ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#12192c] border border-amber-500/30 rounded-2xl p-8 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#f5b800] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Feira da Lua - Sistema Pronto para Reiniciar
              </h2>
              <p className="text-xs text-slate-400">
                Ocorreu uma inconsistência no navegador ou armazenamento local. Clique no botão abaixo para restaurar a integridade da aplicação com os dados oficiais dos prints.
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#f5b800] hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(245,184,0,0.35)] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar e Recarregar Painel</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
