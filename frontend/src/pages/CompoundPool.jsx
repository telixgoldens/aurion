import { useState } from "react";
import { Card, Button } from "../components/CoreUi";
import { Input } from "../components/Inputs";
import { useMarketPool } from "../hooks/useMarketPool";
import { getMockCompoundPool } from "../lib/contracts";

function CompoundPool({ onNavigate }) {
  const { stats, loading, deposit, withdraw, borrow, repay } = useMarketPool(getMockCompoundPool);
  const [amount, setAmount] = useState("");
  const [tab, setTab] = useState("deposit");

  const actions = {
    deposit: () => deposit(amount),
    withdraw: () => withdraw(amount),
    borrow: () => borrow(amount),
    repay: () => repay(amount),
  };

  const tabLabels = ["deposit", "withdraw", "borrow", "repay"];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Back button */}
      <button
        onClick={() => onNavigate("markets")}
        className="flex items-center gap-2 text-sm text-[#F5DEB3]/60 hover:text-[#D4AF37] transition-colors"
      >
        ← Back to Markets
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#22d3ee] shadow-[0_0_6px_#22d3ee]" />
          <span className="text-xs text-[#22d3ee] font-semibold tracking-widest uppercase">Compound V2 · Mock</span>
        </div>
        <h1 className="text-2xl text-white mb-1">Compound Pool</h1>
        <p className="text-sm text-[#F5DEB3]/70">
          Mint cUSDC, borrow against it, and earn interest as the exchange rate grows.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-4">
          <div className="text-xs text-[#F5DEB3]/50 mb-1">Supply APY</div>
          <div className="text-[#22d3ee] text-xl font-bold">{stats.supplyApy?.toFixed(2) ?? "—"}%</div>
        </Card>
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-4">
          <div className="text-xs text-[#F5DEB3]/50 mb-1">Borrow APY</div>
          <div className="text-[#f472b6] text-xl font-bold">{stats.borrowApy?.toFixed(2) ?? "—"}%</div>
        </Card>
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-4">
          <div className="text-xs text-[#F5DEB3]/50 mb-1">Total Deposits</div>
          <div className="text-white text-xl">{stats.totalDeposits.toFixed(2)} USDC</div>
        </Card>
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-4">
          <div className="text-xs text-[#F5DEB3]/50 mb-1">Utilization</div>
          <div className="text-white text-xl">{stats.utilization.toFixed(2)}%</div>
          <div className="mt-2 h-1 rounded bg-[#0B1437] overflow-hidden">
            <div
              className="h-full rounded transition-all duration-700"
              style={{
                width: `${Math.min(stats.utilization, 100)}%`,
                background: stats.utilization > 90 ? "#f87171" : stats.utilization > 80 ? "#fb923c" : "#22d3ee",
              }}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Position */}
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-6 space-y-4">
          <h2 className="text-white text-lg">Your Position</h2>

          {/* cToken balance highlight */}
          <div className="rounded-lg bg-[#0B1437] border border-[#22d3ee]/10 p-4">
            <div className="text-xs text-[#22d3ee]/60 uppercase tracking-widest mb-1">cUSDC Balance</div>
            <div className="text-[#22d3ee] text-2xl font-bold">
              {stats.cTokenBalance?.toFixed(4) ?? "—"}
            </div>
            <div className="text-xs text-[#F5DEB3]/50 mt-1">
              ≈ {stats.userDeposit.toFixed(2)} USDC
            </div>
            {stats.exchangeRate != null && (
              <div className="text-xs text-[#F5DEB3]/40 mt-2">
                Exchange rate: {stats.exchangeRate.toFixed(6)}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#F5DEB3]/60">Wallet Balance</span>
              <span className="text-white font-medium">{stats.usdcBalance.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#F5DEB3]/60">Borrowed</span>
              <span className="text-[#f472b6] font-medium">{stats.userDebt.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#F5DEB3]/60">Available to Borrow</span>
              <span className="text-white font-medium">{stats.availableLiquidity?.toFixed(2) ?? "—"} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#F5DEB3]/60">Collateral Factor</span>
              <span className="text-white font-medium">{stats.collateralFactor ?? 75}%</span>
            </div>

            {stats.healthFactor != null && (
              <div className="flex justify-between text-sm pt-2 border-t border-[#D4AF37]/10">
                <span className="text-[#F5DEB3]/60">Health Factor</span>
                <span
                  className="font-bold"
                  style={{
                    color: stats.healthFactor === Infinity ? "#22d3ee"
                         : stats.healthFactor >= 2 ? "#4ade80"
                         : stats.healthFactor >= 1.5 ? "#facc15"
                         : stats.healthFactor >= 1 ? "#fb923c"
                         : "#f87171",
                  }}
                >
                  {stats.healthFactor === Infinity ? "∞" : stats.healthFactor.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-6 space-y-4">
          <h2 className="text-white text-lg">Actions</h2>

          <div className="grid grid-cols-4 gap-1 bg-[#0B1437] rounded-lg p-1">
            {tabLabels.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                  tab === t
                    ? "bg-[#1a1f3a] text-white"
                    : "text-[#F5DEB3]/50 hover:text-[#F5DEB3]/80"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-[#0B1437] text-white pr-16"
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#D4AF37] font-bold hover:text-[#D4AF37]/80"
              onClick={() => {
                if (tab === "deposit") setAmount(String(stats.usdcBalance));
                else if (tab === "withdraw") setAmount(String(stats.userDeposit));
                else if (tab === "borrow") setAmount(String(stats.availableLiquidity));
                else if (tab === "repay") setAmount(String(stats.userDebt));
              }}
            >
              MAX
            </button>
          </div>

          <p className="text-xs text-[#F5DEB3]/50">
            {tab === "deposit"  && "Minting cUSDC earns interest as the exchange rate grows automatically."}
            {tab === "withdraw" && "Redeem cUSDC for USDC. Collateral must cover existing borrows."}
            {tab === "borrow"   && `Borrow up to ${stats.collateralFactor ?? 75}% of your cUSDC collateral value.`}
            {tab === "repay"    && "Repaying reduces debt and improves your Aurion credit score."}
          </p>

          <Button
            onClick={actions[tab]}
            disabled={loading || !amount}
            className="w-full capitalize"
          >
            {loading ? "Confirming…" : tab}
          </Button>
        </Card>
      </div>

      {/* Cross-protocol note */}
      <div className="rounded-xl border border-[#22d3ee]/20 bg-[#0e2233]/60 px-5 py-3 text-xs text-[#7dd3fc] flex gap-3 items-start">
        <span className="text-base mt-0.5">🔵</span>
        <span>
          Using both Aave and Compound earns a{" "}
          <span className="font-semibold text-[#22d3ee]">+100 point cross-protocol bonus</span>{" "}
          in your Aurion credit score, computed by the{" "}
          <span className="font-semibold">Arbitrum Stylus engine</span>.
        </span>
      </div>
    </div>
  );
}

export default CompoundPool;