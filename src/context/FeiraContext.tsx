import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Feirante,
  FeiraDate,
  RegistroPresenca,
  DespesaFeira,
  TransacaoCaixa,
  UserAccount,
  UserRole,
  PaymentStatus,
} from '../types.ts';
import {
  INITIAL_USERS,
  INITIAL_FEIRAS,
  INITIAL_FEIRANTES,
  INITIAL_REGISTROS,
  INITIAL_DESPESAS,
  INITIAL_TRANSACOES,
} from '../data/initialData.ts';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage.ts';

export interface PendenteItem {
  id: string;
  registroId: string;
  feiraId: string;
  dataFeira: string;
  labelFeira: string;
  feiranteId: string;
  nomeFeirante: string;
  responsavel: string;
  contato: string;
  presente: boolean;
  valorPendente: number;
  observacao?: string;
  pixChave?: string;
}

interface FeiraContextType {
  isAuthenticated: boolean;
  login: (user: UserAccount, targetTab?: 'relatorios' | 'feiras' | 'feirantes' | 'usuarios' | 'caixa') => void;
  loginAsCustomPerson: (
    nome: string,
    role: UserRole,
    targetTab?: 'relatorios' | 'feiras' | 'feirantes' | 'usuarios' | 'caixa',
    email?: string
  ) => void;
  logout: () => void;
  activeTab: 'relatorios' | 'feiras' | 'feirantes' | 'usuarios' | 'caixa';
  setActiveTab: (tab: 'relatorios' | 'feiras' | 'feirantes' | 'usuarios' | 'caixa') => void;
  users: UserAccount[];
  currentUser: UserAccount;
  setCurrentUser: (u: UserAccount) => void;
  addUser: (user: Omit<UserAccount, 'id' | 'ultimoAcesso'>) => void;
  updateUser: (user: UserAccount) => void;
  toggleUserStatus: (id: string) => void;
  feiras: FeiraDate[];
  addFeira: (feira: Omit<FeiraDate, 'id'>) => void;
  updateFeira: (feira: FeiraDate) => void;
  feirantes: Feirante[];
  addFeirante: (f: Omit<Feirante, 'id'>) => void;
  updateFeirante: (f: Feirante) => void;
  deleteFeirante: (id: string) => void;
  registros: RegistroPresenca[];
  updateRegistroStatus: (feiraId: string, feiranteId: string, status: PaymentStatus, valorCobrado?: number) => void;
  registrarPagamento: (params: {
    feiraId: string;
    feiranteId: string;
    valor: number;
    metodo: 'pix' | 'dinheiro';
    observacao?: string;
  }) => void;
  despesas: DespesaFeira[];
  addDespesa: (d: Omit<DespesaFeira, 'id'>) => void;
  deleteDespesa: (id: string) => void;
  transacoes: TransacaoCaixa[];
  addTransacaoCaixa: (tx: Omit<TransacaoCaixa, 'id' | 'timestamp'>) => void;
  resetToInitialData: () => void;

  // Real-time calculated metrics
  totalFeiras: number;
  totalDinheiroLiq: number;
  totalPixLiq: number;
  saldoLiquidoGeral: number;
  totalPendenteGeral: number;
  pendentesList: PendenteItem[];
}

const FeiraContext = createContext<FeiraContextType | undefined>(undefined);

const STORAGE_KEYS = {
  IS_AUTH: 'feiradalua_is_auth_v3',
  USERS: 'feiradalua_users_v3',
  CURRENT_USER_ID: 'feiradalua_current_user_v3',
  FEIRAS: 'feiradalua_feiras_v3',
  FEIRANTES: 'feiradalua_feirantes_v3',
  REGISTROS: 'feiradalua_registros_v3',
  DESPESAS: 'feiradalua_despesas_v3',
  TRANSACOES: 'feiradalua_transacoes_v3',
};

