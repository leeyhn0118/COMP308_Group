import React, { useEffect, useState, lazy, Suspense } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Spinner, Container } from 'react-bootstrap';

const UserApp = lazy(() => import('userApp/App'));
const CommunityApp = lazy(() => import('communityApp/App'));

const CURRENT_USER_QUERY = gql`
  query {
    currentUser {
      username
    }
  }
`;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { data, loading, refetch } = useQuery(CURRENT_USER_QUERY, { 
    fetchPolicy: 'network-only',
  });

    useEffect(() => {
    if (!loading) {
      if (data?.currentUser) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false); 
      }
    }

    const handleLoginSuccess = () => {
      setIsLoggedIn(true);
      refetch();
    };

    const handleLogoutSuccess = async () => {
      setIsLoggedIn(false);
      await client.clearStore(); 
      window.location.reload(); 
    };
    

    window.addEventListener('loginSuccess', handleLoginSuccess);
    window.addEventListener('logoutSuccess', handleLogoutSuccess);

    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
      window.removeEventListener('logoutSuccess', handleLogoutSuccess);
    };
  }, [data, loading, refetch]);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Suspense fallback={<div>Loading...</div>}>
        {isLoggedIn ? <CommunityApp /> : <UserApp />}
      </Suspense>
    </Container>
  );
}
