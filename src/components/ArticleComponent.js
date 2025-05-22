// src/components/NotesViewer.js
import React from 'react';

function NotesViewer({ topic, onBack }) {
  return (
    <div style={{ padding: '1rem' }}>
      <button onClick={onBack} style={{ marginBottom: '1rem' }}>← Back</button>
      <h2>{topic.name} - Notes</h2>
      <div style={{
        border: '1px solid #ccc',
        padding: '1rem',
        background: '#f9f9f9',
        whiteSpace: 'pre-wrap',
        lineHeight: '1.5'
      }}>
        {topic.notes || 'No notes available for this topic.'}
      </div>
    </div>
  );
}

export default NotesViewer;
