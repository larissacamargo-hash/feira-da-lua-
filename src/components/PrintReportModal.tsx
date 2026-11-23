import React from 'react';
import { useFeira } from '../context/FeiraContext.tsx';
import { Printer, X, Download } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ isOpen, onClose }) => {
  const {
    feiras,
    totalDinheiroLiq,
    totalPixLiq,
    saldoLiquidoGeral,
    totalPendenteGeral,
    pendentesList,
    despesas,
    currentUser,
  } = useFeira();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['RELATORIO OFICIAL - FEIRA DA LUA'],
      ['Gerado em', new Date().toLocaleString('pt-BR'), 'Operador', currentUser.nome],
      [],
      ['INDICADORES GERAIS'],
      ['Total de Feiras Realizadas', feiras.length],
      ['Total Dinheiro Liquido (R$)', totalDinheiroLiq.toFixed(2)],
      ['Total Pix Liquido (R$)', totalPixLiq.toFixed(2)],
      ['Saldo Liquido Geral (R$)', saldoLiquidoGeral.toFixed(2)],
      ['Total Pendente de Cobranca (R$)', totalPendenteGeral.toFixed(2)],
      [],
      ['PENDENTES DE COBRANCA'],
      ['Data Feira', 'Barraca / Feirante', 'Responsavel', 'Contato', 'Valor Pendente (R$)'],
      ...pendentesList.map((p) => [
        p.dataFeira,
        p.nomeFeirante,
        p.responsavel,
        p.contato || 'Sem telefone',
        p.valorPendente.toFixed(2),
      ]),
      [],
      ['DESPESAS CONSOLIDADAS'],
      ['Data', 'Descricao', 'Categoria', 'Valor (R$)', 'Responsavel'],
      ...despesas.map((d) => [d.data, d.descricao, d.categoria, d.valor.toFixed(2), d.pagoPor]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      csvRows.map((e) => e.map((val) => `"${val}"`).join(';')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_Feira_da_Lua_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#12192c] text-white border border-white/15 rounded-2xl max-w-4xl w-full my-8 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Controls Bar (hidden during print) */}
        <div className="p-4 bg-slate-900 border-b border-white/10 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-[#f5b800]" />
              Visualização para Impressão de Relatório
            </span>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              Pronto para Imprimir / PDF
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-white/10 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV / Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#f5b800] hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-[0_0_12px_rgba(245,184,0,0.3)]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Agora (Ctrl + P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (Looks like an official paper report) */}
        <div className="p-8 overflow-y-auto bg-slate-950 print:bg-white print:text-black print:p-0 space-y-6">
          {/* Header */}
          <div className="border-b-2 border-amber-500/50 print:border-black pb-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="font-black text-2xl tracking-tight text-white print:text-black">
                  FEIRA DA <span className="text-[#f5b800] print:text-black">LUA</span>
                </span>
                <span className="text-xs text-amber-400 print:text-gray-600 font-semibold px-2 py-0.5 border border-amber-500/30 rounded">
                  Prestação de Contas Oficial
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                Relatório Geral Consolidado de Feiras, Entradas, Despesas e Cobranças
              </p>
            </div>
            <div className="text-right text-xs text-slate-400 print:text-gray-600">
              <p>Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
              <p>
                Responsável: <strong className="text-white print:text-black">{currentUser.nome}</strong>
              </p>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:grid-cols-4">
            <div className="p-3.5 bg-slate-900 print:bg-gray-100 border border-white/10 print:border-gray-300 rounded-xl">
              <span className="text-[11px] text-slate-400 print:text-gray-600 uppercase font-semibold block">
                Total de Feiras
              </span>
              <span className="text-2xl font-black text-white print:text-black tabular-nums">
                {feiras.length}
              </span>
            </div>

            <div className="p-3.5 bg-slate-900 print:bg-gray-100 border border-white/10 print:border-gray-300 rounded-xl">
              <span className="text-[11px] text-emerald-400 print:text-emerald-800 uppercase font-semibold block">
                Total Dinheiro (Líq)
              </span>
              <span className="text-2xl font-black text-emerald-400 print:text-emerald-800 tabular-nums">
                R$ {totalDinheiroLiq.toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 bg-slate-900 print:bg-gray-100 border border-white/10 print:border-gray-300 rounded-xl">
              <span className="text-[11px] text-cyan-400 print:text-cyan-800 uppercase font-semibold block">
                Total Pix (Líq)
              </span>
              <span className="text-2xl font-black text-cyan-400 print:text-cyan-800 tabular-nums">
                R$ {totalPixLiq.toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 bg-slate-900 print:bg-gray-100 border border-amber-500/30 print:border-gray-400 rounded-xl">
              <span className="text-[11px] text-[#f5b800] print:text-black uppercase font-semibold block">
                Saldo Líquido Geral
              </span>
              <span className="text-2xl font-black text-[#f5b800] print:text-black tabular-nums">
                R$ {saldoLiquidoGeral.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Pending debts section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-white print:text-black uppercase tracking-wider">
                Feirantes com Pagamento Pendente ({pendentesList.length})
              </h4>
              <span className="text-xs font-bold text-red-400 print:text-red-700 bg-red-950/40 print:bg-red-50 border border-red-800/40 px-2 py-0.5 rounded">
                Total Pendente: R$ {totalPendenteGeral.toFixed(2)}
              </span>
            </div>

            <div className="overflow-x-auto border border-white/10 print:border-gray-300 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 print:bg-gray-200 text-slate-400 print:text-black border-b border-white/10 print:border-gray-300 uppercase font-semibold">
                  <tr>
                    <th className="py-2 px-3">Feira (Data)</th>
                    <th className="py-2 px-3">Feirante / Barraca</th>
                    <th className="py-2 px-3">Responsável</th>
                    <th className="py-2 px-3">Contato</th>
                    <th className="py-2 px-3">Presença</th>
                    <th className="py-2 px-3 text-right">Valor Pendente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-gray-200 text-slate-300 print:text-black">
                  {pendentesList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-500">
                        Nenhum feirante pendente. Todos os pagamentos em dia!
                      </td>
                    </tr>
                  ) : (
                    pendentesList.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 px-3 font-semibold text-white print:text-black font-mono">
                          {p.dataFeira}
                        </td>
                        <td className="py-2 px-3 font-bold text-white print:text-black">
                          {p.nomeFeirante}
                        </td>
                        <td className="py-2 px-3 text-slate-400 print:text-gray-700">
                          {p.responsavel}
                        </td>
                        <td className="py-2 px-3 text-slate-400 print:text-gray-700">
                          {p.contato || '-'}
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/50 print:bg-amber-100 text-amber-300 print:text-amber-800 border border-amber-800/40">
                            Presente
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-red-400 print:text-red-700 tabular-nums">
                          R$ {p.valorPendente.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Despesas da feira */}
          <div>
            <h4 className="text-sm font-bold text-white print:text-black uppercase tracking-wider mb-2">
              Demonstrativo de Custos Operacionais
            </h4>
            <div className="overflow-x-auto border border-white/10 print:border-gray-300 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 print:bg-gray-200 text-slate-400 print:text-black border-b border-white/10 print:border-gray-300 uppercase font-semibold">
                  <tr>
                    <th className="py-2 px-3">Data</th>
                    <th className="py-2 px-3">Descrição da Despesa</th>
                    <th className="py-2 px-3">Categoria</th>
                    <th className="py-2 px-3">Autorizado por</th>
                    <th className="py-2 px-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-gray-200 text-slate-300 print:text-black">
                  {despesas.map((d) => (
                    <tr key={d.id}>
                      <td className="py-2 px-3 font-mono">{d.data}</td>
                      <td className="py-2 px-3 font-medium text-white print:text-black">
                        {d.descricao}
                      </td>
                      <td className="py-2 px-3 text-slate-400 print:text-gray-700">{d.categoria}</td>
                      <td className="py-2 px-3 text-slate-400 print:text-gray-700">{d.pagoPor}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-200 print:text-black tabular-nums">
                        R$ {d.valor.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t border-white/10 print:border-gray-400 grid grid-cols-2 gap-8 text-center text-xs text-slate-400 print:text-gray-700">
            <div>
              <div className="border-b border-slate-600 print:border-black mb-1 mx-6 h-8" />
              <p className="font-bold text-white print:text-black">{currentUser.nome}</p>
              <p>{currentUser.cargo}</p>
            </div>
            <div>
              <div className="border-b border-slate-600 print:border-black mb-1 mx-6 h-8" />
              <p className="font-bold text-white print:text-black">Coordenação Geral</p>
              <p>Feira da Lua - Gestão Comunitária</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
