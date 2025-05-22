import React, { useEffect, useMemo, useState } from 'react';

// Helper to generate dummy users
const generateDummyUsers = (count = 100, maxScore = 10) => {
  const names = ['Alex', 'Riya', 'Sam', 'John', 'Priya', 'Tina', 'Rohit', 'Zara', 'Aman', 'Lina'];
  const users = [];

  for (let i = 0; i < count; i++) {
    const name = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100);
    const score = Math.floor(Math.random() * (maxScore + 1)); // 0 to maxScore
    const time = Math.floor(Math.random() * 600); // 0 to 10 minutes
    users.push({ name, score, time });
  }

  return users;
};

const LeaderboardComponent = ({ score, timeElapsed, profile, onExit, topic }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const maxScore = topic.quiz.length;

  // Generate dummy users once with correct maxScore
  const dummyUsers = useMemo(() => generateDummyUsers(100, maxScore), [maxScore]);

  useEffect(() => {
    const actualUser = {
      name: profile.name,
      score,
      time: timeElapsed,
      isUser: true
    };

    const allUsers = [...dummyUsers, actualUser];

    // Sort users: higher score first, lower time for tie
    allUsers.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.time - b.time;
    });

    const rank = allUsers.findIndex(u => u.isUser) + 1;
    setUserRank(rank);

    // Show nearby ranks for better UX
    let displayList = [];
    if (rank <= 10) {
      displayList = allUsers.slice(0, 15);
    } else if (rank >= allUsers.length - 5) {
      displayList = allUsers.slice(-15);
    } else {
      displayList = allUsers.slice(rank - 6, rank + 5);
    }

    setLeaderboard(displayList);
  }, [score, timeElapsed, profile, dummyUsers]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>🏆 Leaderboard</h2>
      <p style={{ textAlign: 'center' }}>
        You ranked <strong>#{userRank}</strong> out of 101 students
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={cellStyle}>Rank</th>
            <th style={cellStyle}>Name</th>
            <th style={cellStyle}>Score</th>
            <th style={cellStyle}>Time</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((user, idx) => (
            <tr
              key={idx}
              style={{
                backgroundColor: user.isUser ? '#d1e7dd' : 'transparent',
                fontWeight: user.isUser ? 'bold' : 'normal'
              }}
            >
              <td style={cellStyle}>#{userRank + idx - leaderboard.findIndex(u => u.isUser)}</td>
              <td style={cellStyle}>{user.name}</td>
              <td style={cellStyle}>{user.score}/{maxScore}</td>
              <td style={cellStyle}>{formatTime(user.time)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={onExit}
          style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: '#4caf50',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

const cellStyle = {
  padding: '0.5rem',
  border: '1px solid #ccc',
  textAlign: 'center'
};

export default LeaderboardComponent;
