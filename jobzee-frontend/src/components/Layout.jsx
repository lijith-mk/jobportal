import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Hide global navbar/footer on admin and app dashboards
  const isAdminRoute = location.pathname.startsWith('/admin');
  const hiddenNavbarRoutes = ['/dashboard', '/employer/dashboard'];
  const shouldHideNavbar = isAdminRoute || hiddenNavbarRoutes.includes(location.pathname);
  
  return (
    <div className="min-h-screen flex flex-col">
      {!shouldHideNavbar && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default Layout; 