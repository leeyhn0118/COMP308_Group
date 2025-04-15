import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  Container, Form, Button, ListGroup, Alert, Modal, Navbar,
} from 'react-bootstrap';

const GET_POSTS = gql`query { posts { id title content category createdAt updatedAt author } }`;
const GET_HELP_REQUESTS = gql`query { helpRequests { id description location isResolved volunteers createdAt updatedAt author } }`;

const CREATE_POST = gql`
  mutation CreatePost($title: String!, $content: String!, $category: String!) {
    createPost(title: $title, content: $content, category: $category) { id }
  }
`;
const CREATE_HELP = gql`
  mutation CreateHelp($description: String!, $location: String) {
    createHelpRequest(description: $description, location: $location) { id }
  }
`;
const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $title: String, $content: String, $category: String) {
    updatePost(id: $id, title: $title, content: $content, category: $category) {
      id updatedAt
    }
  }
`;
const DELETE_POST = gql`mutation DeletePost($id: ID!) { deletePost(id: $id) }`;

const UPDATE_HELP = gql`
  mutation UpdateHelp(
    $id: ID!,
    $description: String,
    $location: String,
    $isResolved: Boolean,
    $volunteers: [ID!]
  ) {
    updateHelpRequest(
      id: $id,
      description: $description,
      location: $location,
      isResolved: $isResolved,
      volunteers: $volunteers
    ) {
      id updatedAt
    }
  }
