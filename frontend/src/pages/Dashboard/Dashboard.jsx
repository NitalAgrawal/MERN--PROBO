import { useNavigate } from 'react-router-dom';
import StoryCard from '../../components/ui/StoryCard';
import StoryEmptyState from '../../components/ui/StoryEmptyState';
import { mockStories } from '../../data/stories';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStoryClick = (story) => {
    if (story.status === 'Completed' || story.status === 'Published') {
      navigate(`/book/${story.id}`);
    } else {
      navigate(`/book-reveal/${story.id}`);
    }
  };

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
          Create Memory
        </button>
      </div>

      {mockStories.length === 0 ? (
        <StoryEmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {mockStories.map((story) => (
            <StoryCard 
              key={story.id} 
              story={story} 
              onClick={() => handleStoryClick(story)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
