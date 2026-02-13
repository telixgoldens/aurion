import { useMemo, useState } from "react";
import { Card } from "./CoreUi";
import { Button } from "./CoreUi";
import { Input } from "./Inputs";
import { TrendingDown, Shield, Loader2, AlertTriangle } from "lucide-react";
import { useAccount } from "wagmi";

import { useBorrow } from "../../hooks/useBorrow";
import { useDashboard } from "../../hooks/useDashboard";
import { formatAddress, formatCurrency } from "../../utils/format";
import { addresses } from "../../lib/contracts";

const mustEnv = (k) => {
  const v = import.meta.env[k];
  if (!v) throw new Error(`Missing env var: ${k}`);
  return v;
};

export default function Borrow() {
  const { isConnected, address } = useAccount();
  const { data } = useDashboard(); // debt, limit, available, healthFactor
  const { borrowFromAave, borrowFromCompound, loading } = useBorrow();

  const [amount, setAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("USDC");
  const [route, setRoute] = useState("AAVE"); // "AAVE" | "COMPOUND"

  // Define assets from env. Start with USDC only if that’s what you have deployed.
  const assets = useMemo(
    () => ({
      USDC: { address: addresses.USDC, decimals: 6 },
      // If you actually have these tokens deployed, add env + addresses:
      // ETH: { address: mustEnv("VITE_WETH"), decimals: 18 },
      // USDT: { address: mustEnv("VITE_USDT"), decimals: 6 },
    }),
    []
  );

  const limit = Number(data.limit || 0);
  const debt = Number(data.debt || 0);
  const available = Math.max(0, Number(data.available || 0));

  const hf = Number(data.healthFactor || 0);
  const hfDisplay = Number.isFinite(hf) ? hf : 0;
  const isHealthy = hfDisplay >= 1;

  const hfPct = hfDisplay >= 10 ? 100 : Math.max(0, Math.min(100, hfDisplay * 100));

  const selected = assets[selectedAsset];
  const maxBorrow = available; // available credit in USDC terms based on your manager

  const handleMax = () => setAmount(String(maxBorrow));

  const handleBorrow = async () => {
    if (!isConnected || !address) {
      alert("Connect wallet first");
      return;
    }

    if (!amount || Number(amount) <= 0) return;

    try {
      const assetAddr = selected.address;

      // Protocol targets (you must set these)
      const aavePool = mustEnv("VITE_AAVE_POOL");
      const compoundPool = mustEnv("VITE_COMPOUND_POOL");

      if (route === "AAVE") {
        await borrowFromAave(aavePool, assetAddr, amount, selected.decimals);
      } else {
        await borrowFromCompound(compoundPool, assetAddr, amount, selected.decimals);
      }

      setAmount("");
      alert("Borrow Successful");
    } catch (e) {
      console.error(e);
      alert(e?.message || "Borrow failed");
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl text-white mb-2">Borrow Assets</h1>
        <p className="text-sm text-[#d4af37]/70">Aurion Credit Abstraction Layer • Arbitrum Sepolia</p>
        <div className="mt-2 text-xs text-[#d4af37]/70">
          Router: <span className="text-white">{formatAddress(addresses.CREDIT_ROUTER)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Borrow card */}
        <Card className="lg:col-span-2 bg-[#0a0e17] border-[#d4af37]/20 p-8 shadow-xl">
          <div className="space-y-6">
            {/* Asset + Route selectors */}
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="bg-[#01060f] border border-[#d4af37]/30 text-white rounded-lg px-3 py-2 text-sm"
              >
                {Object.keys(assets).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>

              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="bg-[#01060f] border border-[#d4af37]/30 text-white rounded-lg px-3 py-2 text-sm"
              >
                <option value="AAVE">Route: Aave</option>
                <option value="COMPOUND">Route: Compound</option>
              </select>

              <div className="ml-auto text-xs text-gray-400 flex items-center">
                {isConnected ? `Connected: ${formatAddress(address)}` : "Not connected"}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-3 block">
                Amount to Borrow
              </label>

              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-[#01060f] border-[#d4af37]/30 text-white text-3xl h-20 px-6 rounded-xl focus:border-[#d4af37]"
                />

                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-xl font-bold text-white">{selectedAsset}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#d4af37] hover:bg-[#d4af37]/10"
                    onClick={handleMax}
                    disabled={!isConnected}
                  >
                    MAX
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex justify-between px-2">
                <span className="text-xs text-gray-500">Route: {route === "AAVE" ? "Aave" : "Compound"}</span>
                <span className="text-xs text-[#d4af37]">
                  Available: {formatCurrency(maxBorrow)}
                </span>
              </div>
            </div>

            <Button
              className="w-full bg-[#d4af37] hover:bg-[#b8860b] text-[#0a0e17] font-bold h-14 rounded-xl transition-all"
              onClick={handleBorrow}
              disabled={loading || !amount || Number(amount) <= 0 || !isConnected}
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <TrendingDown className="w-5 h-5 mr-2" />}
              EXECUTE CREDIT ROUTING
            </Button>
          </div>
        </Card>

        {/* Risk State */}
        <Card className="bg-[#0a0e17] border-[#d4af37]/20 p-6">
          <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Risk State</h3>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-400">Health Factor</span>
                <span className={`text-xs font-bold ${isHealthy ? "text-green-400" : "text-[#d4af37]"}`}>
                  {hfDisplay > 1_000_000 ? "∞" : hfDisplay.toFixed(2)} ({isHealthy ? "Safe" : "At risk"})
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#01060f] rounded-full overflow-hidden">
                <div className={`h-full ${isHealthy ? "bg-green-500" : "bg-[#d4af37]"}`} style={{ width: `${hfPct}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#d4af37]/5 border border-[#d4af37]/10">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-4 h-4 text-[#d4af37]" />
                <span className="text-xs font-bold text-white">Aurion Protection</span>
              </div>
              <p className="text-[10px] text-gray-400">
                Borrow power and liquidation checks are enforced by CreditManager health factor and router rules.
              </p>
            </div>

            <div className="pt-4 border-top border-white/5">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Liquidation when HF &lt; 1.00</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
