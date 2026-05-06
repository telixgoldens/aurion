import { Card } from "../components/CoreUi";
import { Button } from "../components/CoreUi";

const markets = [
  {
    name: "Aave Mock Pool",
    page: "aave-pool",
    description: "Supply and borrow USDC from the mock Aave V3 pool on Arbitrum Sepolia.",
    accent: "#4ade80",
    tag: "Aave V3",
  },
  {
    name: "Compound Mock Pool",
    page: "compound-pool",
    description: "Mint cUSDC and borrow from the mock Compound V2 money market.",
    accent: "#22d3ee",
    tag: "Compound V2",
  },
];

function Markets({ onNavigate }) {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl text-white mb-2">Markets</h1>
        <p className="text-sm text-[#F5DEB3]/70">
          Supply and borrow directly from Aurion mock execution layers.
          Every action builds your on-chain credit history.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {markets.map((market) => (
          <Card key={market.name} className="bg-[#1a1f3a] border-[#D4AF37]/20 p-6">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: market.accent, boxShadow: `0 0 6px ${market.accent}` }}
              />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: market.accent }}
              >
                {market.tag}
              </span>
            </div>
            <h2 className="text-xl text-white mb-2">{market.name}</h2>
            <p className="text-sm text-[#F5DEB3]/60 mb-5">{market.description}</p>
            <Button
              className="bg-[#D4AF37] hover:bg-[#C19A2E] text-[#0B1437] font-semibold"
              onClick={() => onNavigate(market.page)}
            >
              Open Market →
            </Button>
          </Card>
        ))}
      </div>

      {/* Credit score callout */}
      <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1a0e2e] border border-[#a78bfa]/30 flex items-center justify-center text-lg">
            ◎
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">
              Activity here powers your Aurion credit score
            </h3>
            <p className="text-sm text-[#F5DEB3]/60 mb-3">
              Your supply, borrow, and repayment history across both pools is fed into the{" "}
              <span className="text-[#a78bfa] font-medium">Arbitrum Stylus score engine</span>{" "}
              — a Rust/WASM contract that computes your 0–1000 credit score and risk tier on-chain.
            </p>
            <Button
              className="bg-transparent border border-[#a78bfa]/40 text-[#a78bfa] hover:bg-[#1a0e2e]"
              onClick={() => onNavigate("dashboard")}
            >
              View Credit Score →
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Markets;