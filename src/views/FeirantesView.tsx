import React, { useState } from 'react';
import { useFeira } from '../context/FeiraContext.tsx';
import { Feirante } from '../types.ts';
import {
  Users,
  Plus,
  Search,
  Store,
  Phone,
  MessageCircle,
  Tag,
  DollarSign,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  QrCode,
  MapPin,
} from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal.tsx';

export const FeirantesView: React.FC = () => {
  const { feirantes, addFeirante, updateFeirante, deleteFeirante, registros } = useFeira();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFeirante, setEditingFeirante] = useState<Feirante | null>(null);
  const [deletingFeirante, setDeletingFeirante] = useState<Feirante | null>(null);

  // Quick Payment Modal
  const [paymentFeiranteId, setPaymentFeiranteId] = useState<string | null>(null);

  // Form state
  const [nomeBarraca, setNomeBarraca] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [contato, setContato] = useState('');
  const [categoria, setCategoria] = useState<Feirante['categoria']>('Alimentação');
  const [taxaPadrao, setTaxaPadrao] = useState<number>(55);
  const [ponto, setPonto] = useState('');
  const [pixChave, setPixChave] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const openAddModal = () => {
    setNomeBarraca('');
    setResponsavel('');
    setContato('');
    setCategoria('Alimentação');
    setTaxaPadrao(55);
    setPonto('Barraca #' + String(feirantes.length + 1).padStart(2, '0'));
    setPixChave('');
    setObservacoes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (f: Feirante) => {
    setEditingFeirante(f);
    setNomeBarraca(f.nomeBarraca);
    setResponsavel(f.responsavel);
    setContato(f.contato);
    setCategoria(f.categoria);
    setTaxaPadrao(f.taxaPadrao);
    setPonto(f.ponto);
    setPixChave(f.pixChave || '');
    setObservacoes(f.observacoes || '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeBarraca.trim() || !responsavel.trim()) return;

    if (editingFeirante) {
      updateFeirante({
        ...editingFeirante,
        nomeBarraca: nomeBarraca.trim(),
        responsavel: responsavel.trim(),
        contato: contato.trim(),
        categoria,
        taxaPadrao: Number(taxaPadrao),
        ponto: ponto.trim(),
        pixChave: pixChave.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      });
      setEditingFeirante(null);
    } else {
      addFeirante({
        nomeBarraca: nomeBarraca.trim(),
        responsavel: responsavel.trim(),
        contato: contato.trim(),
        categoria,
        taxaPadrao: Number(taxaPadrao),
        ponto: ponto.trim() || 'Barraca #' + String(feirantes.length + 1).padStart(2, '0'),
        ativo: true,
        pixChave: pixChave.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      });
      setIsAddModalOpen(false);
    }
  };

  const filteredFeirantes = feirantes.filter((f) => {
    const matchesSearch =
      f.nomeBarraca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.ponto.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = categoryFilter === 'all' || f.categoria === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const getFeiranteDebt = (feiranteId: string) => {
    return registros
      .filter((r) => r.feiranteId === feiranteId && r.statusPagamento === 'pendente')
      .reduce((acc, r) => acc + (r.valorCobrado - r.valorPago), 0);
  };

  const getFeiranteTotalPaid = (feiranteId: string) => {
    return registros
      .filter(
        (r) =>
          r.feiranteId === feiranteId &&
          (r.statusPagamento === 'pago_pix' ||
            r.statusPagamento === 'pago_dinheiro' ||
            r.statusPagamento === 'pago_lincon')
      )
      .reduce((acc, r) => acc + (r.valorPago || r.valorCobrado), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#f5b800]">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Gestão de Feirantes & Barracas
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Cadastre e monitore todas as barracas da Feira da Lua (Cachorro Quente, Doces, Pastel, Artesanatos, etc.).
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#f5b800] hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(245,184,0,0.3)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cadastrar Barraca</span>
        </button>
      </div>

      {/* Filter and stats row */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search and Category filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por barraca, feirante ou ponto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 bg-[#12192c] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 w-64"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#12192c] border border-white/10 p-1 rounded-xl overflow-x-auto text-xs">
            {['all', 'Alimentação', 'Doces', 'Bebidas', 'Artesanato', 'Lazer'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  categoryFilter === cat
                    ? 'bg-[#f5b800] text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'Todas as Categorias' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-4">
          <span>
            Total: <strong className="text-white">{filteredFeirantes.length}</strong> barracas
          </span>
        </div>
      </div>

      {/* Barracas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeirantes.map((f) => {
          const debt = getFeiranteDebt(f.id);
          const totalPaid = getFeiranteTotalPaid(f.id);
          const hasPhone = f.contato && f.contato.trim().length > 0;

          return (
            <div
              key={f.id}
              className="bg-[#12192c] border border-white/10 hover:border-white/25 rounded-2xl p-5 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-white/5">
                    {f.categoria}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[#f5b800] font-mono">
                      Taxa: R$ {f.taxaPadrao.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Barraca Name */}
                <h3 className="text-base font-bold text-white group-hover:text-[#f5b800] transition-colors">
                  {f.nomeBarraca}
                </h3>

                {/* Responsible and Point */}
                <div className="text-xs text-slate-400 space-y-1 mt-1 mb-3">
                  <p className="flex items-center gap-1.5">
                    <span className="text-slate-500">Responsável:</span>
                    <strong className="text-slate-200">{f.responsavel}</strong>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-amber-500/70" />
                    <span>{f.ponto}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{f.contato || 'Sem telefone cadastrado'}</span>
                  </p>
                </div>

                {/* Financial Summary for this Barraca */}
                <div className="p-3 bg-slate-900/80 border border-white/5 rounded-xl grid grid-cols-2 gap-2 text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">
                      Total Quitado
                    </span>
                    <span className="font-bold text-emerald-400 tabular-nums">
                      R$ {totalPaid.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">
                      Dívida Pendente
                    </span>
                    <span
                      className={`font-bold tabular-nums ${
                        debt > 0 ? 'text-[#f87171]' : 'text-slate-400'
                      }`}
                    >
                      {debt > 0 ? `R$ ${debt.toFixed(2)}` : 'R$ 0,00 (Em dia)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {hasPhone && (
                    <a
                      href={`https://wa.me/55${f.contato.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      title="Conversar no WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => openEditModal(f)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                    title="Editar Barraca"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingFeirante(f)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Excluir Barraca"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setPaymentFeiranteId(f.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5b800]/15 hover:bg-[#f5b800]/25 border border-[#f5b800]/30 text-[#f5b800] rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Cobrar / Receber</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add or Edit Feirante */}
      {(isAddModalOpen || editingFeirante) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12192c] border border-white/15 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400" />
              {editingFeirante ? 'Editar Dados da Barraca' : 'Cadastrar Nova Barraca / Feirante'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Preencha as informações para registro oficial na Feira da Lua.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nome da Barraca *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cachorro Quente do Zé"
                    value={nomeBarraca}
                    onChange={(e) => setNomeBarraca(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Responsável *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: José Almir"
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Categoria
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Alimentação">Alimentação</option>
                    <option value="Doces">Doces</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Artesanato">Artesanato</option>
                    <option value="Lazer">Lazer</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Taxa Padrão (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={taxaPadrao}
                    onChange={(e) => setTaxaPadrao(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Ponto / Espaço
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Barraca #01"
                    value={ponto}
                    onChange={(e) => setPonto(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Contato (WhatsApp)
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 98765-4321"
                    value={contato}
                    onChange={(e) => setContato(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Chave Pix da Barraca
                  </label>
                  <input
                    type="text"
                    placeholder="E-mail, CPF ou Telefone"
                    value={pixChave}
                    onChange={(e) => setPixChave(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Observações Gerais
                </label>
                <textarea
                  rows={2}
                  placeholder="Informações sobre ponto elétrico, botijão de gás, etc."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingFeirante(null);
                  }}
                  className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5 border border-white/10 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-[#f5b800] hover:bg-amber-400 text-slate-950 rounded-lg shadow-md"
                >
                  {editingFeirante ? 'Salvar Alterações' : 'Cadastrar Barraca'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingFeirante && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12192c] border border-white/15 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Excluir Barraca?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Deseja remover <strong>{deletingFeirante.nomeBarraca}</strong> ({deletingFeirante.responsavel}) do cadastro da Feira da Lua?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingFeirante(null)}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 border border-white/10 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteFeirante(deletingFeirante.id);
                  setDeletingFeirante(null);
                }}
                className="flex-1 px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentFeiranteId && (
        <PaymentModal
          isOpen={true}
          onClose={() => setPaymentFeiranteId(null)}
          initialFeiranteId={paymentFeiranteId}
        />
      )}
    </div>
  );
};
