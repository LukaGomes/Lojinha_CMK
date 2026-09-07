import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333",
});

// Se o token expirar ou for inválido, o backend responde 401 — nesse caso
// limpamos a sessão salva, pra próxima tela mandar a pessoa logar de novo.
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro.response?.status === 401) {
      localStorage.removeItem("lojinha:token");
      delete api.defaults.headers.common["Authorization"];
    }
    return Promise.reject(erro);
  }
);

// -------- Tipos --------

export interface Pessoa {
  id: string;
  nome: string;
  telefone: string | null;
}

export interface Produto {
  id: string;
  nome: string;
  preco: string;
  ativo: boolean;
  controlaQuantidade: boolean;
}

export interface Lote {
  id: string;
  produto: string;
  quantidadeDisponivel: number;
  quantidadeVendida: number;
  quantidadeRestante: number;
}

export interface ItemCarrinho {
  produtoId?: string;
  descricaoAvulso?: string;
  valor?: number;
  quantidade: number;
  loteId?: string;
  // só usado no front, pra exibir na tela de confirmação
  nomeExibicao: string;
  precoUnitario: number;
}

export interface Fechamento {
  id: string;
  tipo: "MENSAL" | "EVENTO";
  titulo: string;
  dataInicio: string;
  dataFim: string | null;
  status: "ABERTO" | "FECHADO";
}

export interface ItemRelatorio {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface DiaRelatorio {
  data: string;
  subtotal: number;
  itens: ItemRelatorio[];
}

export interface PessoaRelatorio {
  pessoaId: string;
  nome: string;
  telefone: string | null;
  valorTotal: number;
  dias: DiaRelatorio[];
}

export interface RelatorioFechamento {
  fechamento: Fechamento;
  pessoas: PessoaRelatorio[];
}

export interface Pagamento {
  id: string;
  pessoaId: string;
  fechamentoId: string;
  valorTotal: string;
  pago: boolean;
  dataPagamento: string | null;
  pessoa: Pessoa;
}

// -------- Chamadas --------

export async function buscarPessoas(nome?: string) {
  const { data } = await api.get<Pessoa[]>("/pessoas", {
    params: nome ? { nome } : undefined,
  });
  return data;
}

export async function criarPessoa(nome: string, telefone?: string) {
  const { data } = await api.post<Pessoa>("/pessoas", { nome, telefone });
  return data;
}

export async function listarProdutos(todos?: boolean) {
  const { data } = await api.get<Produto[]>("/produtos", {
    params: todos ? { todos: "true" } : undefined,
  });
  return data;
}

export async function criarProduto(nome: string, preco: number) {
  const { data } = await api.post<Produto>("/produtos", {
    nome,
    preco,
    controlaQuantidade: false,
  });
  return data;
}

export async function editarProduto(id: string, dados: { nome?: string; preco?: number }) {
  const { data } = await api.patch<Produto>(`/produtos/${id}`, dados);
  return data;
}

export async function desativarProduto(id: string) {
  const { data } = await api.patch<Produto>(`/produtos/${id}/desativar`);
  return data;
}

export async function reativarProduto(id: string) {
  const { data } = await api.patch<Produto>(`/produtos/${id}/reativar`);
  return data;
}

export async function listarLotes(fechamentoId?: string) {
  const { data } = await api.get<Lote[]>("/lotes", {
    params: fechamentoId ? { fechamentoId } : undefined,
  });
  return data;
}

export async function criarLancamento(
  pessoaId: string,
  itens: {
    produtoId?: string;
    descricaoAvulso?: string;
    valor?: number;
    quantidade: number;
    loteId?: string;
  }[]
) {
  const { data } = await api.post("/lancamentos", { pessoaId, itens });
  return data;
}

export async function listarFechamentos() {
  const { data } = await api.get<Fechamento[]>("/fechamentos");
  return data;
}

export async function buscarRelatorioFechamento(id: string) {
  const { data } = await api.get<RelatorioFechamento>(`/fechamentos/${id}/relatorio`);
  return data;
}

export async function fecharFechamento(id: string) {
  const { data } = await api.patch<RelatorioFechamento>(`/fechamentos/${id}/fechar`);
  return data;
}

export async function criarFechamentoEvento(titulo: string) {
  const { data } = await api.post<Fechamento>("/fechamentos/evento", { titulo });
  return data;
}

export async function listarPagamentos(fechamentoId: string) {
  const { data } = await api.get<Pagamento[]>(`/fechamentos/${fechamentoId}/pagamentos`);
  return data;
}

export async function marcarComoPago(pagamentoId: string) {
  const { data } = await api.patch<Pagamento>(`/pagamentos/${pagamentoId}/pagar`);
  return data;
}

export async function desmarcarComoPago(pagamentoId: string) {
  const { data } = await api.patch<Pagamento>(`/pagamentos/${pagamentoId}/desfazer-pagamento`);
  return data;
}
