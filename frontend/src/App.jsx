import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ParentInfo from './pages/ParentInfo';
import ChildInfo from './pages/ChildInfo';
import Schedule from './pages/Schedule';
import Review from './pages/Review';
import './App.css';

// Main App component with routing
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Form routes */}
        <Route path="/parent-info" element={<ParentInfo />} />
        <Route path="/child-info" element={<ChildInfo />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/review" element={<Review />} />

        {/* Catch all - redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;