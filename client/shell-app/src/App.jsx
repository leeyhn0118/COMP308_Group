import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';

const UserApp = React.lazy(() => import('userApp/App'));
const CommunityApp = React.lazy(() => import('communityApp/App'));
const AdminApp = React.lazy(() => import('adminApp/App'));

const ApolloProviderWrapper = React.lazy(() => import('userApp/ApolloProviderWrapper'));

function App() {
    return (
        <React.Suspense fallback={<div>Loading Shell...</div>}>
           <ApolloProviderWrapper>
                <Router>
                    <div>
                        <Navbar bg="dark" variant="dark" expand="lg">
                            <Container>
                                <Navbar.Brand href="/">Community Connect Shell</Navbar.Brand>
                                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                                <Navbar.Collapse id="basic-navbar-nav">
                                    <Nav className="me-auto">
                                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                                        <Nav.Link as={Link} to="/user/login">User Login</Nav.Link>
                                        <Nav.Link as={Link} to="/community">Community</Nav.Link>
                                        <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
                                    </Nav>
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>

                        <Container className="mt-4">
                             <React.Suspense fallback={<div>Loading Microfrontend...</div>}>
                                <Routes>
                                    <Route path="/" element={<div><h1>Welcome to Community Connect</h1></div>} />
                                    <Route path="/user/*" element={<UserApp />} />
                                    <Route path="/community/*" element={<CommunityApp />} />
                                    <Route path="/admin/*" element={<AdminApp />} />
                                </Routes>
                             </React.Suspense>
                        </Container>
                    </div>
                </Router>
            </ApolloProviderWrapper>
        </React.Suspense>
    );
}

export default App;