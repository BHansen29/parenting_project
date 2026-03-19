import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import GettingStarted from './pages/GettingStarted';
import ParentalRights from './pages/ParentalRights';
import ParentingTimeAndCommunication from './pages/ParentingTimeAndCommunication';
import InformationSharing from './pages/InformationSharing';
import TaxExemptions from './pages/TaxExemptions';
import Review from './pages/Review';
import { FormProvider } from './context/FormContext';
import { NavigationProvider } from './context/NavigationContext';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <FormProvider>
        <NavigationProvider>
          <Routes>
            {/* Landing page (no sidebar) */}
            <Route path="/" element={<LandingPage />} />

        {/* Auth routes without sidebar */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Dashboard (no sidebar) */}
        <Route path="/dashboard" element={<Dashboard />} />

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
        </NavigationProvider>
      </FormProvider>
    </BrowserRouter>
  );
}

export default App;