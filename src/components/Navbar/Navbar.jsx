import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/fos_logo.png';
import './Navbar.css';

const Navbar = ({ hideNavbar, onLogout }) => {
  if (hideNavbar) return null;

  const navigate = useNavigate();
  const [employee, setEmployee] = useState({ name: '', id: '' });
  const navbarCollapseRef = useRef(null);

  useEffect(() => {
    const empData = JSON.parse(localStorage.getItem('employee'));
    if (empData) {
      setEmployee({ name: empData.name, id: empData.id });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    if (onLogout) onLogout();
    navigate('/login');
  };

  const goHome = () => {
    navigate('/dashboard/home');
  };

  const handleNavLinkClick = () => {
    if (
      navbarCollapseRef.current &&
      navbarCollapseRef.current.classList.contains('show')
    ) {
      new window.bootstrap.Collapse(navbarCollapseRef.current).hide();
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-dark px-3 fixed-top shadow"
      style={{ zIndex: 1030 }}
    >
      <NavLink className="navbar-brand d-flex align-items-center" to="/dashboard/home" onClick={handleNavLinkClick}>
        <img src={logo} alt="Logo" height="40" className="me-2" />
        <span>FOS</span>
      </NavLink>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNavDropdown"
        aria-controls="navbarNavDropdown"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNavDropdown" ref={navbarCollapseRef}>
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          {/* Inventory */}
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              <i className="bi bi-box"></i> Inventory
            </a>
            <ul className="dropdown-menu">
              <li><NavLink className="dropdown-item" to="/dashboard/inventory/view" onClick={handleNavLinkClick}><i className="bi bi-box-seam me-1"></i>View Inventory</NavLink></li>
              <li><NavLink className="dropdown-item" to="/dashboard/inventory/update" onClick={handleNavLinkClick}><i className="bi bi-pencil-square me-1"></i>Update Inventory</NavLink></li>
            </ul>
          </li>

          {/* Products */}
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              <i className="bi bi-bag"></i> Products
            </a>
            <ul className="dropdown-menu">
              <li><NavLink className="dropdown-item" to="/dashboard/products/view" onClick={handleNavLinkClick}><i className="bi bi-card-list me-1"></i>View Products</NavLink></li>
              <li><NavLink className="dropdown-item" to="/dashboard/products/add" onClick={handleNavLinkClick}><i className="bi bi-plus-square me-1"></i>Add Product</NavLink></li>
              <li><NavLink className="dropdown-item" to="/dashboard/products/price" onClick={handleNavLinkClick}><i className="bi bi-currency-dollar me-1"></i>Update Price</NavLink></li>
            </ul>
          </li>

          {/* Sales & Collections */}
          <li className="nav-item">
            <NavLink className="nav-link" to="/dashboard/salescollections" onClick={handleNavLinkClick}>
              <i className="bi bi-cash-coin me-1"></i>Sales & Collections
            </NavLink>
          </li>

          {/* Customers */}
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              <i className="bi bi-people"></i> Customers
            </a>
            <ul className="dropdown-menu">
              <li><NavLink className="dropdown-item" to="/dashboard/customers/view" onClick={handleNavLinkClick}><i className="bi bi-person-lines-fill me-1"></i>View Customers</NavLink></li>
              <li><NavLink className="dropdown-item" to="/dashboard/customers/add" onClick={handleNavLinkClick}><i className="bi bi-person-plus me-1"></i>Add Customer</NavLink></li>
            </ul>
          </li>

          {/* Expenses */}
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              <i className="bi bi-receipt"></i> Expenses
            </a>
            <ul className="dropdown-menu">
              <li><NavLink className="dropdown-item" to="/dashboard/expenses/view" onClick={handleNavLinkClick}><i className="bi bi-list-ul me-1"></i>View Expenses</NavLink></li>
              <li><NavLink className="dropdown-item" to="/dashboard/expenses/add" onClick={handleNavLinkClick}><i className="bi bi-plus-lg me-1"></i>Add Expense</NavLink></li>
              <li><NavLink className="dropdown-item" to="/dashboard/expenses/add-category" onClick={handleNavLinkClick}><i className="bi bi-folder-plus me-1"></i>Add Category</NavLink></li>
            </ul>
          </li>

          {/* Documents */}
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              <i className="bi bi-folder2-open"></i> Documents
            </a>
            <ul className="dropdown-menu">
              <li><NavLink className="dropdown-item" to="/dashboard/documents/view" onClick={handleNavLinkClick}><i className="bi bi-file-earmark-text me-1"></i>View Documents</NavLink></li>
              <li><NavLink className="dropdown-item" to="/dashboard/documents/upload" onClick={handleNavLinkClick}><i className="bi bi-upload me-1"></i>Upload Documents</NavLink></li>
            </ul>
          </li>
        </ul>

        {/* Right side: employee and logout */}
        <div className="d-flex align-items-center text-white gap-3">
          <span>{employee.name} (ID: {employee.id})</span>
          <button className="btn btn-outline-light btn-sm" onClick={goHome}>Home</button>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;