import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Container, Row, Col, Card, Button, Spinner, Alert, ListGroup, Tab, Nav } from 'react-bootstrap';

const ADMIN_DATA_QUERY = gql`
  query GetAdminData {
    users {
      id
      username
      email
      role
      location
      createdAt
    }
     pendingApprovals {
       id
       entityType
       entityData
       status
     }
     reportedContent {
        id
        contentType
        contentId
        reason
        reporter { username }
        createdAt
        status
     }
  }
`;

const APPROVE_ITEM_MUTATION = gql`
  mutation ApproveItem($itemId: ID!) {
    approveContent(itemId: $itemId) {
      id
      status
    }
  }
`;

const REJECT_ITEM_MUTATION = gql`
   mutation RejectItem($itemId: ID!) {
     rejectContent(itemId: $itemId) {
       id
       status
     }
   }
`;


function AdminDashboard() {
    const { loading, error, data, refetch } = useQuery(ADMIN_DATA_QUERY);
    const [approveItem, { loading: approveLoading, error: approveError }] = useMutation(APPROVE_ITEM_MUTATION);
    const [rejectItem, { loading: rejectLoading, error: rejectError }] = useMutation(REJECT_ITEM_MUTATION);


     const handleApprove = async (itemId) => {
        try {
            await approveItem({ variables: { itemId } });
            refetch();
        } catch (err) {
            console.error("Approval error:", err);
        }
    };

     const handleReject = async (itemId) => {
         try {
             await rejectItem({ variables: { itemId } });
             refetch();
         } catch (err) {
            console.error("Rejection error:", err);
         }
     };


    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">Error loading admin data: {error.message}</Alert>;

    const { users = [], pendingApprovals = [], reportedContent = [] } = data || {};


    return (
        <Container fluid>
            <h1>Admin Dashboard</h1>
            {(approveLoading || rejectLoading) && <Spinner animation="border" size="sm" />}
            {approveError && <Alert variant="danger">Approval Error: {approveError.message}</Alert>}
            {rejectError && <Alert variant="danger">Rejection Error: {rejectError.message}</Alert>}

             <Tab.Container id="admin-tabs" defaultActiveKey="users">
                <Row>
                    <Col sm={3}>
                        <Nav variant="pills" className="flex-column">
                            <Nav.Item>
                                <Nav.Link eventKey="users">User Management ({users.length})</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="approvals">Pending Approvals ({pendingApprovals.length})</Nav.Link>
                            </Nav.Item>
                             <Nav.Item>
                                <Nav.Link eventKey="reports">Reported Content ({reportedContent.length})</Nav.Link>
                             </Nav.Item>
                        </Nav>
                    </Col>
                    <Col sm={9}>
                        <Tab.Content>
                            <Tab.Pane eventKey="users">
                                <h2>User Management</h2>
                                 <ListGroup>
                                     {users.map(user => (
                                        <ListGroup.Item key={user.id}>
                                            <strong>{user.username}</strong> ({user.email}) - Role: {user.role}
                                            <br/>
                                            Location: {user.location || 'N/A'} | Joined: {new Date(user.createdAt).toLocaleDateString()}
                                            {/* Add buttons for edit/delete user if needed */}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Tab.Pane>
                            <Tab.Pane eventKey="approvals">
                                 <h2>Pending Approvals</h2>
                                 {pendingApprovals.length > 0 ? pendingApprovals.map(item => (
                                     <Card key={item.id} className="mb-2">
                                        <Card.Body>
                                            <Card.Title>Type: {item.entityType}</Card.Title>
                                             <Card.Text>
                                                 Status: {item.status}
                                                 <pre>{JSON.stringify(JSON.parse(item.entityData || '{}'), null, 2)}</pre>
                                            </Card.Text>
                                             <Button variant="success" size="sm" className="me-2" onClick={() => handleApprove(item.id)} disabled={approveLoading}>Approve</Button>
                                            <Button variant="danger" size="sm" onClick={() => handleReject(item.id)} disabled={rejectLoading}>Reject</Button>
                                         </Card.Body>
                                     </Card>
                                 )) : <p>No pending approvals.</p>}
                            </Tab.Pane>
                             <Tab.Pane eventKey="reports">
                                 <h2>Reported Content</h2>
                                 {reportedContent.length > 0 ? reportedContent.map(report => (
                                    <Card key={report.id} className="mb-2">
                                        <Card.Body>
                                             <Card.Title>Reported Item: {report.contentType} (ID: {report.contentId})</Card.Title>
                                             <Card.Subtitle className="mb-2 text-muted">Reported by: {report.reporter?.username || 'Unknown'} on {new Date(report.createdAt).toLocaleString()}</Card.Subtitle>
                                              <Card.Text>Reason: {report.reason}</Card.Text>
                                              <Card.Text>Status: {report.status}</Card.Text>
                                              {report.status === 'PENDING' && (
                                                <div>
                                                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleApprove(report.id)} disabled={approveLoading}>Dismiss Report</Button>
                                                    <Button variant="danger" size="sm" onClick={() => handleReject(report.id)} disabled={rejectLoading}>Take Action (Reject Content)</Button>
                                                </div>
                                            )}
                                         </Card.Body>
                                     </Card>
                                 )) : <p>No reported content.</p>}
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>


        </Container>
    );
}

export default AdminDashboard;