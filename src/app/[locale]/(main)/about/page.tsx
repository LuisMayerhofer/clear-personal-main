import Image from 'next/image';
import aboutUsIllustration from '@/public/assets/AboutUsIllustration.jpg';
import { getTranslations } from 'next-intl/server';

const AboutClearPage = async () => {
  const t = await getTranslations('about_page');

  return (
    <div className="flex items-center gap-8">
      <Image src={aboutUsIllustration} alt="About Clear" />
      <div className="flex max-w-xl flex-col text-center">
        <h1 className="mb-4 text-3xl font-bold">{t('title')}</h1>
        <p className="align-semibold text-xl">
          {t('description_1')}
          <br />
          <br />
          {t('description_2')}
          <br />
          {t('description_3')}
        </p>
      </div>
    </div>
  );
};

export default AboutClearPage;
