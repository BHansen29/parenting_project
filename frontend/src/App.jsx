import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Temporary placeholder components (we'll move these to separate files later)
function ParentInfo() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Parent Information</h1>
      <p>This is where the parent info form will go</p>
    </div>
  );
}

function ChildInfo() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Child Information</h1>
      <p>This is where the child info form will go</p>
    </div>
  );
}

function Schedule() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Parenting Schedule</h1>
      <p>This is where the schedule builder will go</p>
    </div>
  );
}

function Review() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Review & Submit</h1>
      <p>This is where the review page will go</p>
    </div>
  );
}

// Main App component with routing
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect home to first step */}
        <Route path="/" element={<Navigate to="/parent-info" replace />} />
        
        {/* Main routes */}
        <Route path="/parent-info" element={<ParentInfo />} />
        <Route path="/child-info" element={<ChildInfo />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/review" element={<Review />} />
        
        {/* Catch all - redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/parent-info" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;