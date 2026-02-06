'use client';
import ChevronDown from './Icons/ChevronDown';
import { FC } from 'react';
import { flags } from './Flags';
import { Locale } from '@/dictionaries';
import { usePathname, useRouter } from 'next/navigation';

interface LanguagePickerProps {
	locale: Locale;
}

const languageNames: Record<Locale, string> = {
	en: 'English',
	de: 'Deutsch',
	tr: 'Türkçe',
};

const languageIndex = 1;

const LanguagePickerItem: FC<LanguagePickerProps> = ({ locale }) => {
	const Flag = flags[locale];
	const pathname = usePathname(); // e.g. "/en/your-application"
	const router = useRouter();

	const onClick = () => {
		const segments = pathname.split('/'); // ["", "en", "your-application"]

		if (segments.length > 1) {
			segments[languageIndex] = locale; // Replace the language segment
		}

		const newPath = segments.join('/');
		router.push(newPath);
	};

	return (
		<button
			className="z-1 flex w-[150px] flex-row items-center justify-between gap-[10px] rounded-sm px-[4px] py-[6px]"
			onClick={onClick}
		>
			<div className="flex cursor-pointer flex-row items-center gap-[19px]">
				<Flag className="rounded-sm" height={24} width={36} />
				<p className="font-semibold">{languageNames[locale]}</p>
			</div>
			<ChevronDown />
		</button>
	);
};

export default LanguagePickerItem;
