import { useAccount, useDisconnect } from "wagmi";
import { LogOut } from "lucide-react";

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  if (!isConnected) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end">
        <span className="text-[10px] text-[#d4af37] font-bold tracking-widest uppercase">
          Verified Identity
        </span>
        <span className="text-white text-sm font-mono">{truncatedAddress}</span>
      </div>

      <button
        onClick={() => disconnect()}
        className="p-2 rounded-full border border-white/10 hover:border-white/20"
        title="Disconnect Wallet"
      >
        <LogOut size={16} className="text-white" />
      </button>
    </div>
  );
}
