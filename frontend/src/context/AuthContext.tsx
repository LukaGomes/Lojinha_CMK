import { createContext, useContext, useState, ReactNode } from "react";
import { api } from "../api/client";

interface Admin {
  id: string;
  nome: string;
  email: string;
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  logado: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CHAVE_STORAGE = "lojinha:token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(CHAVE_STORAGE)
  );

  async function entrar(email: string, senha: string) {
    const { data } = await api.post("/login", { email, senha });
    setAdmin(data.admin);
    setToken(data.token);
    localStorage.setItem(CHAVE_STORAGE, data.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
  }

  function sair() {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem(CHAVE_STORAGE);
    delete api.defaults.headers.common["Authorization"];
  }

  // Se já tinha um token salvo (de uma sessão anterior), reaplica ele nas
  // próximas requisições. Não validamos ele aqui — se estiver expirado,
  // a primeira chamada protegida vai dar 401 e o interceptor cuida disso.
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  return (
    <AuthContext.Provider value={{ admin, token, logado: !!token, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider");
  }
  return contexto;
}
