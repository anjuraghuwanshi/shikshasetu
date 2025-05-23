// src/components/DiagramViewer.js
import React from 'react';

function VideoComponent({ topic, onExit }) {
  return (
    <div style={{ padding: '1rem' }}>
      <button onClick={onExit} style={{ marginBottom: '1rem' }}>← Back</button>
      <h2>{topic.name} -  Video</h2>
      {topic.video? (
<video
  src={topic.video}
  controls
  style={{ width: '100%', maxWidth: '600px', border: '1px solid #ccc', padding: '0.5rem', background: '#fff' }}
/>

      ) : (
        <p>No video available for this topic.</p>
      )}
    </div>
  );
}

export default VideoComponent;
