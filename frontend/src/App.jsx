import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import GettingStarted from './pages/GettingStarted';
import ParentalRights from './pages/ParentalRights';
import ParentingTimeAndCommunication from './pages/ParentingTimeAndCommunication';
import CustodySchedule from './pages/CustodySchedule';
import Transportation from './pages/Transportation';
import InformationSharing from './pages/InformationSharing';
import TaxExemptions from './pages/TaxExemptions';
import Review from './pages/Review';
import './App.css';

// Main App component with routing
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page (no sidebar) */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth routes without sidebar */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Form routes with sidebar */}
        <Route path="/getting-started" element={
          <MainLayout>
            <GettingStarted />
          </MainLayout>
        } />
        <Route path="/parental-rights" element={
          <MainLayout>
            <ParentalRights />
          </MainLayout>
        } />
        <Route path="/parenting-time-communication" element={
          <MainLayout>
            <ParentingTimeAndCommunication />
          </MainLayout>
        } />
        <Route path="/custody-schedule" element={
          <MainLayout>
            <CustodySchedule />
          </MainLayout>
        } />
        <Route path="/transportation" element={
          <MainLayout>
            <Transportation />
          </MainLayout>
        } />
        <Route path="/informationsharing" element={
          <MainLayout>
            <InformationSharing />
          </MainLayout>
        } />
        <Route path="/tax-exemptions" element={
          <MainLayout>
            <TaxExemptions />
          </MainLayout>
        } />
        <Route path="/review" element={
          <MainLayout>
            <Review />
          </MainLayout>
        } />

        {/* Catch all - redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;