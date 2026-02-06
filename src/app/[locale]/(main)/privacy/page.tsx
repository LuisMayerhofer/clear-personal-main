import Image from 'next/image';
import dataPrivacyIllustration from '@/public/assets/DataPrivacyIllustration.jpg';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

const DataPrivacyPage = async () => {
	const t = await getTranslations('privacy_page');
	return (
		<div style={{ padding: '32px 0 0 0', flex: 1 }}>
			<h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '24px', textAlign: 'left' }}>
				{t('page_title')}
			</h1>
			<div
				style={{
					border: '1px solid #e0e0e0',
					borderBottom: 'none',
					borderRadius: '12px 12px 0 0',
					padding: '64px 48px 48px 48px',
					width: '100%',
					background: '#fff',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
					<div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
						<Image
							src={dataPrivacyIllustration}
							alt="Data Privacy"
							style={{ width: '340px', height: 'auto' }}
						/>
					</div>
					<div style={{ flex: 1, marginLeft: '20px' }}>
						<h2
							style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '24px', lineHeight: 1.2 }}
						>
							{t('privacy_title')}
						</h2>
						<p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '40px', lineHeight: 1.6 }}>
							{t('description')}
						</p>
					</div>
				</div>
			</div>
			<div
				style={{
					background: '#f6f7fb',
					padding: '48px',
					borderRadius: '0 0 9px 9px',
					width: '100%',
				}}
			>
				<h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
					{t('footer_title')}
				</h3>
				<p style={{ fontSize: '1rem', color: '#555' }}>
					{t.rich('footer_description', {
						a: (chunks) => (
							<Link
								href="/privacy-policy"
								style={{ color: '#2856c2', textDecoration: 'underline' }}
							>
								{chunks}
							</Link>
						),
					})}
				</p>
			</div>
		</div>
	);
};

export default DataPrivacyPage;
