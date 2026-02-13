import React from 'react';
import '../styles/landingPage.css';

const LandingPage = () => {
  return (
    <div className="min-vh-100">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg py-3">
        <div className="container">
          <a className="navbar-brand fw-bold text-white" href="#">
            <span className="text-gold">CREDIT</span> LAYER
          </a>
          <div className="d-none d-md-flex gap-4">
            <a href="#features" className="text-white text-decoration-none opacity-75">Protocol</a>
            <a href="#layers" className="text-white text-decoration-none opacity-75">Execution</a>
            <a href="#risk" className="text-white text-decoration-none opacity-75">Risk</a>
          </div>
          <button className="btn btn-outline-light rounded-pill px-4">Launch App</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section text-center">
        <div className="container">
          <div className="stat-pill mb-4">Target Chain: Arbitrum One</div>
          <h1 className="display-3 fw-bold mb-4">
            A New Way to Manage <br />
            <span className="text-gold">On-Chain Credit</span>
          </h1>
          <p className="lead opacity-75 mb-5 mx-auto" style={{ maxWidth: '700px' }}>
            A non-custodial credit infrastructure aggregating Aave v3 and Compound v3. 
            Enforce permissions, allocate delegated capital, and maintain risk state.
          </p>
          <div className="d-flex justify-content-center gap-3 mb-5">
            <button className="btn btn-gold">Get Started</button>
            <button className="btn btn-link text-white text-decoration-none">Read Docs →</button>
          </div>

          {/* Visual UI Elements inspired by Credly and Stakt */}
          <div className="row justify-content-center mt-5">
            <div className="col-lg-8">
              <div className="credit-card-ui text-start">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">Credit Aggregation</h5>
                  <span className="badge border border-warning text-gold">Live Risk State</span>
                </div>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-3 border border-secondary rounded-3">
                      <small className="opacity-50">Execution Layer</small>
                      <p className="fw-bold mb-0">Aave v3 Pool</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 border border-secondary rounded-3">
                      <small className="opacity-50">Execution Layer</small>
                      <p className="fw-bold mb-0">Compound v3 Pool</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-dark rounded-3 border-start border-gold border-4">
                  <small className="text-gold d-block mb-1">Delegated Credit (Risk Capital)</small>
                  <h3 className="mb-0">$1,240,098.00</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default LandingPage;