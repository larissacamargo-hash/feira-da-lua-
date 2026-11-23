export type PaymentStatus = 
  | 'pago_pix' 
  | 'pago_dinheiro' 
  | 'pago_lincon' 
  | 'pendente' 
  | 'cancelado' 
  | 'atestado';

export type UserRole = 'admin' | 'operador' | 'visualizador';

export interface UserAccount {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  cargo: string;
  ativo: boolean;
  avatarColor: string;
  ultimoAcesso: string;
}

export interface Feirante {
  id: string;
  nomeBarraca: string;
  responsavel: string;
  contato: string;
  categoria: 'Alimentação' | 'Doces' | 'Bebidas' | 'Artesanato' | 'Lazer' | 'Outros';
  taxaPadrao: number;
  ponto: string;
  ativo: boolean;
  pixChave?: string;
  observacoes?: string;
}

export interface FeiraDate {
  id: string;
  data: string; // e.g. "15/10/2026"
  label: string; // e.g. "15/10"
  statusFeira: 'aberta' | 'concluida' | 'cancelada';
  observacao?: string;
}

export interface RegistroPresenca {
  id: string;
  feiraId: string;
  feiranteId: string;
  presente: boolean;
  statusPagamento: PaymentStatus;
  valorCobrado: number;
  valorPago: number;
  metodoPagamento?: 'pix' | 'dinheiro' | 'misto';
  dataPagamento?: string;
  recebidoPor?: string;
  comprovante?: string;
  observacao?: string;
}

export interface DespesaFeira {
  id: string;
  feiraId: string;
  descricao: string;
  valor: number;
  categoria: 'Limpeza' | 'Segurança' | 'Energia' | 'Banheiros' | 'Taxa Prefeitura' | 'Outros';
  data: string;
  pagoPor: string;
}

export interface TransacaoCaixa {
  id: string;
  tipo: 'entrada' | 'saida';
  metodo: 'dinheiro' | 'pix';
  valor: number;
  descricao: string;
  feiraId: string;
  feiranteNome?: string;
  operador: string;
  timestamp: string;
}
