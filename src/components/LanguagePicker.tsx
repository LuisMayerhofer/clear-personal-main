'use client';
import { FC, useState } from 'react';
import { Locale } from '@/dictionaries';
import LanguagePickerItem from './LanguagePickerItem';
import { useLocale } from 'next-intl';

const languages: Locale[] = ['en', 'de', 'tr'];

const LanguagePicker: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale() as Locale;

  const openDropdown = () => {
    setIsOpen(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const pickerItems = languages
    .filter((language) => language != locale)
    .map((language: Locale) => {
      return (
        <li key={`picker-${language}`}>
          <LanguagePickerItem locale={language} />
        </li>
      );
    });

  return (
    <div className="z-1" onMouseEnter={openDropdown} onMouseLeave={closeDropdown}>
      <LanguagePickerItem locale={locale} />

      {isOpen && (
        <div className="absolute gap-[19px] rounded-sm shadow-lg">
          <ul role="menu" aria-orientation="vertical" aria-labelledby="language-menu">
            {...pickerItems}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguagePicker;
