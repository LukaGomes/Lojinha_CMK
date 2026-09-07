interface LogoProps {
  tamanho?: "sm" | "md" | "lg";
  comTexto?: boolean;
}

const TAMANHOS = {
  sm: { marca: "w-10 h-10", texto: "text-sm" },
  md: { marca: "w-14 h-14", texto: "text-lg" },
  lg: { marca: "w-24 h-24", texto: "text-2xl" },
};

// Marca da Comunidade Missão Kairós. O arquivo vive em
// /public/logo.png — pra trocar a imagem no futuro, basta substituir
// esse arquivo (mesmo nome) que ela atualiza em todo o app automaticamente.
export default function Logo({ tamanho = "md", comTexto = true }: LogoProps) {
  const { marca, texto } = TAMANHOS[tamanho];

  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Comunidade Missão Kairós"
        className={`${marca} rounded-lg object-cover shrink-0 ring-1 ring-neblina/20`}
      />
      {comTexto && (
        <span className={`font-display font-semibold text-creme leading-tight ${texto}`}>
          Lojinha do
          <br className="hidden sm:block" /> Grupo de Oração
        </span>
      )}
    </div>
  );
}
