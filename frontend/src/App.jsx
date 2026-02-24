import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import HouseholdInfo from './pages/HouseholdInfo';
import CustodySchedule from './pages/CustodySchedule';
import Transportation from './pages/Transportation';
import InformationSharing from './pages/InformationSharing';
import Review from './pages/Review';
import './App.css';

// Main App component with routing
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Form routes */}
        <Route path="/household-info" element={<HouseholdInfo />} />
        <Route path="/custody-schedule" element={<CustodySchedule />} />
        <Route path="/transportation" element={<Transportation />} />
        <Route path="/informationsharing" element={<InformationSharing />} />
        <Route path="/review" element={<Review />} />

        {/* Catch all - redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;