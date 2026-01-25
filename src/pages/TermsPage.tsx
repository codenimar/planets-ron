import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <h1>📜 Terms of Service</h1>
        <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using RoninAds.com ("the Service"), you accept and agree to be bound by the terms
            and provision of this agreement. If you do not agree to these Terms of Service, please do not use
            the Service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            RoninAds is a decentralized advertising platform built on the Ronin Network that allows:
          </p>
          <ul>
            <li>Users to earn points by viewing advertisements</li>
            <li>Publishers with Publisher Pass NFTs to create and display advertisements</li>
            <li>Users to exchange earned points for rewards including NFTs and tokens</li>
          </ul>
        </section>

        <section>
          <h2>3. Wallet Connection and Authentication</h2>
          <p>
            To use the Service, you must connect a compatible Web3 wallet (Ronin Wallet or Metamask). You are
            responsible for maintaining the security of your wallet and private keys. RoninAds does not have
            access to your private keys and cannot recover lost wallets.
          </p>
        </section>

        <section>
          <h2>4. Points and Rewards System</h2>
          <ul>
            <li>Points are earned by viewing advertisements for the required duration (10 seconds)</li>
            <li>Each post can only be viewed once per 24-hour period per user</li>
            <li>Points have no monetary value and cannot be transferred between users</li>
            <li>Points can be exchanged for rewards subject to availability</li>
            <li>Reward claims are processed manually and may take up to 7 business days</li>
            <li>RoninAds reserves the right to modify point values and reward costs at any time</li>
          </ul>
        </section>

        <section>
          <h2>5. Publisher Guidelines</h2>
          <p>
            Publishers with valid Publisher Pass NFTs agree to:
          </p>
          <ul>
            <li>Not post content that is illegal, offensive, or violates others' rights</li>
            <li>Ensure all linked content is appropriate and safe</li>
            <li>Not engage in fraudulent or misleading advertising practices</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Accept that all posts are subject to review and approval</li>
          </ul>
          <p>
            RoninAds reserves the right to remove any content and revoke publisher privileges for violations.
          </p>
        </section>

        <section>
          <h2>6. NFT Passes</h2>
          <ul>
            <li><strong>Publisher Pass:</strong> Grants ability to create posts with duration and limits based on pass tier</li>
            <li><strong>Click Pass:</strong> Provides bonus points when viewing advertisements</li>
            <li>Pass benefits are verified through on-chain NFT ownership</li>
            <li>Passes are non-refundable once issued</li>
          </ul>
        </section>

        <section>
          <h2>7. Prohibited Activities</h2>
          <p>
            Users may not:
          </p>
          <ul>
            <li>Use bots, scripts, or automation to earn points</li>
            <li>Create multiple accounts to circumvent viewing limits</li>
            <li>Attempt to manipulate or exploit the points system</li>
            <li>Engage in any activity that could harm the platform or other users</li>
            <li>Reverse engineer or attempt to access restricted parts of the Service</li>
          </ul>
        </section>

        <section>
          <h2>8. Account Suspension and Termination</h2>
          <p>
            RoninAds reserves the right to suspend or terminate accounts that violate these terms or engage in
            suspicious activity. In case of termination, accumulated points and pending rewards may be forfeited.
          </p>
        </section>

        <section>
          <h2>9. Disclaimers</h2>
          <ul>
            <li>The Service is provided "as is" without warranties of any kind</li>
            <li>RoninAds does not guarantee the availability, accuracy, or reliability of the Service</li>
            <li>Users are responsible for evaluating all content and linked websites</li>
            <li>RoninAds is not responsible for losses due to smart contract bugs or blockchain issues</li>
          </ul>
        </section>

        <section>
          <h2>10. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, RoninAds and its operators shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2>11. Changes to Terms</h2>
          <p>
            RoninAds reserves the right to modify these Terms of Service at any time. Continued use of the
            Service after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2>12. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with applicable international laws
            regarding blockchain and digital assets.
          </p>
        </section>

        <section>
          <h2>13. Contact</h2>
          <p>
            For questions about these Terms of Service, please contact us at:
            <br />
            <a href="https://x.com/planetronin" target="_blank" rel="noopener noreferrer">
              @planetronin on X (Twitter)
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
