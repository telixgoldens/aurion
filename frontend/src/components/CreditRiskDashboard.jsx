// CreditRiskDashboard.jsx
import React from 'react';

const CreditRiskDashboard = () => {
  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="credit-card-ui">
            {/* Header with Protocol Status */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary">
              <div>
                <h4 className="fw-bold mb-1">Active Credit Accounts</h4>
                <p className="text-gold small mb-0">● Protocol Health: 98.4%</p>
              </div>
              <div className="text-end">
                <small className="opacity-50 d-block">Total Value Locked (TVL)</small>
                <h5 className="fw-bold">$14.2M</h5>
              </div>
            </div>

            {/* Risk State Table */}
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle custom-table">
                <thead>
                  <tr className="text-gold opacity-75 small uppercase">
                    <th>Account Holder</th>
                    <th>Execution Layer</th>
                    <th>Allocated Credit</th>
                    <th>Utilization</th>
                    <th>Risk Factor</th>
                  </tr>
                </thead>
                <tbody className="small">
                  <tr>
                    <td>0x71C...4a2b</td>
                    <td><span className="badge bg-navy border border-secondary">Aave v3</span></td>
                    <td className="fw-bold text-white">250,000 USDC</td>
                    <td>
                      <div className="progress bg-dark" style={{height: '6px'}}>
                        <div className="progress-bar bg-gold" style={{width: '65%'}}></div>
                      </div>
                    </td>
                    <td className="text-success">Low</td>
                  </tr>
                  <tr>
                    <td>0x3aF...9e11</td>
                    <td><span className="badge bg-navy border border-secondary">Compound v3</span></td>
                    <td className="fw-bold text-white">120,500 USDT</td>
                    <td>
                      <div className="progress bg-dark" style={{height: '6px'}}>
                        <div className="progress-bar bg-warning" style={{width: '82%'}}></div>
                      </div>
                    </td>
                    <td className="text-warning">Medium</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Router Logic Visual */}
            <div className="mt-4 p-3 rounded bg-navy-light border border-secondary d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div className="router-icon">⌥</div>
                <div>
                  <small className="text-gold d-block">Routing Engine</small>
                  <span className="small opacity-75">Optimizing credit flow between Arbitrum markets</span>
                </div>
              </div>
              <button className="btn btn-sm btn-gold">Manage Allocation</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditRiskDashboard;