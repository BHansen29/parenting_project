import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Users, FileText, Calendar, UserPlus, Plus } from 'lucide-react';
// import { auth } from '../lib/firebase';
import Header from '../components/common/Header';
import InviteModal from '../components/common/InviteModal';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Mock plan data — replace with real data fetching later
  const [plans] = useState([
    { id: 1, name: 'Plan for Alice', status: 'DRAFT', lastModified: '3/3/2026' },
  ]);

  // TODO: restore auth guard when Firebase is connected
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     if (!currentUser) navigate('/signin');
  //     else setUser(currentUser);
  //   });
  //   return unsubscribe;
  // }, [navigate]);

  // const handleSignOut = async () => {
  //   await signOut(auth);
  //   navigate('/signin');
  // };

  return (
    <div className="dashboard">
      <Header />
      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />

      <main className="dashboard__main">

        {/* Invite co-parent banner */}
        <div className="dashboard__invite-banner">
          <div className="dashboard__invite-icon">
            <Users size={32} color="#14abdd" />
          </div>

          <div className="dashboard__invite-text">
            <h2 className="dashboard__invite-title">Co-parenting works better together</h2>
            <p className="dashboard__invite-description">
              Invite the other parent to contribute to the plan. You'll both fill out your preferences
              independently, and we'll help you find common ground.
            </p>
          </div>

          <div className="dashboard__invite-action">
            <button className="dashboard__invite-btn" onClick={() => setIsInviteOpen(true)}>
              <UserPlus size={18} />
              Invite Co-parent
            </button>
            <span className="dashboard__invite-note">Free for both parents</span>
          </div>
        </div>

        {/* Your Plans section */}
        <section className="dashboard__plans">
          <div className="dashboard__plans-header">
            <h2 className="dashboard__plans-title">Your Plans</h2>
            <button className="dashboard__new-plan-btn" onClick={() => navigate('/getting-started')}>
              <Plus size={16} />
              New Plan
            </button>
          </div>

          <div className="dashboard__plans-grid">
            {plans.map((plan) => (
              <div key={plan.id} className="plan-card">
                <div className="plan-card__top">
                  <div className="plan-card__icon">
                    <FileText size={24} color="#6b7280" />
                  </div>
                  <span className="plan-card__badge">{plan.status}</span>
                </div>

                <h3 className="plan-card__name">{plan.name}</h3>

                <div className="plan-card__meta">
                  <Calendar size={14} color="#9ca3af" />
                  <span>Last modified: {plan.lastModified}</span>
                </div>

                <button
                  className="plan-card__open-btn"
                  onClick={() => navigate('/getting-started')}
                >
                  Open Plan &rarr;
                </button>

                <button className="plan-card__invite-btn" onClick={() => setIsInviteOpen(true)}>
                  <UserPlus size={14} />
                  Invite Parent
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
