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
            how we collect, use, and safeguard information when you use our social engagement and rewards platform.
            We prioritize user privacy by storing all user data locally in your browser.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Wallet Information</h3>
          <ul>
            <li>Ronin wallet address for authentication and prize distribution</li>
            <li>Wallet signatures for login verification</li>
            <li>On-chain asset holdings for featured NFT/token bonus verification</li>
          </ul>

          <h3>2.2 X.com (Twitter) Information</h3>
          <ul>
            <li>X.com handle (username) for task verification and leaderboard display</li>
            <li>Public X.com profile data accessible through X.com's API</li>
            <li>Social task completion status (follows, likes, retweets)</li>
          </ul>
          <p>
            <strong>Important:</strong> We do not collect your X.com password or access your private messages.
            We only verify publicly visible social actions.
          </p>

          <h3>2.3 Usage and Activity Data</h3>
          <ul>
            <li>Points earned through social tasks and asset verification</li>
            <li>Social tasks completed (follow, like, retweet actions)</li>
            <li>Asset verification timestamps and cooldown periods</li>
            <li>Referral relationships and referral rewards earned</li>
            <li>Leaderboard rankings and weekly standings</li>
          </ul>

          <h3>2.4 Data We Do NOT Collect</h3>
          <ul>
            <li>Email addresses</li>
            <li>Real names or personal identification</li>
            <li>Phone numbers</li>
            <li>Physical addresses</li>
            <li>Payment information</li>
            <li>Private keys or seed phrases</li>
          </ul>
        </section>

        <section>
          <h2>3. How Data is Stored</h2>
          
          <h3>3.1 Local Browser Storage</h3>
          <p>
            <strong>All user data is stored locally in your browser's localStorage</strong>, including:
          </p>
          <ul>
            <li>Your connected wallet address</li>
            <li>Your X.com handle</li>
            <li>Points earned and task completion history</li>
            <li>Asset verification status and cooldown timers</li>
            <li>Referral codes and relationships</li>
          </ul>

          <h3>3.2 No Server-Side Storage</h3>
          <p>
            We do not store your personal data on our servers. The platform operates using client-side storage,
            meaning your data remains on your device. This provides you with maximum privacy and control over
            your information.
          </p>

          <h3>3.3 Data Persistence</h3>
          <p>
            Your data persists in your browser until you:
          </p>
          <ul>
            <li>Clear your browser's localStorage manually</li>
            <li>Clear your browser cache and site data</li>
            <li>Use browser privacy features (e.g., incognito mode)</li>
          </ul>
          <p>
            <strong>Note:</strong> Clearing localStorage will reset your points and task history. We cannot
            recover this data as it is not stored on our servers.
          </p>
        </section>

        <section>
          <h2>4. How We Use Your Information</h2>
          <p>
            The information we collect is used solely for:
          </p>
          <ul>
            <li>Authenticating your wallet connection and verifying your identity</li>
            <li>Linking your X.com handle to your wallet address (one-time setup)</li>
            <li>Verifying completion of social tasks on X.com</li>
            <li>Calculating and tracking points earned through social engagement</li>
            <li>Verifying ownership of featured NFTs and tokens for bonus points</li>
            <li>Managing asset verification cooldown periods (1-hour intervals)</li>
            <li>Tracking referral relationships and distributing referral rewards</li>
            <li>Displaying leaderboard rankings and weekly standings</li>
            <li>Conducting weekly prize draws and distributing prizes to winners</li>
            <li>Detecting and preventing fraudulent activity or system abuse</li>
          </ul>
        </section>

        <section>
          <h2>5. X.com Handle Usage</h2>
          <p>
            Your X.com handle is used exclusively for:
          </p>
          <ul>
            <li>Verifying that you have completed required social tasks (follows, likes, retweets)</li>
            <li>Displaying your username on leaderboards and public rankings</li>
            <li>Confirming task eligibility and preventing duplicate task completion</li>
          </ul>
          <p>
            We do not:
          </p>
          <ul>
            <li>Post to X.com on your behalf</li>
            <li>Access your private messages or direct messages</li>
            <li>Collect your X.com password or authentication credentials</li>
            <li>Monitor your X.com activity beyond the specific tasks required by RoninAds</li>
            <li>Share your X.com handle with third parties for marketing purposes</li>
          </ul>
        </section>

        <section>
          <h2>6. Wallet Address Usage</h2>
          <p>
            Your Ronin wallet address is used for:
          </p>
          <ul>
            <li>Authenticating your identity through wallet signature verification</li>
            <li>Verifying on-chain ownership of featured NFTs and tokens</li>
            <li>Distributing prizes to weekly prize draw winners</li>
            <li>Preventing multiple accounts and fraudulent activity</li>
          </ul>
          <p>
            Your wallet address may be displayed in truncated format on leaderboards. Full addresses are not
            publicly displayed.
          </p>
        </section>

        <section>
          <h2>7. Information Sharing</h2>
          
          <h3>7.1 No Third-Party Data Sharing</h3>
          <p>
            We do not sell, rent, trade, or share your personal information with third parties for marketing or
            advertising purposes.
          </p>

          <h3>7.2 Public Information</h3>
          <p>
            The following information is publicly visible on the platform:
          </p>
          <ul>
            <li>X.com handles on leaderboards and rankings</li>
            <li>Truncated wallet addresses (first 6 and last 4 characters)</li>
            <li>Points totals and leaderboard positions</li>
            <li>Referral codes (optional sharing by users)</li>
          </ul>

          <h3>7.3 Blockchain Data</h3>
          <p>
            Asset verification and prize distribution occur on the Ronin blockchain, which is public and
            transparent. On-chain transactions are permanently visible to anyone.
          </p>

          <h3>7.4 Legal Requirements</h3>
          <p>
            We may disclose information if required by law, court order, or government regulation, or to protect
            our rights, safety, and property.
          </p>
        </section>

        <section>
          <h2>8. Security Measures</h2>
          <ul>
            <li>All data is stored locally in your browser, reducing server-side security risks</li>
            <li>Wallet authentication uses cryptographic signatures, not passwords</li>
            <li>We never request or store your private keys or seed phrases</li>
            <li>X.com task verification uses read-only API access</li>
            <li>Asset verification queries public blockchain data only</li>
            <li>Platform communications occur over HTTPS encrypted connections</li>
          </ul>
          <p>
            <strong>Your Responsibilities:</strong>
          </p>
          <ul>
            <li>Keep your wallet private keys and seed phrases secure and confidential</li>
            <li>Use strong passwords for your X.com account</li>
            <li>Be cautious of phishing attempts impersonating RoninAds</li>
            <li>Verify you are on the official RoninAds.com domain</li>
            <li>Never share your private keys with anyone, including RoninAds support</li>
          </ul>
        </section>

        <section>
          <h2>9. Your Rights and Control</h2>
          
          <h3>9.1 Data Access</h3>
          <p>
            Since all your data is stored locally in your browser, you have complete access to it at any time
            through your browser's developer tools (localStorage inspector).
          </p>

          <h3>9.2 Data Deletion</h3>
          <p>
            You can delete your data at any time by:
          </p>
          <ul>
            <li>Clearing your browser's localStorage for RoninAds.com</li>
            <li>Clearing your browser cache and site data</li>
            <li>Using browser settings to remove specific site data</li>
          </ul>
          <p>
            <strong>Warning:</strong> Deleting your local data will permanently erase your points, task history,
            and referral data. This action cannot be undone.
          </p>

          <h3>9.3 Data Portability</h3>
          <p>
            You can export your data from localStorage at any time using browser developer tools. Your data is
            stored in JSON format and can be backed up or transferred.
          </p>

          <h3>9.4 Right to Disconnect</h3>
          <p>
            You can stop using RoninAds at any time by:
          </p>
          <ul>
            <li>Disconnecting your wallet from the platform</li>
            <li>Clearing your browser data</li>
            <li>Simply not accessing the platform</li>
          </ul>
        </section>

        <section>
          <h2>10. Cookies and Tracking</h2>
          <p>
            RoninAds uses minimal cookies and tracking:
          </p>
          <ul>
            <li>LocalStorage for user data persistence (points, tasks, X.com handle)</li>
            <li>Session storage for temporary authentication state</li>
            <li>No third-party advertising or tracking cookies</li>
            <li>No cross-site tracking or user profiling</li>
          </ul>
        </section>

        <section>
          <h2>11. Third-Party Services</h2>
          
          <h3>11.1 X.com (Twitter) Integration</h3>
          <p>
            RoninAds verifies social tasks using X.com's platform. Your X.com activity is subject to X.com's
            Privacy Policy and Terms of Service. We recommend reviewing X.com's policies.
          </p>

          <h3>11.2 Ronin Network</h3>
          <p>
            Asset verification and prize distribution occur on the Ronin blockchain. Blockchain data is public
            and permanent. We do not control blockchain data.
          </p>

          <h3>11.3 External Links</h3>
          <p>
            Social tasks may link to external X.com profiles and posts. We are not responsible for the privacy
            practices of external websites.
          </p>
        </section>

        <section>
          <h2>12. Children's Privacy</h2>
          <p>
            RoninAds is not intended for users under the age of 18. We do not knowingly collect information from
            children. If you believe a child has provided us with information, please contact us immediately, and
            we will take appropriate action.
          </p>
        </section>

        <section>
          <h2>13. Data Retention</h2>
          <p>
            Since data is stored locally in your browser:
          </p>
          <ul>
            <li>We retain no server-side copies of your personal data</li>
            <li>Data persists indefinitely in your browser until you clear it</li>
            <li>Leaderboard data may be cached temporarily for performance but does not constitute long-term storage</li>
            <li>Prize winner information may be retained for legal and tax compliance purposes</li>
          </ul>
        </section>

        <section>
          <h2>14. International Users</h2>
          <p>
            RoninAds is accessible globally. Since data is stored locally on your device, data transfer concerns
            are minimized. However, your interactions with the Ronin blockchain and X.com are subject to
            international data flows governed by those platforms.
          </p>
        </section>

        <section>
          <h2>15. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal
            requirements. The "Last Updated" date at the top will reflect the most recent changes. We will
            notify users of material changes through:
          </p>
          <ul>
            <li>Platform notifications</li>
            <li>Announcements on our official X.com account (@planetronin)</li>
            <li>Prominent notices on the RoninAds website</li>
          </ul>
          <p>
            Continued use of the Service after changes constitutes acceptance of the updated Privacy Policy.
          </p>
        </section>

        <section>
          <h2>16. GDPR Compliance (EU Users)</h2>
          <p>
            For users in the European Union:
          </p>
          <ul>
            <li><strong>Legal Basis:</strong> Consent (by using the Service) and legitimate interest (fraud prevention)</li>
            <li><strong>Data Controller:</strong> RoninAds platform operators</li>
            <li><strong>Data Processing:</strong> Minimal server-side processing; most data stored client-side</li>
            <li><strong>Your Rights:</strong> Access, rectification, erasure, restriction, portability, objection</li>
            <li><strong>Right to Withdraw Consent:</strong> Stop using the Service and clear your browser data</li>
            <li><strong>Right to Lodge Complaints:</strong> Contact your local data protection authority</li>
          </ul>
        </section>

        <section>
          <h2>17. California Privacy Rights (CCPA)</h2>
          <p>
            For California residents:
          </p>
          <ul>
            <li><strong>Right to Know:</strong> You have the right to know what data we collect (see Section 2)</li>
            <li><strong>Right to Delete:</strong> Clear your browser localStorage to delete all personal data</li>
            <li><strong>Right to Opt-Out:</strong> We do not sell personal information</li>
            <li><strong>Non-Discrimination:</strong> We do not discriminate against users who exercise privacy rights</li>
          </ul>
        </section>

        <section>
          <h2>18. Contact Information</h2>
          <p>
            If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
            please contact us:
          </p>
          <ul>
            <li>
              <strong>X.com (Twitter):</strong>{' '}
              <a href="https://x.com/planetronin" target="_blank" rel="noopener noreferrer">
                @planetronin
              </a>
            </li>
            <li><strong>Website:</strong> RoninAds.com</li>
          </ul>
          <p>
            We will respond to privacy inquiries within a reasonable timeframe, typically within 30 days.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
