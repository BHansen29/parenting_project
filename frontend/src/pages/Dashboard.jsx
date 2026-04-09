import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Users, FileText, Calendar, UserPlus, Plus, Trash2, Pencil, Lock } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useForm } from '../hooks/useForm';
import Header from '../components/common/Header';
import InviteModal from '../components/common/InviteModal';
import './Dashboard.css';
import { API_BASE_URL, buildApiUrl } from '../lib/apiClient';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [showSwitchPrompt, setShowSwitchPrompt] = useState(false);

  const { state, dispatch } = useForm();

  // collaborationMode drives all invite UI:
  //   'locked-individual' — safety concern; hide all invite surfaces entirely
  //   'individual'        — user chose solo; show invite button with a switch prompt
  //   'collaborative'     — user chose collaborative; invite button works normally
  //   ''                  — not yet set (user hasn't completed Getting Started)
  const collaborationMode = state.collaborationMode ?? '';

  // Mock plan data — replace with real data fetching later
  const [plans, setPlans] = useState([{ id: 1, name: 'Loading', status: 'DRAFT', lastModified: '3/3/2026'}]);

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    window.addEventListener('scroll', close);
    return () => { window.removeEventListener('click', close); window.removeEventListener('scroll', close); };
  }, []);

  /*
    This function will be ran anytime the "user" object is updated.
    When the "user" object gets updated, make an API call to retrieve all plans owned by the user
    and use the setPlans() method call to update the plans object so they are shown in the dashboard
  */
  useEffect(() => {
    if (!user) return;
    user.getIdToken()
      .then((idToken) => {
        return fetch(buildApiUrl("api/plan/" + user.uid + "/all"), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          }
        });
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to retrieve plans");
        }
        return res.json();
      })
      .then((data) => {
        setPlans(data);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }, [user]);

  const handleContextMenu = (e, plan) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, plan });
  };

  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDeletePlan = (id) => {
    if (user) {
      user.getIdToken().then((idToken) => {
        fetch(buildApiUrl("api/plan/delete"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({userID: user.uid, pID: id})
        })
        .then( async (response) => {
          if (!response.ok) {
            console.error("Failed to delete plan: ", response.message)
          } else {
            setPlans(prev => prev.filter(plan => plan._id !== id));
            setDeleteTarget(null);
          }
        });
      })
      .catch((error) => {
        console.error("Couldn't retrieve session token: ", error.message)
      });
    }
  };

  const startEditing = (plan) => {
    setEditingId(plan.id);
    setEditingName(plan.name);
  };

  const commitEdit = (id) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, name: editingName.trim() || p.name } : p));
    setEditingId(null);
  };

  const handleNewPlan = async () => {
    if (user) {
      user.getIdToken().then((idToken) => {
        fetch(buildApiUrl("api/plan/"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          }
        })
        .then( async (response) => {
          if (!response.ok) {
            console.error("Failed to create plan: ", response.message)
          } else {
            const plan = await response.json()
            setPlans(prev => [...prev, plan]);
            dispatch({ type: 'UPDATE_SECTION', section: 'plan', payload: plan });
            if (plan.caseId) setActiveCaseId(plan.caseId);
          }
        });
      })
      .catch((error) => {
        console.error("Couldn't retrieve session token: ", error.message)
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) navigate('/signin');
      else setUser(currentUser);
    });
    return unsubscribe;
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  // Called when user clicks any invite button.
  // Routes based on current collaborationMode.
  const handleInviteClick = () => {
    if (collaborationMode === 'collaborative') {
      // Already in collaborative mode — open invite directly
      setIsInviteOpen(true);
    } else if (collaborationMode === 'individual') {
      // User chose individual mode — ask if they want to switch first
      setShowSwitchPrompt(true);
    }
    // 'locked-individual' — button is not rendered at all, so this is unreachable
  };

  // User confirmed they want to switch from individual to collaborative mode.
  const handleConfirmSwitch = () => {
    dispatch({ type: 'UPDATE_SECTION', section: 'collaborationMode', payload: 'collaborative' });
    setShowSwitchPrompt(false);
    setIsInviteOpen(true);
  };

  // Whether to show any invite surface at all
  const showInviteUI = collaborationMode !== 'locked-individual';

  return (
    <div className="dashboard" onClick={() => setContextMenu(null)}>
      <Header user={user} onSignOut={handleSignOut} />
      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} caseId={activeCaseId} />

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="delete-modal__overlay" onClick={() => setDeleteTarget(null)}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <h3 className="delete-modal__title">Delete plan?</h3>
            <p className="delete-modal__body">
              Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? This action cannot be undone.
            </p>
            <div className="delete-modal__actions">
              <button className="delete-modal__cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="delete-modal__confirm" onClick={() => handleDeletePlan(deleteTarget._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Switch-to-collaborative confirmation prompt */}
      {showSwitchPrompt && (
        <div className="delete-modal__overlay" onClick={() => setShowSwitchPrompt(false)}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <h3 className="delete-modal__title">Switch to collaborative mode?</h3>
            <p className="delete-modal__body">
              You're currently completing this plan individually. Switching to collaborative mode
              will allow your co-parent to fill out their section separately. Would you like to switch?
            </p>
            <div className="delete-modal__actions">
              <button className="delete-modal__cancel" onClick={() => setShowSwitchPrompt(false)}>
                Stay in individual mode
              </button>
              <button className="delete-modal__confirm" onClick={handleConfirmSwitch}>
                Switch &amp; invite co-parent
              </button>
            </div>
          </div>
        </div>
      )}

      {contextMenu && (
        <ul
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <li onClick={() => { startEditing(contextMenu.plan); setContextMenu(null); }}>
            <Pencil size={14} /> Rename
          </li>
          <li className="context-menu__delete" onClick={() => { setDeleteTarget(contextMenu.plan); setContextMenu(null); }}>
            <Trash2 size={14} /> Delete
          </li>
        </ul>
      )}

      <main className="dashboard__main">

        {/* Invite co-parent banner — hidden entirely for locked-individual users */}
        {showInviteUI && (
          <div className="dashboard__invite-banner">
            <div className="dashboard__invite-icon">
              <Users size={32} color="#14abdd" />
            </div>

            <div className="dashboard__invite-text">
              {collaborationMode === 'individual' ? (
                <>
                  <h2 className="dashboard__invite-title">You're working individually</h2>
                  <p className="dashboard__invite-description">
                    You chose to complete this plan on your own. If you'd like your co-parent to
                    contribute, you can switch to collaborative mode at any time.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="dashboard__invite-title">Co-parenting works better together</h2>
                  <p className="dashboard__invite-description">
                    Invite the other parent to contribute to the plan. You'll both fill out your
                    preferences independently, and we'll help you find common ground.
                  </p>
                </>
              )}
            </div>

            <div className="dashboard__invite-action">
              <button className="dashboard__invite-btn" onClick={() => { setActiveCaseId(plans[0]?.caseId || null); setIsInviteOpen(true); }}>
                <UserPlus size={18} />
                {collaborationMode === 'individual' ? 'Switch & Invite Co-parent' : 'Invite Co-parent'}
              </button>
              <span className="dashboard__invite-note">
                {collaborationMode === 'individual'
                  ? 'You are currently in individual mode'
                  : 'Free for both parents'}
              </span>
            </div>
          </div>
        )}

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
              <div key={plan._id} className={`plan-card${plan.isShared ? ' plan-card--shared' : ''}`} onContextMenu={e => handleContextMenu(e, plan)}>
                <div className="plan-card__top">
                  <div className="plan-card__icon">
                    <FileText size={24} color="#6b7280" />
                  </div>
                  {plan.isShared && (
                    <span className="plan-card__shared-badge">
                      <Users size={12} /> Shared
                    </span>
                  )}
                  <button className="plan-card__delete-btn" onClick={() => setDeleteTarget(plan)}>
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="plan-card__name-row">
                  {editingId === plan._id ? (
                    <input
                      className="plan-card__name-input"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onBlur={() => commitEdit(plan._id)}
                      onKeyDown={e => e.key === 'Enter' && commitEdit(plan._id)}
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
                {(() => {
                    if (plan.currentQuestion) { // maybe use status field of plan for this?
                      return (
                        <button
                          className="plan-card__open-btn"
                          onClick={() => {
                            dispatch({
                                type: 'UPDATE_SECTION',
                                section: "plan",
                                payload: plan
                            });
                            if (plan.caseId) setActiveCaseId(plan.caseId);
                            fetch(buildApiUrl("/api/logic-engine/question/" + plan.currentQuestion), {
                              method: "GET",
                              headers: {
                                "Content-Type": "application/json",
                              }
                            })
                            .then(res => {
                              if (!res.ok) {
                                throw new Error("Failed to retrieve question");
                              }
                              res.json().then(q => {
                                dispatch({
                                  type: 'UPDATE_SECTION',
                                  section: "question",
                                  payload: q
                                });
                                navigate('/' + q.section)})
                            })
                          }}
                        >
                          Resume Plan &rarr;
                        </button>
                      );
                    } else {
                      return (
                        <button
                          className="plan-card__open-btn"
                          onClick={() => {
                            dispatch({
                                type: 'UPDATE_SECTION',
                                section: "plan",
                                payload: plan
                            });
                            if (plan.caseId) setActiveCaseId(plan.caseId);
                            navigate('/getting-started')
                          }}
                        >
                          Open Plan &rarr;
                        </button>
                      );
                    }
                })()}

                {/* Per-card invite button — hidden for locked-individual users */}
                {showInviteUI && (
                  <button className="plan-card__invite-btn" onClick={() => { setActiveCaseId(plan.caseId || null); setIsInviteOpen(true); }}>
                  <UserPlus size={14} />
                    <UserPlus size={14} />
                    {collaborationMode === 'individual' ? 'Switch & Invite' : 'Invite Parent'}
                  </button>
                )}

              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}