import Image from 'next/image';
import Link from 'next/link';
import logo from '@/public/assets/logo.png';
import { getTranslations } from 'next-intl/server';

const WelcomePage = async () => {
  // Localized texts
  const t = await getTranslations('welcome_page');

  return (
    <div className="flex grow flex-col text-center">
      <main className="flex grow flex-col items-center gap-[69px]">
        <Image src={logo} alt="CLEAR" />
        <section className="flex flex-col items-center gap-[24px]">
          <p className="text-3xl font-bold">{t('title')}</p>
          <p className="text-2xl font-semibold">{t('description')}</p>
        </section>
        <section className="flex flex-col items-center gap-[24px]">
          <Link className="button" href="your-application">
            {t('get_started_button')}
          </Link>
          <Link className="text-xl font-semibold" href="learn-more">
            {t('learn_more_button')}
          </Link>
        </section>
      </main>
      <footer className="mb-[24px] flex flex-row items-center justify-center gap-[8px] text-sm">
        <Link href="privacy-policy">{t('privacy_policy')}</Link>•
        <Link href="terms-of-use">{t('terms_of_use')}</Link>
      </footer>
    </div>
  );
};
export default WelcomePage;
