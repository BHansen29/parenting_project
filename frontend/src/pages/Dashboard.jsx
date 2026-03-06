import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Users, FileText, Calendar, UserPlus, Plus, Trash2, Pencil } from 'lucide-react';
// import { auth } from '../lib/firebase';
import Header from '../components/common/Header';
import InviteModal from '../components/common/InviteModal';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Mock plan data — replace with real data fetching later
  const [plans, setPlans] = useState([
    { id: 1, name: 'Untitled Plan', status: 'DRAFT', lastModified: '3/3/2026' },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const [contextMenu, setContextMenu] = useState(null); // { x, y, plan }

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    window.addEventListener('scroll', close);
    return () => { window.removeEventListener('click', close); window.removeEventListener('scroll', close); };
  }, []);

  const handleContextMenu = (e, plan) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, plan });
  };

  const handleDeletePlan = (id) => {
    setPlans(prev => prev.filter(plan => plan.id !== id));
  };

  const startEditing = (plan) => {
    setEditingId(plan.id);
    setEditingName(plan.name);
  };

  const commitEdit = (id) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, name: editingName.trim() || p.name } : p));
    setEditingId(null);
  };

  const handleNewPlan = () => {
    const today = new Date().toLocaleDateString('en-US');
    setPlans(prev => [
      ...prev,
      { id: Date.now(), name: 'Untitled Plan', status: 'DRAFT', lastModified: today },
    ]);
  };

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
    <div className="dashboard" onClick={() => setContextMenu(null)}>
      <Header />
      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />

      {contextMenu && (
        <ul
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <li onClick={() => { startEditing(contextMenu.plan); setContextMenu(null); }}>
            <Pencil size={14} /> Rename
          </li>
          <li className="context-menu__delete" onClick={() => { handleDeletePlan(contextMenu.plan.id); setContextMenu(null); }}>
            <Trash2 size={14} /> Delete
          </li>
        </ul>
      )}

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
            <button className="dashboard__new-plan-btn" onClick={handleNewPlan}>
              <Plus size={16} />
              New Plan
            </button>
          </div>

          <div className="dashboard__plans-grid">
            {plans.map((plan) => (
              <div key={plan.id} className="plan-card" onContextMenu={e => handleContextMenu(e, plan)}>
                <div className="plan-card__top">
                  <div className="plan-card__icon">
                    <FileText size={24} color="#6b7280" />
                  </div>
                  <button className="plan-card__delete-btn" onClick={() => handleDeletePlan(plan.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="plan-card__name-row">
                  {editingId === plan.id ? (
                    <input
                      className="plan-card__name-input"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onBlur={() => commitEdit(plan.id)}
                      onKeyDown={e => e.key === 'Enter' && commitEdit(plan.id)}
                      autoFocus
                    />
                  ) : (
                    <>
                      <h3 className="plan-card__name">{plan.name}</h3>
                      <button className="plan-card__edit-btn" onClick={() => startEditing(plan)}>
                        <Pencil size={14} />
                      </button>
                    </>
                  )}
                </div>

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
