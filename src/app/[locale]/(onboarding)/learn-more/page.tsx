import Image from 'next/image';
import Link from 'next/link';
import logo from '@/public/assets/logo.png';
import { getTranslations } from 'next-intl/server';

const LearnMorePage = async () => {
  // Localized texts
  const t = await getTranslations('learn_more_page');

  return (
    <div className="flex flex-col items-center justify-center gap-[50px] p-[24px] text-center">
      <Image src={logo} width={182.4} alt="CLEAR" />
      <p className="text-3xl font-bold">{t('title')}</p>
      <section className="flex flex-col items-center gap-[8px] text-2xl font-semibold">
        <p>{t('description_1')}</p>
        <p>{t('description_2')}</p>
        <p>{t('description_3')}</p>
        <p>{t('description_4')}</p>
      </section>
      <Link className="button" href="/dashboard">
        {t('get_started_button')}
      </Link>
    </div>
  );
};

export default LearnMorePage;
