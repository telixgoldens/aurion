import React from 'react';
import '../styles/appFooter.css';

const AppFooter = () => {
  return (
    <footer className="app-footer">
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center">
          
          {/* Left: Protocol Status & Version */}
          <div className="d-flex align-items-center gap-4">
            <div className="status-indicator">
              <span className="dot pulse"></span>
              <span className="status-text text-gold small fw-bold">AURION v1.0</span>
            </div>
            <div className="d-none d-md-flex gap-3 border-start border-secondary ps-4">
              <a href="#" className="app-footer-link">Docs</a>
              <a href="#" className="app-footer-link">Governance</a>
              <a href="#" className="app-footer-link">Security</a>
            </div>
          </div>

          {/* Right: Network & Socials */}
          <div className="d-flex align-items-center gap-4">
            <div className="network-pill d-none d-sm-flex">
              <span className="network-dot"></span>
              Arbitrum One
            </div>
            <div className="d-flex gap-3 social-icons">
              <a href="#" className="app-footer-link" aria-label="Discord">
                <i className="bi bi-discord"></i>
              </a>
              <a href="#" className="app-footer-link" aria-label="Twitter">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="#" className="app-footer-link" aria-label="Github">
                <i className="bi bi-github"></i>
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default AppFooter;