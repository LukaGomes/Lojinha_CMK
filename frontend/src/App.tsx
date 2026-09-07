import { Routes, Route, Navigate } from "react-router-dom";
import { CarrinhoProvider } from "./context/CarrinhoContext";
import { AuthProvider } from "./context/AuthContext";
import RotaProtegida from "./components/RotaProtegida";
import LayoutPublico from "./components/LayoutPublico";
import SelecionarPessoa from "./pages/SelecionarPessoa";
import SelecionarProdutos from "./pages/SelecionarProdutos";
import ConfirmarCarrinho from "./pages/ConfirmarCarrinho";
import Login from "./pages/Login";
import AreaAdmin from "./pages/AreaAdmin";
import Produtos from "./pages/Produtos";
import Fechamentos from "./pages/Fechamentos";
import DetalheFechamento from "./pages/DetalheFechamento";

export default function App() {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/lancamento/pessoa" replace />} />

          {/* Fluxo de lançamento — aberto, sem login */}
          <Route element={<LayoutPublico />}>
            <Route path="/lancamento/pessoa" element={<SelecionarPessoa />} />
            <Route path="/lancamento/produtos" element={<SelecionarProdutos />} />
            <Route path="/lancamento/confirmar" element={<ConfirmarCarrinho />} />
          </Route>

          {/* Área do admin — exige login */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <RotaProtegida>
                <AreaAdmin />
              </RotaProtegida>
            }
          />
          <Route
            path="/admin/produtos"
            element={
              <RotaProtegida>
                <Produtos />
              </RotaProtegida>
            }
          />
          <Route
            path="/admin/fechamentos"
            element={
              <RotaProtegida>
                <Fechamentos />
              </RotaProtegida>
            }
          />
          <Route
            path="/admin/fechamentos/:id"
            element={
              <RotaProtegida>
                <DetalheFechamento />
              </RotaProtegida>
            }
          />
        </Routes>
      </CarrinhoProvider>
    </AuthProvider>
  );
}
