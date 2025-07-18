import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">RoadmapApp</Link>
      </div>
      
      <div className="navbar-nav">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/users" className="nav-link">Users</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
        <Link to="/settings" className="nav-link">Settings</Link>
      </div>

      <div className="navbar-user">
        <span className="user-name">Welcome, {currentUser?.name || 'User'}</span>
        <button className="btn btn-outline" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;