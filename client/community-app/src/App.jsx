import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CommunityComponent from './CommunityComponent';

function App() {
  console.log("CommunityApp Mounted by Shell");

  return (
    <div>
      <Routes>
        <Route path="/" element={<CommunityComponent />} />
      </Routes>
    </div>
  );
}

export default App;