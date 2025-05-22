import { openDB } from 'idb';

// Initialize the IndexedDB
export function initDB() {
  return openDB('EduBattleDB', 4, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains('profiles')) {
        db.createObjectStore('profiles', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }

      let topicStore;
      if (!db.objectStoreNames.contains('topics')) {
        topicStore = db.createObjectStore('topics', { keyPath: 'id' });
      } else {
        topicStore = db.transaction(['topics'], 'versionchange').objectStore('topics');
      }

      if (topicStore && !topicStore.indexNames.contains('class')) {
        topicStore.createIndex('class', 'class');
      }

      if (!db.objectStoreNames.contains('results')) {
        db.createObjectStore('results', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains('activeProfile')) {
        db.createObjectStore('activeProfile');
      }
    },
  });
}

// Save new profile and set it active
export async function saveProfile(profile) {
  const db = await initDB();
  const tx = db.transaction(['profiles', 'activeProfile'], 'readwrite');
  const profileStore = tx.objectStore('profiles');
  const activeStore = tx.objectStore('activeProfile');

  const id = await profileStore.add(profile);
  await activeStore.put(id, 'current');

  await tx.done;
  return { ...profile, id };
}

// Get current profile
export async function getProfile() {
  const db = await initDB();
  const activeStore = db.transaction('activeProfile').objectStore('activeProfile');
  const id = await activeStore.get('current');
  if (!id) return null;

  const profileStore = db.transaction('profiles').objectStore('profiles');
  return await profileStore.get(id);
}

// Get all profiles
export async function getAllProfiles() {
  const db = await initDB();
  const tx = db.transaction('profiles', 'readonly');
  return await tx.objectStore('profiles').getAll();
}

// Set current active profile
export async function setActiveProfile(id) {
  const db = await initDB();
  const tx = db.transaction('activeProfile', 'readwrite');
  await tx.objectStore('activeProfile').put(id, 'current');
  await tx.done;
}

// Save quiz result
export async function saveResult(result) {
  const db = await initDB();
  const tx = db.transaction('results', 'readwrite');
  await tx.objectStore('results').add(result);
  await tx.done;
}

// Get all topics
export async function getAllTopics() {
  const db = await initDB();
  const tx = db.transaction('topics', 'readonly');
  return await tx.objectStore('topics').getAll();
}

// Store class data only if not already stored
export async function storeClassDataIfNeeded(userClass,userLanguage) {
  const db = await initDB();
  let alreadyStored = false;
  const lan = userLanguage.toLowerCase()
  try {
    const tx = db.transaction('topics', 'readonly');
    const store = tx.objectStore('topics');
    const index = store.index('class');
    const existing = await index.getAll(userClass);
    alreadyStored = existing.length > 0;
    await tx.done;
  } catch (error) {
    console.error('Error checking IndexedDB:', error);
  }

  if (!alreadyStored) {
    try {

      const response = await fetch(`${process.env.PUBLIC_URL}/data/${lan}/class-${userClass}.json`);
      if (!response.ok) throw new Error(`Failed to fetch class data: ${response.statusText}`);

      const topics = await response.json();
      const tx = db.transaction('topics', 'readwrite');
      const store = tx.objectStore('topics');
      for (const rawTopic of topics) {
        if (rawTopic.topic && rawTopic.language) {
          const id = crypto.randomUUID();
          const processedTopic = {
            ...rawTopic,
            id,
            class: userClass,
            title: rawTopic.topic, // remap "topic" to "title"
          };
          await store.put(processedTopic);
        } else {
          console.warn('Skipping invalid topic:', rawTopic);
        }
      }

      await tx.done;
      console.log(`Successfully stored class-${userClass} data.`);
    } catch (err) {
      console.error(`Error storing class-${userClass} data:`, err);
    }
  } else {
    console.log(`Class-${userClass} data already exists in IndexedDB.`);
  }
}

// Search topics by query and class
export async function searchContent(query, userClass) {
  const db = await initDB();
  const tx = db.transaction('topics', 'readonly');
  const store = tx.objectStore('topics');
  let allTopics = [];

  try {
    const index = store.index('class');
    allTopics = await index.getAll(userClass);

    const filtered = allTopics.filter((topic) =>
      topic.title.toLowerCase().includes(query.toLowerCase())
    );

    await tx.done;
    return filtered;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}
