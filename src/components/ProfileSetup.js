// src/components/ProfileSetup.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { saveProfile } from '../utils/db';
import '../css/ProfileSetup.css'; // Import the CSS file

function ProfileSetup({ onSave }) {
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [language, setLanguage] = useState('English');

  const handleSubmit = async () => {
    if (!name.trim() || !studentClass.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    const profile = {
      name: name.trim(),
      class: studentClass.trim(),
      language,
    };

    try {
      const savedProfile = await saveProfile(profile);
      if (typeof onSave === 'function') {
        onSave(savedProfile);
      } else {
        console.error('onSave is not a function');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="profile-setup-container">
      <div className="profile-card">
        <h2 className="title">Welcome to ShikshaSetu 👋</h2>
        <p className="subtitle">Create your profile to get started</p>

        <label htmlFor="name">Your Name</label>
        <input
          id="name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <label htmlFor="class">Class (1 to 12)</label>
        <input
          id="class"
          type="number"
          min="1"
          max="12"
          placeholder="Enter your class"
          value={studentClass}
          onChange={e => setStudentClass(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <label htmlFor="language">Preferred Language</label>
        <select
          id="language"
          value={language}
          onChange={e => setLanguage(e.target.value)}
        >
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
        </select>

        <button onClick={handleSubmit}>Create Profile</button>
      </div>
    </div>
  );
}

ProfileSetup.propTypes = {
  onSave: PropTypes.func.isRequired,
};

export default ProfileSetup;

