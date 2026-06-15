import { useMemo, useState, useEffect } from "react";
import { Card } from "./CoreUi";
import { Button } from "./CoreUi";
import { Input } from "./Inputs";
import { TrendingDown, TrendingUp, Shield, Loader2, AlertTriangle } from "lucide-react";
import { useAccount } from "wagmi";
import { useBorrow } from "../hooks/useBorrow";
import { useDashboard } from "../hooks/useDashboard";
import { useAlert, AlertModal } from "./AlertModal";
import { ethers } from "ethers";
import { getCreditRouter } from "../lib/contracts";
import { getSigner, getBrowserProvider } from "../lib/eth";
import { formatAddress, formatCurrency } from "../utils/format";
import { addresses } from "../lib/contracts";

const mustEnv = (k) => {
  const v = import.meta.env[k];
  if (!v) throw new Error(`Missing env var: ${k}`);
  return v;
};

function Borrow() {
  const { isConnected, address }        = useAccount();
  const { alertState, showAlert, closeAlert } = useAlert();
  const { data }                        = useDashboard();
  const { borrowFromAave, borrowFromCompound, repay, loading } = useBorrow(); 
  const [amount, setAmount]             = useState("");
  const [selectedAsset, setSelectedAsset] = useState("USDC");
  const [route, setRoute]               = useState("AAVE");
  const [routerOwner, setRouterOwner]   = useState("");
  const [delegateUser, setDelegateUser] = useState("");
  const [delegateAmount, setDelegateAmount] = useState("");
  const [delegating, setDelegating]     = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const provider = await getBrowserProvider();
        const router   = getCreditRouter(provider);
        const owner    = await router.OWNER();
        setRouterOwner(owner);
      } catch (e) {
        console.error("Failed to read router owner", e);
      }
    })();
  }, []);

  const isAdmin =
    isConnected &&
    address &&
    routerOwner &&
    address.toLowerCase() === routerOwner.toLowerCase();

  const assets = useMemo(() => ({
    USDC: { address: addresses.USDC, decimals: 6 },
  }), []);

  const limit     = Number(data.limit    || 0);
  const debt      = Number(data.debt     || 0);
  const available = Math.max(0, Number(data.available || 0));

  const hf        = Number(data.healthFactor || 0);
  const hfDisplay = Number.isFinite(hf) ? hf : 0;
  const isHealthy = hfDisplay >= 1;
  const hfPct     = hfDisplay >= 10 ? 100 : Math.max(0, Math.min(100, hfDisplay * 100));

  const selected  = assets[selectedAsset];
  const maxBorrow = available;

  const handleDelegate = async () => {
    if (!isAdmin) return showAlert("Only router owner can delegate", "error", "Permission Denied");
    if (!ethers.isAddress(delegateUser)) return showAlert("Invalid user address", "error", "Invalid Address");
    if (!delegateAmount || Number(delegateAmount) <= 0) return;

    setDelegating(true);
    try {
      const signer = await getSigner();
      const router = getCreditRouter(signer);
      const amt    = ethers.parseUnits(delegateAmount.toString(), 6);
      const tx     = await router.delegateCredit(delegateUser, amt);
      await tx.wait();
      setDelegateAmount("");
      showAlert("Delegation successful", "success", "Delegation Complete");
    } catch (e) {
      console.error(e);
      showAlert(e?.shortMessage || e?.message || "Delegation failed", "error", "Delegation Failed");
    } finally {
      setDelegating(false);
    }
  };

  const handleMax    = () => setAmount(String(maxBorrow));
  const handleMaxDebt = () => setAmount(String(debt));   

  const handleBorrow = async () => {
    if (!isConnected || !address) {
      showAlert("Connect wallet first", "info", "Wallet Required");
      return;
    }
    if (!amount || Number(amount) <= 0) return;

    try {
      const assetAddr    = selected.address;
      const aavePool     = mustEnv("VITE_AAVE_ADAPTER");
      const compoundPool = mustEnv("VITE_COMPOUND_ADAPTER");

      if (route === "AAVE") {
        await borrowFromAave(aavePool, assetAddr, amount, selected.decimals);
      } else {
        await borrowFromCompound(compoundPool, amount, selected.decimals);
      }

      setAmount("");
      showAlert("Borrow Successful", "success", "Borrow Complete");
    } catch (e) {
      console.error(e);
      showAlert(e?.message || "Borrow failed", "error", "Borrow Failed");
    }
  };

  const handleRepay = async () => {
    if (!isConnected || !address) {
      showAlert("Connect wallet first", "info", "Wallet Required");
      return;
    }
    if (!amount || Number(amount) <= 0) return;
    if (debt <= 0) {
      showAlert("No outstanding debt to repay", "info", "No Debt");
      return;
    }

    try {
      const protocol = route === "AAVE" ? "aave" : "compound";
      await repay(amount, protocol, selected.decimals);
      setAmount("");
      showAlert("Repay Successful", "success", "Repay Complete");
    } catch (e) {
      console.error(e);
      showAlert(e?.message || "Repay failed", "error", "Repay Failed");
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
      <div>
        <h1 className="text-2xl text-white mb-2">Borrow Assets</h1>
        <p className="text-sm text-[#d4af37]/70">
          Aurion Credit Abstraction Layer • Arbitrum Sepolia
        </p>
        <div className="mt-2 text-xs text-[#d4af37]/70">
          Router:{" "}
          <span className="text-white">{formatAddress(addresses.CREDIT_ROUTER)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#0a0e17] border-[#d4af37]/20 p-8 shadow-xl">
          <div className="space-y-6">
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

            <div>
              <label className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-3 block">
                Amount
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
                  <div className="flex flex-col gap-1">
                    <button
                      className="text-[10px] text-[#d4af37] font-bold leading-none"
                      onClick={handleMax}
                      disabled={!isConnected}
                      title="Max borrow"
                    >
                      MAX↓
                    </button>
                    <button
                      className="text-[10px] text-red-400 font-bold leading-none"
                      onClick={handleMaxDebt}
                      disabled={!isConnected || debt <= 0}
                      title="Max repay"
                    >
                      MAX↑
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-between px-2">
                <span className="text-xs text-gray-500">
                  Route: {route === "AAVE" ? "Aave" : "Compound"}
                </span>
                <div className="flex gap-4">
                  <span className="text-xs text-[#d4af37]">
                    Available: {formatCurrency(maxBorrow)}
                  </span>
                  <span className="text-xs text-red-400">
                    Debt: {formatCurrency(debt)}
                  </span>
                </div>
              </div>
            </div>
            <Button
              className="w-full bg-[#d4af37] hover:bg-[#b8860b] text-[#0a0e17] font-bold h-14 rounded-xl transition-all"
              onClick={handleBorrow}
              disabled={loading || !amount || Number(amount) <= 0 || !isConnected}
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <TrendingDown className="w-5 h-5 mr-2" />
              )}
              EXECUTE CREDIT ROUTING
            </Button>
            <Button
              className="w-full bg-transparent border border-red-500/50 hover:bg-red-500/10 text-red-400 font-bold h-12 rounded-xl transition-all disabled:opacity-40"
              onClick={handleRepay}
              disabled={loading || !amount || Number(amount) <= 0 || !isConnected || debt <= 0}
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <TrendingUp className="w-5 h-5 mr-2" />
              )}
              REPAY VIA {route}
            </Button>
          </div>
        </Card>

        {isAdmin && (
          <Card className="bg-[#0a0e17] border-[#d4af37]/20 p-6">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Admin Delegation
            </h3>
            <div className="space-y-3">
              <Input
                value={delegateUser}
                onChange={(e) => setDelegateUser(e.target.value)}
                placeholder="Borrower address (0x...)"
                className="bg-[#01060f] border-[#d4af37]/30 text-white"
              />
              <Input
                type="number"
                value={delegateAmount}
                onChange={(e) => setDelegateAmount(e.target.value)}
                placeholder="Amount (USDC)"
                className="bg-[#01060f] border-[#d4af37]/30 text-white"
              />
              <Button
                className="w-full bg-[#d4af37] hover:bg-[#b8860b] text-[#0a0e17] font-bold"
                onClick={handleDelegate}
                disabled={delegating}
              >
                {delegating ? "Delegating..." : "Delegate Credit"}
              </Button>
              <div className="text-[10px] text-[#d4af37]/70">
                Router owner:{" "}
                <span className="text-white">{formatAddress(routerOwner)}</span>
              </div>
            </div>
          </Card>
        )}

        <Card className="bg-[#0a0e17] border-[#d4af37]/20 p-6">
          <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
            Risk State
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-400">Health Factor</span>
                <span className={`text-xs font-bold ${isHealthy ? "text-green-400" : "text-[#d4af37]"}`}>
                  {hfDisplay > 1_000_000 ? "∞" : hfDisplay.toFixed(2)}{" "}
                  ({isHealthy ? "Safe" : "At risk"})
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#01060f] rounded-full overflow-hidden">
                <div
                  className={`h-full ${isHealthy ? "bg-green-500" : "bg-[#d4af37]"}`}
                  style={{ width: `${hfPct}%` }}
                />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[#d4af37]/5 border border-[#d4af37]/10">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-4 h-4 text-[#d4af37]" />
                <span className="text-xs font-bold text-white">Aurion Protection</span>
              </div>
              <p className="text-[10px] text-gray-400">
                Borrow power and liquidation checks are enforced by
                CreditManager health factor and router rules.
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

export default Borrow;