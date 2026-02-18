import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { Droplet, Wallet, RefreshCw } from "lucide-react";
import { Card, Button } from "../components/CoreUi";
import { formatAddress } from "../utils/format";
import { getBrowserProvider, getSigner } from "../lib/eth";
import { addresses, claimFaucet, readUSDCBalance } from "../lib/contracts";
import { useAlert, AlertModal } from "../components/AlertModal";

function shortErr(e) {
  return (
    e?.shortMessage ||
    e?.reason ||
    e?.info?.error?.message ||
    e?.message ||
    "Transaction failed"
  );
}

export default function Faucet() {
  const { address, isConnected } = useAccount();
  const { alertState, showAlert, closeAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bal, setBal] = useState({
    formatted: "0.00",
    raw: 0n,
    symbol: "USDC",
    decimals: 6,
  });

  const [canClaim, setCanClaim] = useState(false);
  const faucetAddr = addresses.FAUCET;
  const usdcAddr = addresses.USDC;
  const statusLabel = useMemo(() => {
    if (!isConnected) return "Connect wallet";
    return canClaim ? "Ready" : "Cooldown active";
  }, [isConnected, canClaim]);

  const fetchBalanceAndStatus = async () => {
    if (!isConnected || !address || !window.ethereum) return;

    setRefreshing(true);
    try {
      const provider = await getBrowserProvider();
      const { bal: raw, decimals, symbol } = await readUSDCBalance(provider, address);
      const formatted = ethers.formatUnits(raw ?? 0n, decimals ?? 6);

      setBal({
        raw: raw ?? 0n,
        decimals: Number(decimals ?? 6),
        symbol: symbol ?? "USDC",
        formatted,
      });

      const faucet = new ethers.Contract(
        faucetAddr,
        ["function claim() external"],
        provider
      );

      try {
        await faucet.claim.staticCall({ from: address });
        setCanClaim(true);
      } catch {
        setCanClaim(false);
      }
    } catch (e) {
      console.error(e);
      showAlert(shortErr(e), "error", "Failed to load faucet data");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBalanceAndStatus();
  }, [isConnected, address]);

  const handleClaim = async () => {
    if (!isConnected || !address) {
      showAlert("Connect your wallet first.", "error", "Not connected");
      return;
    }

    setLoading(true);
    try {
      const signer = await getSigner();
      await claimFaucet(signer);

      showAlert("USDC claimed successfully.", "success", "Faucet Claimed");
      await fetchBalanceAndStatus();
    } catch (e) {
      console.error(e);
      showAlert(shortErr(e), "error", "Claim failed");
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl text-white mb-2">USDC Faucet</h1>
        <p className="text-sm text-[#d4af37]/70">
          Claim test USDC for Aurion on Arbitrum Sepolia.
        </p>
        <div className="mt-2 text-xs text-[#d4af37]/70">
          Faucet: <span className="text-white">{formatAddress(faucetAddr)}</span> • USDC:{" "}
          <span className="text-white">{formatAddress(usdcAddr)}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#0a0e17] border-[#d4af37]/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#d4af37]" />
              <div className="text-sm text-white font-semibold">Your Balance</div>
            </div>
            <button
              onClick={fetchBalanceAndStatus}
              disabled={!isConnected || refreshing}
              className="text-xs text-[#d4af37] hover:text-[#b8860b] disabled:opacity-50"
              title="Refresh"
            >
              <span className="inline-flex items-center gap-1">
                <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </span>
            </button>
          </div>
          <div className="text-3xl text-white font-mono">
            {Number(bal.formatted || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-base text-[#F5DEB3]/70">{bal.symbol}</span>
          </div>

          <div className="mt-2 text-xs text-[#F5DEB3]/60">
            Wallet:{" "}
            <span className="text-white">
              {isConnected && address ? formatAddress(address) : "Not connected"}
            </span>
          </div>
        </Card>
        <Card className="bg-[#0a0e17] border-[#d4af37]/20 p-6">
          <div className="text-sm text-white font-semibold mb-2">Faucet Status</div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                !isConnected ? "bg-gray-500" : canClaim ? "bg-emerald-500" : "bg-[#d4af37]"
              }`}
            />
            <div className="text-sm text-[#F5DEB3]/80">{statusLabel}</div>
          </div>
          <p className="text-xs text-[#F5DEB3]/60 mt-3">
            If cooldown is active, the claim simulation reverts. Refresh later.
          </p>
        </Card>
        <Card className="bg-[#0a0e17] border-[#d4af37]/20 p-6">
          <div className="text-sm text-white font-semibold mb-2">Claim</div>
          <Button
            className="w-full bg-[#d4af37] hover:bg-[#b8860b] text-[#0a0e17] font-bold h-12 text-sm uppercase tracking-wider"
            onClick={handleClaim}
            disabled={!isConnected || loading || !canClaim}
          >
            <Droplet className="w-4 h-4 mr-2" />
            {loading ? "Claiming…" : "Claim USDC"}
          </Button>
          {!isConnected && (
            <p className="text-xs text-[#F5DEB3]/60 mt-3">Connect your wallet to claim.</p>
          )}
          {isConnected && !canClaim && (
            <p className="text-xs text-[#F5DEB3]/60 mt-3">
              Cooldown active. Try again later.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
