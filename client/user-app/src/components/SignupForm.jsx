// client/user-app/src/components/SignupForm.jsx
import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const SIGNUP_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!, $role: String!, $location: String) {
    register(username: $username, email: $email, password: $password, role: $role, location: $location) {
      token
      user {
        id
        username
        email
        role
      }
    }
  }
`;

function SignUpForm() {
  const [formState, setFormState] = useState({ username: '', email: '', password: '', role: 'resident', location: '' });
  const [register, { loading, error }] = useMutation(SIGNUP_MUTATION);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const { data } = await register({ variables: formState });
      if (data?.register?.token) {
        alert('Signup successful! Please sign in.');
        navigate('/user/login');
      }
    } catch (e) {
      console.error("Signup error:", e);
       const errorMessage = e.graphQLErrors?.[0]?.message || e.message || 'Error during registration';
      alert(`Signup failed: ${errorMessage}`);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      {error && <Alert variant="danger">{error.message}</Alert>}
      <Form.Group controlId="signupUsername">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          name="username"
          value={formState.username}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group controlId="signupEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={formState.email}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group controlId="signupPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          name="password"
          value={formState.password}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group controlId="signupRole">
        <Form.Label>Your Role</Form.Label>
        <Form.Select
          name="role"
          value={formState.role}
          onChange={handleChange}
          required
        >
          <option value="resident">Resident</option>
          <option value="business_owner">Business Owner</option>
          <option value="community_organizer">Community Organizer</option>
        </Form.Select>
      </Form.Group>
      <Form.Group controlId="signupLocation">
        <Form.Label>Location (Optional)</Form.Label>
        <Form.Control
          type="text"
          name="location"
          value={formState.location}
          onChange={handleChange}
        />
      </Form.Group>
      <Button type="submit" disabled={loading}>
         {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Sign Up'}
      </Button>
    </Form>
  );
}

export default SignUpForm;