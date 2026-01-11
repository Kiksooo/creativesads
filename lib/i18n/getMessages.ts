import type { Locale } from './messages';
import enMessages from './messages/en.json';
import ruMessages from './messages/ru.json';
import esMessages from './messages/es.json';

const messages: Record<Locale, Record<string, string>> = {
  en: enMessages,
  ru: ruMessages,
  es: esMessages,
};

export function getMessages(locale: Locale): Record<string, string> {
  return messages[locale] || messages.en;
}
