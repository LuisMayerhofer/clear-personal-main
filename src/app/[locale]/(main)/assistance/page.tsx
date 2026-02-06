import Image from 'next/image';
import getAssistanceIllustration from '@/public/assets/GetAssistanceIllustration.jpg';
import { getTranslations } from 'next-intl/server';

const GetAssistancePage = async () => {
	const t = await getTranslations('get_assistance_page');
	return (
		<div style={{ padding: '32px 0 0 32px' }}>
			<h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '24px' }}>{t('title')}</h1>
			<div
				style={{
					background: '#ffffff',
					borderRadius: '16px',
					padding: '48px',
					display: 'flex',
					alignItems: 'center',
					maxWidth: '1100px',
					minHeight: '500px',
				}}
			>
				<div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
					<Image
						src={getAssistanceIllustration}
						alt="Get Assistance"
						style={{ width: '340px', height: 'auto' }}
					/>
				</div>
				<form
					style={{
						flex: 1,
						marginLeft: '48px',
						background: '#fff',
						borderRadius: '12px',
						padding: '32px 32px 24px 32px',
						display: 'flex',
						flexDirection: 'column',
						gap: '18px',
						minWidth: '450px',
						maxWidth: '600px',
					}}
				>
					<label style={{ fontWeight: 500, fontSize: '1rem' }}>
						{t('name_label')}
						<input
							type="text"
							pattern="[A-Za-z\s\-]+"
							required
							title="Please enter only letters, spaces, or hyphens. No numbers or special characters."
							placeholder={t('name_placeholder')}
							style={{
								width: '100%',
								marginTop: '4px',
								marginBottom: '8px',
								padding: '8px 12px',
								borderRadius: '6px',
								border: '1px solid #d1d5db',
								fontSize: '1rem',
								background: '#f3f4f6',
							}}
						/>
					</label>
					<label style={{ fontWeight: 500, fontSize: '1rem' }}>
						{t('surname_label')}
						<input
							type="text"
							pattern="[A-Za-z\s\-]+"
							required
							title="Please enter only letters, spaces, or hyphens. No numbers or special characters."
							placeholder={t('surname_placeholder')}
							style={{
								width: '100%',
								marginTop: '4px',
								marginBottom: '8px',
								padding: '8px 12px',
								borderRadius: '6px',
								border: '1px solid #d1d5db',
								fontSize: '1rem',
								background: '#f3f4f6',
							}}
						/>
					</label>
					<label style={{ fontWeight: 500, fontSize: '1rem' }}>
						{t('email_label')}
						<input
							type="email"
							required
							placeholder={t('email_placeholder')}
							style={{
								width: '100%',
								marginTop: '4px',
								marginBottom: '8px',
								padding: '8px 12px',
								borderRadius: '6px',
								border: '1px solid #d1d5db',
								fontSize: '1rem',
								background: '#f3f4f6',
							}}
						/>
					</label>
					<label style={{ fontWeight: 500, fontSize: '1rem' }}>
						{t('message_label')}
						<textarea
							placeholder={t('message_placeholder')}
							required
							rows={3}
							style={{
								width: '100%',
								marginTop: '4px',
								marginBottom: '8px',
								padding: '8px 12px',
								borderRadius: '6px',
								border: '1px solid #d1d5db',
								fontSize: '1rem',
								background: '#f3f4f6',
								resize: 'vertical',
							}}
						/>
					</label>
					<button
						type="submit"
						style={{
							background: '#2856c2',
							color: '#fff',
							border: 'none',
							borderRadius: '8px',
							padding: '12px 0',
							fontSize: '1.1rem',
							fontWeight: 500,
							cursor: 'pointer',
							marginTop: '12px',
						}}
					>
						{t('submit_button_text')}
					</button>
				</form>
			</div>
		</div>
	);
};

export default GetAssistancePage;
