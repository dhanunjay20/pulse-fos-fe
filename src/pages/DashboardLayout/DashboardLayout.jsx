import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navWrapperRef = useRef(null);
  const [navHeight, setNavHeight] = useState(70);

  // Hide navbar only on /dashboard/home
  const hideNavbar = location.pathname === '/dashboard/home';

  useEffect(() => {
    const measure = () => {
      const el = navWrapperRef.current;
      const candidate = el?.firstElementChild || el;
      const height = candidate ? Math.ceil(candidate.getBoundingClientRect().height) : 70;
      setNavHeight(height);

      document.documentElement.style.setProperty('--navbar-height', `${height}px`);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <div ref={navWrapperRef}>
        <Navbar onLogout={handleLogout} hideNavbar={hideNavbar} />
      </div>

      <main
        className="flex-grow-1 container-fluid p-3"
        style={{ paddingTop: `${navHeight}px` }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;