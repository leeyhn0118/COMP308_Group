import React, { useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { Button, Form, Spinner } from 'react-bootstrap';

const COMMUNITY_AI_QUERY = gql`
  query CommunityAIQuery($input: String!) {
    communityAIQuery(input: $input) {
      text
      summary
      suggestedQuestions
      retrievedPosts {
        id
        title
        content
        category
        author
        createdAt
        updatedAt
      }
      retrievedHelps {
        id
        description
        location
        isResolved
        volunteers
        author
        createdAt
        updatedAt
      }
    }
  }
`;

export default function AIChatBotComponent() {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const [fetchAI, { loading }] = useLazyQuery(COMMUNITY_AI_QUERY, {
    onCompleted: (data) => {
      const ai = data?.communityAIQuery;
      if (!ai) return;

      const newMessage = {
        role: 'ai',
        text: ai.text?.trim() || '',
        summary: ai.summary || '',
        suggestedQuestions: ai.suggestedQuestions || [],
        retrievedPosts: ai.retrievedPosts || [],
        retrievedHelps: ai.retrievedHelps || [],
      };

      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'ai' && last.text === newMessage.text) return prev;
        return [...prev, newMessage];
      });
    },
    onError: (err) => {
      setMessages((prev) => [...prev, { role: 'ai', text: `Error: ${err.message}` }]);
    },
    fetchPolicy: 'no-cache',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text: input }]);
    fetchAI({ variables: { input } });
    setInput('');
  };

  const renderDataTable = (label, data, columns) => {
    return (
      <div className="mt-2">
        <div className="fw-bold">{label}</div>
        <table className="table table-bordered table-sm table-hover">
          <thead>
            <tr>{columns.map((col, i) => <th key={i}>{col.label}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx}>
              {columns.map((col, i) => (
                <td key={i}>
                  {col.render ? col.render(item[col.key]) : item[col.key]}
                </td>
              ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };  

  return (
    <>
      {!visible && (
        <Button
          onClick={() => setVisible(true)}
          style={{
            position: 'fixed',
            bottom: '25px',
            right: '25px',
            zIndex: 1000,
            minWidth: '140px',
            height: '45px',
            fontSize: '0.95rem',
          }}
          className="btn btn-primary shadow-lg rounded-pill"
        >
          🤖 Need Help?
        </Button>
      )}

      {visible && (
        <div
          style={{
            position: 'fixed',
            bottom: '25px',
            right: '25px',
            width: '580px',
            height: '740px',
            backgroundColor: '#ffffff',
            border: '2px solid #0d6efd',
            borderRadius: '16px',
            padding: '15px',
            boxShadow: '0 0 20px rgba(0,0,0,0.3)',
            zIndex: 2000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="m-0">🤖 Community Assistant</h5>
            <Button variant="outline-danger" size="sm" onClick={() => setVisible(false)}>×</Button>
          </div>

          <div className="flex-grow-1 overflow-auto mb-2 px-1" style={{ fontSize: '0.9rem' }}>
            {messages.map((msg, idx) => (
              <div key={idx} className="mb-3">
                <div className="fw-bold mb-1">
                  {msg.role === 'user' ? '🧑:' : '🤖:'} <span className="fw-normal">{msg.text}</span>
                </div>

                {msg.role === 'ai' && (
                  <>
                    {(msg.retrievedPosts?.length > 0 || msg.retrievedHelps?.length > 0) ? (
                      <>
                        {msg.retrievedPosts?.length > 0 &&
                          renderDataTable("📄 Retrieved Posts", msg.retrievedPosts, [
                            { key: "title", label: "Title" },
                            { key: "content", label: "Content" },
                            { key: "category", label: "Category" },
                            { key: "author", label: "Author" },
                          ])
                        }

                        {msg.retrievedHelps?.length > 0 &&
                          renderDataTable("🆘 Help Requests", msg.retrievedHelps, [
                            { key: "description", label: "Description" },
                            { key: "location", label: "Location" },
                            { key: "isResolved", label: "Resolved", render: (val) => val ? 'Yes' : 'No' },
                            { key: "author", label: "Author" },
                          ])
                        }
                      </>
                    ) : (
                      <div className="mt-1">{msg.text}</div>
                    )}

                    {msg.summary && (
                      <div className="text-muted mt-2">
                        <strong>📋 Summary:</strong> {msg.summary}
                      </div>
                    )}

                    {msg.suggestedQuestions?.length > 0 && (
                      <ul className="mb-0 mt-1 ps-3">
                        {msg.suggestedQuestions.map((q, i) => (
                          <li key={i}>💡 {q}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <Form onSubmit={handleSubmit} className="d-flex gap-2">
            <Form.Control
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about posts or help requests..."
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" animation="border" /> : 'Send'}
            </Button>
          </Form>
        </div>
      )}
    </>
  );
}
