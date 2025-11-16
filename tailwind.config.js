// tailwind.config.js
module.exports = {
  plugins: [require("daisyui")], // Activation de DaisyUI
  daisyui: {
    themes: ["light", "dark", "lemonade"], // Liste des thèmes
    darkTheme: "lemonade", // Optionnel : active le dark mode via préférence OS
  },
};
