import React from 'react';

const TechnicalArchitecture = () => {
  return (
    <section id="architecture" className="py-5 bg-navy">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-6 fw-bold">The <span className="text-gold">Aurion</span> Stack</h2>
          <p className="opacity-50">Abstracting complexity through modular credit infrastructure</p>
        </div>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="p-4 bg-navy-light border border-secondary rounded-4 h-100">
              <div className="text-gold mb-3 fs-3">01</div>
              <h5 className="fw-bold">Abstraction Layer</h5>
              <p className="small opacity-75">
                Standardized API for credit accounts. Users interact with a single interface 
                regardless of the underlying market.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 border-gold bg-navy-light rounded-4 h-100 shadow-sm">
              <div className="text-gold mb-3 fs-3">02</div>
              <h5 className="fw-bold">Aurion Router</h5>
              <p className="small opacity-75">
                The core logic engine. It enforces borrowing permissions and routes 
                delegated credit to Aave v3 or Compound v3 based on yield and risk.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 bg-navy-light border border-secondary rounded-4 h-100">
              <div className="text-gold mb-3 fs-3">03</div>
              <h5 className="fw-bold">Execution Layers</h5>
              <p className="small opacity-75">
                Passive liquidity pools on Arbitrum. Funds never leave these battle-tested 
                protocols, ensuring maximum security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnicalArchitecture;