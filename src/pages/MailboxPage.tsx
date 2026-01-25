import React from 'react';
import Mailbox from '../components/Mailbox';

const MailboxPage: React.FC = () => {
  return (
    <div className="mailbox-page">
      <div className="page-header">
        <h1>📬 Mailbox</h1>
        <p className="page-subtitle">View your messages and notifications</p>
      </div>
      <Mailbox />
    </div>
  );
};

export default MailboxPage;
