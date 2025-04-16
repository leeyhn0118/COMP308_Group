import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';

function App() {
  console.log("Admin App Mounted")
  return (
    <div>
      <Routes>
         <Route path="/" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;