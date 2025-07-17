import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-left">
          <h1 className="hero-title">
            Welcome To <span className="gradient-text">KIIT CONNECT</span>
          </h1>
          <p className="hero-subtitle">
            Get Premium Membership at just INR Rs. 99 for the whole semester
          </p>
          <button className="join-community-btn">
            Join Community
          </button>
        </div>

        <div className="hero-right">
          <div className="features-circle">
            <div className="center-logo">
              <div className="logo-container">
                <div className="hexagon-pattern">
                  {Array.from({ length: 19 }, (_, i) => (
                    <div key={i} className={`hex hex-${i + 1}`}></div>
                  ))}
                </div>
                <div className="center-text">
                  <span className="kiit-text">KIIT-CONNECT</span>
                </div>
              </div>
            </div>

            <div className="feature-item monthly-visits">
              <div className="feature-content">
                <div className="feature-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="feature-text">
                  <span className="feature-label">Monthly visits</span>
                  <span className="feature-value">10K+</span>
                </div>
              </div>
            </div>

            <div className="feature-item pyqs">
              <div className="feature-content">
                <span className="feature-value">500+ PYQs</span>
              </div>
            </div>

            <div className="feature-item faculty-review">
              <div className="feature-content">
                <span className="feature-value">Faculty Review</span>
              </div>
            </div>

            <div className="feature-item section-selection">
              <div className="feature-content">
                <span className="feature-value">Section Selection</span>
              </div>
            </div>

            <div className="feature-item faculty-details">
              <div className="feature-content">
                <span className="feature-value">Faculty Details</span>
              </div>
            </div>

            <div className="feature-item connect-kiitians">
              <div className="feature-content">
                <span className="feature-label">Connect with</span>
                <span className="feature-value gradient-text">KIITIANS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="floating-elements">
        <div className="floating-dot dot-1"></div>
        <div className="floating-dot dot-2"></div>
        <div className="floating-dot dot-3"></div>
        <div className="floating-line line-1"></div>
        <div className="floating-line line-2"></div>
      </div>
    </section>
  );
};

export default HeroSection;