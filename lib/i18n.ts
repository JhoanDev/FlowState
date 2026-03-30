import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en";
import ptBR from "@/locales/pt-BR";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      "pt-BR": { translation: ptBR },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React handles XSS escaping
    },
    // Disable suspense so components never block render
    react: {
      useSuspense: false,
    },
  });

export default i18n;
