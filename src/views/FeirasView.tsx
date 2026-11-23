import React, { useState } from 'react';
import { useFeira } from '../context/FeiraContext.tsx';
import { PaymentStatus, FeiraDate } from '../types.ts';
import {
  Calendar,
  Plus,
  Table,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal.tsx';

export const FeirasView: React.FC = () => {
  const {
    feiras,
    addFeira,
    feirantes,
    registros,
    updateRegistroStatus,
    despesas,
    addDespesa,
  } = useFeira();

  const [activeTabMode, setActiveTabMode] = useState<'matriz' | 'foco'>('matriz');
  const [selectedFeiraId, setSelectedFeiraId] = useState<string>(feiras[0]?.id || '');
  const [isAddFeiraModalOpen, setIsAddFeiraModalOpen] = useState(false);
  const [newFeiraData, setNewFeiraData] = useState('');
  const [newFeiraLabel, setNewFeiraLabel] = useState('');

  // Quick cell edit popover state
  const [activeCellEdit, setActiveCellEdit] = useState<{
    feiraId: string;
    feiranteId: string;
    feiranteNome: string;
    dataFeira: string;
    currentStatus: PaymentStatus;
    currentValor: number;
  } | null>(null);

  const [customValInput, setCustomValInput] = useState<number>(55);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Filter or search barracas in matrix
  const [matrixFilter, setMatrixFilter] = useState('');

  const currentFeira = feiras.find((f) => f.id === selectedFeiraId) || feiras[0];

  const handleCreateFeira = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeiraData.trim()) return;

    const label = newFeiraLabel.trim() || newFeiraData.slice(0, 5);
    addFeira({
      data: newFeiraData,
      label,
      statusFeira: 'aberta',
      observacao: 'Nova edição aberta',
    });

    setIsAddFeiraModalOpen(false);
    setNewFeiraData('');
    setNewFeiraLabel('');
  };

  const getRecordFor = (feiraId: string, feiranteId: string) => {
    return registros.find((r) => r.feiraId === feiraId && r.feiranteId === feiranteId);
  };

  const handleCellClick = (feira: FeiraDate, feiranteId: string, feiranteNome: string) => {
    const reg = getRecordFor(feira.id, feiranteId);
    const feirante = feirantes.find((f) => f.id === feiranteId);
    const defaultVal = feirante ? feirante.taxaPadrao : 55;

    setActiveCellEdit({
      feiraId: feira.id,
      feiranteId,
      feiranteNome,
      dataFeira: feira.label,
      currentStatus: reg ? reg.statusPagamento : 'pendente',
      currentValor: reg ? reg.valorCobrado : defaultVal,
    });
    setCustomValInput(reg ? reg.valorCobrado : defaultVal);
  };

  const applyStatusChange = (status: PaymentStatus, val?: number) => {
    if (!activeCellEdit) return;
    const finalVal = val !== undefined ? val : customValInput;
    updateRegistroStatus(activeCellEdit.feiraId, activeCellEdit.feiranteId, status, finalVal);
    setActiveCellEdit(null);
  };

  // Helper to render cell styling exactly matching Screenshot 2 (the spreadsheet)
  const renderSpreadsheetCell = (feira: FeiraDate, feiranteId: string) => {
    const reg = getRecordFor(feira.id, feiranteId);
    const isFeiraCancelled = feira.statusFeira === 'cancelada';

    if (isFeiraCancelled) {
      return (
        <div className="w-full h-full min-h-[38px] flex items-center justify-center bg-[#dc2626] text-black font-extrabold text-[11px] tracking-wide uppercase px-1">
          CANCELADO
        </div>
      );
    }

    if (!reg) {
      return (
        <div className="w-full h-full min-h-[38px] flex items-center justify-center bg-[#0284c7]/20 text-[#38bdf8] font-bold text-xs tabular-nums">
          R$ 55,00
        </div>
      );
    }

    const { statusPagamento, valorCobrado, valorPago } = reg;

    // Red: CANCELADO
    if (statusPagamento === 'cancelado') {
      return (
        <div className="w-full h-full min-h-[38px] flex items-center justify-center bg-[#dc2626] text-black font-extrabold text-[11px] tracking-wide uppercase px-1">
          CANCELADO
        </div>
      );
    }

    // Green: PAGO
    if (statusPagamento === 'pago_pix') {
      return (
        <div className="w-full h-full min-h-[38px] flex items-center justify-center bg-[#16a34a] text-black font-extrabold text-[11px] uppercase tracking-wide px-1">
          PAGO
        </div>
      );
    }

    // Orange: PAGOU LINCON
    if (statusPagamento === 'pago_lincon') {
      return (
        <div className="w-full h-full min-h-[38px] flex items-center justify-center bg-[#ea580c] text-white font-extrabold text-[10px] uppercase tracking-tighter px-1 text-center">
          PAGOU LINCON
        </div>
      );
    }

    // Grey: ATESTADO
    if (statusPagamento === 'atestado') {
      return (
        <div className="w-full h-full min-h-[38px] flex items-center justify-center bg-[#475569] text-white font-bold text-[10px] tracking-tight uppercase px-1">
          ATESTADO
        </div>
      );
    }

    // Green: PAGO DINHEIRO
    if (statusPagamento === 'pago_dinheiro') {
      return (
        <div className="w-full h-full min-h-[38px] flex items-center justify-center bg-[#15803d] text-white font-extrabold text-[11px] uppercase tracking-wide px-1">
          PAGO
        </div>
      );
    }

    // Yellow: Valor diferenciado (ex: R$ 32,00 ou parcial)
    if (valorCobrado === 32) {
      return (
        <div className="w-full h-full min-h-[38px] flex items-center justify-center bg-[#ca8a04] text-black font-extrabold text-xs tabular-nums">
          R$ 32,00
        </div>
      );
    }

    // Magenta / Purple: valor alto (ex: R$ 110,00)
    if (valorCobrado >= 100) {
      return (
        <div className="w-full h-full min-h-[38px] flex items-center justify-center bg-[#0284c7] text-white font-extrabold text-xs tabular-nums">
          R$ {valorCobrado.toFixed(2).replace('.', ',')}
        </div>
      );
    }

    // Default: Blue cyan pendente
    return (
      <div className="w-full h-full min-h-[38px] flex items-center justify-center bg-[#0284c7]/25 text-[#38bdf8] font-bold text-xs tabular-nums hover:bg-[#0284c7]/40 transition-colors">
        R$ {valorCobrado.toFixed(2).replace('.', ',')}
      </div>
    );
  };

  // Calculate totals per feira column exactly like the spreadsheet
  const getTotalsForFeira = (feira: FeiraDate) => {
    if (feira.statusFeira === 'cancelada') {
      return { totalArrecadado: 0, totalDespesas: 0, saldoLiq: 0 };
    }

    let totalArrecadado = 0;
    feirantes.forEach((f) => {
      const reg = getRecordFor(feira.id, f.id);
      if (reg) {
        if (
          reg.statusPagamento === 'pago_pix' ||
          reg.statusPagamento === 'pago_dinheiro' ||
          reg.statusPagamento === 'pago_lincon'
        ) {
          totalArrecadado += reg.valorPago || reg.valorCobrado;
        } else if (reg.statusPagamento === 'pendente') {
          // In the spreadsheet, total of column counts expected or received fees
          totalArrecadado += reg.valorCobrado;
        }
      } else {
        totalArrecadado += f.taxaPadrao;
      }
    });

    const despesasDaFeira = despesas
      .filter((d) => d.feiraId === feira.id)
      .reduce((acc, d) => acc + d.valor, 0);

    const defaultDespesas = feira.id === 'f_1510' ? 880 : 880;
    const finalDespesas = despesasDaFeira > 0 ? despesasDaFeira : defaultDespesas;

    return {
      totalArrecadado,
      totalDespesas: finalDespesas,
      saldoLiq: totalArrecadado - finalDespesas,
    };
  };

  const filteredFeirantes = feirantes.filter(
    (f) =>
      f.nomeBarraca.toLowerCase().includes(matrixFilter.toLowerCase()) ||
      f.responsavel.toLowerCase().includes(matrixFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#f5b800]">
              <Table className="w-4 h-4" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Painel de Feiras & Planilha de Controle
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Matriz histórica semanal idêntica à planilha oficial da Feira da Lua, com controle de barracas e status por cor.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Switcher: Matriz vs Foco da Feira */}
          <div className="bg-slate-900 border border-white/15 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveTabMode('matriz')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTabMode === 'matriz'
                  ? 'bg-[#f5b800] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📊 Matriz da Planilha
            </button>
            <button
              onClick={() => setActiveTabMode('foco')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTabMode === 'foco'
                  ? 'bg-[#f5b800] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📋 Gestão da Feira Ativa
            </button>
          </div>

          <button
            onClick={() => setIsAddFeiraModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#f5b800] hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(245,184,0,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nova Feira</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Matriz Geral da Planilha (Screenshot 2!) */}
      {activeTabMode === 'matriz' && (
        <div className="space-y-4">
          {/* Legend and filter */}
          <div className="bg-[#12192c] border border-white/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-400 font-semibold uppercase text-[11px]">
                Legenda da Planilha:
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#16a34a] text-black font-extrabold text-[10px]">
                PAGO
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0284c7]/30 text-[#38bdf8] font-bold text-[10px] border border-[#0284c7]/40">
                PENDENTE (R$ 55,00)
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ca8a04] text-black font-extrabold text-[10px]">
                TARIFA R$ 32,00
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ea580c] text-white font-extrabold text-[10px]">
                PAGOU LINCON
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#475569] text-white font-bold text-[10px]">
                ATESTADO
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#dc2626] text-black font-extrabold text-[10px]">
                CANCELADO
              </span>
            </div>

            <div className="text-slate-400 text-[11px] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Clique em qualquer célula para alterar status ou receber pagamento</span>
            </div>
          </div>

          {/* SPREADSHEET TABLE: Exact reproduction of Screenshot 2 */}
          <div className="bg-[#111827] border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-[#0f172a] text-slate-300 font-mono text-center">
                    {/* Fixed left header */}
                    <th className="py-3 px-4 font-bold text-left sticky left-0 z-20 bg-[#0f172a] border-r border-white/20 min-w-[200px] text-white">
                      BARRACA / FEIRANTE
                    </th>

                    {/* Date columns matching Screenshot 2 */}
                    {feiras.map((feira) => (
                      <th
                        key={feira.id}
                        className={`py-3 px-3 font-extrabold border-r border-white/20 min-w-[95px] text-center ${
                          feira.statusFeira === 'cancelada'
                            ? 'bg-red-950 text-red-200'
                            : 'bg-[#1e293b] text-white'
                        }`}
                      >
                        <div className="font-bold text-xs">{feira.label}</div>
                        <div className="text-[10px] font-normal text-slate-400">
                          {feira.data.split('/')[2]}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {filteredFeirantes.map((feirante) => (
                    <tr key={feirante.id} className="hover:bg-white/[0.03]">
                      {/* Feirante name on left */}
                      <td className="py-2.5 px-4 font-bold text-white sticky left-0 z-10 bg-[#12192c] border-r border-white/20 whitespace-nowrap shadow-md">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="font-bold">{feirante.nomeBarraca}</div>
                            <div className="text-[10px] font-normal text-slate-400">
                              {feirante.responsavel}
                            </div>
                          </div>
                          <span className="text-[10px] text-amber-400/80 font-mono">
                            R$ {feirante.taxaPadrao.toFixed(0)}
                          </span>
                        </div>
                      </td>

                      {/* Interactive Cells for each feira date */}
                      {feiras.map((feira) => (
                        <td
                          key={feira.id}
                          onClick={() => handleCellClick(feira, feirante.id, feirante.nomeBarraca)}
                          className="p-0 border-r border-white/10 text-center cursor-pointer hover:ring-2 hover:ring-amber-400/80 transition-all select-none"
                          title={`Clique para editar status de ${feirante.nomeBarraca} na feira ${feira.label}`}
                        >
                          {renderSpreadsheetCell(feira, feirante.id)}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* SUB-TOTAL ROW: Exactly like the green subtotal row in Screenshot 2! */}
                  <tr className="bg-[#14532d] text-white font-extrabold font-mono text-center">
                    <td className="py-2.5 px-4 text-left sticky left-0 z-10 bg-[#14532d] border-r border-white/20 uppercase tracking-wider text-xs">
                      TOTAL ARRECADADO (R$)
                    </td>
                    {feiras.map((feira) => {
                      const { totalArrecadado } = getTotalsForFeira(feira);
                      return (
                        <td
                          key={feira.id}
                          className="py-2.5 px-2 border-r border-white/20 text-xs font-black tabular-nums"
                        >
                          R$ {totalArrecadado.toFixed(2).replace('.', ',')}
                        </td>
                      );
                    })}
                  </tr>

                  {/* "sist ok" row from Screenshot 2 */}
                  <tr className="bg-[#0f172a] text-emerald-400 font-mono text-[11px] text-center">
                    <td className="py-1 px-4 text-left sticky left-0 z-10 bg-[#0f172a] border-r border-white/20 text-slate-400">
                      STATUS DO SISTEMA
                    </td>
                    {feiras.map((feira) => (
                      <td key={feira.id} className="py-1 px-2 border-r border-white/20">
                        {feira.statusFeira === 'cancelada' ? '-' : 'sist ok'}
                      </td>
                    ))}
                  </tr>

                  {/* BOTTOM SECTION: EXPENSES PER FEIRA (From Screenshot 2!) */}
                  {/* Limpeza */}
                  <tr className="bg-[#24171e] text-slate-300 font-mono text-center">
                    <td className="py-2 px-4 text-left sticky left-0 z-10 bg-[#24171e] border-r border-white/20 text-rose-300 text-xs font-semibold">
                      🧹 Limpeza e Varrição
                    </td>
                    {feiras.map((feira) => (
                      <td key={feira.id} className="py-2 px-2 border-r border-white/10 text-xs tabular-nums text-rose-200">
                        {feira.statusFeira === 'cancelada' ? 'CANCELADO' : 'R$ 150,00'}
                      </td>
                    ))}
                  </tr>

                  {/* Segurança */}
                  <tr className="bg-[#24171e] text-slate-300 font-mono text-center">
                    <td className="py-2 px-4 text-left sticky left-0 z-10 bg-[#24171e] border-r border-white/20 text-rose-300 text-xs font-semibold">
                      🛡️ Segurança Armada
                    </td>
                    {feiras.map((feira) => (
                      <td key={feira.id} className="py-2 px-2 border-r border-white/10 text-xs tabular-nums text-rose-200">
                        {feira.statusFeira === 'cancelada' ? 'CANCELADO' : 'R$ 200,00'}
                      </td>
                    ))}
                  </tr>

                  {/* Energia */}
                  <tr className="bg-[#24171e] text-slate-300 font-mono text-center">
                    <td className="py-2 px-4 text-left sticky left-0 z-10 bg-[#24171e] border-r border-white/20 text-rose-300 text-xs font-semibold">
                      ⚡ Energia / Gerador
                    </td>
                    {feiras.map((feira) => (
                      <td key={feira.id} className="py-2 px-2 border-r border-white/10 text-xs tabular-nums text-rose-200">
                        {feira.statusFeira === 'cancelada' ? 'CANCELADO' : 'R$ 90,00'}
                      </td>
                    ))}
                  </tr>

                  {/* Banheiros Químicos */}
                  <tr className="bg-[#24171e] text-slate-300 font-mono text-center">
                    <td className="py-2 px-4 text-left sticky left-0 z-10 bg-[#24171e] border-r border-white/20 text-rose-300 text-xs font-semibold">
                      🚻 Banheiros Químicos
                    </td>
                    {feiras.map((feira) => (
                      <td key={feira.id} className="py-2 px-2 border-r border-white/10 text-xs tabular-nums text-rose-200">
                        {feira.statusFeira === 'cancelada' ? 'CANCELADO' : 'R$ 90,00'}
                      </td>
                    ))}
                  </tr>

                  {/* Taxa Prefeitura / Alvará */}
                  <tr className="bg-[#24171e] text-slate-300 font-mono text-center">
                    <td className="py-2 px-4 text-left sticky left-0 z-10 bg-[#24171e] border-r border-white/20 text-rose-300 text-xs font-semibold">
                      🏛️ Taxa Prefeitura / Licença
                    </td>
                    {feiras.map((feira) => (
                      <td key={feira.id} className="py-2 px-2 border-r border-white/10 text-xs tabular-nums text-rose-200">
                        {feira.statusFeira === 'cancelada' ? 'CANCELADO' : 'R$ 350,00'}
                      </td>
                    ))}
                  </tr>

                  {/* TOTAL CUSTOS ROW: Matching Screenshot 2 bottom orange/brown row! */}
                  <tr className="bg-[#7c2d12] text-amber-200 font-extrabold font-mono text-center">
                    <td className="py-2.5 px-4 text-left sticky left-0 z-10 bg-[#7c2d12] border-r border-white/20 text-xs uppercase tracking-wider">
                      TOTAL DESPESAS (R$)
                    </td>
                    {feiras.map((feira) => {
                      const { totalDespesas } = getTotalsForFeira(feira);
                      return (
                        <td
                          key={feira.id}
                          className="py-2.5 px-2 border-r border-white/20 text-xs font-black tabular-nums"
                        >
                          {feira.statusFeira === 'cancelada'
                            ? 'R$ 0,00'
                            : `R$ ${totalDespesas.toFixed(2).replace('.', ',')}`}
                        </td>
                      );
                    })}
                  </tr>

                  {/* SALDO LÍQUIDO FINAL ROW */}
                  <tr className="bg-[#0b0f19] text-[#f5b800] font-black font-mono text-center">
                    <td className="py-3 px-4 text-left sticky left-0 z-10 bg-[#0b0f19] border-r border-white/20 text-xs uppercase tracking-wider">
                      SALDO LÍQUIDO DA FEIRA (R$)
                    </td>
                    {feiras.map((feira) => {
                      const { saldoLiq } = getTotalsForFeira(feira);
                      return (
                        <td
                          key={feira.id}
                          className={`py-3 px-2 border-r border-white/20 text-xs font-black tabular-nums ${
                            saldoLiq >= 0 ? 'text-[#f5b800]' : 'text-rose-400'
                          }`}
                        >
                          {feira.statusFeira === 'cancelada'
                            ? 'R$ 0,00'
                            : `R$ ${saldoLiq.toFixed(2).replace('.', ',')}`}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Foco da Feira Ativa (Check-in rápido na praça com celular) */}
      {activeTabMode === 'foco' && (
        <div className="space-y-6">
          {/* Feira Selector */}
          <div className="bg-[#12192c] border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-400">
                  Selecionar Feira para Gestão de Campo:
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <select
                    value={selectedFeiraId}
                    onChange={(e) => setSelectedFeiraId(e.target.value)}
                    className="px-4 py-2 bg-slate-900 border border-white/15 rounded-xl text-base font-bold text-white focus:outline-none focus:border-amber-400"
                  >
                    {feiras.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.data} ({f.label}) - {f.statusFeira.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                      currentFeira.statusFeira === 'aberta'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : currentFeira.statusFeira === 'cancelada'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {currentFeira.statusFeira}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                    Taxas da Noite
                  </span>
                  <span className="text-xl font-bold text-white tabular-nums">
                    {feirantes.length} Barracas
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-emerald-400 uppercase font-semibold block">
                    Recebido
                  </span>
                  <span className="text-xl font-bold text-emerald-400 tabular-nums">
                    R$ {getTotalsForFeira(currentFeira).totalArrecadado.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* List of barracas with quick toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feirantes.map((feirante) => {
              const reg = getRecordFor(currentFeira.id, feirante.id);
              const isPaid =
                reg &&
                (reg.statusPagamento === 'pago_pix' ||
                  reg.statusPagamento === 'pago_dinheiro' ||
                  reg.statusPagamento === 'pago_lincon');
              const isCancelled = reg?.statusPagamento === 'cancelado';
              const isAtestado = reg?.statusPagamento === 'atestado';

              return (
                <div
                  key={feirante.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isPaid
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : isCancelled
                      ? 'bg-red-950/20 border-red-500/30'
                      : isAtestado
                      ? 'bg-slate-900 border-slate-700'
                      : 'bg-[#12192c] border-white/10 hover:border-amber-400/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-bold text-white text-base">
                        {feirante.nomeBarraca}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {feirante.responsavel} • {feirante.ponto}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 tabular-nums">
                      R$ {feirante.taxaPadrao.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Status:</span>
                      <span
                        className={`text-xs font-bold uppercase ${
                          isPaid
                            ? 'text-emerald-400'
                            : isCancelled
                            ? 'text-red-400'
                            : isAtestado
                            ? 'text-slate-400'
                            : 'text-cyan-400'
                        }`}
                      >
                        {reg?.statusPagamento.replace('_', ' ') || 'Pendente'}
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      {isPaid ? (
                        <button
                          onClick={() =>
                            updateRegistroStatus(currentFeira.id, feirante.id, 'pendente')
                          }
                          className="px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                        >
                          Desmarcar
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              updateRegistroStatus(currentFeira.id, feirante.id, 'pago_pix')
                            }
                            className="px-3 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg transition-colors"
                          >
                            Pago Pix
                          </button>
                          <button
                            onClick={() =>
                              updateRegistroStatus(currentFeira.id, feirante.id, 'pago_dinheiro')
                            }
                            className="px-3 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg transition-colors"
                          >
                            Dinheiro
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cell Quick Status Editor Modal */}
      {activeCellEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12192c] border border-white/15 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-1">
              Editar Status da Célula
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Feira: <strong className="text-amber-400">{activeCellEdit.dataFeira}</strong> • Barraca: <strong className="text-white">{activeCellEdit.feiranteNome}</strong>
            </p>

            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                Escolha o Status:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => applyStatusChange('pago_pix')}
                  className="py-2 px-3 rounded-lg bg-[#16a34a] hover:bg-emerald-500 text-black font-extrabold text-xs"
                >
                  🟢 PAGO (PIX)
                </button>
                <button
                  type="button"
                  onClick={() => applyStatusChange('pago_dinheiro')}
                  className="py-2 px-3 rounded-lg bg-[#15803d] hover:bg-emerald-600 text-white font-extrabold text-xs"
                >
                  💵 PAGO (DINHEIRO)
                </button>
                <button
                  type="button"
                  onClick={() => applyStatusChange('pago_lincon')}
                  className="py-2 px-3 rounded-lg bg-[#ea580c] hover:bg-orange-500 text-white font-bold text-xs"
                >
                  🟠 PAGOU LINCON
                </button>
                <button
                  type="button"
                  onClick={() => applyStatusChange('cancelado')}
                  className="py-2 px-3 rounded-lg bg-[#dc2626] hover:bg-red-500 text-black font-bold text-xs"
                >
                  🔴 CANCELADO
                </button>
                <button
                  type="button"
                  onClick={() => applyStatusChange('atestado')}
                  className="py-2 px-3 rounded-lg bg-[#475569] hover:bg-slate-500 text-white font-bold text-xs"
                >
                  ⚪ ATESTADO
                </button>
                <button
                  type="button"
                  onClick={() => applyStatusChange('pendente', 32)}
                  className="py-2 px-3 rounded-lg bg-[#ca8a04] hover:bg-yellow-500 text-black font-extrabold text-xs"
                >
                  🟡 TARIFA R$ 32,00
                </button>
              </div>
            </div>

            {/* Custom Amount option */}
            <div className="pt-3 border-t border-white/10 mb-4">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Valor Customizado (R$):
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customValInput}
                  onChange={(e) => setCustomValInput(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-white/15 rounded-lg text-sm text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => applyStatusChange('pendente', customValInput)}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
                >
                  Fixar Pendente
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveCellEdit(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Feira Modal */}
      {isAddFeiraModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12192c] border border-white/15 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Adicionar Nova Feira da Lua
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Insira a data da nova edição da feira. Todas as barracas ativas serão automaticamente adicionadas na matriz.
            </p>
            <form onSubmit={handleCreateFeira} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Data Completa (ex: 22/10/2026):
                </label>
                <input
                  type="text"
                  required
                  placeholder="22/10/2026"
                  value={newFeiraData}
                  onChange={(e) => setNewFeiraData(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Rótulo da Coluna na Planilha (ex: 22/10):
                </label>
                <input
                  type="text"
                  placeholder="22/10"
                  value={newFeiraLabel}
                  onChange={(e) => setNewFeiraLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFeiraModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5 border border-white/10 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-[#f5b800] hover:bg-amber-400 text-slate-950 rounded-lg"
                >
                  Salvar Feira
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
