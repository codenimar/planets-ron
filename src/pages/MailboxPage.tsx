import React from 'react';
import Mailbox from '../components/Mailbox';

const MailboxPage: React.FC = () => {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">INBOX</p>
          <h1>Mailbox</h1>
          <p className="lede">Stay updated with broadcasts and admin messages.</p>
        </div>
        <div className="glow-pill">
          <span className="dot-pulse"></span>
          Live updates
        </div>
      </div>
      <Mailbox />
    </div>
  );
};

export default MailboxPage;
