import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import './Layout.css';
import Footer from '../components/common/Footer';
import { buildApiUrl } from '../lib/apiClient';
import { useForm } from '../hooks/useForm';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Layout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const { state, dispatch } = useForm();
  const plan = state.plan
  const q = state.question
  const parents = state.parents
  const answer = state.currAnswer
  // Define the page navigation order
  const pageOrder = [
    '/getting-started',
    '/parental-rights',
    '/parenting-time-communication',
    '/custody-schedule',
    '/transportation',
    '/review'
  ];

  const currentPageIndex = pageOrder.indexOf(location.pathname);
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === pageOrder.length - 1;

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) navigate('/signin');
      else setUser(currentUser);
    });
    return unsubscribe;
  }, [navigate]);

  // Determine if current page should show navigation
  const shouldShowNavigation = ['/getting-started', '/parental-rights', '/parenting-time', '/custody-schedule', '/transportation', '/review'].includes(location.pathname);

  // Determine if current page should show header (not landing page)
  const shouldShowHeader = location.pathname !== '/';

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleBack = () => {
    if (currentPageIndex > 0) {
      navigate(pageOrder[currentPageIndex - 1]);
    }
  };

  function gettingStartedNext(idToken) {
    // API call to update sharing status if neccessary
    const isSharing = (plan.allowSharing === "true")
    fetch(buildApiUrl("api/plan/setShareMode/" + state.plan._id), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({allowShare: isSharing})
    })
    .then( async (response) => {
      if (!response.ok) {
        console.error("Failed to update plan share mode: ", response.message)
      }
    })

    // API call to update plan with added children
    fetch(buildApiUrl('api/plan/' + plan._id + '/children'), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({planChildren: plan.children})
    })
    .then( async (response) => {
      if (!response.ok) {
        console.error("Failed to update plan children: ", response.message)
      }
      // api call to update user's answer to current question in plan
      fetch(buildApiUrl('api/plan/' + plan._id + '/contact'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({phone: parents.phone, address: parents.address })
      })
      .then( async (response) => {
        if (!response.ok) {
          console.error("Failed to add contact info to user plan: ", response.message)
        }
        response.json().then( data => {
          dispatch({
            type: 'UPDATE_SECTION',
            section: "plan",
            payload: data
          })
        })
      })
    })
  }

  function questionnaireNext(idToken) {
    // update currentQuestion field in plan
    plan.currentQuestion = q._id

    // api call to set current question of plan to question just answered 
    fetch(buildApiUrl('api/plan/updateCurrent/' + plan._id + '/' + plan.currentQuestion), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      }
    })
    .then( async (response) => {
      if (!response.ok) {
        console.error("Failed to update plan: ", response.message)
      }
      // api call to update user's answer to current question in plan
      fetch(buildApiUrl('api/plan/' + plan._id + '/answer'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({qKey: q.qKey, answer: answer})
      })
      .then( async (response) => {
        if (!response.ok) {
          console.error("Failed to add answer to user plan: ", response.message)
        }
        response.json().then( data => {
          dispatch({
            type: 'UPDATE_SECTION',
            section: "plan",
            payload: data
          })
        })
      })
    })
  }

  const handleNext = async () => {
    // prevent user from clicking next if answer is not selected
    if ((pageOrder[currentPageIndex] !== '/getting-started') && (q.options.findIndex(qAnswer => qAnswer.value === answer) < 0)) {
      return
    }
    const apiURL = pageOrder[currentPageIndex] === '/getting-started' 
      ? '/api/logic-engine/question/69c57450e794c12043e820fb' // default starting question (probably change to const or something)
      : '/api/logic-engine/nextQuestion/' + q.qKey + '/' + answer
    try {
      // get the next 'question' object
      const response = await fetch(buildApiUrl(apiURL));
      if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
      }
      if (user) {
        user.getIdToken().then((idToken) => { 
          if (pageOrder[currentPageIndex] === "/getting-started") {
            gettingStartedNext(idToken)
          } else {
            questionnaireNext(idToken)
          }
        })
      }
      response.json().then( data => {
        // update question in context
        dispatch({
          type: 'UPDATE_SECTION',
          section: "question",
          payload: data
        });
        navigate("/" + data.section);
      })
    } catch (e) {
        console.error(e.message)
    }
  };

  return (
    <div className="layout">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />

      <div className={`layout__main ${isSidebarCollapsed ? 'layout__main--sidebar-collapsed' : ''}`}>
        {shouldShowHeader && (
          <Header
            showNavigation={false} // Navigation is now in sidebar
            saved={false} // You can pass saved state if needed
          />
        )}

        <main className="layout__content">
          {children}
        </main>

        <Footer
          showBackButton={!isFirstPage}
          showNextButton={!isLastPage}
          onBack={handleBack}
          onNext={handleNext}
        />
      </div>

    </div>
  );
}