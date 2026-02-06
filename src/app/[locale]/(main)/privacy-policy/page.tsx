'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const faqs = [
	{
		question: 'What personal data do we collect during your loan application process?',
		answer:
			'We collect only the information you provide to assess your loan eligibility, such as income, employment status, loan preferences, and any additional details you submit. No unnecessary personal data is collected, and we do not track your browsing history or use cookies for marketing purposes.',
	},
	{
		question: 'How is your data used and processed?',
		answer:
			'Your data is used exclusively to generate counterfactual loan scenarios and eligibility calculations. We employ advanced algorithms to analyze your information securely. Your data is not used for marketing, shared with third parties, or sold to advertisers. We process your data in compliance with applicable data protection laws.',
	},
	{
		question: 'How long do we retain your data?',
		answer:
			'We store your data only as long as necessary to provide you with your loan eligibility results. Once your application process is complete, your data is securely deleted from our systems. We do not retain your information for longer than required by law or for any other purpose.',
	},
	{
		question: 'Can you request the deletion of your data?',
		answer:
			'Yes, you have the right to request the deletion of your data at any time. Please contact our support team, and we will promptly remove your information from our systems. We are committed to respecting your privacy and ensuring you have control over your personal data.',
	},
	{
		question: 'Is your data shared with any third parties?',
		answer:
			'No. Your data is never sold, shared, or disclosed to third parties. It is used exclusively for your loan application process within our platform. We maintain strict confidentiality and security measures to protect your information.',
	},
	{
		question: 'What are your rights regarding your data?',
		answer:
			'You have the right to access, correct, or delete your personal data. You can also request a copy of your data or object to its processing. For any inquiries or requests, please contact our support team, and we will assist you promptly.',
	},
];

