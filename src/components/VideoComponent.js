// src/components/DiagramViewer.js
import React from 'react';

function DiagramViewer({ topic, onBack }) {
  return (
    <div style={{ padding: '1rem' }}>
      <button onClick={onBack} style={{ marginBottom: '1rem' }}>← Back</button>
      <h2>{topic.name} - Diagram</h2>
      {topic.diagram ? (
        <img
          src={topic.diagram}
          alt={`${topic.name} diagram`}
          style={{ width: '100%', maxWidth: '600px', border: '1px solid #ccc', padding: '0.5rem', background: '#fff' }}
        />
      ) : (
        <p>No diagram available for this topic.</p>
      )}
    </div>
  );
}

export default DiagramViewer;
