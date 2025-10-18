// src/components/ui/LanguageSwitcher.tsx
import React, { useContext } from 'react';
import { Button } from "./button";
import { LanguageContext } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
    variant?: 'default' | 'outline' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    showText?: boolean;
    className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
    variant = 'ghost',
    size = 'sm',
    showText = true,
    className = ''
}) => {
    const { language, toggleLanguage } = useContext(LanguageContext);
    const { t } = useTranslation();

    return (
        <Button
            variant={variant}
            size={size}
            onClick={toggleLanguage}
            className={`flex items-center gap-1 ${className}`}
            title={t('common.language')}
        >
            <Globe className="h-4 w-4" />
            {showText && (
                <span>
                    {language === 'en' ? 'AR' : 'EN'}
                </span>
            )}
        </Button>
    );
};

export default LanguageSwitcher;
