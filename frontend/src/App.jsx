import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Guard Components
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicOnlyRoute from './components/common/PublicOnlyRoute';
import { AuthProvider } from './context/AuthContext';

// Pages
import Landing from './pages/Landing/Landing';
import Dashboard from './pages/Dashboard/Dashboard';
import CreateMemory from './pages/CreateMemory/CreateMemory';
import Workspace from './pages/Workspace/Workspace';
import BookReveal from './pages/BookReveal/BookReveal';
import BookPreview from './pages/BookPreview/BookPreview';
import BookEditor from './pages/BookEditor/BookEditor';
import NotFound from './pages/NotFound/NotFound';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes under PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route 
              path="/login" 
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicOnlyRoute>
                  <ForgotPassword />
                </PublicOnlyRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Route>
          
          {/* Protected Dashboard Routes */}
          <Route 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          
          {/* Protected Standalone Full-screen Routes */}
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <CreateMemory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workspace/:storyId" 
            element={
              <ProtectedRoute>
                <Workspace />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/book-reveal" 
            element={
              <ProtectedRoute>
                <BookReveal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/book-reveal/:storyId" 
            element={
              <ProtectedRoute>
                <BookReveal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/book/:storyId" 
            element={
              <ProtectedRoute>
                <BookPreview />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/book-editor/:storyId" 
            element={
              <ProtectedRoute>
                <BookEditor />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
