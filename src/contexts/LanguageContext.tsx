import React, { createContext, useContext, useState, useEffect } from 'react';
import { ownerTranslations, TranslationKey } from '../modules/owner/i18n/owner.translations';

export type Language = 'ar' | 'en';

interface LanguageContextType {
    lang: Language;
    toggleLanguage: () => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Language>(() => {
        return (localStorage.getItem('owner_lang') as Language) || 'ar';
    });

    useEffect(() => {
        localStorage.setItem('owner_lang', lang);
        const dir = lang === 'ar' ? 'rtl' : 'ltr';
        
        // Apply direction to the document element globally
        document.documentElement.dir = dir;
        
        // Handle font classes
        if (lang === 'ar') {
            document.documentElement.classList.add('font-ar');
            document.documentElement.classList.remove('font-sans');
        } else {
            document.documentElement.classList.add('font-sans');
            document.documentElement.classList.remove('font-ar');
        }
    }, [lang]);

    const toggleLanguage = () => {
        setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
    };

    // Lightweight translation function
    const t = (key: TranslationKey): string => {
        const entry = ownerTranslations[key];
        if (!entry) return key;
        return entry[lang];
    };

    return (
        <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
