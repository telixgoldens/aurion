# Aurion Protocol

> Cross-Protocol Credit Aggregation and Risk Control Layer for DeFi

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-blue)](https://docs.soliditylang.org)
[![Foundry](https://img.shields.io/badge/Built%20with-Foundry-red)](https://getfoundry.sh/)

Aurion is a non-custodial credit layer that operates above existing DeFi money markets (Aave, Compound) to enable cross-protocol credit aggregation, delegated credit infrastructure, and institutional-grade risk management.

## Overview

Traditional DeFi lending protocols conflate two distinct functions: **liquidity provision** and **credit risk underwriting**. Aurion separates these concerns by introducing a meta-layer that:

- **Aggregates** user positions across multiple protocols into unified credit accounts
- **Enforces** sophisticated risk controls through mandatory routing architecture  
- **Enables** delegated credit pools that backstop risk without deploying liquidity
- **Maintains** non-custodial operations - never touching user collateral or borrowed assets

## Key Features

### Cross-Protocol Credit Aggregation
Users maintain a single credit identity spanning Aave, Compound, and other supported protocols. Borrow capacity is calculated at the portfolio level rather than per-protocol.

### Delegated Credit Infrastructure
Third-party **Credit Providers** deposit capital into isolated pools that:
- Act as loss-absorbing buffers (not actively lent)
- Enable borrowers to exceed vanilla protocol LTV limits
- Earn fees from credit utilization independent of lending interest

### Mandatory Router Architecture
All borrows execute through Aurion's **Credit Router**, which:
- Validates aggregate credit eligibility pre-transaction
- Routes approved borrows to underlying protocols via adapters
- Updates internal credit state post-execution
- Enforces protocol-wide risk invariants

### Portable Credit Scores
On-chain credit scoring based on:
- Historical health factor maintenance
- Repayment consistency
- Position diversification
- Cross-protocol behavior

##  Architecture

```
┌─────────────────────────────────────────────────┐
│                     User                        │
└────────────────┬────────────────────────────────┘
                 │
    ┌────────────▼────────────────┐
    │   Credit Account (Aurion)  │
    │  - Aggregated collateral   │
    │  - Total debt              │
    │  - Credit score            │
    │  - Delegated credit        │
    └────────────┬────────────────┘
                 │
    ┌────────────▼────────────────┐
    │    Credit Router (Aurion)  │
    │  - Validates eligibility   │
    │  - Enforces risk limits    │
    └──────┬──────────────┬────────┘
           │              │
    ┌──────▼─────┐  ┌────▼────────┐
    │    Aave    │  │  Compound   │
    │(Collateral │  │(Collateral) │
    │  + Debt)   │  │  + Debt)    │
    └────────────┘  └─────────────┘
```

### Core Contracts

- **CreditManager.sol** - Central state coordinator for all credit accounts
- **CreditRouter.sol** - Borrow request gateway and validation engine
- **CreditAccount.sol** - Per-user position abstraction
- **CreditPool.sol** - Delegated credit capital management
- **InsuranceFund.sol** - Protocol backstop mechanism
- **RiskOracle.sol** - Price feeds and volatility monitoring
- **AaveAdapter.sol** / **CompoundAdapter.sol** - Protocol-specific integrations

##  How It Works

### Borrow Flow

1. **User deposits collateral** directly on Aave or Compound (Aurion never custodies)
2. **User requests borrow** through Aurion's Credit Router
3. **Router validates**:
   - Aggregated LTV across all protocols
   - Credit score meets tier requirements
   - Delegated credit backing is sufficient
   - Protocol health factors remain safe
4. **Router executes** borrow on underlying protocol via adapter
5. **Router updates** internal credit state and fee accounting

### Delegated Credit

**Credit Providers** deposit into pools → Capital backs borrower guarantees → Borrowers access higher LTV → Providers earn fees

**Loss Waterfall** (if liquidation occurs):
1. Borrower's own collateral
2. Insurance Fund
3. Delegated Credit Pool capital

##  Security

### Invariant Enforcement

```solidity
// Fundamental protocol invariants
totalCollateralValue + delegatedCreditValue >= totalDebtValue
protocol_health_factor[i] >= min_safe_health_factor  // For all protocols
Σ(allocated_credit) <= pool_capital + insurance_fund
user_ltv <= max_ltv[risk_tier]
```

### Formal Verification
- **Certora Prover** - Core invariant verification
- **Foundry Invariant Tests** - Automated fuzzing
- **Scribble** - Runtime assertion instrumentation

### Audits
- Planned audits from tier-1 security firms
- Public bug bounty program
- Staged rollout with TVL caps

## Risk Tiers

| Risk Tier    | Max LTV | Credit Fee | Min Credit Score |
|--------------|---------|------------|------------------|
| Conservative | 75%     | 2% APR     | 700              |
| Moderate     | 85%     | 4% APR     | 500              |
| Aggressive   | 95%     | 7% APR     | 300              |

##  Development

### Prerequisites

- [Foundry](https://getfoundry.sh/)
- Node.js >= 16
- Git

### Installation

```bash
git clone https://github.com/yourorg/aurion-protocol
cd aurion-protocol
forge install
npm install
```

### Build

```bash
forge build
```

### Test

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test file
forge test --match-path test/CreditRouter.t.sol

# Run invariant tests
forge test --match-contract Invariant
```

### Coverage

```bash
forge coverage
```

### Deploy (Local)

```bash
# Start local node
anvil

# Deploy (in another terminal)
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Deploy (Arbitrum Sepolia)

```bash
forge script script/Deploy.s.sol \
  --rpc-url $ARBITRUM_SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

## Project Structure

```
aurion-protocol/
├── contracts/
│   ├── core/
│   │   ├── CreditManager.sol
│   │   ├── CreditRouter.sol
│   │   └── CreditAccount.sol
│   ├── pools/
│   │   ├── CreditPool.sol
│   │   └── InsurancePool.sol
│   ├── insurance/
│   │   └── InsuranceFund.sol
│   ├── interfaces/
│   │   ├── IAave.sol
│   │   ├── ICompound.sol
│   │   └── ICreditManager.sol
│   ├── libraries/
│   │   ├── Errors.sol
│   │   └── RiskMath.sol
│   ├── adapters/
│   │   ├── AaveAdapter.sol
│   │   ├── CompoundAdapter.sol
│   ├── oracle/
│   │   └── CreditOracle.sol
│   ├── fees/
│   │   ├── FeeController.sol
│   │   └── LiquidationController.sol
│   └── governance/
│       ├── CreditGovernor.sol
│       └── RiskCouncil.sol
├── test/
│   ├── unit/
│   ├── integration/
│   └── invariant/
├── script/
│   ├── Deploy.s.sol
│   └── Upgrade.s.sol
├── docs/
│   └── whitepaper.pdf
└── foundry.toml
```

## Roadmap

### Phase 1: Foundation (Months 1-4)
- ✅ Core contracts implementation
- ✅ Aave adapter
- ✅ Basic risk engine
- 🔄 Testnet deployment
- 🔄 Initial test coverage

### Phase 2: Expansion (Months 5-8)
-  Compound adapter
-  Delegated Credit Pools
-  Credit scoring system
-  Insurance Fund
-  Security audits
-  Mainnet beta (capped TVL)

### Phase 3: Maturity (Months 9-12)
-  Tradable credit positions
-  DAO account types
-  Structured credit products
-  Full governance activation
-  TVL cap removal

## Deployment

### Arbitrum Sepolia (Testnet)
- **CreditManager**: `0x...` (TBD)
- **CreditRouter**: `0x...` (TBD)
- **AaveAdapter**: `0x...` (TBD)

### Arbitrum One (Mainnet)
- Coming Q2 2026

## Economics

### Fee Distribution
- **70%** → Credit Providers (proportional to allocated capital)
- **20%** → Insurance Fund (backstop accumulation)
- **10%** → Protocol Treasury (development & operations)

### Token
- **Governance**: Parameter voting, Risk Council election
- **No inflation**: Fees fund operations, no token emissions
- **Backstop**: Token staking may participate in insurance backstop (future)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`forge test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use NatSpec comments for all public/external functions
- Maintain >95% test coverage
- Run `forge fmt` before committing

##  Documentation

- [Whitepaper](docs/whitepaper.pdf) - Comprehensive protocol specification
- [Technical Docs](docs/technical/) - In-depth implementation details
- [User Guide](docs/user-guide.md) - How to use Aurion
- [Integration Guide](docs/integration.md) - For protocol integrators
- [API Reference](docs/api/) - Contract interfaces

## 🔗 Links

- **Website**: [aurion.finance](https://aurion.finance) (Coming soon)
- **Discord**: [Join our community](https://discord.gg/aurion)
- **Twitter**: [@AurionProtocol](https://twitter.com/AurionProtocol)
- **Docs**: [docs.aurion.finance](https://docs.aurion.finance)
- **Blog**: [blog.aurion.finance](https://blog.aurion.finance)

## ⚠️ Disclaimer

This software is in active development and has not been audited. Use at your own risk. Never deposit funds you cannot afford to lose.

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Aave Protocol for pioneering DeFi lending
- Compound Finance for protocol design patterns
- Arbitrum for scalable L2 infrastructure
- OpenZeppelin for secure contract primitives

---

**Built with ❤️ for the future of decentralized credit**

For questions or support, reach out on [Discord](https://discord.gg/aurion) or open an issue.
