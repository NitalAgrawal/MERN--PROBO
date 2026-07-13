import { useNavigate } from 'react-router-dom';
import StoryCard from '../../components/ui/StoryCard';
import StoryEmptyState from '../../components/ui/StoryEmptyState';

const mockStories = []; // Empty array to demonstrate the empty state

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-deep-brown mb-2">My Stories</h1>
          <p className="text-warm-gray text-lg">Continue where you left off or start a new chapter.</p>
        </div>
        <button 
          onClick={() => navigate('/create')}
          className="bg-deep-brown text-warm-ivory px-6 py-2.5 rounded-full hover:bg-deep-brown/90 transition-colors shadow-soft text-sm font-medium"
        >
          Create Memory
        </button>
      </div>

      {mockStories.length === 0 ? (
        <StoryEmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {mockStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
