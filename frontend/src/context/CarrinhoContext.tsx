import { createContext, useContext, useState, ReactNode } from "react";
import { Pessoa, ItemCarrinho } from "../api/client";

interface CarrinhoContextType {
  pessoa: Pessoa | null;
  setPessoa: (pessoa: Pessoa | null) => void;
  itens: ItemCarrinho[];
  adicionarItem: (item: ItemCarrinho) => void;
  removerItem: (index: number) => void;
  aumentarQuantidade: (index: number) => void;
  diminuirQuantidade: (index: number) => void;
  limparCarrinho: () => void;
  total: number;
}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined);

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [pessoa, setPessoaState] = useState<Pessoa | null>(null);
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  function setPessoa(novaPessoa: Pessoa | null) {
    setPessoaState(novaPessoa);
    setItens([]); // troca de pessoa sempre começa um carrinho novo
  }

  // Se já existe um item do MESMO produto no carrinho, só soma a
  // quantidade em vez de criar uma linha nova. Itens avulsos (sem
  // produtoId) nunca são unidos, porque a descrição/valor pode variar
  // a cada doação, mesmo com nomes parecidos.
  function adicionarItem(item: ItemCarrinho) {
    setItens((atual) => {
      if (item.produtoId) {
        const indexExistente = atual.findIndex((i) => i.produtoId === item.produtoId);

        if (indexExistente !== -1) {
          const copia = [...atual];
          copia[indexExistente] = {
            ...copia[indexExistente],
            quantidade: copia[indexExistente].quantidade + item.quantidade,
          };
          return copia;
        }
      }

      return [...atual, item];
    });
  }

  function removerItem(index: number) {
    setItens((atual) => atual.filter((_, i) => i !== index));
  }

  function aumentarQuantidade(index: number) {
    setItens((atual) =>
      atual.map((item, i) =>
        i === index ? { ...item, quantidade: item.quantidade + 1 } : item
      )
    );
  }

  // Se chegar a 1 e diminuir de novo, remove o item da lista.
  function diminuirQuantidade(index: number) {
    setItens((atual) => {
      const item = atual[index];
      if (item.quantidade <= 1) {
        return atual.filter((_, i) => i !== index);
      }
      return atual.map((it, i) =>
        i === index ? { ...it, quantidade: it.quantidade - 1 } : it
      );
    });
  }

  function limparCarrinho() {
    setPessoaState(null);
    setItens([]);
  }

  const total = itens.reduce(
    (soma, item) => soma + item.precoUnitario * item.quantidade,
    0
  );

  return (
    <CarrinhoContext.Provider
      value={{
        pessoa,
        setPessoa,
        itens,
        adicionarItem,
        removerItem,
        aumentarQuantidade,
        diminuirQuantidade,
        limparCarrinho,
        total,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const contexto = useContext(CarrinhoContext);
  if (!contexto) {
    throw new Error("useCarrinho precisa ser usado dentro de um CarrinhoProvider");
  }
  return contexto;
}
