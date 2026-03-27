import { useState } from 'react';
import { X, UserPlus, Mail, Copy, Check } from 'lucide-react';
import './InviteModal.css';

// Mock collaboration link - replace with a real generated link later.
const MOCK_COLLAB_LINK = 'https://2dc42780-c3c8-4249-89d0-1ce28f8ac2f1.sharecare.app/join';

export default function InviteModal({ onClose, onSendInvite }) {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    const recipientEmail = email.trim();

    if (!recipientEmail) {
      return;
    }

    setIsSending(true);

    try {
      const result = await onSendInvite(recipientEmail);

      if (result.status === 'sent') {
        setSent(true);
        setEmail('');
        setTimeout(() => setSent(false), 3000);
      } else if (result.status === 'pending') {
        // Show already pending message
        alert('An invite to this email is already pending.');
      } else if (result.status === 'expired') {
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      }
    } catch (error) {
      console.error('Failed to send invite email:', error);
      alert('Failed to send invite. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(MOCK_COLLAB_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Close when clicking the backdrop.
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="invite-modal" role="dialog" aria-modal="true" aria-labelledby="invite-modal-title">
        <div className="invite-modal__header">
          <div className="invite-modal__title-row">
            <div className="invite-modal__icon">
              <UserPlus size={22} color="#14abdd" />
            </div>
            <div>
              <h2 id="invite-modal-title" className="invite-modal__title">Invite Other Parent</h2>
              <p className="invite-modal__subtitle">Collaborate on your parenting plan</p>
            </div>
          </div>
          <button className="invite-modal__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="invite-modal__info-box">
          <p>
            <strong>How it works:</strong> Each parent fills out the parenting plan independently.
            Once both complete it, we'll create a comparison summary showing areas that need
            discussion. Each parent will have the opportunity to revise their responses after seeing the summary,
            and we'll highlight any changes to make it easy to track compromises.
          </p>
        </div>

        <div className="invite-modal__section">
          <label className="invite-modal__label" htmlFor="invite-email">
            Send invite via email
          </label>
          <form className="invite-modal__email-row" onSubmit={handleSend}>
            <input
              id="invite-email"
              className="invite-modal__email-input"
              type="email"
              placeholder="other-parent@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              className={`invite-modal__send-btn ${sent ? 'invite-modal__send-btn--sent' : ''}`}
              disabled={sent || isSending}
            >
              <Mail size={16} />
              {isSending ? 'Sending...' : sent ? 'Sent!' : 'Send'}
            </button>
          </form>
        </div>

        <div className="invite-modal__divider">
          <span>or share link</span>
        </div>

        <div className="invite-modal__section">
          <p className="invite-modal__label">Share collaboration link</p>
          <div className="invite-modal__link-row">
            <div className="invite-modal__link-display">
              {MOCK_COLLAB_LINK}
            </div>
            <button className="invite-modal__copy-btn" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <p className="invite-modal__privacy">
          <strong>Privacy Note:</strong> Neither parent will see the other's specific responses.
          Only areas of agreement and disagreement will be highlighted in the comparison summary.
        </p>
      </div>
    </div>
  );
}
