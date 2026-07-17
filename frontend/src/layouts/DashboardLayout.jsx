import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-warm-ivory flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-warm-gray/10 hidden md:flex flex-col justify-between p-6 bg-white shadow-soft relative z-10">
        <div>
          {/* Logo */}
          <div className="text-2xl font-serif font-bold text-deep-brown mb-10 tracking-tight flex items-center gap-2">
            <span className="text-dusty-rose">✦</span> StoryNest
          </div>
          
          {/* Navigation items */}
          <nav className="space-y-1.5">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-soft-beige text-deep-brown shadow-sm' 
                    : 'text-warm-gray hover:bg-warm-ivory/50 hover:text-deep-brown'
                }`
              }
            >
              <BookOpen size={18} />
              My Stories
            </NavLink>
            <NavLink 
              to="/explore" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-soft-beige text-deep-brown shadow-sm' 
                    : 'text-warm-gray hover:bg-warm-ivory/50 hover:text-deep-brown'
                }`
              }
            >
              <Compass size={18} />
              Explore
            </NavLink>
          </nav>
        </div>

        {/* User profile & Logout block at bottom */}
        {user && (
          <div className="border-t border-warm-gray/10 pt-6 mt-auto">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-10 h-10 rounded-full border border-warm-gray/20 bg-warm-ivory object-cover shadow-sm"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-deep-brown truncate">{user.name}</p>
                <p className="text-xs text-warm-gray truncate font-medium">{user.email}</p>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 bg-warm-ivory hover:bg-red-50 text-warm-gray hover:text-red-600 py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors duration-200 border border-warm-gray/10 hover:border-red-100"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 border-b border-warm-gray/10 flex justify-between items-center px-8 bg-white/50 backdrop-blur-md sticky top-0 z-20">
          <span className="text-sm font-bold text-warm-gray font-serif italic">Dashboard</span>
          
          {/* Header Mobile / Tablet avatar */}
          {user && (
            <div className="flex items-center gap-4 md:hidden">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-8 h-8 rounded-full border border-warm-gray/20 bg-warm-ivory"
              />
              <button 
                onClick={logout}
                className="text-warm-gray hover:text-red-600 transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </header>

        {/* Dynamic Page Content */}
        <div className="p-8 flex-grow overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
