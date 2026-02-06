'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';
import { icons } from './Icons';

interface NavBarItemProps {
	label: string;
	icon: keyof typeof icons;
	href: string;
	disabled?: boolean;
}

const NavBarItem: FC<NavBarItemProps> = ({ label, icon, href, disabled }) => {
	const pathname = usePathname();
	const isActive = pathname.includes(href);

	const Icon = icons[icon];

	const getIconColor = () => {
		if (isActive) return '#fff';
		if (disabled) return '#B0B0B0';
		return undefined;
	};

	const content = (
		<div
			className={`flex min-w-[190px] items-center gap-[14px] rounded-md px-[18px] py-[12px] font-semibold ${isActive ? 'bg-button-background text-button-text' : ''} ${disabled ? 'cursor-not-allowed opacity-40 grayscale' : 'cursor-pointer'}`}
		>
			<Icon color={getIconColor()} />
			<p>{label}</p>
		</div>
	);

	if (disabled) return content;

	return (
		<Link href={`..${href}`} passHref>
			{content}
		</Link>
	);
};

export default NavBarItem;
