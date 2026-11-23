import React, { useState, useMemo } from 'react';
import { useFeira, PendenteItem } from '../context/FeiraContext.tsx';
import {
  PieChart,
  Printer,
  Banknote,
  QrCode,
  DollarSign,
  Receipt,
  MessageCircle,
  Phone,
  CheckCircle,
  Search,
  Filter,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal.tsx';
import { PrintReportModal } from '../components/PrintReportModal.tsx';

export const RelatoriosView: React.FC = () => {
  const {
    totalFeiras,
    totalDinheiroLiq,
    totalPixLiq,
    saldoLiquidoGeral,
    totalPendenteGeral,
    pendentesList,
    feirantes,
    updateFeirante,
  } = useFeira();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPendente, setSelectedPendente] = useState<PendenteItem | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Phone editing modal
  const [editingPhoneFeiranteId, setEditingPhoneFeiranteId] = useState<string | null>(null);
  const [newPhoneInput, setNewPhoneInput] = useState('');

  const filteredPendentes = useMemo(() => {
    if (!searchTerm.trim()) return pendentesList;
    const term = searchTerm.toLowerCase();
    return pendentesList.filter(
      (p) =>
        p.nomeFeirante.toLowerCase().includes(term) ||
        p.responsavel.toLowerCase().includes(term) ||
        p.dataFeira.includes(term) ||
        p.labelFeira.includes(term)
    );
  }, [pendentesList, searchTerm]);

  const handleOpenPayment = (item: PendenteItem) => {
    setSelectedPendente(item);
    setIsPaymentModalOpen(true);
  };

  const handleOpenPhoneEdit = (feiranteId: string, currentPhone: string) => {
    setEditingPhoneFeiranteId(feiranteId);
    setNewPhoneInput(currentPhone || '');
  };

  const handleSavePhone = () => {
    if (!editingPhoneFeiranteId) return;
    const feirante = feirantes.find((f) => f.id === editingPhoneFeiranteId);
    if (feirante) {
      updateFeirante({
        ...feirante,
        contato: newPhoneInput.trim(),
      });
    }
    setEditingPhoneFeiranteId(null);
  };

  const getWhatsAppLink = (item: PendenteItem) => {
    const cleanPhone = item.contato.replace(/\D/g, '');
    const mensagem = encodeURIComponent(
      `Olá ${item.responsavel} (${item.nomeFeirante})! Tudo bem?\n\nPassando para lembrar da taxa da Feira da Lua da edição ${item.dataFeira} no valor de R$ ${item.valorPendente.toFixed(2)}.\n\nChave Pix da Feira: pix@feiradalua.com.br\nFavorecido: Feira da Lua Oficial\n\nAssim que puder, nos envie o comprovante. Agradecemos a colaboração!`
    );

    return cleanPhone
      ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${mensagem}`
      : `https://api.whatsapp.com/send?text=${mensagem}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Section Header: Exactly as in Screenshot 1 */}
      <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#f5b800]">
                <PieChart className="w-4 h-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Relatório Geral de Feiras
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400">
              Prestação de contas consolidada das feiras realizadas, saldos em Pix, Dinheiro e cobranças.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f5b800] hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(245,184,0,0.35)] cursor-pointer"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Imprimir Relatório</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Top KPI Cards: Pixel-accurate replication of Screenshot 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL DE FEIRAS */}
        <div className="bg-[#12192c]/90 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              TOTAL DE FEIRAS
            </span>
            <div className="text-4xl font-extrabold text-white tracking-tight tabular-nums">
              {totalFeiras}
            </div>
          </div>
          <div className="absolute top-4 right-4 text-slate-700 group-hover:text-slate-600 transition-colors">
            <Filter className="w-8 h-8 opacity-20" />
          </div>
        </div>

        {/* Card 2: TOTAL DINHEIRO (LIQ) */}
        <div className="bg-[#12192c]/90 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Banknote className="w-4 h-4" />
              <span>TOTAL DINHEIRO (LIQ)</span>
            </div>
            <div className="text-4xl font-extrabold text-[#34d399] tracking-tight tabular-nums drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
              R$ {totalDinheiroLiq.toFixed(2)}
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 3: TOTAL PIX (LIQ) */}
        <div className="bg-[#12192c]/90 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
              <QrCode className="w-4 h-4" />
              <span>TOTAL PIX (LIQ)</span>
            </div>
            <div className="text-4xl font-extrabold text-[#38bdf8] tracking-tight tabular-nums drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]">
              R$ {totalPixLiq.toFixed(2)}
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 4: SALDO LÍQUIDO GERAL */}
        <div className="bg-[#12192c]/90 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#f5b800]">
              <DollarSign className="w-4 h-4" />
              <span>SALDO LÍQUIDO GERAL</span>
            </div>
            <div className="text-4xl font-extrabold text-[#f5b800] tracking-tight tabular-nums drop-shadow-[0_0_15px_rgba(245,184,0,0.35)]">
              R$ {saldoLiquidoGeral.toFixed(2)}
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Relatório de Pendentes para Cobrança: Exactly as in Screenshot 1 */}
      <div className="bg-[#111827]/90 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        {/* Section Header */}
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Receipt className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Relatório de Pendentes para Cobrança
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Lista consolidada de feirantes com pagamento pendente para cobrança imediata.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar barraca ou data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 w-44 sm:w-56"
              />
            </div>

            {/* Total Pendente badge - exactly as in Screenshot 1 */}
            <div className="px-4 py-2 rounded-xl bg-[#3c141e] border border-red-900/60 text-red-400 text-xs font-bold tracking-tight shadow-sm whitespace-nowrap">
              Total Pendente: R$ {totalPendenteGeral.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Table matching Screenshot 1 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e1422] text-slate-400 uppercase font-semibold border-b border-white/10 tracking-wider">
              <tr>
                <th className="py-3.5 px-6">FEIRA (DATA)</th>
                <th className="py-3.5 px-6">FEIRANTE</th>
                <th className="py-3.5 px-6">CONTATO</th>
                <th className="py-3.5 px-6">PRESENÇA</th>
                <th className="py-3.5 px-6">VALOR PENDENTE</th>
                <th className="py-3.5 px-6">AÇÕES / COBRANÇA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPendentes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle className="w-8 h-8 text-emerald-400 opacity-60" />
                      <p className="font-semibold text-white">Nenhum pagamento pendente no momento!</p>
                      <p className="text-xs text-slate-500">
                        Todas as taxas das feiras ativas estão devidamente quitadas.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPendentes.map((item) => {
                  const hasContact = item.contato && item.contato.trim().length > 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* FEIRA (DATA) */}
                      <td className="py-4 px-6 font-bold text-white font-mono text-sm whitespace-nowrap">
                        {item.dataFeira}
                      </td>

                      {/* FEIRANTE */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-white text-sm">
                          {item.nomeFeirante}
                        </div>
                        {item.responsavel && (
                          <div className="text-[11px] text-slate-400">
                            Resp: {item.responsavel}
                          </div>
                        )}
                      </td>

                      {/* CONTATO */}
                      <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                        {hasContact ? (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{item.contato}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenPhoneEdit(item.feiranteId, item.contato)}
                            className="text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1 text-xs"
                            title="Clique para cadastrar telefone/WhatsApp"
                          >
                            <span>-</span>
                            <span className="text-[10px] text-amber-500/70 underline ml-1">
                              (Cadastrar WhatsApp)
                            </span>
                          </button>
                        )}
                      </td>

                      {/* PRESENÇA - Pill styled as "Presente" orange/brown badge in Screenshot 1 */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#3d2314] text-[#fb923c] border border-[#7c2d12]/50 shadow-sm">
                          Presente
                        </span>
                      </td>

                      {/* VALOR PENDENTE - Neon Red text in Screenshot 1 */}
                      <td className="py-4 px-6 font-extrabold text-[#f87171] text-sm tabular-nums whitespace-nowrap">
                        R$ {item.valorPendente.toFixed(2)}
                      </td>

                      {/* AÇÕES / COBRANÇA */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {hasContact ? (
                            <a
                              href={getWhatsAppLink(item)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs transition-colors cursor-pointer"
                              title="Enviar cobrança personalizada no WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Cobrar via WhatsApp</span>
                            </a>
                          ) : (
                            <button
                              onClick={() => handleOpenPhoneEdit(item.feiranteId, item.contato)}
                              className="text-slate-500 hover:text-slate-400 text-xs flex items-center gap-1 cursor-pointer"
                              title="Adicionar telefone para cobrança"
                            >
                              <span>Sem telefone</span>
                              <Plus className="w-3 h-3 text-amber-400" />
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenPayment(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f5b800]/15 hover:bg-[#f5b800]/25 border border-[#f5b800]/30 text-[#f5b800] font-semibold text-xs transition-colors"
                            title="Registrar recebimento agora"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Receber Agora</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Phone Modal */}
      {editingPhoneFeiranteId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12192c] border border-white/15 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              Cadastrar WhatsApp do Feirante
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Informe o número de telefone com DDD para permitir envio de cobranças e avisos instantâneos via WhatsApp.
            </p>
            <input
              type="text"
              placeholder="(11) 99999-9999"
              value={newPhoneInput}
              onChange={(e) => setNewPhoneInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-sm text-white mb-4 focus:outline-none focus:border-amber-400"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEditingPhoneFeiranteId(null)}
                className="flex-1 px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5 rounded-lg border border-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePhone}
                className="flex-1 px-3 py-2 text-xs font-bold bg-[#f5b800] text-slate-950 rounded-lg hover:bg-amber-400"
              >
                Salvar Contato
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedPendente(null);
        }}
        initialPendente={selectedPendente}
      />

      {/* Print Report Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
};
