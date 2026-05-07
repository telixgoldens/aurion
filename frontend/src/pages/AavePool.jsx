import { useState } from "react";
import { Card, Button } from "../components/CoreUi";
import { Input } from "../components/Inputs";
import { useMarketPool } from "../hooks/useMarketPool";
import { getMockAavePool } from "../lib/contracts";

function AavePool({ onNavigate }) {
  const { stats, loading, deposit, withdraw, borrow, repay } = useMarketPool(getMockAavePool);
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
          <span className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_6px_#4ade80]" />
          <span className="text-xs text-[#4ade80] font-semibold tracking-widest uppercase">Aave V3 · Mock</span>
        </div>
        <h1 className="text-2xl text-white mb-1">Aave Pool</h1>
        <p className="text-sm text-[#F5DEB3]/70">
          Supply USDC as collateral, borrow against it, and build your on-chain credit history.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-4">
          <div className="text-xs text-[#F5DEB3]/50 mb-1">Supply APY</div>
          <div className="text-[#4ade80] text-xl font-bold">{stats.supplyApy?.toFixed(2) ?? "—"}%</div>
        </Card>
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-4">
          <div className="text-xs text-[#F5DEB3]/50 mb-1">Borrow APY</div>
          <div className="text-[#fb923c] text-xl font-bold">{stats.borrowApy?.toFixed(2) ?? "—"}%</div>
        </Card>
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-4">
          <div className="text-xs text-[#F5DEB3]/50 mb-1">Total Deposits</div>
          <div className="text-white text-xl">{stats.totalDeposits.toFixed(2)} USDC</div>
        </Card>
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-4">
          <div className="text-xs text-[#F5DEB3]/50 mb-1">Utilization</div>
          <div className="text-white text-xl">{stats.utilization.toFixed(2)}%</div>
          {/* Utilization bar */}
          <div className="mt-2 h-1 rounded bg-[#0B1437] overflow-hidden">
            <div
              className="h-full rounded transition-all duration-700"
              style={{
                width: `${Math.min(stats.utilization, 100)}%`,
                background: stats.utilization > 90 ? "#f87171" : stats.utilization > 80 ? "#fb923c" : "#4ade80",
              }}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Position */}
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-6 space-y-4">
          <h2 className="text-white text-lg">Your Position</h2>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#F5DEB3]/60">Wallet Balance</span>
              <span className="text-white font-medium">{stats.usdcBalance.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#F5DEB3]/60">Supplied</span>
              <span className="text-[#4ade80] font-medium">{stats.userDeposit.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#F5DEB3]/60">Borrowed</span>
              <span className="text-[#fb923c] font-medium">{stats.userDebt.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#F5DEB3]/60">Available to Borrow</span>
              <span className="text-white font-medium">{stats.availableLiquidity?.toFixed(2) ?? "—"} USDC</span>
            </div>

            {/* Health factor */}
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

          {/* Tab selector */}
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

          {/* Context hint */}
          <p className="text-xs text-[#F5DEB3]/50">
            {tab === "deposit"  && "Supplying earns interest and increases your credit collateral."}
            {tab === "withdraw" && "Withdrawing reduces collateral. Health factor must stay above 1.0."}
            {tab === "borrow"   && "Borrow against supplied collateral. Interest accrues continuously."}
            {tab === "repay"    && "Repaying debt improves your health factor and Aurion credit score."}
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

      {/* Credit score note */}
      <div className="rounded-xl border border-[#4ade80]/20 bg-[#052e16]/60 px-5 py-3 text-xs text-[#86efac] flex gap-3 items-start">
        <span className="text-base mt-0.5">⚡</span>
        <span>
          Every action here is recorded on-chain. Your{" "}
          <span className="font-semibold">Aurion credit score</span> is computed
          by the <span className="font-semibold">Arbitrum Stylus engine</span> using
          this activity — more repayments, better health factor, and cross-protocol
          usage all improve your score.
        </span>
      </div>
    </div>
  );
}

export default AavePool;