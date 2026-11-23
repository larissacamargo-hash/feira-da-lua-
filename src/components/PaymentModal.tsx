import React, { useState } from 'react';
import { useFeira, PendenteItem } from '../context/FeiraContext.tsx';
import { CheckCircle2, QrCode, Banknote, X, MessageSquare, Copy, Check } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPendente?: PendenteItem | null;
  initialFeiraId?: string;
  initialFeiranteId?: string;
  initialValor?: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  initialPendente,
  initialFeiraId,
  initialFeiranteId,
  initialValor,
}) => {
  const { feiras, feirantes, registrarPagamento, currentUser } = useFeira();

  const [selectedFeiraId, setSelectedFeiraId] = useState(
    initialPendente?.feiraId || initialFeiraId || feiras[0]?.id || ''
  );
  const [selectedFeiranteId, setSelectedFeiranteId] = useState(
    initialPendente?.feiranteId || initialFeiranteId || feirantes[0]?.id || ''
  );
  const [valor, setValor] = useState<number>(
    initialPendente?.valorPendente ?? initialValor ?? 55.0
  );
  const [metodo, setMetodo] = useState<'pix' | 'dinheiro'>('pix');
  const [observacao, setObservacao] = useState(initialPendente?.observacao || '');
  const [copiedPix, setCopiedPix] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const feirante = feirantes.find((f) => f.id === selectedFeiranteId);
  const feira = feiras.find((f) => f.id === selectedFeiraId);

  const pixChaveFeira = 'pix@feiradalua.com.br (CNPJ 48.912.430/0001-88)';

  const handleCopyPix = () => {
    navigator.clipboard.writeText('pix@feiradalua.com.br');
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeiraId || !selectedFeiranteId || valor <= 0) return;

    registrarPagamento({
      feiraId: selectedFeiraId,
      feiranteId: selectedFeiranteId,
      valor: Number(valor),
      metodo,
      observacao: observacao.trim() || undefined,
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  const cleanPhone = feirante?.contato ? feirante.contato.replace(/\D/g, '') : '';
  const mensagemWhatsApp = encodeURIComponent(
    `Olá ${feirante?.responsavel || ''} (${feirante?.nomeBarraca || ''})! Tudo bem?\n\nPassando para lembrar da taxa da Feira da Lua da edição ${feira?.data || ''} no valor de R$ ${Number(valor).toFixed(2)}.\n\nChave Pix da Feira: pix@feiradalua.com.br\nFavorecido: Feira da Lua Oficial\n\nAssim que fizer o Pix, por favor nos envie o comprovante por aqui. Obrigado!`
  );
  const whatsappUrl = cleanPhone
    ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${mensagemWhatsApp}`
    : `https://api.whatsapp.com/send?text=${mensagemWhatsApp}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12192c] border border-white/15 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[#f5b800] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Receber Taxa de Feira</h3>
              <p className="text-xs text-slate-400">Lançamento no caixa em tempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Pagamento Registrado com Sucesso!</h4>
            <p className="text-xs text-slate-400">
              R$ {Number(valor).toFixed(2)} recebido via {metodo.toUpperCase()} por {currentUser.nome}. Saldo atualizado em tempo real.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Feira selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Feira (Edição / Data)
              </label>
              <select
                value={selectedFeiraId}
                onChange={(e) => setSelectedFeiraId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
              >
                {feiras.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.data} ({f.label}) {f.statusFeira === 'cancelada' ? '- CANCELADA' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Feirante selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Barraca / Feirante
              </label>
              <select
                value={selectedFeiranteId}
                onChange={(e) => {
                  setSelectedFeiranteId(e.target.value);
                  const sel = feirantes.find((f) => f.id === e.target.value);
                  if (sel) setValor(sel.taxaPadrao);
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
              >
                {feirantes.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nomeBarraca} - {f.responsavel} ({f.categoria})
                  </option>
                ))}
              </select>
            </div>

            {/* Valor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Valor a Receber (R$)
                </label>
                <div className="flex gap-1.5">
                  {[32, 55, 72, 110].map((quickVal) => (
                    <button
                      key={quickVal}
                      type="button"
                      onClick={() => setValor(quickVal)}
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                        valor === quickVal
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      R$ {quickVal}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-slate-400 font-mono">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={valor}
                  onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-base font-bold text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Metodo de Pagamento */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMetodo('pix')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border font-semibold text-xs transition-all ${
                    metodo === 'pix'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                      : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>PIX Instantâneo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodo('dinheiro')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border font-semibold text-xs transition-all ${
                    metodo === 'dinheiro'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.25)]'
                      : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span>Dinheiro (Espécie)</span>
                </button>
              </div>
            </div>

            {/* Chave Pix helper box */}
            {metodo === 'pix' && (
              <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-lg flex items-center justify-between gap-2 text-xs">
                <div className="truncate">
                  <span className="text-[11px] text-cyan-400 font-semibold block">Chave Pix da Feira:</span>
                  <span className="text-slate-300 font-mono truncate block text-[11px]">{pixChaveFeira}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="px-2.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded text-[11px] font-semibold flex items-center gap-1 shrink-0"
                >
                  {copiedPix ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            )}

            {/* Observação */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observação / Detalhe
              </label>
              <input
                type="text"
                placeholder="Ex: Pago por Lincon, adiantado, etc."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Cobrança WhatsApp link */}
            <div className="flex items-center justify-between pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Enviar aviso via WhatsApp</span>
              </a>
              <span className="text-[11px] text-slate-400">
                Operador: <strong className="text-slate-200">{currentUser.nome}</strong>
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 border border-white/10 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-xs font-bold bg-[#f5b800] hover:bg-amber-400 text-slate-950 rounded-lg shadow-[0_0_15px_rgba(245,184,0,0.3)] transition-all"
              >
                Confirmar Recebimento
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
