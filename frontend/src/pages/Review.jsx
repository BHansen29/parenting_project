import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useForm } from '../hooks/useForm';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import InviteModal from '../components/common/InviteModal';
import { createCase, sendCaseInvite } from '../lib/caseApi';

export default function Review() {
  const { state, dispatch } = useForm();
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteStatus, setInviteStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async (email) => {
    setIsLoading(true);
    setInviteStatus(null);

    try {
      // Create case if it doesn't exist yet
      let caseId = state.caseId;
      if (!caseId) {
        const result = await createCase();
        caseId = result.caseId;

        // Store caseId in FormContext
        dispatch({
          type: 'UPDATE_SECTION',
          section: 'caseId',
          payload: caseId,
        });
      }

      // Send invite
      const result = await sendCaseInvite(caseId, email);
      setInviteStatus(result);

      return result;
    } catch (error) {
      console.error('Failed to send invite:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/transportation');
  };

  return (
    <div className="page-container">
      <main className="page-content">
        <div data-slot="card">
          <div data-slot="card-header">
            <h1 data-slot="card-title">Review & Submit</h1>
            <p data-slot="card-description">
              Review your responses and invite your co-parent to collaborate.
            </p>
          </div>

          <div data-slot="card-content">
            {/* TODO: Add questionnaire summary in future phase */}
            <p>Your questionnaire is complete!</p>

            <div style={{ marginTop: '2rem' }}>
              <h3>Invite Co-parent</h3>
              <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Send an invitation to your co-parent to complete their own questionnaire.
              </p>

              <button
                onClick={() => setShowInviteModal(true)}
                className="footer__button footer__button--next"
                disabled={isLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 0 }}
              >
                <UserPlus size={20} />
                {isLoading ? 'Sending...' : 'Invite Co-parent'}
              </button>

              {inviteStatus && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: inviteStatus.status === 'sent' ? '#10b98120' : '#f59e0b20',
                }}>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>
                    {inviteStatus.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onSendInvite={handleInvite}
        />
      )}
    </div>
  );
}