const PrivacyPolicyPage = () => {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const handleToggle = (idx: number) => {
		setOpenIndex(openIndex === idx ? null : idx);
	};

	return (
		<div style={{ padding: '32px 0 0 0' }}>
			<h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '24px', textAlign: 'left' }}>
				Privacy Policy
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
				<div style={{ textAlign: 'center', marginBottom: '32px' }}>
					<strong>Effective Date: July 28, 2025</strong>
					<br />
					<strong>Last Updated: July 28, 2025</strong>
				</div>
				<p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '24px' }}>
					At Clear, we are committed to protecting your privacy and ensuring transparency in how we
					handle your personal information. This Privacy Policy outlines the types of data we
					collect, how it is used, and the rights you have over your information when using our
					interactive platform for visualizing counterfactual loan application scenarios.
				</p>
				<div
					style={{
						background: '#f3f4f6',
						borderRadius: '12px',
						padding: '32px',
						marginBottom: '40px',
					}}
				>
					<p style={{ fontSize: '1.05rem', color: '#333', marginBottom: '0' }}>
						We are committed to transparency and your privacy. You will always have the opportunity
						to review what data is collected and how it is used before proceeding. For any
						questions, please{' '}
						<Link href="/assistance" style={{ color: '#2856c2', textDecoration: 'underline' }}>
							contact us
						</Link>
						.
					</p>
				</div>

				{/* Detailed Privacy Policy Section */}
				<div style={{ marginBottom: '40px' }}>
					<p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '24px' }}>
						At Clear, we are committed to protecting your privacy and ensuring transparency in how
						we handle your personal information. This Privacy Policy outlines the types of data we
						collect, how it is used, and the rights you have over your information when using our
						interactive platform for visualizing counterfactual loan application scenarios.
					</p>

					<h2
						style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}
					>
						1. Who We Are
					</h2>
					<p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
						Clear is a human computation system developed by students of Ludwig-Maximilian
						University of Munich, designed to help users understand rejected loan applications using
						machine learning and interactive counterfactual explanations. This tool is intended for
						educational and prototype purposes only.
					</p>

					<h2
						style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}
					>
						2. What Data We Collect
					</h2>
					<p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '16px' }}>
						We may collect and process the following categories of data:
					</p>
					<ul
						style={{
							fontSize: '1.05rem',
							lineHeight: 1.6,
							marginBottom: '24px',
							paddingLeft: '24px',
						}}
					>
						<li style={{ marginBottom: '8px' }}>
							<strong>Personal Input Data:</strong> When using the tool, you may voluntarily input
							financial details such as income, credit score, employment status, loan amount, and
							savings.
						</li>
						<li style={{ marginBottom: '8px' }}>
							<strong>Interaction Data:</strong> We collect anonymous usage data such as which
							counterfactual scenarios you interact with, filter, or save, in order to improve the
							system&apos;s performance and relevance.
						</li>
						<li style={{ marginBottom: '8px' }}>
							<strong>Device Information:</strong> We may collect browser type, operating system,
							and screen resolution for analytical purposes.
						</li>
						<li style={{ marginBottom: '8px' }}>
							<strong>Cookies:</strong> Our site may use cookies to enhance user experience. You can
							disable cookies in your browser settings.
						</li>
					</ul>

					<h2
						style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}
					>
						3. How We Use Your Data
					</h2>
					<p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '16px' }}>
						All input and interaction data is used solely for the following purposes:
					</p>
					<ul
						style={{
							fontSize: '1.05rem',
							lineHeight: 1.6,
							marginBottom: '24px',
							paddingLeft: '24px',
						}}
					>
						<li style={{ marginBottom: '8px' }}>
							To provide personalized counterfactual explanations and interactive insights.
						</li>
						<li style={{ marginBottom: '8px' }}>
							To improve our system&apos;s responsiveness and adapt future recommendations to user
							needs.
						</li>
						<li style={{ marginBottom: '8px' }}>
							To evaluate and refine our educational prototype.
						</li>
					</ul>
					<p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
						We do not use the data for real loan approval decisions or share it with third parties.
					</p>

					<h2
						style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}
					>
						4. Data Storage and Security
					</h2>
					<p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
						Your data is processed in real-time and not permanently stored on our servers. All
						computations are carried out securely during your session. Any temporary data stored is
						automatically deleted after session termination.
						<br />
						<br />
						We implement standard technical and organizational measures to protect your data against
						unauthorized access, accidental loss, or unlawful processing.
					</p>

					<h2
						style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}
					>
						5. Your Rights
					</h2>
					<p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '16px' }}>
						As a user, you have the following rights under the GDPR and applicable data protection
						laws:
					</p>
					<ul
						style={{
							fontSize: '1.05rem',
							lineHeight: 1.6,
							marginBottom: '24px',
							paddingLeft: '24px',
						}}
					>
						<li style={{ marginBottom: '8px' }}>
							<strong>Right to Access:</strong> You can request information about what data we
							process.
						</li>
						<li style={{ marginBottom: '8px' }}>
							<strong>Right to Rectification:</strong> You can request correction of inaccurate or
							incomplete data.
						</li>
						<li style={{ marginBottom: '8px' }}>
							<strong>Right to Erasure:</strong> You can ask us to delete any personal data you have
							submitted.
						</li>
						<li style={{ marginBottom: '8px' }}>
							<strong>Right to Restriction:</strong> You may request limitation of processing under
							certain conditions.
						</li>
						<li style={{ marginBottom: '8px' }}>
							<strong>Right to Object:</strong> You can object to data processing in specific
							circumstances.
						</li>
					</ul>
					<p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
						To exercise these rights, contact us at:{' '}
						<Link
							href="mailto:clearinfo@gmail.com"
							style={{ color: '#2856c2', textDecoration: 'underline' }}
						>
							clearinfo@gmail.com
						</Link>
					</p>

					<h2
						style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}
					>
						6. Third-Party Services
					</h2>
					<p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
						Our website may include links to external services (e.g., Figma or Google Drive
						prototypes). These platforms have their own privacy policies, and we do not take
						responsibility for how they handle your data.
					</p>

					<h2
						style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}
					>
						7. Changes to This Policy
					</h2>
					<p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
						We may update this Privacy Policy as we further develop our tool. Updates will be posted
						on this page with a revised &quot;Last Updated&quot; date. We encourage you to review
						this policy periodically.
					</p>

					<h2
						style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}
					>
						8. Contact Information
					</h2>
					<p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
						If you have questions about this Privacy Policy or your data, feel free to reach out:
						<br />
						<br />
						Project: Clear — Visualizing Plural Counterfactuals for Loan Applications
						<br />
						Contact Person: All of Us
						<br />
						Email:{' '}
						<Link
							href="mailto:clearinfo@gmail.com"
							style={{ color: '#2856c2', textDecoration: 'underline' }}
						>
							clearinfo@gmail.com
						</Link>
					</p>
				</div>

				<h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '20px' }}>
					Frequently Asked Questions
				</h2>
				<div>
					{faqs.map((faq, idx) => (
						<div
							key={idx}
							style={{
								marginBottom: '16px',
								borderRadius: '8px',
								background: '#fafbfc',
								boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
							}}
						>
							<button
								onClick={() => handleToggle(idx)}
								style={{
									width: '100%',
									textAlign: 'left',
									background: 'none',
									border: 'none',
									padding: '18px 20px',
									fontSize: '1.1rem',
									fontWeight: 500,
									cursor: 'pointer',
									outline: 'none',
									color: '#222',
									borderBottom: openIndex === idx ? '1px solid #2856c2' : '1px solid #e0e0e0',
									borderRadius: openIndex === idx ? '8px 8px 0 0' : '8px',
								}}
								aria-expanded={openIndex === idx}
							>
								{faq.question}
							</button>
							{openIndex === idx && (
								<div
									style={{
										padding: '18px 20px',
										background: '#f7f8fa',
										borderRadius: '0 0 8px 8px',
										color: '#444',
									}}
								>
									{faq.answer}
								</div>
							)}
						</div>
					))}
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
				<h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Questions?</h3>
				<p style={{ fontSize: '1rem', color: '#555' }}>
					If you have questions about this Privacy Policy or your data, feel free to reach out:{' '}
					<Link
						href="mailto:clearinfo@gmail.com"
						style={{ color: '#2856c2', textDecoration: 'underline' }}
					>
						clearinfo@gmail.com
					</Link>
				</p>
			</div>
		</div>
	);
};

export default PrivacyPolicyPage;
