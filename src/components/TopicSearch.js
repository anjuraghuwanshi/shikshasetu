import { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import { getAllTopics } from '../utils/db'; // Correct the path if needed

const TopicSearch = ({ userClass, language, onTopicSelect }) => {
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    async function fetchTopics() {
      try {
        const allTopics = await getAllTopics();
        console.log('Fetched Topics:', allTopics); // Log topics for debugging
        const classTopics = allTopics.filter(
          (t) => t.class === userClass && t.language === language
        );
        setTopics(classTopics);
        setFilteredTopics(classTopics);
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    }

    fetchTopics();
  }, [userClass, language]);

  // Debounced search handler
  const debouncedSearch = debounce((text) => {
    const filtered = topics.filter((topic) =>
      topic.name.toLowerCase().includes(text.toLowerCase()) // Assuming topic has 'name' field
    );
    setFilteredTopics(filtered);
  }, 300); // Delay of 300ms

  const handleSearch = (e) => {
    const text = e.target.value;
    setSearchText(text);
    debouncedSearch(text);  // Call the debounced search function
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <input
        type="text"
        placeholder="Search topic..."
        value={searchText}
        onChange={handleSearch}
        style={{
          padding: '0.5rem',
          width: '100%',
          marginBottom: '1rem',
        }}
      />

      {filteredTopics.length > 0 ? (
        filteredTopics.map((topic) => (
          <div
            key={topic.id}
            style={{
              border: '1px solid #ccc',
              padding: '1rem',
              marginBottom: '0.5rem',
              cursor: 'pointer',
            }}
            onClick={() => onTopicSelect(topic)}
          >
            {topic.name} {/* Changed 'topic.topic' to 'topic.name' assuming topic has 'name' */}
          </div>
        ))
      ) : (
        <p>No topics found for the selected class and language.</p>
      )}
    </div>
  );
};

export default TopicSearch;
