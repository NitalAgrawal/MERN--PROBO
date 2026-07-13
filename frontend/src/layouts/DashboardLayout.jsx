import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-warm-ivory flex">
      {/* Sidebar will go here */}
      <aside className="w-64 border-r border-warm-gray/20 hidden md:block p-6">
        <div className="text-xl font-serif font-bold text-deep-brown mb-10">StoryNest</div>
        {/* Navigation items */}
      </aside>
      
      <main className="flex-1 flex flex-col">
        {/* Topbar will go here */}
        <header className="h-16 border-b border-warm-gray/20 flex items-center px-8">
          <span className="text-sm font-medium text-warm-gray">Dashboard</span>
        </header>

        <div className="p-8 flex-grow">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
