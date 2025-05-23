
import React from 'react';

function ArticleComponent({ topic, onExit }) {
return (
  <div style={{ padding: '1rem' }}>
    <button onClick={onExit} style={{ marginBottom: '1rem' }}>← Back</button>
    <h2>{topic.name} - Article</h2>
    <div
      style={{
        border: '1px solid #ccc',
        padding: '1rem',
        background: '#f9f9f9',
        whiteSpace: 'pre-wrap',
        lineHeight: '1.5',
        maxHeight: '300px',          // Set max height
        overflowY: 'auto'            // Enable vertical scroll if needed
      }}
    >
      {topic.article || 'No notes available for this topic.'}
    </div>
  </div>
);

}

export default ArticleComponent;
