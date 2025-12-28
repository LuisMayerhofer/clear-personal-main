'use client';
import NavBarItem from './NavBarItem';
import { icons } from './Icons';
import { getDictionary } from '@/dictionaries';
import { FC } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import DashboardFiltersFrame from './DashboardFiltersFrame';

interface NavItem {
  id: keyof Awaited<ReturnType<typeof getDictionary>>['side_bar'];
  href: string;
  icon: keyof typeof icons;
}
const navItems: NavItem[] = [
  {
    id: 'dashboard',
    href: '/dashboard',
    icon: 'barGroup',
  },
  {
    id: 'your_application',
    href: '/your-application',
    icon: 'perspective',
  },
  {
    id: 'saved_scenarios',
    href: '/saved-scenarios',
    icon: 'heart',
  },
  {
    id: 'get_assistance',
    href: '/assistance',
    icon: 'messageText',
  },
  {
    id: 'data_privacy',
    href: '/privacy',
    icon: 'shieldCheck',
  },
  {
    id: 'about_clear',
    href: '/about',
    icon: 'userProfileGroup',
  },
];

const NavBar: FC = () => {
  const navBarTexts = useTranslations('side_bar');
  const pathname = usePathname();
  const renderNavigation = () => {
    return (
      <ul>
        {navItems.map(({ id, href, icon }) => (
          <li key={id}>
            <NavBarItem href={href} label={navBarTexts(id)} icon={icon} />
          </li>
        ))}
      </ul>
    );
  };

  const renderDashboardFilters = () => {
    const segments = pathname.split('/'); // ["", "en", "dashboard"]

    if (!segments.includes('dashboard')) return null;

    return <DashboardFiltersFrame />;
  };

  return (
    <nav className="align-center my-[24px] h-full flex-col rounded-r-2xl bg-white p-[16px] drop-shadow-md">
      {renderNavigation()}
      {renderDashboardFilters()}
    </nav>
  );
};

export default NavBar;
