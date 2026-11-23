import React, { useState } from 'react';
import { useFeira } from '../context/FeiraContext.tsx';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Banknote,
  QrCode,
  DollarSign,
  Receipt,
  Trash2,
  Clock,
  ShieldCheck,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal.tsx';

export const CaixaView: React.FC = () => {
  const {
    totalDinheiroLiq,
    totalPixLiq,
    saldoLiquidoGeral,
    transacoes,
    addTransacaoCaixa,
    despesas,
    addDespesa,
    deleteDespesa,
    currentUser,
    feiras,
  } = useFeira();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSangriaModalOpen, setIsSangriaModalOpen] = useState(false);

  // Expense form state
  const [despesaDesc, setDespesaDesc] = useState('');
  const [despesaValor, setDespesaValor] = useState<number>(150);
  const [despesaCat, setDespesaCat] = useState<'Limpeza' | 'Segurança' | 'Energia' | 'Banheiros' | 'Taxa Prefeitura' | 'Outros'>('Limpeza');
  const [despesaFeiraId, setDespesaFeiraId] = useState(feiras[0]?.id || '');

  // Sangria / Aporte form state
  const [sangriaTipo, setSangriaTipo] = useState<'entrada' | 'saida'>('saida');
  const [sangriaMetodo, setSangriaMetodo] = useState<'dinheiro' | 'pix'>('dinheiro');
  const [sangriaValor, setSangriaValor] = useState<number>(100);
  const [sangriaDesc, setSangriaDesc] = useState('Sangria para depósito bancário');

  const handleSaveDespesa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!despesaDesc.trim() || despesaValor <= 0) return;

    addDespesa({
      feiraId: despesaFeiraId || feiras[0]?.id,
      descricao: despesaDesc.trim(),
      valor: Number(despesaValor),
      categoria: despesaCat,
      data: new Date().toLocaleDateString('pt-BR'),
      pagoPor: currentUser.nome,
    });

    setIsExpenseModalOpen(false);
    setDespesaDesc('');
    setDespesaValor(150);
  };

  const handleSaveSangria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sangriaDesc.trim() || sangriaValor <= 0) return;

    addTransacaoCaixa({
      tipo: sangriaTipo,
      metodo: sangriaMetodo,
      valor: Number(sangriaValor),
      descricao: sangriaDesc.trim(),
      feiraId: feiras[0]?.id || 'f_1510',
      operador: currentUser.nome,
    });

    setIsSangriaModalOpen(false);
    setSangriaValor(100);
    setSangriaDesc('Sangria para depósito bancário');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Controle de Dinheiro & Caixa em Tempo Real
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Gestão instantânea de arrecadação em espécie (físico), Pix digital, saídas e despesas operacionais da feira.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
            <span>Lançar Despesa</span>
          </button>

          <button
            onClick={() => setIsSangriaModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <span>Sangria / Ajuste</span>
          </button>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#f5b800] hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(245,184,0,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Receber Taxa</span>
          </button>
        </div>
      </div>

      {/* Real-time Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Dinheiro em Espécie (Físico) */}
        <div className="bg-[#12192c] border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Banknote className="w-4 h-4" />
              Caixa Físico (Dinheiro em Espécie)
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[10px] font-mono">
              Na Gaveta
            </span>
          </div>
          <div className="text-3xl md:text-4xl font-extrabold text-[#34d399] tracking-tight tabular-nums drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
            R$ {totalDinheiroLiq.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Total disponível em notas e moedas com o fiscal de campo.
          </p>
        </div>

        {/* Conta Digital Pix */}
        <div className="bg-[#12192c] border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <QrCode className="w-4 h-4" />
              Conta Bancária (Recebido em PIX)
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-[10px] font-mono">
              Conta Feira
            </span>
          </div>
          <div className="text-3xl md:text-4xl font-extrabold text-[#38bdf8] tracking-tight tabular-nums drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]">
            R$ {totalPixLiq.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Transferências instantâneas recebidas via chave Pix oficial.
          </p>
        </div>

        {/* Saldo Consolidado */}
        <div className="bg-[#12192c] border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-[#f5b800] text-xs font-bold uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              Saldo Líquido Geral
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-[10px] font-mono">
              Consolidado
            </span>
          </div>
          <div className="text-3xl md:text-4xl font-extrabold text-[#f5b800] tracking-tight tabular-nums drop-shadow-[0_0_15px_rgba(245,184,0,0.35)]">
            R$ {saldoLiquidoGeral.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Resultado real-time: Dinheiro Líquido + Pix Líquido.
          </p>
        </div>
      </div>

      {/* Two columns: Extrato ao Vivo & Despesas da Feira */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Extrato de Transações em Tempo Real (2 cols) */}
        <div className="lg:col-span-2 bg-[#12192c] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-base">
                Extrato de Movimentações em Tempo Real
              </h3>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sincronizado ao vivo
            </span>
          </div>

          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
            {transacoes.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Nenhuma movimentação registrada no caixa ainda.
              </div>
            ) : (
              transacoes.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 hover:bg-white/[0.02] flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.tipo === 'entrada'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {tx.tipo === 'entrada' ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white leading-snug">
                        {tx.descricao}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-mono text-slate-500">{tx.timestamp}</span>
                        <span>•</span>
                        <span className="uppercase text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {tx.metodo}
                        </span>
                        <span>•</span>
                        <span>Op: {tx.operador}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-base font-extrabold font-mono tabular-nums ${
                        tx.tipo === 'entrada' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.tipo === 'entrada' ? '+' : '-'} R$ {tx.valor.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Custos & Despesas Operacionais (1 col) */}
        <div className="bg-[#12192c] border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-white text-base">Despesas da Feira</h3>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
              {despesas.map((d) => (
                <div
                  key={d.id}
                  className="p-4 hover:bg-white/[0.02] flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-semibold text-white">{d.descricao}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="text-amber-400/80">{d.categoria}</span>
                      <span>•</span>
                      <span>{d.data}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-rose-400 font-mono tabular-nums">
                      R$ {d.valor.toFixed(2)}
                    </span>
                    <button
                      onClick={() => deleteDespesa(d.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors p-1"
                      title="Excluir despesa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-900/60 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold uppercase">Total Custos:</span>
            <span className="font-bold text-rose-400 text-sm font-mono tabular-nums">
              R$ {despesas.reduce((acc, d) => acc + d.valor, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Modal: Lançar Despesa */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12192c] border border-white/15 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-400" />
              Lançar Despesa Operacional
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Registre custos de limpeza, segurança, taxas municipais ou energia.
            </p>

            <form onSubmit={handleSaveDespesa} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Descrição da Despesa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Equipe de Limpeza e Varrição"
                  value={despesaDesc}
                  onChange={(e) => setDespesaDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Categoria
                </label>
                <select
                  value={despesaCat}
                  onChange={(e) => setDespesaCat(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Limpeza">Limpeza</option>
                  <option value="Segurança">Segurança</option>
                  <option value="Energia">Energia / Gerador</option>
                  <option value="Banheiros">Banheiros Químicos</option>
                  <option value="Taxa Prefeitura">Taxa Prefeitura / Alvará</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Valor da Despesa (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={despesaValor}
                  onChange={(e) => setDespesaValor(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-base font-bold text-rose-400 font-mono focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5 border border-white/10 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
                >
                  Confirmar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Sangria / Aporte */}
      {isSangriaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12192c] border border-white/15 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-1">
              Sangria ou Aporte de Caixa
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Retirada de dinheiro físico para depósito ou reforço de fundo de troco.
            </p>

            <form onSubmit={handleSaveSangria} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSangriaTipo('saida')}
                  className={`py-2 text-xs font-bold rounded-lg border ${
                    sangriaTipo === 'saida'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-900 border-white/10 text-slate-400'
                  }`}
                >
                  Sangria (Retirada)
                </button>
                <button
                  type="button"
                  onClick={() => setSangriaTipo('entrada')}
                  className={`py-2 text-xs font-bold rounded-lg border ${
                    sangriaTipo === 'entrada'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border-white/10 text-slate-400'
                  }`}
                >
                  Aporte (Troco)
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={sangriaValor}
                  onChange={(e) => setSangriaValor(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Motivo / Observação
                </label>
                <input
                  type="text"
                  required
                  value={sangriaDesc}
                  onChange={(e) => setSangriaDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsSangriaModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5 border border-white/10 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-[#f5b800] text-slate-950 rounded-lg hover:bg-amber-400"
                >
                  Lançar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
};
