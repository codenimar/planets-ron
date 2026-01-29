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
            and provisions of this agreement. If you do not agree to these Terms of Service, please do not use
            the Service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            RoninAds is a social engagement and rewards platform built on the Ronin Network that allows users to:
          </p>
          <ul>
            <li>Connect with their Ronin wallet and X.com (Twitter) account</li>
            <li>Earn points by completing social tasks on X.com (following accounts, liking posts, retweeting content)</li>
            <li>Verify ownership of featured NFTs and tokens for bonus points</li>
            <li>Participate in weekly prize draws based on point accumulation</li>
            <li>Earn referral rewards when their referrals complete social tasks</li>
          </ul>
        </section>

        <section>
          <h2>3. User Eligibility</h2>
          <p>
            To use the Service, you must:
          </p>
          <ul>
            <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
            <li>Have a valid Ronin wallet with the ability to sign messages</li>
            <li>Have an active X.com (Twitter) account in good standing</li>
            <li>Comply with X.com's Terms of Service and Community Guidelines</li>
            <li>Not be located in a jurisdiction where the Service is prohibited by law</li>
          </ul>
        </section>

        <section>
          <h2>4. Points System</h2>
          
          <h3>4.1 Earning Points</h3>
          <p>
            Users earn points by completing social engagement tasks on X.com:
          </p>
          <ul>
            <li><strong>Standard Actions:</strong> 1 point per completed action (follow, like, retweet)</li>
            <li><strong>Featured Asset Bonus:</strong> 2 points per action when holding verified featured NFTs or tokens</li>
            <li><strong>Asset Verification:</strong> Users can verify holdings of featured assets for bonus point eligibility</li>
            <li><strong>Cooldown Period:</strong> Asset verification has a 1-hour cooldown period between verifications</li>
          </ul>

          <h3>4.2 Referral Rewards</h3>
          <ul>
            <li>Referrers earn 1 point for each retweet completed by users they referred</li>
            <li>Referral relationships are tracked through unique referral links</li>
            <li>Only genuine referrals are counted; self-referrals and fraudulent referrals will be disqualified</li>
          </ul>

          <h3>4.3 Points Properties</h3>
          <ul>
            <li>Points have no monetary value and cannot be transferred, sold, or exchanged for cash</li>
            <li>Points are used solely to determine eligibility for weekly prize draws</li>
            <li>RoninAds reserves the right to adjust point values and earning mechanics at any time</li>
            <li>All point data is stored locally in your browser's localStorage</li>
          </ul>
        </section>

        <section>
          <h2>5. Weekly Prize Draws</h2>
          <ul>
            <li>Prize draws are conducted weekly for top point earners on the leaderboard</li>
            <li>Winners are selected based on accumulated points during the prize period</li>
            <li>Prize distribution is at the sole discretion of RoninAds</li>
            <li>Winners will be contacted through their connected wallet address or X.com handle</li>
            <li>Prizes may include NFTs, tokens, or other digital assets on the Ronin Network</li>
            <li>Winners must claim prizes within the specified timeframe or forfeit their winnings</li>
            <li>RoninAds reserves the right to modify, suspend, or cancel prize draws at any time</li>
            <li>Prize eligibility may be subject to verification of legitimate participation</li>
          </ul>
        </section>

        <section>
          <h2>6. Asset Verification</h2>
          <p>
            Users may verify ownership of featured NFTs or tokens to qualify for bonus points:
          </p>
          <ul>
            <li>Asset ownership is verified through on-chain wallet holdings</li>
            <li>Verification checks are subject to a 1-hour cooldown period</li>
            <li>Users must maintain asset ownership to continue receiving bonus points</li>
            <li>Featured assets and bonus multipliers may change without notice</li>
            <li>False verification attempts or manipulation will result in disqualification</li>
          </ul>
        </section>

        <section>
          <h2>7. X.com Integration</h2>
          <p>
            By connecting your X.com handle:
          </p>
          <ul>
            <li>You authorize RoninAds to verify completion of social tasks on X.com</li>
            <li>You agree that your X.com handle may be displayed on leaderboards and public lists</li>
            <li>You are responsible for ensuring all X.com activities comply with X.com's Terms of Service</li>
            <li>You understand that X.com handles are used solely for verification purposes</li>
            <li>You acknowledge that X.com account suspensions or violations may affect your eligibility</li>
          </ul>
        </section>

        <section>
          <h2>8. User Responsibilities</h2>
          <p>
            Users agree to:
          </p>
          <ul>
            <li>Participate honestly and authentically in all social engagement tasks</li>
            <li>Not use bots, scripts, automation, or any artificial means to earn points</li>
            <li>Not create multiple accounts or collude with others to manipulate the points system</li>
            <li>Not engage in any activity that could harm the platform, other users, or the Ronin Network</li>
            <li>Maintain the security of their wallet and X.com account credentials</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Report any bugs, exploits, or suspicious activity to RoninAds immediately</li>
          </ul>
        </section>

        <section>
          <h2>9. Prohibited Activities</h2>
          <p>
            The following activities are strictly prohibited:
          </p>
          <ul>
            <li>Using automated tools, bots, or scripts to complete social tasks</li>
            <li>Creating fake or fraudulent X.com accounts</li>
            <li>Engaging in "follow/unfollow" schemes or other manipulative behaviors</li>
            <li>Attempting to exploit vulnerabilities in the points system</li>
            <li>Harassing, threatening, or abusing other users or platform operators</li>
            <li>Impersonating others or misrepresenting your identity</li>
            <li>Interfering with the normal operation of the Service</li>
          </ul>
        </section>

        <section>
          <h2>10. Wallet Security</h2>
          <p>
            You are solely responsible for:
          </p>
          <ul>
            <li>Maintaining the security of your Ronin wallet and private keys</li>
            <li>All transactions and signatures made with your wallet</li>
            <li>Any losses resulting from unauthorized access to your wallet</li>
          </ul>
          <p>
            RoninAds does not have access to your private keys and cannot recover lost wallets or reverse
            transactions. Never share your private keys or seed phrases with anyone.
          </p>
        </section>

        <section>
          <h2>11. Account Suspension and Termination</h2>
          <p>
            RoninAds reserves the right to, at our sole discretion:
          </p>
          <ul>
            <li>Suspend or terminate accounts that violate these Terms of Service</li>
            <li>Disqualify users from prize draws for suspicious or fraudulent activity</li>
            <li>Remove points earned through prohibited activities</li>
            <li>Ban wallet addresses or X.com handles from future participation</li>
            <li>Refuse service to anyone for any reason</li>
          </ul>
          <p>
            In case of termination, accumulated points and prize eligibility will be forfeited without compensation.
          </p>
        </section>

        <section>
          <h2>12. Disclaimers</h2>
          <ul>
            <li>The Service is provided "as is" and "as available" without warranties of any kind</li>
            <li>RoninAds does not guarantee the availability, accuracy, or reliability of the Service</li>
            <li>We do not guarantee that you will win prizes or earn any specific amount of points</li>
            <li>Prize availability and values are subject to change without notice</li>
            <li>We are not responsible for X.com's actions, policies, or service disruptions</li>
            <li>We are not responsible for losses due to wallet security breaches or blockchain issues</li>
            <li>Social task completion and verification are subject to X.com's API availability</li>
          </ul>
        </section>

        <section>
          <h2>13. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, RoninAds and its operators, developers, and affiliates shall
            not be liable for any:
          </p>
          <ul>
            <li>Indirect, incidental, special, consequential, or punitive damages</li>
            <li>Loss of profits, revenue, data, or goodwill</li>
            <li>Damages arising from your use or inability to use the Service</li>
            <li>Damages related to prize eligibility, distribution, or value</li>
            <li>Damages from unauthorized access to your wallet or accounts</li>
            <li>Damages from errors, bugs, or interruptions in service</li>
          </ul>
          <p>
            Our total liability shall not exceed the value of prizes (if any) you have actually received.
          </p>
        </section>

        <section>
          <h2>14. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless RoninAds, its operators, and affiliates from any claims,
            damages, losses, or expenses (including legal fees) arising from:
          </p>
          <ul>
            <li>Your violation of these Terms of Service</li>
            <li>Your violation of X.com's Terms of Service or any applicable laws</li>
            <li>Your use or misuse of the Service</li>
            <li>Your fraudulent or dishonest activities</li>
          </ul>
        </section>

        <section>
          <h2>15. Modifications to Service</h2>
          <p>
            RoninAds reserves the right to:
          </p>
          <ul>
            <li>Modify, suspend, or discontinue any aspect of the Service at any time</li>
            <li>Change point earning rates, bonus multipliers, and featured assets</li>
            <li>Adjust prize structures, frequencies, and eligibility criteria</li>
            <li>Update social tasks and engagement requirements</li>
            <li>Implement new features or remove existing features</li>
          </ul>
          <p>
            We will make reasonable efforts to notify users of significant changes, but continued use of the
            Service constitutes acceptance of modifications.
          </p>
        </section>

        <section>
          <h2>16. Changes to Terms</h2>
          <p>
            RoninAds reserves the right to modify these Terms of Service at any time. The "Last Updated" date
            will reflect when changes were made. Material changes will be communicated through the platform or
            our official X.com account. Continued use of the Service after changes constitutes acceptance of the
            new terms.
          </p>
        </section>

        <section>
          <h2>17. Governing Law and Disputes</h2>
          <p>
            These Terms shall be governed by and construed in accordance with applicable international laws
            regarding blockchain and digital assets. Any disputes arising from these Terms or use of the Service
            shall be resolved through binding arbitration. You waive any right to participate in class actions.
          </p>
        </section>

        <section>
          <h2>18. Severability</h2>
          <p>
            If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions
            shall continue in full force and effect.
          </p>
        </section>

        <section>
          <h2>19. Contact</h2>
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
