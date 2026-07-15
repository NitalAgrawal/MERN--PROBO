import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Landing from './pages/Landing/Landing';
import Dashboard from './pages/Dashboard/Dashboard';
import CreateMemory from './pages/CreateMemory/CreateMemory';
import Workspace from './pages/Workspace/Workspace';
import BookReveal from './pages/BookReveal/BookReveal';
import BookPreview from './pages/BookPreview/BookPreview';
import BookEditor from './pages/BookEditor/BookEditor';
import NotFound from './pages/NotFound/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        
        {/* Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        
        {/* Standalone Full-screen Routes */}
        <Route path="/create" element={<CreateMemory />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/book-reveal" element={<BookReveal />} />
        <Route path="/book-reveal/:storyId" element={<BookReveal />} />
        <Route path="/book/:storyId" element={<BookPreview />} />
        <Route path="/book-editor/:storyId" element={<BookEditor />} />

        {/* We will add Auth routes in the next steps */}
      </Routes>
    </Router>
  );
}

export default App;
