import React, { useEffect, useState, useRef } from 'react';
import { initDB } from '../utils/db';
import QuizComponent from './QuizComponent';
import ArticleComponent from './ArticleComponent';
import VideoComponent from './VideoComponent';
import '../css/MainDashboard.css'
function MainDashboard({ onBackToWelcome, profile }) {
  const [topics, setTopics] = useState([]);
  const [search, setSearch] = useState('');
  const [viewingTopic, setViewingTopic] = useState(null);
  const [actionChoice, setActionChoice] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [completedTopicIds, setCompletedTopicIds] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Load topics from IndexedDB
  useEffect(() => {
    if (!profile?.language || !profile?.class) return;

    const loadTopics = async () => {
      const db = await initDB();
      const storeName = 'topics';
      if (!db.objectStoreNames.contains(storeName)) {
        setTopics([]);
        return;
      }

      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const allTopics = await store.getAll();

      const filtered = allTopics.filter(t =>
        String(t.class) === String(profile.class)
      );

      setTopics(filtered);
    };

    loadTopics();
  }, [profile]);

  // Load completed topics from IndexedDB + localStorage
  useEffect(() => {
    const loadCompletedTopics = async () => {
      const db = await initDB();
      const tx = db.transaction('results', 'readonly');
      const store = tx.objectStore('results');
      const allResults = await store.getAll();

      const dbCompleted = allResults.filter(r => r.profileId === profile.id).map(r => r.topicId);

      const localCompleted = JSON.parse(localStorage.getItem(`completedTopicIds_${profile.id}`)) || [];

      const combined = [...new Set([...dbCompleted, ...localCompleted])]; // ensure unique

      setCompletedTopicIds(combined);
    };

    loadCompletedTopics();
  }, [profile]);

  // Save completed topics to localStorage whenever updated
  useEffect(() => {
    if (profile?.id) {
      localStorage.setItem(`completedTopicIds_${profile.id}`, JSON.stringify([...new Set(completedTopicIds)]));
    }
  }, [completedTopicIds, profile]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = profile?.language === 'Hindi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearch(transcript);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, [profile]);

  const handleVoiceSearch = () => {
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const filteredTopics = search
    ? topics.filter(t => t.topic?.toLowerCase().includes(search.toLowerCase()))
    : topics;

  const handleTopicClick = (topic) => {
    setViewingTopic(topic);
    setActionChoice('');
    setShowModal(true);
  };

  const handleExit = () => {
    setViewingTopic(null);
    setActionChoice('');
    setShowModal(false);
  };

  const handleMarkComplete = (updater) => {
    setCompletedTopicIds(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      return [...new Set(updated)];
    });
  };

  // Check if all quizzes for a topic are completed
  const isTopicCompleted = (topicId) => {
    return completedTopicIds.includes(topicId);
  };

  return (
<div className="dashboard-container">
{topics.length > 0 && (
<div className="progress-container">
  <h2>Welcome to Class {profile.class}, {profile.name} 👋</h2>

  <div className="progress-ring">
    <div
      className="progress-fill"
      style={{
        background: `conic-gradient(#4caf50 ${Math.round((completedTopicIds.length / topics.length) * 100)}%, #e0e0e0 0)`
      }}
    >
      <div className="progress-inner">
        <div className="user-icon">👤</div>
        <div className="progress-check">✔</div>
      </div>
    </div>
  </div>
</div>

)}


  {/* Search Bar */}
<div className="search-bar">
  <div className="search-input-wrapper">
    <input
      type="text"
      placeholder="Search topics..."
      value={search}
      onChange={e => setSearch(e.target.value)}
      className="search-input"
    />
    <button
      onClick={handleVoiceSearch}
      className={`mic-button ${listening ? 'listening' : ''}`}
      aria-label="Start voice search"
    >
      🎙️
    </button>
  </div>
</div>





  {/* Topic List */}
  {filteredTopics.length > 0 ? (
    <ul className="topic-list">
      {filteredTopics.map((topic, i) => (
        <li key={i} className="topic-item">
          <strong>{topic.topic}</strong>
          {isTopicCompleted(topic.id) && (
            <span className="checkmark">✓</span>
          )}
          <div>
            <button onClick={() => handleTopicClick(topic)}>View Details</button>
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <p>No topics found.</p>
  )}

  {/* Back Button */}
  <button onClick={onBackToWelcome} className="back-button">
    Back to Welcome
  </button>

  {/* Modal for topic details */}
  {showModal && viewingTopic && (
    <div className="modal-overlay">
      <div className="modal-box">
        <button onClick={handleExit} className="modal-close">✖</button>

        <h3>{viewingTopic.topic}</h3>

        {!actionChoice && (
          
          <div className="modal-actions">
            <h4>Choose an option:</h4>
            {viewingTopic.article && (
              <button onClick={() => setActionChoice('article')}>📘 View Article</button>
            )}
            {viewingTopic.video && (
              <button onClick={() => setActionChoice('video')}>🎥 Watch Video</button>
            )}
            {viewingTopic.quiz?.length > 0 && (
              <button onClick={() => setActionChoice('quiz')}>📝 Attempt Quiz</button>
            )}
          </div>
        )}

        {actionChoice === 'article' && (
          <ArticleComponent topic={viewingTopic} onExit={handleExit} />
        )}

        {actionChoice === 'video' && (
          <VideoComponent topic={viewingTopic} onExit={handleExit} />
        )}

        {actionChoice === 'quiz' && (
          <QuizComponent
            topic={viewingTopic}
            profile={profile}
            onExit={handleExit}
            markComplete={handleMarkComplete}
          />
        )}
      </div>
    </div>
  )}
</div>

  );
}

export default MainDashboard;

