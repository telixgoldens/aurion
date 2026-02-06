import React from 'react';

const ReputationLayer = () => {
  return (
    <section className="py-5" style={{ background: 'rgba(0,0,0,0.2)' }}>
      <div className="container">
        <div className="row align-items-center g-5">
          {/* Left: Branding & Logic */}
          <div className="col-lg-5">
            <h2 className="display-5 fw-bold mb-4">
              Monetize <span className="text-gold">Reputation</span>
            </h2>
            <p className="opacity-75 mb-4">
              Aurion doesn't just manage liquidity; it guarantees it. By maintaining an on-chain credit state, 
              we allow high-reputation accounts to access delegated risk capital with lower friction.
            </p>
            <ul className="list-unstyled">
              <li className="mb-3 d-flex align-items-center">
                <span className="text-gold me-2">✔</span> 
                <strong>Credit Guarantees:</strong> Protocol-backed safety for lenders.
              </li>
              <li className="mb-3 d-flex align-items-center">
                <span className="text-gold me-2">✔</span> 
                <strong>Reputation Yield:</strong> Earn fees by maintaining a high Aurion Score.
              </li>
            </ul>
          </div>

          {/* Right: The "Aurion Score" Card */}
          <div className="col-lg-7">
            <div className="credit-card-ui border-gold shadow-lg p-5 text-center">
              <div className="mb-3">
                <small className="text-gold uppercase fw-bold tracking-widest">Aurion Credit Identity</small>
              </div>
              <h1 className="display-2 fw-bold text-white mb-2">842</h1>
              <div className="progress mx-auto bg-dark mb-4" style={{ height: '8px', maxWidth: '300px' }}>
                <div className="progress-bar bg-gold" style={{ width: '84%' }}></div>
              </div>
              
              <div className="row g-3 mt-4 text-start">
                <div className="col-6">
                  <div className="p-3 bg-navy-light rounded border border-secondary">
                    <small className="opacity-50">Guarantee Power</small>
                    <p className="fw-bold mb-0 text-gold">$50,000.00</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-navy-light rounded border border-secondary">
                    <small className="opacity-50">Reputation Fee</small>
                    <p className="fw-bold mb-0 text-white">0.25% APY</p>
                  </div>
                </div>
              </div>
              
              <button className="btn btn-gold w-100 mt-4 py-3 fw-bold">
                Mint Credit Guarantee
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReputationLayer;