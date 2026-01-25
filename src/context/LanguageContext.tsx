import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface Translations {
    [key: string]: {
        ar: string;
        en: string;
    };
}

const translations: Translations = {
    dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
    properties: { ar: 'العقارات', en: 'Properties' },
    units: { ar: 'الوحدات', en: 'Units' },
    tenants: { ar: 'المستأجرين', en: 'Tenants' },
    contracts: { ar: 'العقود', en: 'Contracts' },
    payments: { ar: 'المدفوعات', en: 'Payments' },
    maintenance: { ar: 'الصيانة', en: 'Maintenance' },
    reports: { ar: 'التقارير', en: 'Reports' },
    settings: { ar: 'الإعدادات', en: 'Settings' },
    search_placeholder: { ar: 'ابحث عن أي شيء...', en: 'Search anything...' },
    welcome: { ar: 'أهلاً بك في أركان', en: 'Welcome to Arkan' },
    logout: { ar: 'تسجيل الخروج', en: 'Logout' },
    // Add more as needed
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('arkan_language');
        return (saved as Language) || 'ar';
    });

    useEffect(() => {
        localStorage.setItem('arkan_language', language);
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    const t = (key: string) => {
        return translations[key]?.[language] || key;
    };

    const isRtl = language === 'ar';

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