export const FeiraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return safeGetItem<boolean>(STORAGE_KEYS.IS_AUTH, true);
  });

  const [activeTab, setActiveTab] = useState<'relatorios' | 'feiras' | 'feirantes' | 'usuarios' | 'caixa'>('relatorios');

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const loaded = safeGetItem<UserAccount[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    return loaded.map((u) =>
      u.email === 'mariaeduardaxs091@gmail.com' || u.nome === 'Maria Eduarda'
        ? {
            ...u,
            nome: 'Admin Principal',
            email: 'admin@feiradalua.com.br',
            cargo: 'Administrador Geral',
          }
        : u
    );
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = safeGetItem<string>(STORAGE_KEYS.CURRENT_USER_ID, 'usr_1');
    return saved || 'usr_1';
  });

  const [feiras, setFeiras] = useState<FeiraDate[]>(() => {
    return safeGetItem<FeiraDate[]>(STORAGE_KEYS.FEIRAS, INITIAL_FEIRAS);
  });

  const [feirantes, setFeirantes] = useState<Feirante[]>(() => {
    return safeGetItem<Feirante[]>(STORAGE_KEYS.FEIRANTES, INITIAL_FEIRANTES);
  });

  const [registros, setRegistros] = useState<RegistroPresenca[]>(() => {
    const loaded = safeGetItem<RegistroPresenca[]>(STORAGE_KEYS.REGISTROS, INITIAL_REGISTROS);
    return loaded.map((r) =>
      r.recebidoPor === 'Maria Eduarda' ? { ...r, recebidoPor: 'Admin Principal' } : r
    );
  });

  const [despesas, setDespesas] = useState<DespesaFeira[]>(() => {
    const loaded = safeGetItem<DespesaFeira[]>(STORAGE_KEYS.DESPESAS, INITIAL_DESPESAS);
    return loaded.map((d) =>
      d.pagoPor === 'Maria Eduarda' ? { ...d, pagoPor: 'Admin Principal' } : d
    );
  });

  const [transacoes, setTransacoes] = useState<TransacaoCaixa[]>(() => {
    const loaded = safeGetItem<TransacaoCaixa[]>(STORAGE_KEYS.TRANSACOES, INITIAL_TRANSACOES);
    return loaded.map((t) =>
      t.operador === 'Maria Eduarda' ? { ...t, operador: 'Admin Principal' } : t
    );
  });

  // Save changes safely to storage
  useEffect(() => {
    safeSetItem(STORAGE_KEYS.IS_AUTH, isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.USERS, users);
  }, [users]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.FEIRAS, feiras);
  }, [feiras]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.FEIRANTES, feirantes);
  }, [feirantes]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.REGISTROS, registros);
  }, [registros]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.DESPESAS, despesas);
  }, [despesas]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.TRANSACOES, transacoes);
  }, [transacoes]);

  // Guaranteed non-null currentUser
  const currentUser = useMemo(() => {
    const found = users?.find((u) => u?.id === currentUserId);
    return found || users?.[0] || INITIAL_USERS[0];
  }, [users, currentUserId]);

  const setCurrentUser = (u: UserAccount) => {
    if (u?.id) {
      setCurrentUserId(u.id);
    }
  };

  const login = (
    user: UserAccount,
    targetTab: 'relatorios' | 'feiras' | 'feirantes' | 'usuarios' | 'caixa' = 'relatorios'
  ) => {
    setCurrentUserId(user.id);
    setUsers((prev) =>
      (prev || []).map((u) =>
        u.id === user.id ? { ...u, ultimoAcesso: 'Agora mesmo' } : u
      )
    );
    setActiveTab(targetTab);
    setIsAuthenticated(true);
  };

  const loginAsCustomPerson = (
    nome: string,
    role: UserRole,
    targetTab: 'relatorios' | 'feiras' | 'feirantes' | 'usuarios' | 'caixa' = 'relatorios',
    email?: string
  ) => {
    const cleanName = nome.trim();
    const cleanEmail = email?.trim();

    const existing = (users || []).find(
      (u) =>
        u.nome.toLowerCase() === cleanName.toLowerCase() &&
        u.role === role
    );

    if (existing) {
      login({ ...existing, ativo: true }, targetTab);
      return;
    }

    const cargoPorRole: Record<UserRole, string> = {
      admin: 'Administrador(a) Geral',
      operador: 'Fiscal de Caixa e Cobrança',
      visualizador: 'Auditor(a) Contábil',
    };

    const colors = [
      'from-amber-400 to-yellow-600',
      'from-blue-500 to-cyan-600',
      'from-emerald-500 to-teal-600',
      'from-purple-500 to-indigo-600',
      'from-rose-500 to-pink-600',
    ];

    const slug = cleanName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.+|\.+$/g, '');

    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      nome: cleanName,
      email: cleanEmail || `${slug || 'usuario'}@feiradalua.com.br`,
      role,
      cargo: cargoPorRole[role],
      ativo: true,
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      ultimoAcesso: 'Agora mesmo',
    };

    setUsers((prev) => [...(prev || []), newUser]);
    setCurrentUserId(newUser.id);
    setActiveTab(targetTab);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const addUser = (userData: Omit<UserAccount, 'id' | 'ultimoAcesso'>) => {
    const newUser: UserAccount = {
      ...userData,
      id: `usr_${Date.now()}`,
      ultimoAcesso: 'Agora mesmo',
    };
    setUsers((prev) => [...(prev || []), newUser]);
  };

  const updateUser = (updated: UserAccount) => {
    setUsers((prev) => (prev || []).map((u) => (u.id === updated.id ? updated : u)));
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      (prev || []).map((u) => (u.id === id ? { ...u, ativo: !u.ativo } : u))
    );
  };

  const addFeira = (feiraData: Omit<FeiraDate, 'id'>) => {
    const newFeira: FeiraDate = {
      ...feiraData,
      id: `f_${Date.now()}`,
    };
    setFeiras((prev) => [newFeira, ...(prev || [])]);

    // Pre-create initial presence records for active feirantes
    const safeFeirantes = feirantes || INITIAL_FEIRANTES;
    const newRegistros: RegistroPresenca[] = safeFeirantes
      .filter((f) => f.ativo)
      .map((f) => ({
        id: `reg_${f.id}_${newFeira.id}`,
        feiraId: newFeira.id,
        feiranteId: f.id,
        presente: true,
        statusPagamento: 'pendente',
        valorCobrado: f.taxaPadrao,
        valorPago: 0,
      }));

    setRegistros((prev) => [...(prev || []), ...newRegistros]);
  };

  const updateFeira = (feira: FeiraDate) => {
    setFeiras((prev) => (prev || []).map((f) => (f.id === feira.id ? feira : f)));
  };

  const addFeirante = (fData: Omit<Feirante, 'id'>) => {
    const newFeirante: Feirante = {
      ...fData,
      id: `ft_${Date.now()}`,
    };
    setFeirantes((prev) => [...(prev || []), newFeirante]);

    // Create pending records for ongoing open feiras
    const safeFeiras = feiras || INITIAL_FEIRAS;
    const openFeiras = safeFeiras.filter((f) => f.statusFeira === 'aberta');
    if (openFeiras.length > 0) {
      const recordsToAdd: RegistroPresenca[] = openFeiras.map((of) => ({
        id: `reg_${newFeirante.id}_${of.id}`,
        feiraId: of.id,
        feiranteId: newFeirante.id,
        presente: true,
        statusPagamento: 'pendente',
        valorCobrado: newFeirante.taxaPadrao,
        valorPago: 0,
      }));
      setRegistros((prev) => [...(prev || []), ...recordsToAdd]);
    }
  };

  const updateFeirante = (updated: Feirante) => {
    setFeirantes((prev) => (prev || []).map((f) => (f.id === updated.id ? updated : f)));
  };

  const deleteFeirante = (id: string) => {
    setFeirantes((prev) => (prev || []).filter((f) => f.id !== id));
  };

  const updateRegistroStatus = (
    feiraId: string,
    feiranteId: string,
    status: PaymentStatus,
    valorCobrado?: number
  ) => {
    setRegistros((prev) => {
      const currentList = prev || [];
      const existingIndex = currentList.findIndex(
        (r) => r.feiraId === feiraId && r.feiranteId === feiranteId
      );

      const feirante = (feirantes || []).find((f) => f.id === feiranteId);
      const defaultValor = feirante ? feirante.taxaPadrao : 55.0;
      const targetValorCobrado = valorCobrado !== undefined ? valorCobrado : defaultValor;

      const isPaid = status === 'pago_pix' || status === 'pago_dinheiro' || status === 'pago_lincon';
      const targetValorPago = isPaid ? targetValorCobrado : 0;
      const metodo =
        status === 'pago_pix'
          ? 'pix'
          : status === 'pago_dinheiro' || status === 'pago_lincon'
          ? 'dinheiro'
          : undefined;

      if (existingIndex >= 0) {
        const copy = [...currentList];
        copy[existingIndex] = {
          ...copy[existingIndex],
          statusPagamento: status,
          valorCobrado: targetValorCobrado,
          valorPago: targetValorPago,
          metodoPagamento: metodo,
          recebidoPor: isPaid ? currentUser.nome : copy[existingIndex].recebidoPor,
          dataPagamento: isPaid ? new Date().toISOString() : undefined,
          presente: status !== 'cancelado',
        };
        return copy;
      } else {
        const newRecord: RegistroPresenca = {
          id: `reg_${feiranteId}_${feiraId}`,
          feiraId,
          feiranteId,
          presente: status !== 'cancelado',
          statusPagamento: status,
          valorCobrado: targetValorCobrado,
          valorPago: targetValorPago,
          metodoPagamento: metodo,
          recebidoPor: isPaid ? currentUser.nome : undefined,
          dataPagamento: isPaid ? new Date().toISOString() : undefined,
        };
        return [...currentList, newRecord];
      }
    });
  };

  const registrarPagamento = ({
    feiraId,
    feiranteId,
    valor,
    metodo,
    observacao,
  }: {
    feiraId: string;
    feiranteId: string;
    valor: number;
    metodo: 'pix' | 'dinheiro';
    observacao?: string;
  }) => {
    const status: PaymentStatus = metodo === 'pix' ? 'pago_pix' : 'pago_dinheiro';
    const feirante = (feirantes || []).find((f) => f.id === feiranteId);
    const feiranteNome = feirante ? feirante.nomeBarraca : 'Feirante';
    const feira = (feiras || []).find((f) => f.id === feiraId);
    const feiraData = feira ? feira.label : 'Feira';

    // 1. Update presence registry
    updateRegistroStatus(feiraId, feiranteId, status, valor);

    // 2. Add to real-time cash transaction
    const now = new Date();
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}:${String(
      now.getSeconds()
    ).padStart(2, '0')}`;

    const newTx: TransacaoCaixa = {
      id: `tx_${Date.now()}`,
      tipo: 'entrada',
      metodo,
      valor,
      descricao: `Taxa Feira ${feiraData} - ${feiranteNome}${observacao ? ` (${observacao})` : ''}`,
      feiraId,
      feiranteNome,
      operador: currentUser.nome,
      timestamp: dateFormatted,
    };

    setTransacoes((prev) => [newTx, ...(prev || [])]);
  };

  const addDespesa = (dData: Omit<DespesaFeira, 'id'>) => {
    const newDespesa: DespesaFeira = {
      ...dData,
      id: `dsp_${Date.now()}`,
    };
    setDespesas((prev) => [...(prev || []), newDespesa]);

    // Also add to transactions as a cash outflow
    const now = new Date();
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTx: TransacaoCaixa = {
      id: `tx_${Date.now()}`,
      tipo: 'saida',
      metodo: 'dinheiro',
      valor: dData.valor,
      descricao: `Despesa: ${dData.descricao} (${dData.categoria})`,
      feiraId: dData.feiraId,
      operador: currentUser.nome,
      timestamp: dateFormatted,
    };
    setTransacoes((prev) => [newTx, ...(prev || [])]);
  };

  const deleteDespesa = (id: string) => {
    setDespesas((prev) => (prev || []).filter((d) => d.id !== id));
  };

  const addTransacaoCaixa = (txData: Omit<TransacaoCaixa, 'id' | 'timestamp'>) => {
    const now = new Date();
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}:${String(
      now.getSeconds()
    ).padStart(2, '0')}`;

    const newTx: TransacaoCaixa = {
      ...txData,
      id: `tx_${Date.now()}`,
      timestamp: dateFormatted,
    };
    setTransacoes((prev) => [newTx, ...(prev || [])]);
  };

  const resetToInitialData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUserId('usr_1');
    setFeiras(INITIAL_FEIRAS);
    setFeirantes(INITIAL_FEIRANTES);
    setRegistros(INITIAL_REGISTROS);
    setDespesas(INITIAL_DESPESAS);
    setTransacoes(INITIAL_TRANSACOES);
    safeRemoveItem(STORAGE_KEYS.USERS);
    safeRemoveItem(STORAGE_KEYS.CURRENT_USER_ID);
    safeRemoveItem(STORAGE_KEYS.FEIRAS);
    safeRemoveItem(STORAGE_KEYS.FEIRANTES);
    safeRemoveItem(STORAGE_KEYS.REGISTROS);
    safeRemoveItem(STORAGE_KEYS.DESPESAS);
    safeRemoveItem(STORAGE_KEYS.TRANSACOES);
  };

  // Real-time computed metrics
  const totalFeiras = (feiras || []).length;

  const totalDinheiroLiq = useMemo(() => {
    const safeTxs = transacoes || [];
    const entradasDinheiro = safeTxs
      .filter((t) => t.tipo === 'entrada' && t.metodo === 'dinheiro')
      .reduce((acc, t) => acc + (t.valor || 0), 0);
    const saidasDinheiro = safeTxs
      .filter((t) => t.tipo === 'saida' && t.metodo === 'dinheiro')
      .reduce((acc, t) => acc + (t.valor || 0), 0);
    return entradasDinheiro - saidasDinheiro;
  }, [transacoes]);

  const totalPixLiq = useMemo(() => {
    const safeTxs = transacoes || [];
    const entradasPix = safeTxs
      .filter((t) => t.tipo === 'entrada' && t.metodo === 'pix')
      .reduce((acc, t) => acc + (t.valor || 0), 0);
    const saidasPix = safeTxs
      .filter((t) => t.tipo === 'saida' && t.metodo === 'pix')
      .reduce((acc, t) => acc + (t.valor || 0), 0);
    return entradasPix - saidasPix;
  }, [transacoes]);

  const saldoLiquidoGeral = useMemo(() => {
    return totalDinheiroLiq + totalPixLiq;
  }, [totalDinheiroLiq, totalPixLiq]);

  // List of all pendentes for collection
  const pendentesList = useMemo(() => {
    const list: PendenteItem[] = [];
    const safeRegistros = registros || [];
    const safeFeiras = feiras || [];
    const safeFeirantes = feirantes || [];

    safeRegistros.forEach((reg) => {
      if (reg.statusPagamento === 'pendente') {
        const feira = safeFeiras.find((f) => f.id === reg.feiraId);
        const feirante = safeFeirantes.find((f) => f.id === reg.feiranteId);

        if (feira && feirante) {
          list.push({
            id: `${feira.id}_${feirante.id}`,
            registroId: reg.id,
            feiraId: feira.id,
            dataFeira: feira.data,
            labelFeira: feira.label,
            feiranteId: feirante.id,
            nomeFeirante: feirante.nomeBarraca,
            responsavel: feirante.responsavel,
            contato: feirante.contato,
            presente: reg.presente,
            valorPendente: (reg.valorCobrado || 0) - (reg.valorPago || 0),
            observacao: reg.observacao,
            pixChave: feirante.pixChave,
          });
        }
      }
    });

    return list;
  }, [registros, feiras, feirantes]);

  const totalPendenteGeral = useMemo(() => {
    return pendentesList.reduce((acc, item) => acc + item.valorPendente, 0);
  }, [pendentesList]);

  return (
    <FeiraContext.Provider
      value={{
        isAuthenticated,
        login,
        loginAsCustomPerson,
        logout,
        activeTab,
        setActiveTab,
        users: users || INITIAL_USERS,
        currentUser,
        setCurrentUser,
        addUser,
        updateUser,
        toggleUserStatus,
        feiras: feiras || INITIAL_FEIRAS,
        addFeira,
        updateFeira,
        feirantes: feirantes || INITIAL_FEIRANTES,
        addFeirante,
        updateFeirante,
        deleteFeirante,
        registros: registros || INITIAL_REGISTROS,
        updateRegistroStatus,
        registrarPagamento,
        despesas: despesas || INITIAL_DESPESAS,
        addDespesa,
        deleteDespesa,
        transacoes: transacoes || INITIAL_TRANSACOES,
        addTransacaoCaixa,
        resetToInitialData,
        totalFeiras,
        totalDinheiroLiq,
        totalPixLiq,
        saldoLiquidoGeral,
        totalPendenteGeral,
        pendentesList,
      }}
    >
      {children}
    </FeiraContext.Provider>
  );
};

export const useFeira = () => {
  const context = useContext(FeiraContext);
  if (!context) {
    throw new Error('useFeira must be used within a FeiraProvider');
  }
  return context;
};
