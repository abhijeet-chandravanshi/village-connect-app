import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

function Layout() {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Top Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-6">
        <Outlet />
      </main>
      
      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  );
}

export default Layout;

