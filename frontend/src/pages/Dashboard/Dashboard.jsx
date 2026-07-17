import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StoryCard from '../../components/ui/StoryCard';
import StoryEmptyState from '../../components/ui/StoryEmptyState';
import { getStories } from '../../services/storyService';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await getStories();
        setStories(response.data.stories || []);
      } catch (err) {
        console.error('Failed to load stories:', err);
        setError('Failed to load stories. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const handleStoryClick = (story) => {
    if (story.status === 'Ready' || story.status === 'Published') {
      navigate(`/book/${story._id}`);
    } else {
      navigate(`/workspace/${story._id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-dusty-rose" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-medium mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-deep-brown text-warm-ivory px-6 py-2 rounded-full text-sm font-semibold hover:bg-deep-brown/95 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-deep-brown mb-2">My Stories</h1>
          <p className="text-warm-gray text-lg">
            Welcome back, <span className="text-deep-brown font-semibold">{user?.name || 'Writer'}</span>. Continue where you left off or start a new chapter.
          </p>
        </div>
        <button 
          onClick={() => navigate('/create')}
          className="bg-deep-brown text-warm-ivory px-6 py-2.5 rounded-full hover:bg-deep-brown/90 transition-all hover:scale-105 active:scale-[0.98] transition-colors shadow-soft text-sm font-semibold shrink-0"
        >
          Create Story
        </button>
      </div>

      {stories.length === 0 ? (
        <StoryEmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {stories.map((story) => (
            <StoryCard 
              key={story._id} 
              story={{
                ...story,
                id: story._id // support older components expecting .id
              }} 
              onClick={() => handleStoryClick(story)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
