import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import Festivals from './pages/Festivals';
import FestivalDetail from './pages/FestivalDetail';
import Contribute from './pages/Contribute';
import Gallery from './pages/Gallery';
import Profile from './pages/Profile';
import MyContributions from './pages/MyContributions';
import Notifications from './pages/Notifications';
import Transparency from './pages/Transparency';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import VerifyContributions from './pages/admin/VerifyContributions';
import ManageFestivals from './pages/admin/ManageFestivals';
import ManageExpenses from './pages/admin/ManageExpenses';
import UploadPhotos from './pages/admin/UploadPhotos';
import SendNotification from './pages/admin/SendNotification';
import ManageMembers from './pages/admin/ManageMembers';

// Loading Component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br from-primary-500 to-saffron-500 animate-pulse flex items-center justify-center">
          <span className="text-white font-bold text-xl">UC</span>
        </div>
        <p className="text-earth-600 animate-pulse">लोड हो रहा है...</p>
      </div>
      </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isNewUser) {
    return <Navigate to="/profile-setup" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Public Route Component (redirects to home if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user && !user.isNewUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      
      <Route
        path="/profile-setup"
        element={
          <ProtectedRoute>
            <ProfileSetup />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes with Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="festivals" element={<Festivals />} />
        <Route path="festivals/:id" element={<FestivalDetail />} />
        <Route path="contribute/:festivalId" element={<Contribute />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="profile" element={<Profile />} />
        <Route path="my-contributions" element={<MyContributions />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="transparency" element={<Transparency />} />
        <Route path="transparency/:festivalId" element={<Transparency />} />

        {/* Admin Routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/verify-contributions"
          element={
            <ProtectedRoute adminOnly>
              <VerifyContributions />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/manage-festivals"
          element={
            <ProtectedRoute adminOnly>
              <ManageFestivals />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/manage-expenses"
          element={
            <ProtectedRoute adminOnly>
              <ManageExpenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/upload-photos"
          element={
            <ProtectedRoute adminOnly>
              <UploadPhotos />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/send-notification"
          element={
            <ProtectedRoute adminOnly>
              <SendNotification />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/manage-members"
          element={
            <ProtectedRoute adminOnly>
              <ManageMembers />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
