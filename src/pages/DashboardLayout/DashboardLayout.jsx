import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';

const DashboardLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100">

      <Navbar onLogout={handleLogout} />

      <main className="flex-grow-1 container-fluid p-3 bg-light">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
