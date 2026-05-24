import React, { createContext, useContext, useMemo, useState } from "react";
import en from "@/i18n/en.json";
import pl from "@/i18n/pl.json";

export type Language = "en" | "pl";

const dictionaries = {
  en: en as Record<string, string>,
  pl: pl as Record<string, string>
} as const satisfies Record<Language, Record<string, string>>;

function interpolate(template: string, vars?: Record<string, string>) {
  if (!vars) return template;
  return template.replaceAll(/\{(\w+)\}/g, (_m, key: string) => vars[key] ?? `{${key}}`);
}

type I18nValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

const STORAGE_KEY = "mytutor.lang";

function initialLang(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "pl") return stored;
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith("pl")) return "pl";
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => initialLang());

  const setLang = (next: Language) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const value: I18nValue = useMemo(() => {
    const dict = dictionaries[lang];
    return {
      lang,
      setLang,
      t: (key, vars) => interpolate(dict[key] ?? key, vars)
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export const supportedLanguages: ReadonlyArray<Language> = ["en", "pl"];

