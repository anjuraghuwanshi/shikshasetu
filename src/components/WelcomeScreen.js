// src/components/WelcomeScreen.js
import React, { useEffect, useState } from 'react';
import { getAllProfiles } from '../utils/db';

function WelcomeScreen({ profile, onProceed, onCreateNew, onSwitchProfile }) {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchProfiles() {
      try {
        const all = await getAllProfiles();
        if (isMounted) {
          setProfiles(all);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to load profiles:', err);
        }
      }
    }

    fetchProfiles();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSwitch = async (profileId) => {
    const selected = profiles.find(p => p.id === profileId);
    if (selected) {
      onSwitchProfile(selected);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Welcome back to EduBattle, {profile?.name || 'Student'} 👋</h2>
      <p>You're in Class {profile?.class} - Language: {profile?.language}</p>

      <button onClick={onProceed} style={{ margin: '1rem 1rem 1rem 0' }}>
        Continue
      </button>
      <button onClick={onCreateNew}>Create New Profile</button>

      {profiles.length > 1 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Switch Profile</h3>
          {profiles
            .filter(p => p.id !== profile?.id)
            .map(p => (
              <div key={p.id} style={{ margin: '0.5rem 0' }}>
                <button onClick={() => handleSwitch(p.id)}>
                  {p.name} - Class {p.class} ({p.language})
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default WelcomeScreen;
