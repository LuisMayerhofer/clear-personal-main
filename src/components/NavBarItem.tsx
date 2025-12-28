'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';
import { icons } from './Icons';

interface NavBarItemProps {
  label: string;
  icon: keyof typeof icons;
  href: string;
}

const NavBarItem: FC<NavBarItemProps> = ({ label, icon, href }) => {
  const pathname = usePathname();
  const isActive = pathname.includes(href);

  const activeClassName = 'bg-button-background text-button-text';
  const Icon = icons[icon];
  return (
    <Link href={`..${href}`} passHref>
      <div
        className={`flex min-w-[190px] items-center gap-[14px] rounded-md px-[18px] py-[12px] font-semibold ${isActive ? activeClassName : ''}`}
      >
        <Icon color={isActive ? '#fff' : undefined} />
        <p>{label}</p>
      </div>
    </Link>
  );
};

export default NavBarItem;
