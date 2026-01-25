import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <h1>🔒 Privacy Policy</h1>
        <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            RoninAds ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, and safeguard information when you use our decentralized advertising platform.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Wallet Information</h3>
          <ul>
            <li>Wallet addresses (Ronin or Ethereum format)</li>
            <li>Wallet type (Ronin Wallet, Metamask, etc.)</li>
            <li>Transaction signatures for authentication</li>
          </ul>

          <h3>2.2 Usage Data</h3>
          <ul>
            <li>Posts viewed and timestamps</li>
            <li>Points earned and spent</li>
            <li>Reward claims and fulfillment status</li>
            <li>Login timestamps and session information</li>
          </ul>

          <h3>2.3 NFT Ownership Data</h3>
          <ul>
            <li>Publisher Pass and Click Pass NFT ownership verification</li>
            <li>NFT collection data from on-chain sources</li>
          </ul>

          <h3>2.4 Publisher Content</h3>
          <ul>
            <li>Post titles, descriptions, images, and links</li>
            <li>Post performance metrics (views, engagement)</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>
            We use the collected information for:
          </p>
          <ul>
            <li>Authenticating your wallet connection and maintaining your session</li>
            <li>Tracking points earned and managing the rewards system</li>
            <li>Verifying NFT ownership for pass benefits</li>
            <li>Displaying personalized content and preventing duplicate views</li>
            <li>Detecting and preventing fraudulent activity</li>
            <li>Improving our services and user experience</li>
            <li>Communicating important service updates</li>
          </ul>
        </section>

        <section>
          <h2>4. Information Sharing and Disclosure</h2>
          
          <h3>4.1 What We Don't Share</h3>
          <p>
            We do not sell, rent, or trade your personal information to third parties for marketing purposes.
          </p>

          <h3>4.2 Public Information</h3>
          <p>
            The following information is publicly visible on the platform:
          </p>
          <ul>
            <li>Wallet addresses (in truncated format on posts)</li>
            <li>Publisher posts and their performance metrics</li>
            <li>On-chain transaction data (inherently public on blockchain)</li>
          </ul>

          <h3>4.3 Service Providers</h3>
          <p>
            We may share information with trusted service providers who assist in:
          </p>
          <ul>
            <li>Hosting and infrastructure</li>
            <li>Analytics and performance monitoring</li>
            <li>NFT verification and blockchain data indexing</li>
          </ul>

          <h3>4.4 Legal Requirements</h3>
          <p>
            We may disclose information if required by law or to protect our rights and safety.
          </p>
        </section>

        <section>
          <h2>5. Data Storage and Security</h2>
          <ul>
            <li>We use industry-standard security measures to protect your data</li>
            <li>Wallet private keys are never stored on our servers</li>
            <li>Session data is stored securely with encryption</li>
            <li>Database access is restricted and monitored</li>
            <li>Regular security audits and updates are performed</li>
          </ul>
          <p>
            However, no method of transmission over the internet is 100% secure. While we strive to protect
            your information, we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>6. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to:
          </p>
          <ul>
            <li>Maintain your authentication session</li>
            <li>Remember your preferences</li>
            <li>Analyze usage patterns and improve the Service</li>
          </ul>
          <p>
            You can control cookies through your browser settings, but disabling cookies may affect
            functionality.
          </p>
        </section>

        <section>
          <h2>7. Blockchain and Smart Contracts</h2>
          <p>
            Please note that blockchain transactions are:
          </p>
          <ul>
            <li>Publicly visible and permanent</li>
            <li>Cannot be deleted or modified once confirmed</li>
            <li>May reveal patterns about your activity and holdings</li>
          </ul>
          <p>
            This is an inherent characteristic of blockchain technology and not controlled by RoninAds.
          </p>
        </section>

        <section>
          <h2>8. Third-Party Links</h2>
          <p>
            Our Service may contain links to third-party websites and advertisements. We are not responsible
            for the privacy practices or content of these external sites. Please review their privacy policies
            before providing any information.
          </p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            RoninAds is not intended for users under the age of 18. We do not knowingly collect personal
            information from children. If we become aware of such data, we will take steps to delete it.
          </p>
        </section>

        <section>
          <h2>10. Data Retention</h2>
          <p>
            We retain your information for as long as:
          </p>
          <ul>
            <li>Your account remains active</li>
            <li>Needed to provide services and fulfill transactions</li>
            <li>Required for legal or business purposes</li>
          </ul>
          <p>
            You may request account deletion by contacting us, though some data may be retained for legal
            compliance.
          </p>
        </section>

        <section>
          <h2>11. Your Rights</h2>
          <p>
            Depending on your jurisdiction, you may have the right to:
          </p>
          <ul>
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Export your data in a portable format</li>
          </ul>
          <p>
            To exercise these rights, please contact us through our official channels.
          </p>
        </section>

        <section>
          <h2>12. International Users</h2>
          <p>
            Our Service is accessible globally. By using RoninAds, you consent to the transfer and processing
            of your information in various jurisdictions where our servers and service providers operate.
          </p>
        </section>

        <section>
          <h2>13. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. The "Last Updated" date will reflect when
            changes were made. Continued use of the Service after changes constitutes acceptance of the updated
            policy.
          </p>
        </section>

        <section>
          <h2>14. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            <br />
            <a href="https://x.com/planetronin" target="_blank" rel="noopener noreferrer">
              @planetronin on X (Twitter)
            </a>
          </p>
        </section>

        <section>
          <h2>15. GDPR Compliance (EU Users)</h2>
          <p>
            For users in the European Union, we comply with GDPR requirements:
          </p>
          <ul>
            <li>Legal basis: Legitimate interest and user consent</li>
            <li>Data controller: RoninAds platform operators</li>
            <li>Right to lodge complaints with supervisory authorities</li>
            <li>Data protection officer contact available upon request</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
