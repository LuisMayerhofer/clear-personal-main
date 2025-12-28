import Link from 'next/link';

const TermsOfUsePage = () => {
  return (
    <div style={{ padding: '32px 0px 0 0px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '24px' }}>Terms of Use</h1>
      <div
        style={{
          border: '1px solid #e0e0e0',
          borderBottom: 'none',
          borderRadius: '12px 12px 0 0',
          padding: '64px 48px 48px 48px',
          width: '100%',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <strong>Effective Date: July 28, 2025</strong>
          <br />
          <strong>Last Updated: July 28, 2025</strong>
        </div>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '32px' }}>
          Welcome to Clear, a prototype platform developed by students at Ludwig-Maximilian
          University of Munich. Clear is designed to help users better understand rejected loan
          applications through machine learning–generated plural counterfactual explanations. By
          using this platform, you agree to the following terms and conditions.
        </p>

        <h2
          style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}
        >
          1. Purpose of the Platform
        </h2>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
          Clear is an educational and research-oriented prototype intended for demonstration
          purposes only. It is not a real loan application service, nor does it provide professional
          financial advice or official credit assessments.
        </p>

        <h2
          style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}
        >
          2. Acceptable Use
        </h2>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '16px' }}>
          By accessing or using Clear, you agree to:
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
            Use the platform only for non-commercial, educational, or personal exploration purposes.
          </li>
          <li style={{ marginBottom: '8px' }}>
            Provide fictional or anonymized data when interacting with the platform.
          </li>
          <li style={{ marginBottom: '8px' }}>
            Refrain from attempting to misuse, reverse-engineer, or disrupt the platform&apos;s
            services or underlying systems.
          </li>
        </ul>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
          You acknowledge that any data input is treated as non-sensitive and temporary; do not
          enter actual personal financial or identifying information.
        </p>

        <h2
          style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}
        >
          3. No Financial or Legal Advice
        </h2>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
          Clear does not offer financial, legal, or credit-related recommendations. The tool uses
          simulated machine learning models trained on example datasets. Any suggestions or
          counterfactual scenarios shown are hypothetical and do not guarantee real-world results.
          <br />
          <br />
          All users are encouraged to consult with certified financial or legal advisors for actual
          loan or credit decisions.
        </p>

        <h2
          style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}
        >
          4. Intellectual Property
        </h2>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
          All text, visual designs, and interactive components of Clear are the intellectual
          property of the student team unless otherwise credited. You may not copy, redistribute, or
          use the content or design of this site for commercial purposes without permission.
        </p>

        <h2
          style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}
        >
          5. Disclaimer of Warranty
        </h2>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
          The platform is provided &quot;as is&quot; without any warranties of any kind. We do not
          guarantee that the platform will be error-free or always available. The accuracy and
          usefulness of the results are dependent on the quality of input data and the limitations
          of the underlying models.
        </p>

        <h2
          style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}
        >
          6. Limitation of Liability
        </h2>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
          To the fullest extent permitted by law, the creators of Clear disclaim any liability for
          damages arising from your use of the platform. This includes, but is not limited to, lost
          profits, data loss, or decisions made based on the tool&apos;s output.
        </p>

        <h2
          style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}
        >
          7. Modifications to the Terms
        </h2>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
          These Terms of Use may be updated or revised as the project evolves. The latest version
          will always be posted on this page with an updated effective date. Continued use of the
          platform indicates your acceptance of any changes.
        </p>

        <h2
          style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}
        >
          8. Contact Information
        </h2>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
          If you have any questions about these Terms or how Clear operates, please contact us at:
          <br />
          <br />
          Project Team: Insight Job
          <br />
          Ludwig-Maximilian University of Munich
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
      <div
        style={{
          background: '#f6f7fb',
          padding: '48px',
          borderRadius: '0 0 9px 9px',
          width: '100%',
        }}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
          Need more information?
        </h3>
        <p style={{ fontSize: '1rem', color: '#555' }}>
          For any questions about these terms or how we handle your data, please don&apos;t hesitate
          to contact us.
        </p>
      </div>
    </div>
  );
};

export default TermsOfUsePage;
