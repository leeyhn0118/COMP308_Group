import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import SignUpForm from './components/SignupForm';
import SignInForm from './components/SignInForm';


function App() {
  console.log("User App Mounted")
  return (
      <div>
        <nav>
          <Link to="login">Login</Link> | <Link to="signup">Sign Up</Link>
        </nav>
        <Routes>
          <Route path="signup" element={<SignUpForm />} />
          <Route path="login" element={<SignInForm />} />
           <Route path="/" element={<SignInForm />} />
        </Routes>
      </div>
  );
}

export default App;