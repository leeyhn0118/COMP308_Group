import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card, Spinner, Alert } from 'react-bootstrap';

const GET_COMMUNITY_DATA = gql`
  query GetCommunityData {
    posts {
      id
      title
      content
      author {
        username
      }
      createdAt
    }
    events {
      id
      title
      description
      date
      location
      organizer {
        username
      }
    }
    newsItems {
        id
        title
        content
        author {
            username
        }
        createdAt
    }
  }
`;

function CommunityComponent() {
    const { loading, error, data } = useQuery(GET_COMMUNITY_DATA);

    if (loading) return <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>;
    if (error) return <Alert variant="danger">Error loading community data: {error.message}</Alert>;

    const { posts = [], events = [], newsItems = [] } = data || {};


    return (
        <div>
            <h2>Community Feed</h2>

            <h3>Latest Posts</h3>
            {posts.length > 0 ? posts.map(post => (
                <Card key={post.id} className="mb-3">
                    <Card.Body>
                        <Card.Title>{post.title}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">By {post.author?.username || 'Unknown'} on {new Date(post.createdAt).toLocaleDateString()}</Card.Subtitle>
                        <Card.Text>{post.content}</Card.Text>
                    </Card.Body>
                </Card>
            )) : <p>No posts yet.</p>}

            <h3>Upcoming Events</h3>
             {events.length > 0 ? events.map(event => (
                <Card key={event.id} className="mb-3">
                    <Card.Body>
                        <Card.Title>{event.title}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">
                            Organized by {event.organizer?.username || 'Unknown'} | Date: {new Date(event.date).toLocaleString()} | Location: {event.location}
                        </Card.Subtitle>
                        <Card.Text>{event.description}</Card.Text>
                    </Card.Body>
                </Card>
            )) : <p>No upcoming events.</p>}


            <h3>Local News</h3>
            {newsItems.length > 0 ? newsItems.map(news => (
                <Card key={news.id} className="mb-3">
                    <Card.Body>
                        <Card.Title>{news.title}</Card.Title>
                         <Card.Subtitle className="mb-2 text-muted">By {news.author?.username || 'Unknown'} on {new Date(news.createdAt).toLocaleDateString()}</Card.Subtitle>
                        <Card.Text>{news.content}</Card.Text>
                    </Card.Body>
                </Card>
            )) : <p>No news items yet.</p>}

        </div>
    );
}

export default CommunityComponent;