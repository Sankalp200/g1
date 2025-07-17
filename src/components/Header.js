import React, { useState } from 'react';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <div className="logo-icon">
            <div className="logo-layers">
              <div className="layer"></div>
              <div className="layer"></div>
              <div className="layer"></div>
            </div>
          </div>
          <span className="logo-text">
            KIIT-<span className="gradient-text">CONNECT</span>
          </span>
        </div>

        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <a href="#home" className="nav-link active">Home</a>
          <div className="nav-dropdown">
            <a href="#tools" className="nav-link">
              More Tools <i className="fas fa-chevron-down"></i>
            </a>
          </div>
          <a href="#notes" className="nav-link">Notes/PYQS/Videos</a>
          <a href="#reset" className="nav-link">Reset Login</a>
          <a href="#helpdesk" className="nav-link">
            Helpdesk<span className="live-indicator">(Live Now)</span>
          </a>
          <a href="#section" className="nav-link">
            Section Selection Pack<span className="book-now">(BOOK NOW)</span>
          </a>
        </nav>

        <div className="header-actions">
          <button className="login-btn">Login</button>
          <button className="premium-btn">Get Premium</button>
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;