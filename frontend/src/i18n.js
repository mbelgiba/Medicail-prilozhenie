import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      "dashboard": "Главная",
      "appointments": "Запись к врачу",
      "map": "Карта клиник (GPS)",
      "medical_card": "Медицинская карта",
      "games": "Игры и развитие",
      "profile": "Профиль"
    }
  },
  kk: {
    translation: {
      "dashboard": "Басты бет",
      "appointments": "Дәрігерге жазылу",
      "map": "Емханалар картасы (GPS)",
      "medical_card": "Медициналық карта",
      "games": "Ойындар және даму",
      "profile": "Профиль"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ru",
    fallbackLng: "ru",
    interpolation: { escapeValue: false }
  });

export default i18n;