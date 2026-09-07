/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta baseada na logo da Comunidade Missão Kairós
        carvao: {
          DEFAULT: "#211E1B", // fundo principal — escuro, quente
          elevado: "#2C2823", // superfície de cards, um tom acima do fundo
          claro: "#54565A", // texto secundário / cinza da logo
        },
        creme: "#F4EEE1", // texto principal sobre o fundo escuro
        dourado: {
          DEFAULT: "#DE9924", // sol da logo — cor de destaque principal
          escuro: "#B87D1B",
          claro: "#3A3122", // fundo suave pra badges/realces sobre o carvão
        },
        neblina: "#85868A", // cinza claro da logo — bordas e texto apagado
        erro: "#C1503A", // terracota quente — erros e ações destrutivas
        sucesso: "#6F8F5B", // verde-sálvia — pagamentos confirmados
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        sans: ["Work Sans", "sans-serif"],
      },
      keyframes: {
        "reveal": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        reveal: "reveal 0.5s ease-out",
      },
    },
  },
  plugins: [],
};
