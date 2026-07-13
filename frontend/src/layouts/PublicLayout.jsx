import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar will go here */}
      <header className="py-6 px-8 border-b border-warm-gray/20">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-serif font-bold text-deep-brown">StoryNest</div>
        </nav>
      </header>
      
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer will go here */}
    </div>
  );
};

export default PublicLayout;
