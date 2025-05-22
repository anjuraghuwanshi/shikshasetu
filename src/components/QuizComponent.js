import React, { useState, useEffect } from 'react';
import { initDB } from '../utils/db';
import LeaderboardComponent from './LeaderboardComponent';
import '../css/QuizComponent.css'
const correctSound = new Audio(`${process.env.PUBLIC_URL}/assets/correct-answer.mp3`);
const wrongSound = new Audio(`${process.env.PUBLIC_URL}/assets/wrong-answer.mp3`);

function QuizComponent({ topic, profile, onExit, markComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [finalScore, setFinalScore] = useState(null);
  const [finalTime, setFinalTime] = useState(null);

  const question = topic?.quiz?.[currentQuestionIndex];

  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {};
    }
  }, []);

  useEffect(() => {
    readQuestion();
  }, [currentQuestionIndex]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    if (topic.language === 'hindi') {
      const hindiVoice = voices.find(v => v.lang.startsWith('hi') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.toLowerCase().includes('female')));
      utterance.voice = hindiVoice || null;
      utterance.lang = hindiVoice?.lang || 'hi-IN';
    } else {
      const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.toLowerCase().includes('female')));
      utterance.voice = englishVoice || null;
      utterance.lang = englishVoice?.lang || 'en-US';
    }

    utterance.pitch = 1.2;
    utterance.rate = 0.85;
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentUtterance(utterance);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentUtterance(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const readQuestion = () => {
    if (question) {
      const text = `${question.question}. Options are: ${question.options.join(', ')}`;
      speak(text);
    }
  };

  const stopSpeaking = () => {
    if (currentUtterance) currentUtterance.onend = null;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentUtterance(null);
  };

  const toggleSpeaking = () => {
    isSpeaking ? stopSpeaking() : readQuestion();
  };

  const saveQuizResult = async () => {
    const db = await initDB();
    const tx = db.transaction('results', 'readwrite');
    const store = tx.objectStore('results');
    await store.add({ profileId: profile.id, topicId: topic.id });
    await tx.done;
  };

  const handleQuizEnd = async (finalScoreToSave) => {
    setFinalScore(finalScoreToSave);
    setFinalTime(timeElapsed);
    await saveQuizResult();
    markComplete(prev => [...new Set([...prev, topic.id])]);

    const dummyUsers = Array.from({ length: 99 }, (_, i) => ({
      name: `Student${i + 1}`,
      score: Math.floor(Math.random() * (topic.quiz.length + 1))
    }));
    const realUser = { name: profile.name, score: finalScoreToSave };
    const allUsers = [...dummyUsers, realUser].sort((a, b) => b.score - a.score);
    const ranked = allUsers.map((user, index) => ({ ...user, rank: index + 1 }));

    setLeaderboardData(ranked);
    setShowLeaderboard(true);
  };

  const handleOptionClick = (option, index) => {
    stopSpeaking();
    const isCorrect = index === question.answerIndex;
    setSelectedOption(index);
    setShowFeedback(true);
    (isCorrect ? correctSound : wrongSound).play();

    setTimeout(async () => {
      setShowFeedback(false);
      setSelectedOption(null);
      const newScore = isCorrect ? score + 1 : score;
      setScore(newScore);

      if (currentQuestionIndex + 1 < topic.quiz.length) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        await handleQuizEnd(newScore);
      }
    }, 1500);
  };

  if (showLeaderboard) {
    return (
      <LeaderboardComponent
        score={finalScore}
        timeElapsed={finalTime}
        profile={profile}
        onExit={onExit}
        topic={topic}
      />
    );
  }

  if (!question) return <div>No quiz available for this topic.</div>;

  return (
    <div className='quiz-container'>
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        backgroundColor: '#000',
        color: '#fff',
        padding: '0.5rem 1rem',
        borderRadius: '5px',
        fontSize: '16px'
      }}>
        {formatTime(timeElapsed)}
      </div>

      <div style={{ display: 'flex' }}>
        <h3>
          Question {currentQuestionIndex + 1} of {topic.quiz.length}
        </h3>
      </div>

      <div style={{ display: 'flex', alignItems:"flex-end"}}>
      <p  style={{ flex:'100%'}}>{question.question}</p>
        <button
          onClick={toggleSpeaking}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            color: isSpeaking ? '#f44336' : '#4caf50'
          }}
          title={isSpeaking ? 'Stop Reading' : 'Play Reading'}
        >
          🔊
        </button>
          </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {question.options.map((option, index) => (
          <li key={index} style={{ margin: '0.5rem 0' }}>
            <button
              onClick={() => handleOptionClick(option, index)}
              disabled={showFeedback}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: showFeedback
                  ? index === question.answerIndex
                    ? '#4caf50'
                    : index === selectedOption
                      ? '#f44336'
                      : ''
                  : '',
                color: '#fff' ,
                borderRadius: '8px',
                border: '1px solid #ccc',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() => { stopSpeaking(); onExit(); }}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#e0e0e0',
          border: '1px solid #999',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Exit Quiz
      </button>
    </div>
  );
}

export default QuizComponent;
