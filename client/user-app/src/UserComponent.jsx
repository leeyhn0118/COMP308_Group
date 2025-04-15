import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import 'bootstrap/dist/css/bootstrap.min.css';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!, $role: String!) {
    register(username: $username, email: $email, password: $password, role: $role)
  }
`;

const UserComponent = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'resident',
  });

  const [login] = useMutation(LOGIN_MUTATION, {
    onCompleted: () => {
        console.log("✅ Login successful, reloading page...");

        window.dispatchEvent(new CustomEvent('loginSuccess', { detail: { isLoggedIn: true } }));
    },
    onError: (error) => setAuthError(error.message || 'Login failed'),
});

const [register] = useMutation(REGISTER_MUTATION, {
    onCompleted: () => {
        alert("Registration successful! Please log in.");
        setActiveTab('login'); // Switch to login view
    },
    onError: (error) => setAuthError(error.message || 'Registration failed'),
});

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login({ variables: { username: formData.username, password: formData.password } });
        window.dispatchEvent(new Event('loginSuccess'));
      } else {
        await register({ variables: formData });
        alert('✅ Registered successfully! You can now login.');
        setIsLogin(true);
      }
    } catch (error) {
      alert(`❌ ${error.message}`);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4">{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        {!isLogin && (
          <>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <select className="form-select" name="role" value={formData.role} onChange={handleChange}>
                <option value="resident">Resident</option>
                <option value="business_owner">Business Owner</option>
                <option value="community_organizer">Community Organizer</option>
              </select>
            </div>
          </>
        )}
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100 mb-3">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <div className="text-center">
        <button
          className="btn btn-link"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Need to sign up?' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default UserComponent;
