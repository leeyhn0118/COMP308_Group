import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
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

function SignInForm() {
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const { data } = await login({ variables: formState });

      if (data?.login?.token) {
        alert('Login successful!');
        localStorage.setItem('token', data.login.token);
        navigate('/community');
      }
    } catch (e) {
      console.error("Login error:", e);
      alert('Login failed');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2>Sign In</h2>
      {error && <Alert variant="danger">{error.message}</Alert>}
      <Form.Group controlId="signinEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={formState.email}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group controlId="signinPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          name="password"
          value={formState.password}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Button type="submit" disabled={loading}>
        {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Login'}
      </Button>
    </Form>
  );
}

export default SignInForm;