import { useEffect } from 'react'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en/cleaner.json'
import id from './locales/id/cleaner.json'
import es from './locales/es/cleaner.json'
import fr from './locales/fr/cleaner.json'
import de from './locales/de/cleaner.json'
import ja from './locales/ja/cleaner.json'
import zhCN from './locales/zh-CN/cleaner.json'

const resources = {
  en: { translation: en },
  id: { translation: id },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  ja: { translation: ja },
  'zh-CN': { translation: zhCN },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