`;
const DELETE_HELP = gql`mutation DeleteHelp($id: ID!) { deleteHelpRequest(id: $id) }`;

const LOGOUT_MUTATION = gql`mutation { logout }`;

function CommunityComponent() {
  const [post, setPost] = useState({ title: '', content: '', category: 'discussion' });
  const [help, setHelp] = useState({ description: '', location: '' });
  const [error, setError] = useState('');
  const [editPostData, setEditPostData] = useState(null);
  const [editHelpData, setEditHelpData] = useState(null);

  const { data: postData, refetch: refetchPosts } = useQuery(GET_POSTS, { context: { credentials: 'include' } });
  const { data: helpData, refetch: refetchHelp } = useQuery(GET_HELP_REQUESTS, { context: { credentials: 'include' } });

  const [createPost] = useMutation(CREATE_POST, {
    onCompleted: () => {
      setPost({ title: '', content: '', category: 'discussion' });
      refetchPosts();
    },
    onError: (err) => setError(err.message),
  });

  const [createHelpRequest] = useMutation(CREATE_HELP, {
    onCompleted: () => {
      setHelp({ description: '', location: '' });
      refetchHelp();
    },
    onError: (err) => setError(err.message),
  });

  const [updatePost] = useMutation(UPDATE_POST, {
    onCompleted: () => {
      setEditPostData(null);
      refetchPosts();
    },
    onError: (err) => setError(err.message),
  });

  const [deletePost] = useMutation(DELETE_POST, {
    onCompleted: refetchPosts,
    onError: (err) => setError(err.message),
  });

  const [updateHelpRequest] = useMutation(UPDATE_HELP, {
    onCompleted: () => {
      setEditHelpData(null);
      refetchHelp();
    },
    onError: (err) => setError(err.message),
  });

  const [deleteHelpRequest] = useMutation(DELETE_HELP, {
    onCompleted: refetchHelp,
    onError: (err) => setError(err.message),
  });

  const [logout] = useMutation(LOGOUT_MUTATION);

  const handleLogout = async () => {
    try {
      await logout();
      window.dispatchEvent(new Event('logoutSuccess'));
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    createPost({ variables: post });
  };

  const handleHelpSubmit = (e) => {
    e.preventDefault();
    createHelpRequest({ variables: help });
  };

  const cleanVars = (obj) => {
    const result = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined || key === 'id') result[key] = val;
    }
    return result;
  };
  
  return (
    <>
      <Navbar bg="light" expand="lg" className="mb-4 shadow-sm">
        <Container>
          <Navbar.Brand className="fw-bold">Community</Navbar.Brand>
          <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
        </Container>
      </Navbar>

      <Container style={{ maxWidth: 800 }}>
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Post Form */}
        <Form onSubmit={handlePostSubmit} className="mb-4">
          <h4>Create a Post</h4>
          <Form.Control className="mb-2" placeholder="Title" value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} />
          <Form.Control className="mb-2" as="textarea" placeholder="Content" value={post.content} onChange={(e) => setPost({ ...post, content: e.target.value })} />
          <Form.Select className="mb-2" value={post.category} onChange={(e) => setPost({ ...post, category: e.target.value })}>
            <option value="discussion">Discussion</option>
            <option value="news">News</option>
          </Form.Select>
          <Button type="submit">Post</Button>
        </Form>

        {/* Posts List */}
        <h5>📌 All Posts</h5>
        <ListGroup className="mb-4">
          {postData?.posts?.map((p) => (
            <ListGroup.Item key={p.id}>
              <div className="fw-bold">Title: {p.title} <span className="text-muted">({p.category})</span></div>
              <div>Content: {p.content}</div>
              <div>Created At: {new Date(p.createdAt).toLocaleString()}</div>
              {p.updatedAt && <div>Updated At: {new Date(p.updatedAt).toLocaleString()}</div>}
              <div>Author: {p.author}</div>
              <Button size="sm" variant="outline-primary" onClick={() => setEditPostData(p)} className="me-2 mt-2">Edit</Button>
              <Button size="sm" variant="outline-danger" onClick={() => deletePost({ variables: { id: p.id } })} className="mt-2">Delete</Button>
            </ListGroup.Item>
          ))}
        </ListGroup>

        {/* Help Form */}
        <Form onSubmit={handleHelpSubmit} className="mb-4">
          <h4>Need Help?</h4>
          <Form.Control className="mb-2" placeholder="Description" value={help.description} onChange={(e) => setHelp({ ...help, description: e.target.value })} />
          <Form.Control className="mb-2" placeholder="Location (optional)" value={help.location} onChange={(e) => setHelp({ ...help, location: e.target.value })} />
          <Button type="submit">Request Help</Button>
        </Form>

        {/* Help List */}
        <h5>Help Requests</h5>
        <ListGroup>
          {helpData?.helpRequests?.map((h) => (
            <ListGroup.Item key={h.id}>
              <div className="fw-bold">Description: {h.description}</div>
              {h.location && <div>Location:  {h.location}</div>}
              <div>Created At: {new Date(h.createdAt).toLocaleString()}</div>
              {h.updatedAt && <div>Updated At: {new Date(h.updatedAt).toLocaleString()}</div>}
              <div>Volunteers: {h.volunteers?.length || 0}</div>
              <div>Resolved: {h.isResolved ? 'Yes' : 'No'}</div>
              <div>Author: {h.author}</div>
              <Button size="sm" variant="outline-primary" onClick={() => setEditHelpData(h)} className="me-2 mt-2">Edit</Button>
              <Button size="sm" variant="outline-danger" onClick={() => deleteHelpRequest({ variables: { id: h.id } })} className="mt-2">Delete</Button>
            </ListGroup.Item>
          ))}
        </ListGroup>

        {/* Edit Post Modal */}
        <Modal show={!!editPostData} onHide={() => setEditPostData(null)}>
          <Modal.Header closeButton><Modal.Title>Edit Post</Modal.Title></Modal.Header>
          <Modal.Body>
            {editPostData && (
              <>
                <Form.Control className="mb-2" value={editPostData.title} onChange={(e) => setEditPostData({ ...editPostData, title: e.target.value })} />
                <Form.Control className="mb-2" as="textarea" value={editPostData.content} onChange={(e) => setEditPostData({ ...editPostData, content: e.target.value })} />
                <Form.Select className="mb-2" value={editPostData.category} onChange={(e) => setEditPostData({ ...editPostData, category: e.target.value })}>
                  <option value="discussion">Discussion</option>
                  <option value="news">News</option>
                </Form.Select>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditPostData(null)}>Cancel</Button>
            <Button
              onClick={() => {
                const { id, title, content, category } = editPostData;
                updatePost({ variables: cleanVars({ id, title, content, category }) });
              }}
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Help Modal */}
        <Modal show={!!editHelpData} onHide={() => setEditHelpData(null)}>
          <Modal.Header closeButton><Modal.Title>Edit Help Request</Modal.Title></Modal.Header>
          <Modal.Body>
            {editHelpData && (
              <>
                <Form.Control className="mb-2" value={editHelpData.description} onChange={(e) => setEditHelpData({ ...editHelpData, description: e.target.value })} />
                <Form.Control className="mb-2" value={editHelpData.location || ''} onChange={(e) => setEditHelpData({ ...editHelpData, location: e.target.value })} />
                <Form.Check type="checkbox" label="Resolved" checked={editHelpData.isResolved} onChange={(e) => setEditHelpData({ ...editHelpData, isResolved: e.target.checked })} />
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditHelpData(null)}>Cancel</Button>
            <Button
              onClick={() => {
                const { id, description, location, isResolved, volunteers } = editHelpData;
                updateHelpRequest({
                  variables: cleanVars({
                    id,
                    description,
                    location,
                    isResolved,
                    volunteers: Array.isArray(volunteers) ? volunteers : []
                  })
                });
              }}
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}

export default CommunityComponent;
