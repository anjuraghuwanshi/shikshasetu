import React, { useEffect, useState } from 'react';
import ProfileForm from './components/ProfileSetup';
import WelcomeScreen from './components/WelcomeScreen';
import MainDashboard from './components/MainDashboard';
import { getProfile, storeClassDataIfNeeded } from './utils/db';

function App() {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [screen, setScreen] = useState('loading');

  // Function to load profile and class data
  const loadProfileAndData = async () => {
    try {
      const profile = await getProfile();
      if (profile) {
        await storeClassDataIfNeeded(profile.class,profile.language); // Load class-wise data only if profile exists
        setCurrentProfile(profile);
        setScreen('welcome');
      } else {
        setScreen('create');
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setScreen('create'); // Show create screen if an error occurs while loading
    }
  };

  useEffect(() => {
    loadProfileAndData();
  }, []); // Empty dependency array ensures this runs only on mount

  // Function to handle creating a new profile
  const handleCreate = () => setScreen('create');

  // Function to handle saving a profile
  const handleProfileSaved = async (profile) => {
    try {
      await storeClassDataIfNeeded(profile.class,profile.language);
      setCurrentProfile(profile);
      setScreen('welcome');
    } catch (error) {
      console.error("Error storing class data:", error);
    }
  };

  // Function to handle proceeding to dashboard
  const handleProceed = () => setScreen('dashboard');

  // Function to switch between profiles
  const handleSwitchProfile = async (profile) => {
    try {
      await storeClassDataIfNeeded(profile.class,profile.language);
      setCurrentProfile(profile);
      setScreen('welcome');
    } catch (error) {
      console.error("Error switching profile:", error);
    }
  };

  if (screen === 'loading') return <p>Loading profile...</p>;

  if (screen === 'create') {
    return <ProfileForm onSave={handleProfileSaved} />;
  }

  if (screen === 'welcome') {
    return (
      <WelcomeScreen
        profile={currentProfile}
        onProceed={handleProceed}
        onCreateNew={handleCreate}
        onSwitchProfile={handleSwitchProfile}
      />
    );
  }

  if (screen === 'dashboard') {
    return (
      <MainDashboard
        profile={currentProfile}
        onBackToWelcome={() => setScreen('welcome')}
      />
    );
  }

  return null;
}

export default App;
